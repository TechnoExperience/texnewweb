-- =============================================
-- AUTOMATED CRON JOB FOR RA SYNC
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Drop existing job if it exists
SELECT cron.unschedule('ra-events-sync-v2') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'ra-events-sync-v2'
);

-- Create new cron job - runs every 30 minutes
SELECT cron.schedule(
  'ra-events-sync-v2',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-v2',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.vHhWHYfECGJNVnLQiJNMwHdgTNDzQODKlqxONBXwBWo"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- =============================================
-- MONITORING QUERIES
-- =============================================

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- View job run history (last 10 runs)
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'ra-events-sync-v2'
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- View sync statistics
-- SELECT * FROM sync_statistics;

-- View recent sync logs
-- SELECT 
--   created_at,
--   status,
--   events_fetched,
--   events_created,
--   events_updated,
--   events_skipped,
--   array_to_string(cities_processed, ', ') as cities,
--   execution_time_ms,
--   error_message
-- FROM sync_logs
-- ORDER BY created_at DESC
-- LIMIT 20;

-- =============================================
-- MANUAL TRIGGER (for testing)
-- =============================================

-- Uncomment to manually trigger sync:
/*
SELECT
  net.http_post(
    url := 'https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-v2',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.vHhWHYfECGJNVnLQiJNMwHdgTNDzQODKlqxONBXwBWo"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
*/

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';
COMMENT ON EXTENSION http IS 'HTTP client for PostgreSQL';
