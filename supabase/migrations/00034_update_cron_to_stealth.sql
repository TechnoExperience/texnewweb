-- =============================================
-- ACTUALIZAR CRON JOB A SYNC-RA-EVENTS-STEALTH
-- =============================================
-- Esta migración actualiza el cron job para usar la versión stealth
-- y elimina referencias a versiones obsoletas

-- Eliminar cron job antiguo si existe
SELECT cron.unschedule('ra-events-sync-v2') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'ra-events-sync-v2'
);

-- Crear nuevo cron job apuntando a sync-ra-events-stealth
-- Ejecuta cada 30 minutos
SELECT cron.schedule(
  'ra-events-sync-stealth',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.vHhWHYfECGJNVnLQiJNMwHdgTNDzQODKlqxONBXwBWo"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Comentarios
COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - Updated to use sync-ra-events-stealth';

