# 🥷 Sistema de Sincronización Stealth con Resident Advisor

## 🎯 Objetivo

Sincronizar eventos desde Resident Advisor **sin ser detectado** ni bloqueado, usando estrategias avanzadas de rate limiting, caching y delays aleatorios.

## 🛡️ Estrategias Anti-Bloqueo Implementadas

### 1. **Rate Limiting Inteligente**
- ✅ Máximo **10 peticiones por hora** (muy conservador)
- ✅ Ventana deslizante que se resetea automáticamente
- ✅ Espera automática cuando se alcanza el límite
- ✅ Tracking en base de datos para persistencia

### 2. **Caching Agresivo**
- ✅ Cache de respuestas por **30 minutos**
- ✅ Reduce peticiones duplicadas en el mismo sync
- ✅ Limpieza automática de cache expirado
- ✅ Cache en memoria + base de datos

### 3. **Delays Aleatorios (Human Behavior)**
- ✅ Entre eventos: **500ms - 1.5s** (aleatorio)
- ✅ Entre ciudades: **5-10 segundos** (aleatorio)
- ✅ Antes de cada petición: **1-3 segundos** (aleatorio)
- ✅ Simula comportamiento humano real

### 4. **Rotación de Headers**
- ✅ **6 User-Agents diferentes** rotando aleatoriamente
- ✅ **6 Referers diferentes** rotando aleatoriamente
- ✅ Headers completos de navegador real
- ✅ Accept-Language, Accept-Encoding, etc.

### 5. **Retry con Exponential Backoff**
- ✅ Máximo 2-3 reintentos por petición
- ✅ Delays exponenciales: 2s, 4s, 8s...
- ✅ Detección de 429 (Too Many Requests)
- ✅ Detección de 403/401 (Bloqueo)
- ✅ Respeta headers `Retry-After` de RA

### 6. **Prioridad RSS sobre GraphQL**
- ✅ **RSS Feeds primero** (más permisivos, menos bloqueos)
- ✅ GraphQL solo como fallback
- ✅ RSS parseado manualmente (sin librerías pesadas)

### 7. **Limitación de Scope**
- ✅ Solo **5 ciudades principales** de España
- ✅ Máximo **20 eventos por ciudad**
- ✅ Total: ~100 eventos máximo por sync

### 8. **Detección y Respuesta a Bloqueos**
- ✅ Detecta status 429 y espera según `Retry-After`
- ✅ Detecta 403/401 y aumenta delays
- ✅ Logs detallados de cada bloqueo
- ✅ Continúa con otras ciudades si una falla

## 📊 Configuración Actual

```typescript
// Ciudades objetivo (reducidas para minimizar peticiones)
const TARGET_CITIES = [
  { city: 'Madrid', area: 'madrid' },
  { city: 'Barcelona', area: 'barcelona' },
  { city: 'Valencia', area: 'valencia' },
  { city: 'Sevilla', area: 'sevilla' },
  { city: 'Bilbao', area: 'bilbao' },
]

// Rate Limiting
- Máximo: 10 peticiones/hora
- Ventana: 60 minutos
- Auto-reset cuando expira

// Caching
- TTL: 30 minutos
- Limpieza automática cada hora
- Cache en memoria + BD
```

## 🚀 Uso

### 1. Aplicar Migración

```sql
-- En Supabase SQL Editor
-- Ejecutar: supabase/migrations/00033_ra_sync_stealth.sql
```

### 2. Desplegar Edge Function

```bash
# Desde el proyecto
cd supabase/functions
supabase functions deploy sync-ra-events-stealth
```

### 3. Ejecutar Manualmente

```bash
# Desde el proyecto
curl -X POST https://TU_PROJECT.supabase.co/functions/v1/sync-ra-events-stealth \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 4. Programar con Cron (Opcional)

```sql
-- Sincronizar cada 6 horas (muy conservador)
SELECT cron.schedule(
  'ra-stealth-sync',
  '0 */6 * * *', -- Cada 6 horas
  $$
  SELECT
    net.http_post(
      url := 'https://TU_PROJECT.supabase.co/functions/v1/sync-ra-events-stealth',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb
    );
  $$
);
```

## 📈 Monitoreo

### Ver Rate Limits

```sql
SELECT * FROM ra_rate_limits;
```

### Ver Cache Stats

```sql
SELECT 
  COUNT(*) as total_entries,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as active_entries,
  COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_entries
FROM ra_response_cache;
```

### Ver Logs de Sync

```sql
SELECT 
  started_at,
  status,
  events_created,
  events_skipped,
  rate_limit_hits,
  cache_hits,
  execution_time_ms
FROM ra_sync_logs
ORDER BY started_at DESC
LIMIT 10;
```

### Limpiar Cache Manualmente

```sql
SELECT cleanup_ra_cache();
```

## ⚙️ Ajustes de Configuración

### Reducir Rate Limit (Más Conservador)

```sql
-- Cambiar a 5 peticiones/hora
UPDATE ra_rate_limits
SET request_count = 0
WHERE service = 'resident_advisor';
```

### Aumentar TTL del Cache

```sql
-- Cambiar función set_ra_cache para usar 60 minutos
-- Editar: supabase/migrations/00033_ra_sync_stealth.sql
-- Cambiar: p_ttl_minutes INTEGER DEFAULT 60
```

### Añadir Más Ciudades

```typescript
// Editar: supabase/functions/sync-ra-events-stealth/index.ts
const TARGET_CITIES = [
  // ... ciudades existentes
  { city: 'Málaga', area: 'malaga' },
  { city: 'Zaragoza', area: 'zaragoza' },
]
```

## 🎭 Estrategias Adicionales (Futuras)

### 1. Proxy Rotation (Avanzado)
- Usar servicios de proxy rotativos
- Distribuir peticiones entre múltiples IPs
- Costo adicional pero más seguro

### 2. Web Scraping (Alternativa)
- Scraping directo de HTML en lugar de API
- Más difícil de detectar
- Requiere parsing más complejo

### 3. RSS Feeds Exclusivos
- Usar solo RSS (más permisivo)
- Evitar GraphQL completamente
- Menos datos pero más estable

### 4. Distributed Sync
- Sincronizar ciudades en diferentes momentos
- No todas a la vez
- Reduce picos de tráfico

## ⚠️ Recomendaciones

1. **No ejecutar más de 1 vez cada 6 horas**
2. **Monitorear logs regularmente** para detectar bloqueos
3. **Ajustar rate limits** si se detectan bloqueos frecuentes
4. **Usar cache agresivamente** para reducir peticiones
5. **Limitar ciudades** a las más importantes
6. **Revisar eventos en modo DRAFT** antes de publicar

## 🔍 Detección de Problemas

### Si recibes muchos 429:

```sql
-- Verificar rate limits
SELECT * FROM ra_rate_limits;

-- Reducir límite
-- Editar función check_ra_rate_limit: p_max_requests = 5
```

### Si recibes 403/401:

```typescript
// Aumentar delays en el código
// Editar: humanDelay(5000, 15000) // 5-15 segundos
```

### Si no hay eventos:

```sql
-- Verificar que los eventos se están creando
SELECT COUNT(*) 
FROM events 
WHERE ra_synced = true 
  AND created_at > NOW() - INTERVAL '24 hours';
```

## ✅ Checklist de Verificación

- [ ] Migración aplicada sin errores
- [ ] Edge function desplegada
- [ ] Rate limits funcionando
- [ ] Cache funcionando
- [ ] Sync manual ejecutado con éxito
- [ ] Eventos creados en modo DRAFT
- [ ] Logs registrándose correctamente
- [ ] No hay bloqueos después de 24h

---

**Sistema optimizado para evitar detección y bloqueos** 🥷

