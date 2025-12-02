/**
 * Script para listar todas las Edge Functions desplegadas
 */

const SUPABASE_URL = 'https://cfgfshoobuvycrbhnvkd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'

async function listFunctions() {
  console.log('🔍 Buscando Edge Functions desplegadas...\n')
  
  // Intentar diferentes nombres comunes
  const possibleNames = [
    'sync-ra-events',
    'sync_ra_events',
    'syncraevents',
    'rapid-worker',
    'hello-world'
  ]
  
  console.log('Probando diferentes nombres de funciones:\n')
  
  for (const name of possibleNames) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({})
      })
      
      if (response.status === 200 || response.status === 500) {
        // 200 = éxito, 500 = función existe pero tiene error (mejor que 404)
        console.log(`✅ Función encontrada: ${name} (Status: ${response.status})`)
        const text = await response.text()
        console.log(`   Respuesta: ${text.substring(0, 100)}...\n`)
      } else if (response.status === 404) {
        console.log(`❌ No encontrada: ${name}`)
      } else {
        console.log(`⚠️  ${name}: Status ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Error probando ${name}:`, error instanceof Error ? error.message : String(error))
    }
  }
  
  console.log('\n💡 Si ninguna función funciona:')
  console.log('   1. Ve al Dashboard: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions')
  console.log('   2. Verifica que la función esté desplegada')
  console.log('   3. Verifica el nombre exacto de la función')
  console.log('   4. Asegúrate de que el despliegue haya terminado completamente')
}

listFunctions().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

