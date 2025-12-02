/**
 * Utilidad para diagnosticar problemas de conexión con Supabase
 */
import { supabase } from "@/lib/supabase"

export async function testSupabaseConnection() {
  const results = {
    envVars: {
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      url: import.meta.env.VITE_SUPABASE_URL ? '***' : 'MISSING',
    },
    connection: {
      success: false,
      error: null as string | null,
    },
    tables: {
      news: { exists: false, count: 0, error: null as string | null },
      events: { exists: false, count: 0, error: null as string | null },
      dj_releases: { exists: false, count: 0, error: null as string | null },
      videos: { exists: false, count: 0, error: null as string | null },
    },
  }

  // Test 1: Verificar variables de entorno
  console.log('🔍 Testing Supabase Connection...')
  console.log('📋 Environment Variables:', results.envVars)

  if (!results.envVars.hasUrl || !results.envVars.hasKey) {
    results.connection.error = 'Missing environment variables'
    console.error('❌ Missing Supabase environment variables!')
    return results
  }

  // Test 2: Probar conexión básica
  try {
    const { error } = await supabase.from('news').select('id').limit(1)
    if (error) {
      results.connection.error = error.message
      console.error('❌ Connection error:', error)
    } else {
      results.connection.success = true
      console.log('✅ Connection successful!')
    }
  } catch (err: any) {
    results.connection.error = err.message || 'Unknown error'
    console.error('❌ Connection exception:', err)
  }

  // Test 3: Verificar cada tabla
  const tables = ['news', 'events', 'dj_releases', 'videos'] as const
  
  for (const table of tables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        results.tables[table].error = error.message
        console.error(`❌ Table ${table}:`, error.message)
      } else {
        results.tables[table].exists = true
        results.tables[table].count = count || 0
        console.log(`✅ Table ${table}: ${count || 0} rows`)
      }
    } catch (err: any) {
      results.tables[table].error = err.message || 'Unknown error'
      console.error(`❌ Table ${table} exception:`, err)
    }
  }

  return results
}

