/**
 * Script para verificar el estado del cron job de RA sync
 * 
 * Uso: npx tsx scripts/check-cron-job.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cfgfshoobuvycrbhnvkd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurado en .env')
  console.error('   Necesitas el SERVICE_ROLE_KEY (no el anon key) para ejecutar consultas administrativas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCronJob() {
  console.log('🔍 Verificando estado del cron job "sync-ra-events"...\n')

  try {
    // Verificar si el cron job existe
    const { data: jobData, error: jobError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          jobid,
          jobname,
          schedule,
          active,
          command
        FROM cron.job 
        WHERE jobname = 'sync-ra-events';
      `
    })

    if (jobError) {
      // Intentar método alternativo usando query directa
      const { data, error } = await supabase
        .from('_realtime')
        .select('*')
        .limit(0) // Esto es solo para probar la conexión
      
      console.log('⚠️  No se pudo ejecutar la consulta directamente.')
      console.log('   Esto es normal - las consultas a cron.job requieren acceso directo a la base de datos.\n')
      console.log('📋 Para verificar el cron job, ejecuta esta consulta en el SQL Editor de Supabase:\n')
      console.log('   SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = \'sync-ra-events\';\n')
      console.log('🔗 Abre: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new\n')
      
      // Mostrar también consultas útiles
      console.log('📊 Otras consultas útiles:\n')
      console.log('   -- Ver historial de ejecuciones:')
      console.log('   SELECT runid, status, start_time, end_time, return_message')
      console.log('   FROM cron.job_run_details')
      console.log('   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = \'sync-ra-events\')')
      console.log('   ORDER BY start_time DESC LIMIT 10;\n')
      
      console.log('   -- Ejecutar manualmente (para pruebas):')
      console.log('   SELECT cron.run(\'sync-ra-events\');\n')
      
      return
    }

    if (jobData && jobData.length > 0) {
      console.log('✅ Cron job encontrado:\n')
      console.log(JSON.stringify(jobData, null, 2))
    } else {
      console.log('❌ No se encontró el cron job "sync-ra-events"')
      console.log('   Asegúrate de haber ejecutado la migración 00012_create_ra_sync_cron.sql\n')
    }
  } catch (error) {
    console.error('❌ Error al verificar el cron job:', error)
    console.log('\n📋 Ejecuta esta consulta directamente en el SQL Editor de Supabase:\n')
    console.log('   SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = \'sync-ra-events\';\n')
    console.log('🔗 Abre: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new\n')
  }
}

checkCronJob()

