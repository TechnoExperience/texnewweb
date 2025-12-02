/**
 * Script para completar automáticamente las credenciales en el archivo de migración del cron
 * 
 * Uso: npx tsx scripts/fill-cron-credentials.ts [SERVICE_ROLE_KEY]
 * 
 * O simplemente ejecuta y te pedirá la clave:
 * npx tsx scripts/fill-cron-credentials.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_REF = 'zdjjgorcmikhfyxcdmyo'
const MIGRATION_FILE = path.join(process.cwd(), 'supabase', 'migrations', '00012_create_ra_sync_cron.sql')

async function main() {
  let serviceRoleKey = process.argv[2]

  if (!serviceRoleKey) {
    console.log('🔑 Necesitas proporcionar tu SERVICE_ROLE_KEY')
    console.log('📋 Puedes obtenerla de: https://supabase.com/dashboard/project/zdjjgorcmikhfyxcdmyo/settings/api')
    console.log('   (Busca la clave "service_role", NO la "anon")\n')
    
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    serviceRoleKey = await new Promise<string>((resolve) => {
      rl.question('Pega tu SERVICE_ROLE_KEY aquí: ', (answer) => {
        rl.close()
        resolve(answer.trim())
      })
    })
  }

  if (!serviceRoleKey || serviceRoleKey.length < 50) {
    console.error('❌ La SERVICE_ROLE_KEY parece inválida. Debe tener al menos 50 caracteres.')
    process.exit(1)
  }

  // Leer el archivo de migración
  let content = fs.readFileSync(MIGRATION_FILE, 'utf-8')

  // Reemplazar el placeholder
  const oldPlaceholder = "'Bearer [YOUR_SERVICE_ROLE_KEY]'"
  const newValue = `'Bearer ${serviceRoleKey}'`

  if (!content.includes('[YOUR_SERVICE_ROLE_KEY]')) {
    console.log('✅ El archivo ya está configurado (no se encontró el placeholder)')
    return
  }

  content = content.replace(/\[YOUR_SERVICE_ROLE_KEY\]/g, serviceRoleKey)

  // Guardar el archivo
  fs.writeFileSync(MIGRATION_FILE, content, 'utf-8')

  console.log('✅ Archivo de migración actualizado correctamente!')
  console.log(`📄 Archivo: ${MIGRATION_FILE}`)
  console.log('\n📋 Próximos pasos:')
  console.log('1. Revisa el archivo para verificar que todo esté correcto')
  console.log('2. Ejecuta la migración en Supabase SQL Editor o con: supabase db push')
  console.log('\n⚠️  IMPORTANTE: No compartas este archivo públicamente ya que contiene credenciales sensibles!')
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

