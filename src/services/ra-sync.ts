/**
 * Resident Advisor API Sync Service
 * Syncs events from Resident Advisor GraphQL API to Supabase events table
 */

import { supabase } from "@/lib/supabase"

// RA GraphQL Endpoint
const RA_GRAPHQL_ENDPOINT = 'https://ra.co/graphql'

// Countries and their major cities for event syncing
const COUNTRIES_AND_CITIES: Record<string, string[]> = {
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Bristol'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague'],
  'Italy': ['Milan', 'Rome', 'Naples', 'Turin', 'Florence'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent'],
  'Portugal': ['Lisbon', 'Porto'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel'],
  'Austria': ['Vienna', 'Salzburg'],
  'Poland': ['Warsaw', 'Krakow', 'Gdansk'],
  'Czech Republic': ['Prague'],
  'Hungary': ['Budapest'],
  'Greece': ['Athens', 'Thessaloniki'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'],
  'Argentina': ['Buenos Aires', 'Córdoba'],
  'Chile': ['Santiago'],
  'Colombia': ['Bogotá', 'Medellín'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto'],
  'South Korea': ['Seoul', 'Busan'],
  'China': ['Shanghai', 'Beijing', 'Shenzhen'],
  'Thailand': ['Bangkok'],
  'Singapore': ['Singapore'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'New Zealand': ['Auckland', 'Wellington'],
  'South Africa': ['Cape Town', 'Johannesburg'],
  'Morocco': ['Casablanca', 'Marrakech'],
  'Egypt': ['Cairo'],
  'Turkey': ['Istanbul', 'Ankara'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi']
}

interface RAEvent {
  id: string
  title: string
  attending?: number
  date: string
  contentUrl: string
  flyerFront?: string
  images?: Array<{ id: string; filename: string; alt?: string }>
  venue?: {
    id: string
    name: string
    contentUrl?: string
    live?: boolean
  }
  artists?: Array<{
    id: string
    name: string
  }>
}

interface RAEventResponse {
  data?: {
    popularEvents?: RAEvent[]
  }
  errors?: Array<{ message: string }>
}

/**
 * Generate slug from title
 */
function generateSlug(title: string, id?: string): string {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  return id ? `${id}-${baseSlug}` : baseSlug
}

/**
 * Fetch events from Resident Advisor GraphQL API for a specific area
 */
async function fetchRAEvents(area: string, country: string): Promise<RAEvent[]> {
  try {
    const startDate = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 60 days ahead

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
            alt
          }
          venue {
            id
            name
            contentUrl
            live
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
      pageSize: 100
    }

    const response = await fetch(RA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      console.error(`Error fetching RA events for ${area}:`, response.statusText)
      return []
    }

    const data: RAEventResponse = await response.json()

    if (data.errors) {
      console.error(`GraphQL errors for ${area}:`, data.errors)
      return []
    }

    if (!data.data?.popularEvents) {
      return []
    }

    return data.data.popularEvents
  } catch (error) {
    console.error(`Error fetching RA events for ${area}:`, error)
    return []
  }
}

/**
 * Sync a single event to Supabase
 */
async function syncEventToSupabase(raEvent: RAEvent, city: string, country: string): Promise<{ created: boolean; updated: boolean }> {
  try {
    // Check if event already exists by RA ID
    const { data: existing } = await supabase
      .from('events')
      .select('id, ra_event_id')
      .eq('ra_event_id', raEvent.id)
      .single()

    const slug = generateSlug(raEvent.title, raEvent.id)
    const eventDate = new Date(raEvent.date)
    
    // Extract lineup from artists
    const lineup = raEvent.artists?.map(artist => artist.name) || []
    
    // Get image URL
    const imageUrl = raEvent.flyerFront || raEvent.images?.[0]?.filename || null
    
    // Build ticket URL from contentUrl
    const ticketUrl = raEvent.contentUrl ? `https://ra.co${raEvent.contentUrl}` : null

    const eventData = {
      title: raEvent.title,
      slug: slug,
      description: `Evento en ${raEvent.venue?.name || city}. ${lineup.length > 0 ? `Lineup: ${lineup.join(', ')}` : ''}`,
      event_date: eventDate.toISOString(),
      venue: raEvent.venue?.name || 'Venue TBA',
      city: city,
      country: country,
      lineup: lineup,
      image_url: imageUrl,
      ticket_url: ticketUrl,
      language: 'es',
      featured: false,
      ra_event_id: raEvent.id,
      ra_synced: true,
      ra_sync_date: new Date().toISOString()
    }

    if (existing) {
      // Update existing event
      const { error } = await supabase
        .from('events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        console.error(`Error updating event ${raEvent.title}:`, error)
        return { created: false, updated: false }
      }

      return { created: false, updated: true }
    } else {
      // Insert new event
      const { error } = await supabase
        .from('events')
        .insert(eventData)

      if (error) {
        // If slug conflict, try with timestamp
        if (error.code === '23505') {
          const uniqueSlug = `${slug}-${Date.now()}`
          const { error: retryError } = await supabase
            .from('events')
            .insert({ ...eventData, slug: uniqueSlug })
          
          if (retryError) {
            console.error(`Error inserting event ${raEvent.title}:`, retryError)
            return { created: false, updated: false }
          }
        } else {
          console.error(`Error inserting event ${raEvent.title}:`, error)
          return { created: false, updated: false }
        }
      }

      return { created: true, updated: false }
    }
  } catch (error) {
    console.error(`Error syncing event ${raEvent.title}:`, error)
    return { created: false, updated: false }
  }
}

/**
 * Sync events from Resident Advisor for all countries
 */
export async function syncRAEventsAllCountries(): Promise<{
  success: boolean
  totalCreated: number
  totalUpdated: number
  totalProcessed: number
  errors: string[]
}> {
  const results = {
    totalCreated: 0,
    totalUpdated: 0,
    totalProcessed: 0,
    errors: [] as string[]
  }

  console.log('Starting RA events sync for all countries...')

  // Process each country and its cities
  for (const [country, cities] of Object.entries(COUNTRIES_AND_CITIES)) {
    console.log(`Processing ${country}...`)
    
    for (const city of cities) {
      try {
        console.log(`  Fetching events for ${city}, ${country}...`)
        const raEvents = await fetchRAEvents(city, country)
        
        console.log(`  Found ${raEvents.length} events for ${city}`)
        
        for (const raEvent of raEvents) {
          const result = await syncEventToSupabase(raEvent, city, country)
          
          if (result.created) {
            results.totalCreated++
          } else if (result.updated) {
            results.totalUpdated++
          }
          
          results.totalProcessed++
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        const errorMsg = `Error processing ${city}, ${country}: ${error instanceof Error ? error.message : String(error)}`
        console.error(errorMsg)
        results.errors.push(errorMsg)
      }
      
      // Delay between cities
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`Sync completed. Created: ${results.totalCreated}, Updated: ${results.totalUpdated}, Total: ${results.totalProcessed}`)

  return {
    success: results.errors.length === 0,
    ...results
  }
}

/**
 * Sync events for specific countries only
 */
export async function syncRAEventsForCountries(countries: string[]): Promise<{
  success: boolean
  totalCreated: number
  totalUpdated: number
  totalProcessed: number
  errors: string[]
}> {
  const results = {
    totalCreated: 0,
    totalUpdated: 0,
    totalProcessed: 0,
    errors: [] as string[]
  }

  for (const country of countries) {
    const cities = COUNTRIES_AND_CITIES[country]
    if (!cities) {
      results.errors.push(`Country ${country} not found in configuration`)
      continue
    }

    for (const city of cities) {
      try {
        const raEvents = await fetchRAEvents(city, country)
        
        for (const raEvent of raEvents) {
          const result = await syncEventToSupabase(raEvent, city, country)
          
          if (result.created) {
            results.totalCreated++
          } else if (result.updated) {
            results.totalUpdated++
          }
          
          results.totalProcessed++
          
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        const errorMsg = `Error processing ${city}, ${country}: ${error instanceof Error ? error.message : String(error)}`
        results.errors.push(errorMsg)
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return {
    success: results.errors.length === 0,
    ...results
  }
}

