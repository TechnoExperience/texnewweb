// Supabase Edge Function: Sync Resident Advisor Events via RSS Feed
// This is a more stable approach using RA's public RSS feeds

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cfgfshoobuvycrbhnvkd.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Major cities to fetch events from
    const CITIES = [
      'madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao',
      'london', 'berlin', 'amsterdam', 'paris', 'milan',
      'new-york', 'los-angeles', 'miami', 'tokyo', 'sydney'
    ]

    let totalCreated = 0
    let totalUpdated = 0
    let totalProcessed = 0
    const errors: string[] = []

    // Parse RSS feed
    async function parseRSSFeed(city: string): Promise<any[]> {
      try {
        const rssUrl = `https://ra.co/xml/events/${city}.xml`
        const response = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        if (!response.ok) {
          return []
        }

        const xml = await response.text()
        const events: any[] = []

        // Simple XML parsing (you might want to use a proper XML parser)
        const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
        
        for (const match of itemMatches) {
          const itemXml = match[1]
          const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
          const linkMatch = itemXml.match(/<link>(.*?)<\/link>/)
          const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
          const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)

          if (titleMatch && linkMatch) {
            // Extract RA event ID from link
            const link = linkMatch[1]
            const raIdMatch = link.match(/\/events\/(\d+)/)
            const raId = raIdMatch ? raIdMatch[1] : null

            if (raId) {
              events.push({
                id: raId,
                title: titleMatch[1],
                link: link,
                description: descMatch ? descMatch[1] : '',
                pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString()
              })
            }
          }
        }

        return events
      } catch (error) {
        console.error(`Error parsing RSS for ${city}:`, error)
        return []
      }
    }

    function generateSlug(title: string, raId: string): string {
      const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      return `${raId}-${baseSlug}`.substring(0, 100)
    }

    // Process cities
    for (const city of CITIES) {
      try {
        const events = await parseRSSFeed(city)
        console.log(`Found ${events.length} events for ${city}`)

        for (const event of events) {
          try {
            const { data: existing } = await supabase
              .from('events')
              .select('id')
              .eq('ra_event_id', event.id)
              .single()

            const slug = generateSlug(event.title, event.id)
            const eventDate = new Date(event.pubDate)

            const eventData = {
              title: event.title,
              slug: slug,
              description: event.description || `Evento en ${city}`,
              event_date: eventDate.toISOString(),
              venue: 'Venue TBA',
              city: city,
              country: 'Unknown',
              lineup: [],
              image_url: null,
              ticket_url: event.link,
              language: 'es',
              featured: false,
              ra_event_id: event.id,
              ra_synced: true,
              ra_sync_date: new Date().toISOString()
            }

            if (existing) {
              await supabase
                .from('events')
                .update({ ...eventData, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
              totalUpdated++
            } else {
              const { error } = await supabase.from('events').insert(eventData)
              if (error && error.code !== '23505') {
                errors.push(`Error inserting ${event.title}: ${error.message}`)
              } else {
                totalCreated++
              }
            }

            totalProcessed++
            await new Promise(resolve => setTimeout(resolve, 50))
          } catch (eventError) {
            errors.push(`Error processing event: ${eventError}`)
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (cityError) {
        errors.push(`Error processing ${city}: ${cityError}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        timestamp: new Date().toISOString(),
        totalCreated,
        totalUpdated,
        totalProcessed,
        errors: errors.slice(0, 20)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
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

