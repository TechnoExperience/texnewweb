# 🥷 Desplegar RA Stealth Sync - Guía Paso a Paso

## ⚠️ La función NO está desplegada aún (Error 404)

Necesitas desplegarla manualmente desde el Dashboard de Supabase.

---

## 📋 PASO 1: Aplicar Migración SQL

1. **Abre Supabase Dashboard:**
   - Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new

2. **Abre el archivo de migración:**
   - Abre: `supabase/migrations/00033_ra_sync_stealth.sql` en tu editor
   - Copia **TODO** el contenido

3. **Pega y ejecuta:**
   - Pega el SQL en el editor de Supabase
   - Haz clic en **Run** o presiona `Ctrl+Enter`
   - ✅ Verifica que aparezca "Success. No rows returned"

---

## 📋 PASO 2: Crear la Edge Function

### Opción A: Desde Dashboard (MÁS FÁCIL)

1. **Ve a Functions:**
   - https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions

2. **Crea nueva función:**
   - Haz clic en **"Create a new function"** o **"New Function"**
   - Nombre: `sync-ra-events-stealth`
   - Haz clic en **Create**

3. **Copia el código:**
   - Abre: `supabase/functions/sync-ra-events-stealth/index.ts`
   - Copia **TODO** el contenido (431 líneas)

4. **Pega y despliega:**
   - Pega el código en el editor
   - Haz clic en **Deploy** o **Save**

5. **Verifica:**
   - Debe aparecer "Function deployed successfully"
   - La función debe aparecer en la lista

### Opción B: Desde CLI (Si tienes permisos)

```bash
# 1. Login en Supabase
supabase login

# 2. Link al proyecto
supabase link --project-ref cfgfshoobuvycrbhnvkd

# 3. Desplegar función
supabase functions deploy sync-ra-events-stealth
```

---

## 📋 PASO 3: Probar la Función

### Desde PowerShell:

```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth" -Method POST -Headers $headers
    Write-Host "✅ Éxito:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
```

### Desde el Dashboard:

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions/sync-ra-events-stealth
2. Haz clic en **"Invoke function"** o **"Test"**
3. Haz clic en **"Invoke"**
4. Revisa la respuesta

---

## 📋 PASO 4: Verificar Resultados

### Ver eventos creados:

```sql
-- En Supabase SQL Editor
SELECT 
  COUNT(*) as total_eventos,
  COUNT(*) FILTER (WHERE status = 'DRAFT') as pendientes_moderacion,
  COUNT(*) FILTER (WHERE status = 'PUBLISHED') as publicados,
  MAX(created_at) as ultimo_evento
FROM events
WHERE ra_synced = true
  AND created_at > NOW() - INTERVAL '24 hours';
```

### Ver logs de sincronización:

```sql
SELECT 
  started_at,
  status,
  events_created,
  events_skipped,
  rate_limit_hits,
  cache_hits,
  execution_time_ms,
  errors
FROM ra_sync_logs
ORDER BY started_at DESC
LIMIT 5;
```

### Ver rate limits:

```sql
SELECT 
  service,
  request_count,
  window_start,
  last_request_at,
  NOW() - window_start as tiempo_transcurrido
FROM ra_rate_limits;
```

---

## 📋 PASO 5: Programar Sincronización Automática (Opcional)

```sql
-- Sincronizar cada 6 horas (muy conservador para evitar bloqueos)
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

---

## ✅ Checklist de Verificación

- [ ] **Paso 1:** Migración SQL aplicada sin errores
- [ ] **Paso 2:** Función creada y desplegada en Dashboard
- [ ] **Paso 3:** Test manual ejecutado con éxito (no 404)
- [ ] **Paso 4:** Eventos aparecen en tabla `events`
- [ ] **Paso 4:** Eventos tienen `status = 'DRAFT'`
- [ ] **Paso 4:** Logs aparecen en `ra_sync_logs`
- [ ] **Paso 5:** Cron job programado (opcional)

---

## 🔍 URLs Importantes

- **Dashboard:** https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd
- **SQL Editor:** https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
- **Functions:** https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions
- **Function URL:** https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth

---

## ⚠️ Si Tienes Problemas

### Error 404 (Función no encontrada):
- ✅ Verifica que la función esté desplegada en el Dashboard
- ✅ Verifica que el nombre sea exactamente: `sync-ra-events-stealth`

### Error 403 (Sin permisos):
- ✅ Usa el anon key correcto
- ✅ Verifica que la función tenga permisos públicos

### Error 500 (Error interno):
- ✅ Revisa los logs de la función en el Dashboard
- ✅ Verifica que la migración SQL esté aplicada
- ✅ Revisa `ra_sync_logs` para ver errores detallados

---

**Una vez desplegada, la función estará lista para sincronizar eventos sin ser detectada** 🥷

