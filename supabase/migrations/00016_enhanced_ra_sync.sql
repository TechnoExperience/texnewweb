-- =============================================
-- ENHANCED RA SYNC SYSTEM - LOW COST VERSION
-- =============================================

-- First, drop any existing problematic constraints/indexes
DROP INDEX IF EXISTS idx_rate_limits_service CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS sync_logs CASCADE;
DROP TABLE IF EXISTS sync_config CASCADE;
DROP FUNCTION IF EXISTS check_rate_limit CASCADE;
DROP FUNCTION IF EXISTS get_sync_cities CASCADE;
DROP VIEW IF EXISTS sync_statistics CASCADE;

-- Add missing fields to events table for better RA integration
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_id TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Drop existing constraint if it exists
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Add new constraint
ALTER TABLE events 
ADD CONSTRAINT events_status_check CHECK (status IN ('draft', 'published', 'cancelled'));

-- Create unique constraint for deduplication
DROP INDEX IF EXISTS idx_events_source_dedup;
CREATE UNIQUE INDEX idx_events_source_dedup 
ON events(source, source_id) 
WHERE source_id IS NOT NULL;

-- =============================================
-- SYNC LOGS TABLE
-- =============================================
CREATE TABLE sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  events_fetched INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  events_skipped INTEGER DEFAULT 0,
  cities_processed TEXT[],
  error_message TEXT,
  error_details JSONB,
  execution_time_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_created ON sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_source ON sync_logs(source);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);

-- =============================================
-- RATE LIMITS TABLE
-- =============================================
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_duration_minutes INTEGER DEFAULT 60,
  max_requests INTEGER DEFAULT 100,
  last_request_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_service_endpoint UNIQUE (service, endpoint)
);

CREATE INDEX idx_rate_limits_service ON rate_limits(service, endpoint);

-- =============================================
-- SYNC CONFIG TABLE (for managing target cities)
-- =============================================
CREATE TABLE sync_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_source_config UNIQUE (source, config_key)
);

-- Insert default cities for RA sync
INSERT INTO sync_config (source, config_key, config_value) 
VALUES (
  'resident_advisor',
  'target_cities',
  '[
    {"city": "madrid", "country": "spain", "area_id": "34"},
    {"city": "barcelona", "country": "spain", "area_id": "7"},
    {"city": "valencia", "country": "spain", "area_id": "169"},
    {"city": "ibiza", "country": "spain", "area_id": "52"},
    {"city": "berlin", "country": "germany", "area_id": "28"},
    {"city": "london", "country": "uk", "area_id": "13"}
  ]'::jsonb
);

-- =============================================
-- HELPER FUNCTION: Get active sync cities
-- =============================================
CREATE OR REPLACE FUNCTION get_sync_cities(p_source TEXT DEFAULT 'resident_advisor')
RETURNS JSONB AS $$
DECLARE
  v_config JSONB;
BEGIN
  SELECT config_value INTO v_config
  FROM sync_config
  WHERE source = p_source 
    AND config_key = 'target_cities'
    AND enabled = true;
  
  RETURN COALESCE(v_config, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- HELPER FUNCTION: Check rate limit
-- =============================================
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_service TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit RECORD;
  v_window_expired BOOLEAN;
BEGIN
  -- Get or create rate limit record
  INSERT INTO rate_limits (service, endpoint, max_requests, window_duration_minutes)
  VALUES (p_service, p_endpoint, p_max_requests, p_window_minutes)
  ON CONFLICT (service, endpoint) DO NOTHING;

  SELECT * INTO v_limit
  FROM rate_limits
  WHERE service = p_service AND endpoint = p_endpoint;

  -- Check if window has expired
  v_window_expired := (
    EXTRACT(EPOCH FROM (NOW() - v_limit.window_start)) > (v_limit.window_duration_minutes * 60)
  );

  IF v_window_expired THEN
    -- Reset window
    UPDATE rate_limits
    SET requests_count = 1,
        window_start = NOW(),
        last_request_at = NOW()
    WHERE service = p_service AND endpoint = p_endpoint;
    RETURN TRUE;
  END IF;

  IF v_limit.requests_count >= v_limit.max_requests THEN
    -- Rate limit exceeded
    RETURN FALSE;
  END IF;

  -- Increment counter
  UPDATE rate_limits
  SET requests_count = requests_count + 1,
      last_request_at = NOW()
  WHERE service = p_service AND endpoint = p_endpoint;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEW: Sync Statistics
-- =============================================
CREATE OR REPLACE VIEW sync_statistics AS
SELECT 
  source,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'success') as successful_syncs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_syncs,
  SUM(events_created) as total_events_created,
  SUM(events_updated) as total_events_updated,
  SUM(events_fetched) as total_events_fetched,
  AVG(execution_time_ms) as avg_execution_time_ms,
  MAX(created_at) as last_sync_at
FROM sync_logs
GROUP BY source;

-- Grant permissions
GRANT SELECT ON sync_statistics TO authenticated;
GRANT SELECT ON sync_logs TO authenticated;
GRANT SELECT ON sync_config TO authenticated;
GRANT SELECT ON rate_limits TO authenticated;

COMMENT ON TABLE sync_logs IS 'Logs of all sync operations from external sources';
COMMENT ON TABLE rate_limits IS 'Rate limiting for external API calls';
COMMENT ON TABLE sync_config IS 'Configuration for sync operations';
COMMENT ON FUNCTION check_rate_limit IS 'Check if rate limit allows request';
COMMENT ON FUNCTION get_sync_cities IS 'Get list of cities to sync from config';
