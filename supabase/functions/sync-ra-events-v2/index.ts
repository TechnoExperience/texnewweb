// Supabase Edge Function: Enhanced RA Sync (Low-Cost Version)
// Uses Cloudflare Worker proxy to avoid IP bans

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

const RA_PROXY_ENDPOINT = Deno.env.get('RA_PROXY_URL') || 'https://ra.co/graphql'

interface RAEvent {
    id: string
    title: string
    date: string
    contentUrl: string
    flyerFront?: string
    venue: {
        name: string
        contentUrl?: string
    }
    artists: Array<{
        id: string
        name: string
    }>
}

interface SyncResult {
    status: 'success' | 'partial' | 'failed'
    events_fetched: number
    events_created: number
    events_updated: number
    events_skipped: number
    cities_processed: string[]
    error_message?: string
    execution_time_ms: number
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    const startTime = Date.now()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const result: SyncResult = {
        status: 'success',
        events_fetched: 0,
        events_created: 0,
        events_updated: 0,
        events_skipped: 0,
        cities_processed: [],
        execution_time_ms: 0
    }

    try {
        console.log('🚀 Starting RA sync...')

        // 1. Check rate limit
        const { data: canProceed } = await supabase.rpc('check_rate_limit', {
            p_service: 'resident_advisor',
            p_endpoint: 'graphql',
            p_max_requests: 50,
            p_window_minutes: 60
        })

        if (!canProceed) {
            throw new Error('Rate limit exceeded')
        }

        // 2. Get target cities from config
        const { data: configRow, error: configError } = await supabase
            .from('sync_config')
            .select('config_value')
            .eq('source', 'resident_advisor')
            .eq('config_key', 'target_cities')
            .eq('enabled', true)
            .single()

        if (configError) {
            throw new Error(`Config error: ${configError.message}`)
        }

        const cities = configRow?.config_value || []
        console.log(`📊 Found ${cities.length} cities`)

        // 3. Fetch events for each city
        for (const cityConfig of cities) {
            try {
                console.log(`🌍 Processing ${cityConfig.city}...`)
                const events = await fetchEventsFromRA(cityConfig)
                console.log(`  ✅ Found ${events.length} events`)

                result.events_fetched += events.length
                result.cities_processed.push(cityConfig.city)

                // 4. Process each event
                for (const raEvent of events) {
                    try {
                        const processResult = await processEvent(supabase, raEvent, cityConfig)

                        if (processResult === 'created') result.events_created++
                        else if (processResult === 'updated') result.events_updated++
                        else result.events_skipped++

                    } catch (error) {
                        console.error(`  ❌ Error:`, error)
                        result.events_skipped++
                    }
                }

                await delay(2000)

            } catch (error) {
                console.error(`❌ Error for ${cityConfig.city}:`, error)
                result.status = 'partial'
            }
        }

    } catch (error: any) {
        result.status = 'failed'
        result.error_message = error.message
        console.error('❌ Sync failed:', error)
    }

    result.execution_time_ms = Date.now() - startTime

    await supabase.from('sync_logs').insert({
        source: 'resident_advisor',
        status: result.status,
        events_fetched: result.events_fetched,
        events_created: result.events_created,
        events_updated: result.events_updated,
        events_skipped: result.events_skipped,
        cities_processed: result.cities_processed,
        error_message: result.error_message,
        execution_time_ms: result.execution_time_ms
    })

    return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
})

async function fetchEventsFromRA(cityConfig: any): Promise<RAEvent[]> {
    const query = `
    query GetEventListing($areaId: Int!, $pageSize: Int!) {
      eventListings(
        filters: {
          areas: { eq: $areaId }
        }
        pageSize: $pageSize
      ) {
        data {
          id
          title
          date
          contentUrl
          images {
            filename
            url
          }
          venue {
            name
            contentUrl
          }
          artists {
            id
            name
          }
        }
      }
    }
  `

    const response = await fetch(RA_PROXY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query,
            variables: {
                areaId: parseInt(cityConfig.area_id),
                pageSize: 50
            }
        })
    })

    if (!response.ok) {
        throw new Error(`RA API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
        console.error('GraphQL errors:', data.errors)
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
    }

    const events = data.data?.eventListings?.data || []
    return events.map((event: any) => ({
        ...event,
        flyerFront: event.images?.[0]?.url || null
    }))
}

async function processEvent(
    supabase: any,
    raEvent: RAEvent,
    cityConfig: any
): Promise<'created' | 'updated' | 'skipped'> {

    const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('source', 'resident_advisor')
        .eq('source_id', raEvent.id)
        .maybeSingle()

    const eventData = {
        title: raEvent.title,
        slug: generateSlug(raEvent.title, raEvent.id),
        event_date: raEvent.date,
        city: cityConfig.city,
        country: cityConfig.country,
        venue: raEvent.venue?.name || 'TBA',
        image_url: raEvent.flyerFront || null,
        source: 'resident_advisor',
        source_id: raEvent.id,
        source_url: `https://ra.co${raEvent.contentUrl}`,
        status: 'draft',
        last_synced_at: new Date().toISOString(),
        ra_event_id: raEvent.id,
        ra_synced: true,
        ra_sync_date: new Date().toISOString()
    }

    if (existing) {
        await supabase
            .from('events')
            .update(eventData)
            .eq('id', existing.id)
        return 'updated'
    } else {
        const { error } = await supabase
            .from('events')
            .insert(eventData)

        if (error && error.code === '23505') {
            eventData.slug = `${eventData.slug}-${Date.now()}`
            await supabase.from('events').insert(eventData)
        }

        if (raEvent.artists && raEvent.artists.length > 0) {
            const lineup = raEvent.artists.map(a => a.name)
            await supabase
                .from('events')
                .update({
                    lineup: lineup,
                    description: `Lineup: ${lineup.join(', ')}`
                })
                .eq('source_id', raEvent.id)
        }

        return 'created'
    }
}

function generateSlug(title: string, id: string): string {
    const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 80)

    return `${id}-${baseSlug}`
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
