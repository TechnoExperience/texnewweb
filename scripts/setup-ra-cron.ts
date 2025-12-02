/**
 * Script to help set up the RA sync cron job
 * This script generates the SQL with your actual Supabase credentials
 * 
 * Run with: npx tsx scripts/setup-ra-cron.ts
 */

import * as dotenv from 'dotenv'
import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('🔧 RA Sync Cron Job Setup\n')
  console.log('This script will help you configure the automatic RA events sync.\n')

  // Get project reference
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  let projectRef = ''
  
  if (supabaseUrl) {
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)
    if (match) {
      projectRef = match[1]
      console.log(`✅ Found project reference: ${projectRef}`)
    }
  }
  
  if (!projectRef) {
    projectRef = await question('Enter your Supabase PROJECT_REF (from Settings > API): ')
  }

  // Get service role key
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let serviceKey = ''
  
  if (serviceRoleKey) {
    console.log('✅ Found SERVICE_ROLE_KEY in environment')
    const useEnv = await question('Use environment variable? (y/n): ')
    if (useEnv.toLowerCase() !== 'y') {
      serviceKey = await question('Enter your SERVICE_ROLE_KEY (from Settings > API): ')
    } else {
      serviceKey = serviceRoleKey
    }
  } else {
    serviceKey = await question('Enter your SERVICE_ROLE_KEY (from Settings > API): ')
  }

  // Get schedule preference
  console.log('\n📅 Schedule options:')
  console.log('1. Every 6 hours (recommended)')
  console.log('2. Every 12 hours')
  console.log('3. Daily at 2 AM')
  console.log('4. Custom cron expression')
  
  const scheduleChoice = await question('Choose schedule (1-4): ')
  
  let cronExpression = '0 */6 * * *' // Default: every 6 hours
  
  switch (scheduleChoice) {
    case '2':
      cronExpression = '0 */12 * * *'
      break
    case '3':
      cronExpression = '0 2 * * *'
      break
    case '4':
      cronExpression = await question('Enter cron expression (e.g., "0 */6 * * *"): ')
      break
  }

  // Generate SQL
  const sql = `-- Auto-generated RA Sync Cron Job Configuration
-- Generated on: ${new Date().toISOString()}

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Remove existing job if it exists
SELECT cron.unschedule('sync-ra-events') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-ra-events'
);

-- Create cron job
SELECT cron.schedule(
  'sync-ra-events',
  '${cronExpression}',
  $$
  SELECT
    net.http_post(
      url := 'https://${projectRef}.supabase.co/functions/v1/sync-ra-events',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ${serviceKey}'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Verify the job was created
SELECT 
  jobid,
  jobname,
  schedule,
  command
FROM cron.job
WHERE jobname = 'sync-ra-events';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Cron job "sync-ra-events" configured successfully!';
  RAISE NOTICE '📅 Schedule: ${cronExpression}';
  RAISE NOTICE '🔗 Function URL: https://${projectRef}.supabase.co/functions/v1/sync-ra-events';
END $$;
`

  // Save to file
  const outputPath = path.join(process.cwd(), 'supabase', 'migrations', '00012_create_ra_sync_cron_configured.sql')
  fs.writeFileSync(outputPath, sql)
  
  console.log('\n✅ SQL generated successfully!')
  console.log(`📄 Saved to: ${outputPath}\n`)
  console.log('📋 Next steps:')
  console.log('1. Review the generated SQL file')
  console.log('2. Run it in your Supabase SQL Editor')
  console.log('3. Or apply it via: supabase db push\n')
  
  const viewNow = await question('View the generated SQL now? (y/n): ')
  if (viewNow.toLowerCase() === 'y') {
    console.log('\n' + '='.repeat(60))
    console.log(sql)
    console.log('='.repeat(60))
  }

  rl.close()
}

main().catch(error => {
  console.error('❌ Error:', error)
  rl.close()
  process.exit(1)
})

