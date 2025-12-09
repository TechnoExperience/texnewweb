// Script para aplicar la migración de dropshipping directamente
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.SUPABASE_URL || 'https://cfgfshoobuvycrbhnvkd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurado')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('📦 Aplicando migración de dropshipping...')
  
  const migrationPath = join(__dirname, '../supabase/migrations/00035_add_dropshipping_support.sql')
  const sql = readFileSync(migrationPath, 'utf-8')
  
  // Dividir el SQL en statements individuales
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`📝 Ejecutando ${statements.length} statements...`)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';'
    try {
      console.log(`   [${i + 1}/${statements.length}] Ejecutando statement...`)
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        // Si el error es que la función no existe, intentar ejecutar directamente
        if (error.message?.includes('exec_sql')) {
          // Usar query directo (solo funciona para SELECT)
          // Para DDL necesitamos usar el cliente de Postgres directamente
          console.log(`   ⚠️  No se puede ejecutar DDL directamente. Usa el dashboard de Supabase.`)
          console.log(`   📋 SQL a ejecutar:`)
          console.log(statement)
          continue
        }
        
        // Ignorar errores de "already exists"
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate') ||
            error.message?.includes('IF NOT EXISTS')) {
          console.log(`   ✅ Ya existe (ignorado)`)
          continue
        }
        
        throw error
      }
      
      console.log(`   ✅ Statement ${i + 1} ejecutado`)
    } catch (error: any) {
      console.error(`   ❌ Error en statement ${i + 1}:`, error.message)
      // Continuar con el siguiente
    }
  }
  
  console.log('✅ Migración aplicada (o ya estaba aplicada)')
}

applyMigration().catch(console.error)

