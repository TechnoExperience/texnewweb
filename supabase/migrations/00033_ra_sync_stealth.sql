-- =============================================
-- SISTEMA DE SINCRONIZACIÓN STEALTH CON RESIDENT ADVISOR
-- =============================================
-- Implementa estrategias avanzadas para evitar bloqueos:
-- - Rate limiting inteligente
-- - Cache de respuestas
-- - Delays aleatorios
-- - Rotación de User-Agents
-- - Retry con exponential backoff

-- Tabla para tracking de rate limits
CREATE TABLE IF NOT EXISTS ra_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL DEFAULT 'resident_advisor',
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_duration_minutes INTEGER DEFAULT 60,
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(service)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_ra_rate_limits_service ON ra_rate_limits(service);

-- Función para verificar y actualizar rate limit
CREATE OR REPLACE FUNCTION check_ra_rate_limit(
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Obtener o crear registro de rate limit
  INSERT INTO ra_rate_limits (service, request_count, window_start)
  VALUES ('resident_advisor', 0, v_now)
  ON CONFLICT (service) DO NOTHING;

  -- Obtener estado actual
  SELECT request_count, window_start
  INTO v_current_count, v_window_start
  FROM ra_rate_limits
  WHERE service = 'resident_advisor';

  -- Si la ventana ha expirado, resetear
  IF v_now - v_window_start > (p_window_minutes || INTERVAL '1 hour') THEN
    UPDATE ra_rate_limits
    SET request_count = 0,
        window_start = v_now,
        last_request_at = v_now,
        updated_at = v_now
    WHERE service = 'resident_advisor';
    v_current_count := 0;
  END IF;

  -- Verificar si podemos hacer la petición
  IF v_current_count >= p_max_requests THEN
    RETURN FALSE; -- Rate limit alcanzado
  END IF;

  -- Incrementar contador
  UPDATE ra_rate_limits
  SET request_count = request_count + 1,
      last_request_at = v_now,
      updated_at = v_now
  WHERE service = 'resident_advisor';

  RETURN TRUE; -- OK para hacer petición
END;
$$ LANGUAGE plpgsql;

-- Tabla para cache de respuestas de RA
CREATE TABLE IF NOT EXISTS ra_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  response_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para cache
CREATE INDEX IF NOT EXISTS idx_ra_cache_key ON ra_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ra_cache_expires ON ra_response_cache(expires_at);

-- Función para obtener del cache
CREATE OR REPLACE FUNCTION get_ra_cache(p_cache_key TEXT)
RETURNS JSONB AS $$
DECLARE
  v_data JSONB;
BEGIN
  SELECT response_data
  INTO v_data
  FROM ra_response_cache
  WHERE cache_key = p_cache_key
    AND expires_at > NOW();

  IF v_data IS NOT NULL THEN
    -- Actualizar last_used_at
    UPDATE ra_response_cache
    SET last_used_at = NOW()
    WHERE cache_key = p_cache_key;
  END IF;

  RETURN v_data;
END;
$$ LANGUAGE plpgsql;

-- Función para guardar en cache
CREATE OR REPLACE FUNCTION set_ra_cache(
  p_cache_key TEXT,
  p_data JSONB,
  p_ttl_minutes INTEGER DEFAULT 30
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ra_response_cache (cache_key, response_data, expires_at)
  VALUES (p_cache_key, p_data, NOW() + (p_ttl_minutes || INTERVAL '30 minutes'))
  ON CONFLICT (cache_key) DO UPDATE
  SET response_data = p_data,
      expires_at = NOW() + (p_ttl_minutes || INTERVAL '30 minutes'),
      last_used_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar cache expirado
CREATE OR REPLACE FUNCTION cleanup_ra_cache()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM ra_response_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Tabla para logs de sincronización (más detallada)
CREATE TABLE IF NOT EXISTS ra_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL DEFAULT 'stealth',
  cities_processed INTEGER DEFAULT 0,
  events_fetched INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  events_skipped INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  rate_limit_hits INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  execution_time_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'rate_limited'))
);

-- Índice para logs
CREATE INDEX IF NOT EXISTS idx_ra_sync_logs_status ON ra_sync_logs(status, started_at DESC);

-- Función para crear log de sync
CREATE OR REPLACE FUNCTION create_ra_sync_log()
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO ra_sync_logs (sync_type, status)
  VALUES ('stealth', 'running')
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar log de sync
CREATE OR REPLACE FUNCTION update_ra_sync_log(
  p_log_id UUID,
  p_status TEXT,
  p_events_created INTEGER DEFAULT 0,
  p_events_updated INTEGER DEFAULT 0,
  p_events_skipped INTEGER DEFAULT 0,
  p_errors JSONB DEFAULT '[]'::jsonb
)
RETURNS VOID AS $$
DECLARE
  v_started_at TIMESTAMPTZ;
  v_execution_time INTEGER;
BEGIN
  SELECT started_at INTO v_started_at
  FROM ra_sync_logs
  WHERE id = p_log_id;

  v_execution_time := EXTRACT(EPOCH FROM (NOW() - v_started_at))::INTEGER * 1000;

  UPDATE ra_sync_logs
  SET status = p_status,
      events_created = p_events_created,
      events_updated = p_events_updated,
      events_skipped = p_events_skipped,
      errors = p_errors,
      execution_time_ms = v_execution_time,
      completed_at = NOW()
  WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpiar cache automáticamente (cada hora)
CREATE OR REPLACE FUNCTION auto_cleanup_ra_cache()
RETURNS VOID AS $$
BEGIN
  PERFORM cleanup_ra_cache();
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE ra_rate_limits IS 'Control de rate limiting para evitar bloqueos de RA API';
COMMENT ON TABLE ra_response_cache IS 'Cache de respuestas de RA para reducir peticiones';
COMMENT ON TABLE ra_sync_logs IS 'Logs detallados de sincronizaciones con RA';
COMMENT ON FUNCTION check_ra_rate_limit IS 'Verifica si se puede hacer una petición según rate limits';
COMMENT ON FUNCTION get_ra_cache IS 'Obtiene respuesta del cache si existe y no ha expirado';
COMMENT ON FUNCTION set_ra_cache IS 'Guarda respuesta en cache con TTL configurable';

