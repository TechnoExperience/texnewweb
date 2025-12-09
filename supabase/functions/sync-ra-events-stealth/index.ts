// Supabase Edge Function: Sync Resident Advisor Events - Stealth Mode
// Implementa estrategias avanzadas para evitar detección y bloqueos

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// User-Agents rotativos para parecer navegadores reales
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

// Referers rotativos
const REFERERS = [
  'https://ra.co/',
  'https://ra.co/events',
  'https://www.ra.co/',
  'https://www.ra.co/events',
  'https://ra.co/events/spain',
  'https://ra.co/events/madrid',
]

// Rate Limiter con ventana deslizante
class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMinutes: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMinutes * 60 * 1000
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    
    // Limpiar requests fuera de la ventana
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    // Si estamos en el límite, esperar
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0]
      const waitTime = this.windowMs - (now - oldestRequest) + 1000 // +1s de margen
      
      if (waitTime > 0) {
        console.log(`⏳ Rate limit alcanzado. Esperando ${Math.round(waitTime / 1000)}s...`)
        await this.sleep(waitTime)
        // Limpiar después de esperar
        this.requests = this.requests.filter(time => Date.now() - time < this.windowMs)
      }
    }
    
    // Registrar esta petición
    this.requests.push(Date.now())
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Cache simple en memoria (para la ejecución actual)
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutos

// Retry con exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 2000
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Verificar cache primero
      const cacheKey = `${url}:${JSON.stringify(options)}`
      const cached = responseCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`📦 Usando respuesta cacheada para ${url}`)
        // Simular Response desde cache
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Delay aleatorio antes de la petición (1-3 segundos)
      const randomDelay = 1000 + Math.random() * 2000
      await new Promise(resolve => setTimeout(resolve, randomDelay))
      
      const response = await fetch(url, options)
      
      // Si es exitoso, cachear
      if (response.ok) {
        const data = await response.clone().json().catch(() => null)
        if (data) {
          responseCache.set(cacheKey, { data, timestamp: Date.now() })
        }
      }
      
      // Si recibimos 429 (Too Many Requests), esperar más tiempo
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const waitTime = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        
        console.log(`⚠️ Rate limit detectado (429). Esperando ${Math.round(waitTime / 1000)}s...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      // Si es 403 o 401, puede ser bloqueo - esperar más
      if (response.status === 403 || response.status === 401) {
        const waitTime = baseDelay * Math.pow(3, attempt) + Math.random() * 5000
        console.log(`🚫 Bloqueo detectado (${response.status}). Esperando ${Math.round(waitTime / 1000)}s...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        console.log(`🔄 Reintento ${attempt + 1}/${maxRetries} después de ${Math.round(delay / 1000)}s...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded')
}

// Obtener User-Agent aleatorio
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

// Obtener Referer aleatorio
function getRandomReferer(): string {
  return REFERERS[Math.floor(Math.random() * REFERERS.length)]
}

// Delay aleatorio entre peticiones (simula comportamiento humano)
async function humanDelay(minMs = 2000, maxMs = 5000): Promise<void> {
  const delay = minMs + Math.random() * (maxMs - minMs)
  await new Promise(resolve => setTimeout(resolve, delay))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
      Deno.env.get('SUPABASE_PROJECT_URL') || 
      'https://cfgfshoobuvycrbhnvkd.supabase.co'
    
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
      Deno.env.get('SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurado')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Configuración: Solo 2 ciudades principales para evitar timeout y baneos
    const TARGET_CITIES = [
      { city: 'Madrid', area: 'madrid' },
      { city: 'Barcelona', area: 'barcelona' },
    ]

    // Rate limiter: máximo 5 peticiones por hora (muy conservador para evitar baneos)
    const rateLimiter = new RateLimiter(5, 60)

    let totalCreated = 0
    let totalUpdated = 0
    let totalSkipped = 0
    let totalFound = 0 // Total eventos encontrados en RA
    const errors: string[] = []
    const cityStats: Array<{ city: string; found: number; created: number; skipped: number }> = []

    // Función para obtener eventos usando RSS Feed (más permisivo que GraphQL)
    async function fetchRAEventsRSS(city: string): Promise<any[]> {
      try {
        // Validar entrada
        if (!city || typeof city !== 'string') {
          console.error(`❌ Error: city inválido para fetchRAEventsRSS: ${city}`)
          return []
        }
        // Intentar primero con RSS feed (más permisivo, menos bloqueos)
        const rssUrl = `https://ra.co/events/${city}/rss`
        
        await rateLimiter.waitIfNeeded()
        
        const response = await fetchWithRetry(rssUrl, {
          method: 'GET',
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': getRandomReferer(),
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        }, 2, 3000) // Menos reintentos para RSS

        if (!response.ok) {
          console.log(`⚠️ RSS no disponible para ${city}, intentando GraphQL...`)
          return await fetchRAEventsGraphQL(city)
        }

        const xmlText = await response.text()
        
        // Parsear RSS básico
        const events: any[] = []
        const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)
        
        for (const match of itemMatches) {
          const itemXml = match[1]
          const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                           itemXml.match(/<title>(.*?)<\/title>/i)
          const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i)
          const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i)
          const descriptionMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) ||
                                  itemXml.match(/<description>(.*?)<\/description>/i)
          
          if (titleMatch && linkMatch) {
            const raId = linkMatch[1].match(/\/(\d+)$/)?.[1] || Date.now().toString()
            events.push({
              id: raId,
              title: titleMatch[1].trim(),
              contentUrl: linkMatch[1],
              date: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
              description: descriptionMatch?.[1] || '',
            })
          }
        }
        
        return events.slice(0, 10) // Limitar a 10 eventos por ciudad para evitar timeout
      } catch (error) {
        console.error(`Error en RSS para ${city}:`, error)
        const fallback = await fetchRAEventsGraphQL(city)
        return Array.isArray(fallback) ? fallback : []
      }
    }

    // Fallback a GraphQL (solo si RSS falla)
    async function fetchRAEventsGraphQL(city: string): Promise<any[]> {
      try {
        // Validar entrada
        if (!city || typeof city !== 'string') {
          console.error(`❌ Error: city inválido para fetchRAEventsGraphQL: ${city}`)
          return []
        }
        await rateLimiter.waitIfNeeded()
        
        // Usar query más simple y menos sospechosa
        const query = `
          query GetEvents($area: String!) {
            events(filters: { area: $area }, pageSize: 20) {
              id
              title
              date
              contentUrl
            }
          }
        `

        const response = await fetchWithRetry('https://ra.co/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': getRandomUserAgent(),
            'Accept': 'application/json',
            'Referer': getRandomReferer(),
            'Origin': 'https://ra.co',
          },
          body: JSON.stringify({
            query,
            variables: { area: city.toLowerCase() }
          })
        }, 2, 5000) // Más tiempo entre reintentos para GraphQL

        if (!response.ok) {
          return []
        }

        const data = await response.json()
        const events = data?.data?.events || []
        return Array.isArray(events) ? events : []
      } catch (error) {
        console.error(`Error en GraphQL para ${city}:`, error)
        return []
      }
    }

    console.log('🚀 Iniciando sync stealth mode...')
    console.log(`📋 Ciudades objetivo: ${TARGET_CITIES.length}`)

    // Procesar ciudades una por una con delays humanos
    for (let i = 0; i < TARGET_CITIES.length; i++) {
      const { city, area } = TARGET_CITIES[i]
      
      try {
        console.log(`📍 Procesando ${city} (${i + 1}/${TARGET_CITIES.length})...`)
        
        // Intentar RSS primero (más permisivo)
        let raEvents = await fetchRAEventsRSS(area)
        
        // Validar que raEvents es un array
        if (!Array.isArray(raEvents)) {
          console.warn(`⚠️ fetchRAEventsRSS no devolvió un array para ${city}, intentando GraphQL...`)
          raEvents = await fetchRAEventsGraphQL(area)
        }
        
        // Validar nuevamente después de GraphQL
        if (!Array.isArray(raEvents)) {
          console.error(`❌ Error: No se pudo obtener eventos para ${city}`)
          errors.push(`${city}: Error al obtener eventos - respuesta inválida`)
          cityStats.push({
            city,
            found: 0,
            created: 0,
            skipped: 0
          })
          continue
        }
        
        // Si RSS no devuelve resultados, intentar GraphQL
        if (raEvents.length === 0) {
          console.log(`   RSS vacío, intentando GraphQL...`)
          const graphQLEvents = await fetchRAEventsGraphQL(area)
          if (Array.isArray(graphQLEvents)) {
            raEvents = graphQLEvents
          }
        }
        
        console.log(`   ✅ Encontrados ${raEvents.length} eventos`)
        console.log(`   🔍 Debug - raEvents es array:`, Array.isArray(raEvents))
        console.log(`   🔍 Debug - raEvents.length:`, raEvents.length)
        totalFound += raEvents.length
        console.log(`   🔍 Debug - totalFound después de ${city}:`, totalFound)
        
        let cityCreated = 0
        let citySkipped = 0
        
        // Procesar eventos con delay entre cada uno
        for (const raEvent of raEvents) {
          try {
            // Validar que raEvent existe y tiene datos mínimos
            if (!raEvent || typeof raEvent !== 'object') {
              console.warn(`⚠️ Evento inválido en ${city}, saltando...`)
              continue
            }

            const eventId = raEvent.id || String(Date.now())
            
            // Verificar si ya existe
            const checkResult = await supabase
              .from('events')
              .select('id')
              .eq('ra_event_id', eventId)
              .maybeSingle()

            // Validar que checkResult existe
            if (!checkResult) {
              console.warn(`⚠️ Error al verificar evento existente en ${city}, saltando...`)
              continue
            }

            const { data: existing, error: checkError } = checkResult

            if (existing && !checkError) {
              totalSkipped++
              citySkipped++
              continue
            }

            // Crear evento con validación de título
            const eventTitle = raEvent.title || 'Evento'
            const slug = `${eventId}-${String(eventTitle).toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}`
            const eventDate = raEvent.date ? new Date(raEvent.date) : new Date()
            
            // Validar que la fecha es válida
            let validEventDate = eventDate
            if (isNaN(validEventDate.getTime())) {
              console.warn(`⚠️ Fecha inválida para evento en ${city}, usando fecha actual`)
              validEventDate = new Date()
            }
            
            const eventData = {
              title: eventTitle,
              slug: slug.substring(0, 100),
              description: `Evento sincronizado desde Resident Advisor`,
              event_date: validEventDate.toISOString(),
              venue: 'TBA',
              city: city,
              country: 'España',
              lineup: [],
              image_url: null,
              ticket_url: raEvent.contentUrl || null,
              language: 'es',
              featured: false,
              ra_event_id: eventId,
              ra_synced: true,
              ra_sync_date: new Date().toISOString(),
              status: 'DRAFT', // Requiere moderación
            }

            const insertResult = await supabase
              .from('events')
              .insert(eventData)
              .select()

            // Validar que insertResult existe
            if (!insertResult) {
              console.error(`❌ Error: insertResult es undefined para evento en ${city}`)
              errors.push(`${city}: Error al insertar evento - resultado indefinido`)
              continue
            }

            if (insertResult.error) {
              if (insertResult.error.code !== '23505') { // Ignorar duplicados
                errors.push(`${city}: ${insertResult.error.message || 'Error desconocido'}`)
              } else {
                totalSkipped++
                citySkipped++
              }
            } else if (insertResult.data && insertResult.data.length > 0) {
              totalCreated++
              cityCreated++
            }

            // Delay más corto entre eventos (200ms - 800ms) para evitar timeout
            await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 600))
          } catch (eventError) {
            errors.push(`${city} - Evento: ${eventError instanceof Error ? eventError.message : String(eventError)}`)
          }
        }

        // Guardar estadísticas de la ciudad
        const cityStat = {
          city,
          found: raEvents.length,
          created: cityCreated,
          skipped: citySkipped
        }
        console.log(`   🔍 Debug - cityStat para ${city}:`, JSON.stringify(cityStat))
        cityStats.push(cityStat)
        console.log(`   🔍 Debug - cityStats después de ${city}:`, JSON.stringify(cityStats))
        
        // Delay más corto entre ciudades (2-4 segundos) para evitar timeout
        if (i < TARGET_CITIES.length - 1) {
          const delay = 2000 + Math.random() * 2000
          console.log(`   ⏳ Esperando ${Math.round(delay / 1000)}s antes de la siguiente ciudad...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      } catch (cityError) {
        errors.push(`${city}: ${cityError instanceof Error ? cityError.message : String(cityError)}`)
        cityStats.push({
          city,
          found: 0,
          created: 0,
          skipped: 0
        })
      }
    }

    // Debug: Verificar valores antes de crear el resultado
    console.log('🔍 Debug - totalFound:', totalFound)
    console.log('🔍 Debug - cityStats:', JSON.stringify(cityStats))
    console.log('🔍 Debug - totalCreated:', totalCreated)
    console.log('🔍 Debug - totalSkipped:', totalSkipped)
    console.log('🔍 Debug - errors.length:', errors.length)
    
    const result = {
      success: errors.length < TARGET_CITIES.length,
      timestamp: new Date().toISOString(),
      totalFound, // Total eventos encontrados en RA
      totalCreated,
      totalUpdated,
      totalSkipped,
      errors: errors.slice(0, 10),
      strategy: 'stealth_mode',
      citiesProcessed: TARGET_CITIES.length,
      cityStats, // Estadísticas por ciudad
    }

    console.log('✅ Sync completado:', JSON.stringify(result, null, 2))
    console.log('🔍 Debug - result.totalFound:', result.totalFound)
    console.log('🔍 Debug - result.cityStats:', JSON.stringify(result.cityStats))

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('❌ Error fatal:', error)
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

