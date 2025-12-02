# Sync Resident Advisor Events

Esta función de Supabase Edge Function sincroniza automáticamente eventos de Resident Advisor a la base de datos.

## Configuración

### Variables de Entorno

Asegúrate de tener configuradas estas variables en Supabase:
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key para bypass RLS

### Despliegue

```bash
supabase functions deploy sync-ra-events
```

## Uso

### Ejecución Manual

```bash
curl -X POST https://[tu-proyecto].supabase.co/functions/v1/sync-ra-events \
  -H "Authorization: Bearer [ANON_KEY]"
```

### Ejecución Automática con Cron

Configura un cron job en Supabase para ejecutar esta función periódicamente:

1. Ve a Database > Cron Jobs en el dashboard de Supabase
2. Crea un nuevo cron job:
   - Schedule: `0 */6 * * *` (cada 6 horas)
   - SQL: 
   ```sql
   SELECT net.http_post(
     url := 'https://[tu-proyecto].supabase.co/functions/v1/sync-ra-events',
     headers := '{"Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
   );
   ```

## Funcionalidad

- Sincroniza eventos de más de 30 países y 100+ ciudades
- Extrae información completa: título, fecha, venue, lineup, imágenes, enlaces
- Actualiza eventos existentes o crea nuevos
- Maneja duplicados usando `ra_event_id`
- Rate limiting para evitar bloqueos de la API

## Resultado

La función retorna un JSON con:
- `totalCreated`: Eventos nuevos creados
- `totalUpdated`: Eventos existentes actualizados
- `totalProcessed`: Total de eventos procesados
- `errors`: Lista de errores (si los hay)

