/**
 * Script para ejecutar manualmente el sync de Resident Advisor
 * Llama directamente a la Edge Function sync-ra-events
 * 
 * Uso: npx tsx scripts/trigger-ra-sync.ts
 */

const SUPABASE_URL = 'https://cfgfshoobuvycrbhnvkd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'

async function triggerRASync() {
  console.log('🚀 Ejecutando sync de Resident Advisor...\n')
  // La función se llama "RA" en Supabase
  const functionName = 'RA'
  console.log(`📍 URL: ${SUPABASE_URL}/functions/v1/${functionName}\n`)

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({})
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Sync ejecutado exitosamente!\n')
      console.log('📊 Resultado:')
      console.log(JSON.stringify(result, null, 2))
      
      if (result.totalProcessed) {
        console.log(`\n📈 Estadísticas:`)
        console.log(`   - Total procesado: ${result.totalProcessed}`)
        console.log(`   - Creados: ${result.totalCreated || 0}`)
        console.log(`   - Actualizados: ${result.totalUpdated || 0}`)
        if (result.errors && result.errors.length > 0) {
          console.log(`   - Errores: ${result.errors.length}`)
        }
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Error al ejecutar el sync:')
      console.log(`   Status: ${response.status} ${response.statusText}`)
      console.log(`   Error: ${errorText}\n`)
      
      if (response.status === 404) {
        console.log('💡 La Edge Function sync-ra-events no está desplegada.')
        console.log('   Asegúrate de desplegar la función primero.\n')
      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message)
    }
  }
}

triggerRASync()

