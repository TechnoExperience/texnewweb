# Integración Completa con Resident Advisor

## ✅ Estado: LISTO PARA DESPLEGAR

Esta documentación describe la integración completa con Resident Advisor para sincronizar eventos automáticamente.

## 📋 Componentes Implementados

### 1. Base de Datos

#### Migración 00010: Campos RA en Events
- `ra_event_id`: ID único del evento en RA
- `ra_synced`: Si el evento fue sincronizado desde RA
- `ra_sync_date`: Fecha de última sincronización
- Índices para búsquedas rápidas

#### Migración 00012: Cron Job Automático
- Configurado para ejecutarse cada 6 horas
- PROJECT_REF: `cfgfshoobuvycrbhnvkd`
- SERVICE_ROLE_KEY: Configurado
- URL: `https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events`

### 2. Edge Function: sync-ra-events

**Ubicación**: `supabase/functions/sync-ra-events/index.ts`

**Funcionalidades**:
- ✅ Obtiene eventos de más de 30 países y 100+ ciudades
- ✅ Sincroniza eventos populares desde la API GraphQL de RA
- ✅ Inserta nuevos eventos o actualiza existentes
- ✅ Maneja duplicados por `ra_event_id`
- ✅ Genera slugs únicos
- ✅ Rate limiting para evitar bloqueos
- ✅ Manejo de errores robusto
- ✅ Logging detallado

**Países y Ciudades Sincronizadas**:
- España: Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza
- Reino Unido: London, Manchester, Birmingham, Glasgow, Bristol, Leeds, Liverpool
- Alemania: Berlin, Munich, Hamburg, Frankfurt, Cologne, Stuttgart, Dresden
- Francia: Paris, Lyon, Marseille, Toulouse, Nice, Bordeaux, Lille
- Y muchos más países en Europa, América, Asia, África y Oceanía

### 3. Scripts de Utilidad

- `scripts/sync-ra-events-manual.ts`: Sincronización manual
- `scripts/test-ra-sync.ts`: Testing de la sincronización
- `scripts/trigger-ra-sync.ts`: Disparar sync manualmente
- `scripts/setup-ra-cron.ts`: Configurar cron job
- `scripts/fill-cron-credentials.ts`: Completar credenciales

## 🚀 Pasos para Desplegar

### Paso 1: Ejecutar Migraciones

Ejecuta las migraciones en el SQL Editor de Supabase:

1. **Migración 00010** (si no está aplicada):
   ```sql
   -- Ya debería estar aplicada, pero verifica
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'events' AND column_name LIKE 'ra_%';
   ```

2. **Migración 00012** (Cron Job):
   - Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
   - Copia el contenido de `supabase/migrations/00012_create_ra_sync_cron.sql`
   - Ejecuta la migración

### Paso 2: Desplegar Edge Function

**Opción A: Desde Dashboard (Recomendado)**

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions
2. Haz clic en "Create a new function"
3. Nombre: `sync-ra-events`
4. Copia el contenido completo de `supabase/functions/sync-ra-events/index.ts`
5. Configura los Secrets:
   - Ve a: Settings > Edge Functions > Secrets
   - Añade:
     - `SUPABASE_URL`: `https://cfgfshoobuvycrbhnvkd.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY`: Tu service role key
6. Haz clic en "Deploy"

**Opción B: Desde CLI**

```bash
# Si tienes acceso CLI
supabase functions deploy sync-ra-events --project-ref cfgfshoobuvycrbhnvkd
```

### Paso 3: Verificar Configuración

1. **Verificar Cron Job**:
   ```sql
   SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'sync-ra-events';
   ```

2. **Probar Edge Function Manualmente**:
   ```bash
   npm run trigger:ra
   ```

3. **Verificar Eventos Sincronizados**:
   ```sql
   SELECT COUNT(*) FROM events WHERE ra_synced = true;
   SELECT title, city, country, ra_sync_date FROM events WHERE ra_synced = true ORDER BY ra_sync_date DESC LIMIT 10;
   ```

## 📊 Monitoreo

### Ver Historial de Ejecuciones del Cron

```sql
SELECT 
  runid,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-ra-events')
ORDER BY start_time DESC
LIMIT 10;
```

### Ver Estadísticas de Sincronización

```sql
SELECT 
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE ra_synced = true) as ra_synced_events,
  COUNT(*) FILTER (WHERE ra_synced = false) as manual_events,
  MAX(ra_sync_date) as last_sync
FROM events;
```

### Ver Eventos por País

```sql
SELECT 
  country,
  COUNT(*) as event_count
FROM events
WHERE ra_synced = true
GROUP BY country
ORDER BY event_count DESC;
```

## 🔧 Mantenimiento

### Ejecutar Sync Manualmente

```bash
# Opción 1: Script
npm run trigger:ra

# Opción 2: SQL
SELECT cron.run('sync-ra-events');

# Opción 3: HTTP Request
curl -X POST https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### Actualizar Frecuencia del Cron

```sql
-- Cambiar a cada 12 horas
SELECT cron.unschedule('sync-ra-events');
SELECT cron.schedule(
  'sync-ra-events',
  '0 */12 * * *',
  $$
  SELECT net.http_post(
    url := 'https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

### Desactivar Cron Temporalmente

```sql
SELECT cron.unschedule('sync-ra-events');
```

## 🐛 Troubleshooting

### La función no se ejecuta

1. Verifica que el cron job esté activo:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'sync-ra-events';
   ```

2. Verifica los logs de la Edge Function en el Dashboard

3. Verifica que los Secrets estén configurados correctamente

### No se sincronizan eventos

1. Verifica la conexión a la API de RA:
   ```bash
   npm run test:ra
   ```

2. Revisa los errores en los logs:
   ```sql
   SELECT return_message FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-ra-events')
   ORDER BY start_time DESC LIMIT 1;
   ```

### Eventos duplicados

Los eventos se identifican por `ra_event_id`, así que no deberían duplicarse. Si ocurre:

```sql
-- Encontrar duplicados
SELECT ra_event_id, COUNT(*) 
FROM events 
WHERE ra_event_id IS NOT NULL 
GROUP BY ra_event_id 
HAVING COUNT(*) > 1;
```

## 📝 Notas Importantes

1. **Rate Limiting**: La función incluye delays entre requests para evitar bloqueos
2. **Datos**: Solo se sincronizan eventos futuros (próximos 90 días)
3. **Idioma**: Los eventos se crean en español por defecto
4. **Featured**: Los eventos de RA no se marcan como featured automáticamente
5. **Slugs**: Se generan automáticamente desde el título + ID de RA

## ✅ Checklist Final

- [ ] Migración 00010 aplicada
- [ ] Migración 00012 aplicada (cron job)
- [ ] Edge Function desplegada
- [ ] Secrets configurados (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Cron job verificado y activo
- [ ] Primera sincronización manual ejecutada y exitosa
- [ ] Eventos apareciendo en la base de datos
- [ ] Eventos visibles en el frontend

## 🎉 ¡Listo!

Una vez completados estos pasos, los eventos de Resident Advisor se sincronizarán automáticamente cada 6 horas y aparecerán en tu sitio web.

