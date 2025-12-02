# Configuración de Sincronización Automática con Resident Advisor

Esta guía te ayudará a configurar la sincronización automática de eventos desde Resident Advisor a tu base de datos.

## 📋 Requisitos Previos

1. Proyecto Supabase configurado
2. Edge Functions habilitadas
3. Acceso a las credenciales de Supabase (Service Role Key)

## 🚀 Pasos de Configuración

### 1. Desplegar la Edge Function

```bash
# Desde la raíz del proyecto
supabase functions deploy sync-ra-events
```

### 2. Configurar Variables de Entorno

En el dashboard de Supabase:
1. Ve a **Settings** > **Edge Functions**
2. Asegúrate de que estas variables estén configuradas:
   - `SUPABASE_URL`: Tu URL de proyecto (se configura automáticamente)
   - `SUPABASE_SERVICE_ROLE_KEY`: Tu Service Role Key

### 3. Probar la Sincronización Manualmente

#### Opción A: Desde el Dashboard de Supabase

1. Ve a **Edge Functions** > **sync-ra-events**
2. Haz clic en **Invoke**
3. Revisa los logs para ver el progreso

#### Opción B: Desde la Terminal

```bash
# Usando curl
curl -X POST https://[TU_PROJECT_REF].supabase.co/functions/v1/sync-ra-events \
  -H "Authorization: Bearer [TU_ANON_KEY]" \
  -H "Content-Type: application/json"
```

#### Opción C: Script Local

```bash
npm run sync:ra
```

### 4. Configurar Sincronización Automática

#### Opción A: Usando pg_cron (Recomendado)

1. Ve a **Database** > **Extensions** en Supabase
2. Habilita la extensión `pg_cron`
3. Ejecuta este SQL en el SQL Editor:

```sql
-- Reemplaza [YOUR_PROJECT_REF] y [YOUR_SERVICE_ROLE_KEY] con tus valores reales
SELECT cron.schedule(
  'sync-ra-events-auto',
  '0 */6 * * *', -- Cada 6 horas
  $$
  SELECT
    net.http_post(
      url := 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/sync-ra-events',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer [YOUR_SERVICE_ROLE_KEY]'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

#### Opción B: Usando GitHub Actions (Alternativa)

Crea `.github/workflows/sync-ra-events.yml`:

```yaml
name: Sync RA Events

on:
  schedule:
    - cron: '0 */6 * * *' # Cada 6 horas
  workflow_dispatch: # Permite ejecución manual

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync Events
        run: |
          curl -X POST ${{ secrets.SUPABASE_FUNCTION_URL }}/functions/v1/sync-ra-events \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

### 5. Verificar la Sincronización

Después de ejecutar la sincronización, verifica en tu base de datos:

```sql
-- Ver eventos sincronizados recientemente
SELECT 
  title, 
  city, 
  country, 
  event_date, 
  ra_synced, 
  ra_sync_date 
FROM events 
WHERE ra_synced = true 
ORDER BY ra_sync_date DESC 
LIMIT 20;

-- Contar eventos por país
SELECT country, COUNT(*) as total
FROM events
WHERE ra_synced = true
GROUP BY country
ORDER BY total DESC;
```

## 📊 Monitoreo

### Ver Logs de la Función

1. Ve a **Edge Functions** > **sync-ra-events** > **Logs**
2. Revisa los logs para ver:
   - Eventos creados
   - Eventos actualizados
   - Errores (si los hay)

### Verificar Cron Jobs

```sql
-- Ver todos los cron jobs programados
SELECT * FROM cron.job;

-- Ver historial de ejecuciones
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-ra-events-auto')
ORDER BY start_time DESC
LIMIT 10;
```

## 🔧 Configuración Avanzada

### Ajustar Frecuencia de Sincronización

Para cambiar la frecuencia, actualiza el cron schedule:

```sql
-- Cada 3 horas
SELECT cron.unschedule('sync-ra-events-auto');
SELECT cron.schedule(
  'sync-ra-events-auto',
  '0 */3 * * *',
  -- ... resto del código
);

-- Diariamente a las 2 AM
SELECT cron.schedule(
  'sync-ra-events-auto',
  '0 2 * * *',
  -- ... resto del código
);
```

### Agregar Más Ciudades

Edita `supabase/functions/sync-ra-events/index.ts` y agrega ciudades al objeto `COUNTRIES_AND_CITIES`:

```typescript
const COUNTRIES_AND_CITIES: Record<string, string[]> = {
  'Spain': ['Madrid', 'Barcelona', 'TuNuevaCiudad'],
  // ...
}
```

Luego vuelve a desplegar:

```bash
supabase functions deploy sync-ra-events
```

## ⚠️ Limitaciones y Consideraciones

1. **Rate Limiting**: La función incluye delays para evitar bloqueos de la API de RA
2. **Volumen**: La sincronización puede tardar varios minutos dependiendo del número de ciudades
3. **Duplicados**: Los eventos se identifican por `ra_event_id`, evitando duplicados
4. **Actualizaciones**: Los eventos existentes se actualizan automáticamente

## 🐛 Solución de Problemas

### La función no se ejecuta

1. Verifica que las variables de entorno estén configuradas
2. Revisa los logs de la función
3. Verifica que el cron job esté programado correctamente

### No se están creando eventos

1. Verifica que la tabla `events` tenga los campos necesarios
2. Revisa los logs para ver errores específicos
3. Asegúrate de que `ra_event_id` sea único

### Errores de permisos

1. Verifica que estés usando el Service Role Key (no el Anon Key)
2. Revisa las políticas RLS de la tabla `events`

## 📝 Notas

- La primera sincronización puede tardar más tiempo
- Los eventos se sincronizan para los próximos 90 días
- Los eventos pasados no se sincronizan automáticamente
- Puedes ejecutar la sincronización manualmente en cualquier momento

