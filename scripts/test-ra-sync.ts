/**
 * Test script to verify RA sync functionality
 * Run with: npx tsx scripts/test-ra-sync.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSync() {
  console.log('🧪 Testing RA Sync Setup...\n')

  // Test 1: Check if function endpoint is accessible
  console.log('1️⃣ Testing Edge Function endpoint...')
  try {
    const functionUrl = `${supabaseUrl}/functions/v1/sync-ra-events`
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Function is accessible')
      console.log(`   📊 Result:`, data)
    } else {
      console.log(`   ⚠️  Function returned status ${response.status}`)
      const text = await response.text()
      console.log(`   Response:`, text)
    }
  } catch (error) {
    console.log('   ❌ Error calling function:', error instanceof Error ? error.message : String(error))
  }

  // Test 2: Check database schema
  console.log('\n2️⃣ Checking database schema...')
  const { data: columns, error: schemaError } = await supabase
    .from('events')
    .select('*')
    .limit(1)

  if (schemaError) {
    console.log('   ❌ Error accessing events table:', schemaError.message)
  } else {
    console.log('   ✅ Events table is accessible')
    
    // Check for RA fields
    const { data: sample } = await supabase
      .from('events')
      .select('ra_event_id, ra_synced, ra_sync_date')
      .limit(1)
    
    if (sample) {
      console.log('   ✅ RA fields exist in table')
    }
  }

  // Test 3: Check existing RA events
  console.log('\n3️⃣ Checking existing RA events...')
  const { data: raEvents, count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('ra_synced', true)

  console.log(`   📦 Found ${count || 0} events synced from RA`)

  if (count && count > 0) {
    const { data: recent } = await supabase
      .from('events')
      .select('title, city, country, ra_sync_date')
      .eq('ra_synced', true)
      .order('ra_sync_date', { ascending: false })
      .limit(5)

    if (recent) {
      console.log('   📋 Recent RA events:')
      recent.forEach((e, i) => {
        console.log(`      ${i + 1}. ${e.title} - ${e.city}, ${e.country}`)
      })
    }
  }

  // Test 4: Check for duplicates
  console.log('\n4️⃣ Checking for duplicate RA events...')
  const { data: duplicates } = await supabase
    .from('events')
    .select('ra_event_id')
    .not('ra_event_id', 'is', null)

  if (duplicates) {
    const raIds = duplicates.map(e => e.ra_event_id).filter(Boolean)
    const uniqueIds = new Set(raIds)
    if (raIds.length !== uniqueIds.size) {
      console.log(`   ⚠️  Found ${raIds.length - uniqueIds.size} duplicate RA event IDs`)
    } else {
      console.log('   ✅ No duplicate RA event IDs found')
    }
  }

  console.log('\n✅ Test completed!')
}

testSync().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})

