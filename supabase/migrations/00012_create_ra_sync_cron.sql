-- Migration: Create cron job for automatic RA events sync
-- This sets up a pg_cron job to sync events from Resident Advisor every 6 hours

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- ============================================================================
-- ✅ CONFIGURACIÓN COMPLETA
-- 1. ✅ PROJECT_REF: cfgfshoobuvycrbhnvkd
-- 2. ✅ SERVICE_ROLE_KEY: Configurado
-- 
-- Este archivo está listo para ejecutarse. Puedes ejecutarlo en:
-- - Supabase SQL Editor
-- - O con: supabase db push
-- ============================================================================

-- Remove existing job if it exists (to allow re-running this migration)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-ra-events') THEN
    PERFORM cron.unschedule('sync-ra-events');
    RAISE NOTICE 'Removed existing sync-ra-events cron job';
  END IF;
END $$;

-- Create the cron job
-- PROJECT_REF: cfgfshoobuvycrbhnvkd (extracted from your Supabase URL)
-- SERVICE_ROLE_KEY: ✅ Configurado
SELECT cron.schedule(
  'sync-ra-events',
  '0 */6 * * *', -- Every 6 hours at minute 0 (00:00, 06:00, 12:00, 18:00)
  $$
  SELECT
    net.http_post(
      url := 'https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================================================
-- USEFUL QUERIES FOR MONITORING
-- ============================================================================

-- View the scheduled cron job
-- SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname = 'sync-ra-events';

-- View cron job execution history (last 10 runs)
-- SELECT 
--   runid,
--   job_pid,
--   status,
--   return_message,
--   start_time,
--   end_time,
--   end_time - start_time AS duration
-- FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-ra-events')
-- ORDER BY start_time DESC
-- LIMIT 10;

-- Manually trigger the sync (for testing)
-- SELECT cron.run('sync-ra-events');

-- Unschedule the cron job (if needed)
-- SELECT cron.unschedule('sync-ra-events');

-- ============================================================================
-- ALTERNATIVE: Use Supabase Dashboard Cron Jobs (Easier!)
-- ============================================================================
-- Instead of using pg_cron, you can use Supabase's built-in cron feature:
-- 1. Go to: Database > Cron Jobs in Supabase Dashboard
-- 2. Click "Create a new cron job"
-- 3. Set schedule: 0 */6 * * * (every 6 hours)
-- 4. Set SQL:
--    SELECT net.http_post(
--      url := 'https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events',
--      headers := jsonb_build_object(
--        'Content-Type', 'application/json',
--        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'
--      ),
--      body := '{}'::jsonb
--    );
-- ============================================================================
