/**
 * Script para verificar eventos sincronizados desde RA
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cfgfshoobuvycrbhnvkd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSyncedEvents() {
  console.log('🔍 Verificando eventos sincronizados desde Resident Advisor...\n')

  try {
    const { data, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('ra_synced', true)
      .order('ra_sync_date', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    const totalCount = count || 0

    if (totalCount === 0) {
      console.log('⚠️  No hay eventos sincronizados todavía.')
      console.log('   La función puede estar ejecutándose o puede haber errores.')
    } else {
      console.log(`✅ Encontrados ${totalCount} eventos sincronizados desde RA\n`)
      console.log('📋 Últimos eventos sincronizados:\n')
      
      data?.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}`)
        console.log(`   📍 ${event.city}, ${event.country}`)
        console.log(`   📅 ${new Date(event.event_date).toLocaleDateString('es-ES')}`)
        console.log(`   🔄 Sincronizado: ${new Date(event.ra_sync_date || '').toLocaleString('es-ES')}`)
        console.log(`   🆔 RA ID: ${event.ra_event_id}`)
        console.log('')
      })
    }

    // Estadísticas
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    console.log('📊 Estadísticas:')
    console.log(`   Total eventos: ${totalEvents || 0}`)
    console.log(`   Eventos de RA: ${totalCount}`)
    console.log(`   Eventos manuales: ${(totalEvents || 0) - totalCount}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkSyncedEvents()

