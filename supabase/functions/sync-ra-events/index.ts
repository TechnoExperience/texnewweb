// Supabase Edge Function: Sync Resident Advisor Events Automatically
// This function syncs events from Resident Advisor GraphQL API to the events table
// Can be triggered manually or via cron job

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Supabase automatically provides these environment variables
    // No need to set them as secrets - they're available by default
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
      Deno.env.get('SUPABASE_PROJECT_URL') || 
      'https://cfgfshoobuvycrbhnvkd.supabase.co'
    
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
      Deno.env.get('SERVICE_ROLE_KEY') || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Countries and cities configuration - All major techno cities worldwide
    const COUNTRIES_AND_CITIES: Record<string, string[]> = {
      'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza'],
      'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Bristol', 'Leeds', 'Liverpool'],
      'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Dresden'],
      'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Lille'],
      'Netherlands': ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven'],
      'Italy': ['Milan', 'Rome', 'Naples', 'Turin', 'Florence', 'Bologna', 'Venice'],
      'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Bruges'],
      'Portugal': ['Lisbon', 'Porto', 'Braga'],
      'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern'],
      'Austria': ['Vienna', 'Salzburg', 'Graz'],
      'Poland': ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw'],
      'Czech Republic': ['Prague', 'Brno'],
      'Hungary': ['Budapest'],
      'Greece': ['Athens', 'Thessaloniki'],
      'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Boston', 'Seattle'],
      'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary'],
      'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey'],
      'Brazil': ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília'],
      'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario'],
      'Chile': ['Santiago', 'Valparaíso'],
      'Colombia': ['Bogotá', 'Medellín', 'Cali'],
      'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
      'South Korea': ['Seoul', 'Busan', 'Incheon'],
      'China': ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou'],
      'Thailand': ['Bangkok', 'Chiang Mai'],
      'Singapore': ['Singapore'],
      'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
      'New Zealand': ['Auckland', 'Wellington'],
      'South Africa': ['Cape Town', 'Johannesburg', 'Durban'],
      'Morocco': ['Casablanca', 'Marrakech', 'Rabat'],
      'Egypt': ['Cairo', 'Alexandria'],
      'Turkey': ['Istanbul', 'Ankara', 'Izmir'],
      'United Arab Emirates': ['Dubai', 'Abu Dhabi']
    }

    const RA_GRAPHQL_ENDPOINT = 'https://ra.co/graphql'

    let totalCreated = 0
    let totalUpdated = 0
    let totalProcessed = 0
    let totalSkipped = 0
    const errors: string[] = []

    // Helper function to generate slug
    function generateSlug(title: string, raId: string): string {
      const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      return `${raId}-${baseSlug}`.substring(0, 100) // Limit slug length
    }

    // Fetch events from RA API using REST endpoint
    // Note: RA's GraphQL API structure may have changed, using REST as fallback
    async function fetchRAEvents(area: string): Promise<any[]> {
      try {
        // Try using RA's REST API endpoint for events
        // Format: https://ra.co/api/events?area={area}
        const raRestEndpoint = `https://ra.co/api/events`
        
        const params = new URLSearchParams({
          area: area,
          format: 'json'
        })

        const response = await fetch(`${raRestEndpoint}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://ra.co/',
          }
        })

        if (!response.ok) {
          // If REST fails, try GraphQL with different query structure
          return await fetchRAEventsGraphQL(area)
        }

        const data = await response.json()
        
        // Handle different response formats
        if (Array.isArray(data)) {
          return data
        } else if (data.data && Array.isArray(data.data)) {
          return data.data
        } else if (data.events && Array.isArray(data.events)) {
          return data.events
        }
        
        return []
      } catch (error) {
        console.error(`Error fetching RA events for ${area} via REST:`, error)
        // Fallback to GraphQL
        return await fetchRAEventsGraphQL(area)
      }
    }

    // Fallback GraphQL query with alternative field names
    async function fetchRAEventsGraphQL(area: string): Promise<any[]> {
      try {
        const query = `
          query GetEvents($area: String!) {
            events(filters: { area: $area }, pageSize: 50) {
              id
              title
              date
              contentUrl
              flyerFront
              venue {
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
                name
              }
            }
          }
        `

        const variables = {
          area: area
        }

        const response = await fetch(RA_GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ query, variables })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.errors) {
          console.warn(`GraphQL errors for ${area}:`, data.errors)
          return [] // Return empty array instead of throwing
        }

        return data.data?.events || data.data?.popularEvents || []
      } catch (error) {
        console.error(`Error fetching RA events for ${area} via GraphQL:`, error)
        return [] // Return empty array to continue processing other cities
      }
    }

    // Process all countries and cities
    console.log('Starting RA events sync for all countries...')
    
    for (const [country, cities] of Object.entries(COUNTRIES_AND_CITIES)) {
      console.log(`Processing ${country}...`)
      
      for (const city of cities) {
        try {
          console.log(`  Fetching events for ${city}, ${country}...`)
          const raEvents = await fetchRAEvents(city)
          
          console.log(`  Found ${raEvents.length} events for ${city}`)
          
          for (const raEvent of raEvents) {
            try {
              // Handle different event ID formats
              const eventId = raEvent.id || raEvent.eventId || raEvent._id || String(raEvent)
              if (!eventId) {
                console.warn(`Skipping event without ID: ${JSON.stringify(raEvent).substring(0, 100)}`)
                continue
              }

              // Check if event already exists by RA ID
              const { data: existing } = await supabase
                .from('events')
                .select('id, title')
                .eq('ra_event_id', eventId)
                .single()

              if (existing) {
                // Update existing event
                const slug = generateSlug(raEvent.title || raEvent.name || 'Event', eventId)
                const eventDate = new Date(raEvent.date || raEvent.startDate || raEvent.eventDate || new Date())
                const lineup = raEvent.artists?.map((a: any) => (typeof a === 'string' ? a : a.name)) || 
                              raEvent.lineup || 
                              []
                const imageUrl = raEvent.flyerFront || 
                               raEvent.image || 
                               raEvent.images?.[0]?.filename || 
                               raEvent.images?.[0]?.url || 
                               null
                const ticketUrl = raEvent.contentUrl ? 
                                 (raEvent.contentUrl.startsWith('http') ? raEvent.contentUrl : `https://ra.co${raEvent.contentUrl}`) : 
                                 (raEvent.ticketUrl || null)
                const venueName = raEvent.venue?.name || raEvent.venueName || 'Venue TBA'
                const venueAddress = raEvent.venue?.address || raEvent.venueAddress || null
                const eventCountry = raEvent.venue?.area?.country?.name || 
                                    raEvent.country || 
                                    country
                const eventCity = raEvent.venue?.area?.name || 
                                raEvent.city || 
                                city

                // Build description
                let description = `Evento en ${venueName}`
                if (venueAddress) {
                  description += `, ${venueAddress}`
                }
                if (lineup.length > 0) {
                  description += `. Lineup: ${lineup.join(', ')}`
                }
                if (raEvent.attending) {
                  description += `. ${raEvent.attending} personas interesadas.`
                }

                const eventData = {
                  title: raEvent.title || raEvent.name || 'Event',
                  slug: slug,
                  description: description,
                  event_date: eventDate.toISOString(),
                  venue: venueName,
                  city: eventCity,
                  country: eventCountry,
                  lineup: lineup,
                  image_url: imageUrl,
                  ticket_url: ticketUrl,
                  language: 'es',
                  featured: false,
                  ra_event_id: eventId,
                  ra_synced: true,
                  ra_sync_date: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }

                const { error } = await supabase
                  .from('events')
                  .update(eventData)
                  .eq('id', existing.id)

                if (error) {
                  errors.push(`Error updating ${raEvent.title}: ${error.message}`)
                } else {
                  totalUpdated++
                }
              } else {
                // Insert new event
                const slug = generateSlug(raEvent.title || raEvent.name || 'Event', eventId)
                const eventDate = new Date(raEvent.date || raEvent.startDate || raEvent.eventDate || new Date())
                const lineup = raEvent.artists?.map((a: any) => (typeof a === 'string' ? a : a.name)) || 
                              raEvent.lineup || 
                              []
                const imageUrl = raEvent.flyerFront || 
                               raEvent.image || 
                               raEvent.images?.[0]?.filename || 
                               raEvent.images?.[0]?.url || 
                               null
                const ticketUrl = raEvent.contentUrl ? 
                                 (raEvent.contentUrl.startsWith('http') ? raEvent.contentUrl : `https://ra.co${raEvent.contentUrl}`) : 
                                 (raEvent.ticketUrl || null)
                const venueName = raEvent.venue?.name || raEvent.venueName || 'Venue TBA'
                const venueAddress = raEvent.venue?.address || raEvent.venueAddress || null
                const eventCountry = raEvent.venue?.area?.country?.name || 
                                    raEvent.country || 
                                    country
                const eventCity = raEvent.venue?.area?.name || 
                                raEvent.city || 
                                city

                // Build description
                let description = `Evento en ${venueName}`
                if (venueAddress) {
                  description += `, ${venueAddress}`
                }
                if (lineup.length > 0) {
                  description += `. Lineup: ${lineup.join(', ')}`
                }
                if (raEvent.attending) {
                  description += `. ${raEvent.attending} personas interesadas.`
                }

                const eventData = {
                  title: raEvent.title || raEvent.name || 'Event',
                  slug: slug,
                  description: description,
                  event_date: eventDate.toISOString(),
                  venue: venueName,
                  city: eventCity,
                  country: eventCountry,
                  lineup: lineup,
                  image_url: imageUrl,
                  ticket_url: ticketUrl,
                  language: 'es',
                  featured: false,
                  ra_event_id: eventId,
                  ra_synced: true,
                  ra_sync_date: new Date().toISOString()
                }

                const { error } = await supabase
                  .from('events')
                  .insert(eventData)

                if (error) {
                  // Try with unique slug if conflict
                  if (error.code === '23505') {
                    const uniqueSlug = `${slug}-${Date.now()}`
                    const { error: retryError } = await supabase
                      .from('events')
                      .insert({ ...eventData, slug: uniqueSlug })
                    
                    if (retryError) {
                      errors.push(`Error inserting ${raEvent.title}: ${retryError.message}`)
                    } else {
                      totalCreated++
                    }
                  } else {
                    errors.push(`Error inserting ${raEvent.title}: ${error.message}`)
                  }
                } else {
                  totalCreated++
                }
              }

              totalProcessed++

              // Rate limiting - small delay between events
              await new Promise(resolve => setTimeout(resolve, 50))
            } catch (eventError) {
              errors.push(`Error processing event ${raEvent.title}: ${eventError instanceof Error ? eventError.message : String(eventError)}`)
            }
          }

          // Delay between cities to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (cityError) {
          const errorMsg = `Error processing ${city}, ${country}: ${cityError instanceof Error ? cityError.message : String(cityError)}`
          console.error(errorMsg)
          errors.push(errorMsg)
        }
      }
    }

    const result = {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      totalCreated,
      totalUpdated,
      totalProcessed,
      totalSkipped,
      errors: errors.slice(0, 20), // Limit errors in response
      summary: {
        countriesProcessed: Object.keys(COUNTRIES_AND_CITIES).length,
        totalCities: Object.values(COUNTRIES_AND_CITIES).flat().length
      }
    }

    console.log('Sync completed:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Fatal error in sync:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
