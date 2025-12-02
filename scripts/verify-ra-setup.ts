/**
 * Script para verificar que todo esté configurado correctamente para RA sync
 * 
 * Uso: npx tsx scripts/verify-ra-setup.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cfgfshoobuvycrbhnvkd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifySetup() {
  console.log('🔍 Verificando configuración de Resident Advisor Sync...\n')

  const checks = {
    databaseFields: false,
    edgeFunction: false,
    cronJob: false,
    eventsSynced: false
  }

  // 1. Verificar campos RA en la tabla events
  console.log('1️⃣ Verificando campos RA en la tabla events...')
  try {
    const { data, error } = await supabase
      .from('events')
      .select('ra_event_id, ra_synced, ra_sync_date')
      .limit(1)

    if (error) {
      if (error.message.includes('column') && error.message.includes('ra_event_id')) {
        console.log('   ❌ Los campos RA no existen. Ejecuta la migración 00010_add_ra_fields_to_events.sql')
      } else {
        console.log(`   ⚠️  Error: ${error.message}`)
      }
    } else {
      console.log('   ✅ Campos RA existen en la tabla events')
      checks.databaseFields = true
    }
  } catch (error) {
    console.log('   ❌ Error verificando campos:', error)
  }

  // 2. Verificar Edge Function
  console.log('\n2️⃣ Verificando Edge Function sync-ra-events...')
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-ra-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({})
    })

    if (response.status === 404) {
      console.log('   ❌ Edge Function no encontrada. Debes desplegarla desde el Dashboard.')
      console.log('   📋 Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions')
    } else if (response.status === 401 || response.status === 403) {
      console.log('   ⚠️  Edge Function existe pero hay problemas de autenticación')
    } else {
      console.log('   ✅ Edge Function está desplegada y respondiendo')
      checks.edgeFunction = true
    }
  } catch (error) {
    console.log('   ❌ Error verificando Edge Function:', error)
  }

  // 3. Verificar eventos sincronizados
  console.log('\n3️⃣ Verificando eventos sincronizados...')
  try {
    const { data, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('ra_synced', true)

    if (error) {
      console.log(`   ⚠️  Error: ${error.message}`)
    } else {
      const syncedCount = count || 0
      if (syncedCount > 0) {
        console.log(`   ✅ ${syncedCount} eventos sincronizados desde RA`)
        checks.eventsSynced = true
      } else {
        console.log('   ⚠️  No hay eventos sincronizados todavía. Ejecuta el sync manualmente.')
      }
    }
  } catch (error) {
    console.log('   ❌ Error verificando eventos:', error)
  }

  // 4. Verificar cron job (requiere acceso directo a DB)
  console.log('\n4️⃣ Verificando cron job...')
  console.log('   ℹ️  El cron job debe verificarse manualmente en el SQL Editor:')
  console.log('      SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = \'sync-ra-events\';')
  console.log('   📋 Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new')

  // Resumen
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE VERIFICACIÓN')
  console.log('='.repeat(60))
  console.log(`✅ Campos RA en DB: ${checks.databaseFields ? '✓' : '✗'}`)
  console.log(`✅ Edge Function: ${checks.edgeFunction ? '✓' : '✗'}`)
  console.log(`✅ Eventos sincronizados: ${checks.eventsSynced ? '✓' : '✗'}`)
  console.log(`⚠️  Cron Job: Verificar manualmente`)

  const allGood = checks.databaseFields && checks.edgeFunction

  if (allGood) {
    console.log('\n✅ ¡Configuración básica completa!')
    if (!checks.eventsSynced) {
      console.log('\n💡 Próximo paso: Ejecuta el sync manualmente con:')
      console.log('   npm run trigger:ra')
    }
  } else {
    console.log('\n⚠️  Hay elementos pendientes de configurar.')
    console.log('\n📋 Pasos pendientes:')
    if (!checks.databaseFields) {
      console.log('   1. Ejecuta migración 00010_add_ra_fields_to_events.sql')
    }
    if (!checks.edgeFunction) {
      console.log('   2. Despliega la Edge Function sync-ra-events')
    }
    console.log('   3. Ejecuta migración 00012_create_ra_sync_cron.sql para el cron job')
  }
}

verifySetup().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

