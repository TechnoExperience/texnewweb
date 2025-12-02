/**
 * Manual script to sync events from Resident Advisor
 * Run with: npx tsx scripts/sync-ra-events-manual.ts
 * 
 * This script can be run manually or scheduled via cron
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Countries and cities configuration
const COUNTRIES_AND_CITIES: Record<string, string[]> = {
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  'France': ['Paris', 'Lyon', 'Marseille'],
  'Netherlands': ['Amsterdam', 'Rotterdam'],
  'Italy': ['Milan', 'Rome', 'Naples'],
  'Belgium': ['Brussels', 'Antwerp'],
  'Portugal': ['Lisbon', 'Porto'],
  'Switzerland': ['Zurich', 'Geneva'],
  'Austria': ['Vienna'],
  'Poland': ['Warsaw', 'Krakow'],
  'Czech Republic': ['Prague'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver'],
  'Mexico': ['Mexico City'],
  'Brazil': ['São Paulo', 'Rio de Janeiro'],
  'Argentina': ['Buenos Aires'],
  'Japan': ['Tokyo', 'Osaka'],
  'South Korea': ['Seoul'],
  'Australia': ['Sydney', 'Melbourne'],
  'New Zealand': ['Auckland']
}

const RA_GRAPHQL_ENDPOINT = 'https://ra.co/graphql'

function generateSlug(title: string, raId: string): string {
  return `${raId}-${title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`.substring(0, 100)
}

async function fetchRAEvents(area: string): Promise<any[]> {
  try {
    const startDate = new Date().toISOString().split('T')[0]

    const query = `
      query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) {
        popularEvents(filters: $filters, pageSize: $pageSize) {
          id
          title
          attending
          date
          contentUrl
          flyerFront
          images {
            id
            filename
          }
          venue {
            id
            name
            address
            area {
              name
              country {
                name
              }
            }
          }
          artists {
            id
            name
          }
        }
      }
    `

    const variables = {
      filters: {
        area: area,
        listingDate: startDate
      },
      pageSize: 200
    }

    const response = await fetch(RA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.data?.popularEvents || []
  } catch (error) {
    console.error(`Error fetching ${area}:`, error)
    return []
  }
}

async function syncEvent(raEvent: any, city: string, country: string) {
  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('ra_event_id', raEvent.id)
    .single()

  const slug = generateSlug(raEvent.title, raEvent.id)
  const eventDate = new Date(raEvent.date)
  const lineup = raEvent.artists?.map((a: any) => a.name) || []
  const imageUrl = raEvent.flyerFront || raEvent.images?.[0]?.filename || null
  const ticketUrl = raEvent.contentUrl ? `https://ra.co${raEvent.contentUrl}` : null
  const venueName = raEvent.venue?.name || 'Venue TBA'
  const eventCountry = raEvent.venue?.area?.country?.name || country
  const eventCity = raEvent.venue?.area?.name || city

  let description = `Evento en ${venueName}`
  if (lineup.length > 0) {
    description += `. Lineup: ${lineup.join(', ')}`
  }
  if (raEvent.attending) {
    description += `. ${raEvent.attending} personas interesadas.`
  }

  const eventData = {
    title: raEvent.title,
    slug,
    description,
    event_date: eventDate.toISOString(),
    venue: venueName,
    city: eventCity,
    country: eventCountry,
    lineup,
    image_url: imageUrl,
    ticket_url: ticketUrl,
    language: 'es',
    featured: false,
    ra_event_id: raEvent.id,
    ra_synced: true,
    ra_sync_date: new Date().toISOString()
  }

  if (existing) {
    const { error } = await supabase
      .from('events')
      .update({ ...eventData, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    return { created: false, updated: !error, error }
  } else {
    const { error } = await supabase.from('events').insert(eventData)
    if (error && error.code === '23505') {
      const uniqueSlug = `${slug}-${Date.now()}`
      const { error: retryError } = await supabase
        .from('events')
        .insert({ ...eventData, slug: uniqueSlug })
      return { created: !retryError, updated: false, error: retryError }
    }
    return { created: !error, updated: false, error }
  }
}

async function main() {
  console.log('🚀 Starting Resident Advisor events sync...\n')

  let totalCreated = 0
  let totalUpdated = 0
  let totalProcessed = 0
  const errors: string[] = []

  for (const [country, cities] of Object.entries(COUNTRIES_AND_CITIES)) {
    console.log(`📍 Processing ${country}...`)
    
    for (const city of cities) {
      try {
        console.log(`  📍 ${city}...`)
        const raEvents = await fetchRAEvents(city)
        console.log(`    Found ${raEvents.length} events`)
        
        for (const raEvent of raEvents) {
          const result = await syncEvent(raEvent, city, country)
          
          if (result.created) totalCreated++
          if (result.updated) totalUpdated++
          totalProcessed++
          
          if (result.error) {
            errors.push(`${raEvent.title}: ${result.error.message}`)
          }
          
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        errors.push(`${city}, ${country}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  console.log('\n📊 Sync Results:')
  console.log(`  ✅ Created: ${totalCreated}`)
  console.log(`  🔄 Updated: ${totalUpdated}`)
  console.log(`  📦 Total: ${totalProcessed}`)
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors (${errors.length}):`)
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`))
  }
  
  process.exit(errors.length === 0 ? 0 : 1)
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

