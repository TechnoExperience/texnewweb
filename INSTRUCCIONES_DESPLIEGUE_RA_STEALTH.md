# 🥷 Instrucciones de Despliegue - RA Stealth Sync

## ⚠️ Importante: La función debe desplegarse desde el Dashboard de Supabase

Debido a permisos de CLI, la función debe desplegarse manualmente desde el Dashboard de Supabase.

## 📋 Pasos para Desplegar

### 1. Aplicar Migración SQL

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
2. Abre el archivo: `supabase/migrations/00033_ra_sync_stealth.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **Run** o presiona `Ctrl+Enter`
6. ✅ Verifica que no haya errores

### 2. Desplegar Edge Function

#### Opción A: Desde Dashboard (Recomendado)

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions
2. Haz clic en **Create a new function**
3. Nombre: `sync-ra-events-stealth`
4. Copia el contenido de: `supabase/functions/sync-ra-events-stealth/index.ts`
5. Pégalo en el editor
6. Haz clic en **Deploy**

#### Opción B: Desde CLI (Si tienes permisos)

```bash
# Desde el directorio raíz del proyecto
supabase login
supabase link --project-ref cfgfshoobuvycrbhnvkd
supabase functions deploy sync-ra-events-stealth
```

### 3. Configurar Variables de Entorno (Si es necesario)

La función usa variables automáticas de Supabase, pero puedes verificar:

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/settings/functions
2. Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén disponibles

### 4. Probar la Función

#### Desde PowerShell:

```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest -Uri "https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth" -Method POST -Headers $headers
$response.Content
```

#### Desde Navegador (GET):

```
https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth
```

#### Desde cURL (Linux/Mac):

```bash
curl -X POST https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg" \
  -H "Content-Type: application/json"
```

### 5. Verificar Resultados

#### Ver eventos creados:

```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'DRAFT') as pendientes,
  COUNT(*) FILTER (WHERE status = 'PUBLISHED') as publicados
FROM events
WHERE ra_synced = true
  AND created_at > NOW() - INTERVAL '24 hours';
```

#### Ver logs de sync:

```sql
SELECT 
  started_at,
  status,
  events_created,
  events_skipped,
  execution_time_ms
FROM ra_sync_logs
ORDER BY started_at DESC
LIMIT 5;
```

#### Ver rate limits:

```sql
SELECT * FROM ra_rate_limits;
```

### 6. Programar Sincronización Automática (Opcional)

```sql
-- Sincronizar cada 6 horas (muy conservador)
SELECT cron.schedule(
  'ra-stealth-sync',
  '0 */6 * * *', -- Cada 6 horas
  $$
  SELECT
    net.http_post(
      url := 'https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg'
      )
    );
  $$
);
```

## 🔍 Verificar que Funciona

1. ✅ Migración aplicada sin errores
2. ✅ Función desplegada en Supabase Dashboard
3. ✅ Test manual ejecutado con éxito
4. ✅ Eventos aparecen en tabla `events` con `ra_synced = true`
5. ✅ Eventos tienen `status = 'DRAFT'` (requieren moderación)
6. ✅ Logs aparecen en `ra_sync_logs`
7. ✅ Rate limits funcionando en `ra_rate_limits`

## 📊 Monitoreo Continuo

### Dashboard de Monitoreo (SQL):

```sql
-- Resumen diario
SELECT 
  DATE(started_at) as fecha,
  COUNT(*) as syncs,
  SUM(events_created) as eventos_creados,
  SUM(events_skipped) as eventos_omitidos,
  AVG(execution_time_ms) as tiempo_promedio_ms
FROM ra_sync_logs
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(started_at)
ORDER BY fecha DESC;
```

## ⚠️ Troubleshooting

### Si la función no se despliega:

1. Verifica que el código no tenga errores de sintaxis
2. Asegúrate de tener permisos en el proyecto
3. Intenta desplegar desde el Dashboard manualmente

### Si no se crean eventos:

1. Verifica los logs de la función en Supabase Dashboard
2. Revisa `ra_sync_logs` para ver errores
3. Verifica que `ra_rate_limits` no esté bloqueando

### Si recibes errores 429:

1. Reduce el número de ciudades en `TARGET_CITIES`
2. Aumenta los delays en el código
3. Espera más tiempo entre syncs

---

**¡Sistema listo para sincronizar eventos sin ser detectado!** 🥷

