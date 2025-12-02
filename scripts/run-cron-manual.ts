/**
 * Script para ejecutar manualmente el cron job de RA sync
 * 
 * NOTA: cron.run() requiere acceso directo a la base de datos PostgreSQL.
 * Este script intentará ejecutarlo, pero si falla, deberás ejecutarlo
 * directamente en el SQL Editor de Supabase.
 * 
 * Uso: npx tsx scripts/run-cron-manual.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cfgfshoobuvycrbhnvkd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurado en .env')
  console.error('   Necesitas el SERVICE_ROLE_KEY para ejecutar funciones administrativas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runCronManually() {
  console.log('🚀 Intentando ejecutar el cron job "sync-ra-events" manualmente...\n')

  try {
    // Intentar ejecutar usando RPC (si existe una función wrapper)
    // Nota: cron.run() es una función de PostgreSQL que generalmente
    // no está expuesta a través de la API REST de Supabase
    
    console.log('⚠️  La función cron.run() requiere acceso directo a PostgreSQL.')
    console.log('   No se puede ejecutar a través de la API REST de Supabase.\n')
    
    console.log('📋 Para ejecutar el cron job manualmente:\n')
    console.log('   1. Abre el SQL Editor de Supabase:')
    console.log('      https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new\n')
    console.log('   2. Ejecuta esta consulta:\n')
    console.log('      SELECT cron.run(\'sync-ra-events\');\n')
    console.log('   3. Esto ejecutará el sync inmediatamente.\n')
    
    console.log('🔄 Alternativa: Llamar directamente a la Edge Function\n')
    console.log('   Puedes llamar directamente a la función sync-ra-events:\n')
    
    const functionUrl = `${supabaseUrl}/functions/v1/sync-ra-events`
    console.log(`   URL: ${functionUrl}\n`)
    
    console.log('   Ejecutando llamada directa a la Edge Function...\n')
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({})
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Sync ejecutado exitosamente!\n')
      console.log('📊 Resultado:')
      console.log(JSON.stringify(result, null, 2))
    } else {
      const errorText = await response.text()
      console.log('❌ Error al ejecutar el sync:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${errorText}\n`)
      console.log('💡 Asegúrate de que la Edge Function sync-ra-events esté desplegada.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    console.log('\n📋 Ejecuta esta consulta directamente en el SQL Editor de Supabase:\n')
    console.log('   SELECT cron.run(\'sync-ra-events\');\n')
    console.log('🔗 Abre: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new\n')
  }
}

runCronManually()

