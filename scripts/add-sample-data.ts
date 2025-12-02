/**
 * Script para agregar datos de ejemplo:
 * - 10 eventos desde Resident Advisor
 * - Lanzamientos desde Spotify
 * - 2 reviews de ejemplo
 * 
 * Ejecutar con: npx tsx scripts/add-sample-data.ts
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://cfgfshoobuvycrbhnvkd.supabase.co"
// Usar service role key para poder insertar datos sin restricciones RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg"

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper para generar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}

// 1. Agregar 10 eventos desde Resident Advisor (Madrid, Barcelona, Berlin)
async function addRAEvents() {
  console.log("🎵 Sincronizando eventos desde Resident Advisor...")

  const cities = ["Madrid", "Barcelona", "Berlin"]
  const events: any[] = []

  for (const city of cities) {
    try {
      // Simular eventos de RA (en producción usarías la API real)
      const sampleEvents = [
        {
          title: `Techno Night ${city} - Amelie Lens`,
          description: `Una noche épica de techno con Amelie Lens en ${city}. La DJ belga trae su sonido característico de techno industrial y hard techno.`,
          event_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          venue: city === "Madrid" ? "Fabrik" : city === "Barcelona" ? "Razzmatazz" : "Berghain",
          city: city,
          country: city === "Berlin" ? "Germany" : "Spain",
          lineup: ["Amelie Lens", "Charlotte de Witte", "Reinier Zonneveld"],
          image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
          ticket_url: `https://ra.co/events/${Math.floor(Math.random() * 10000)}`,
          language: "es",
          featured: Math.random() > 0.7,
          event_type: "dj" as const,
          ra_event_id: `ra-${Math.floor(Math.random() * 100000)}`,
          ra_synced: true,
        },
        {
          title: `Underground Session ${city} - Enrico Sangiuliano`,
          description: `El productor italiano Enrico Sangiuliano presenta su nuevo álbum en ${city}. Una noche de techno melódico y progresivo.`,
          event_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          venue: city === "Madrid" ? "Mondo Disko" : city === "Barcelona" ? "Input" : "Tresor",
          city: city,
          country: city === "Berlin" ? "Germany" : "Spain",
          lineup: ["Enrico Sangiuliano", "ANNA", "Sam Paganini"],
          image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
          ticket_url: `https://ra.co/events/${Math.floor(Math.random() * 10000)}`,
          language: "es",
          featured: Math.random() > 0.7,
          event_type: "dj" as const,
          ra_event_id: `ra-${Math.floor(Math.random() * 100000)}`,
          ra_synced: true,
        },
        {
          title: `Drumcode Night ${city}`,
          description: `La noche oficial de Drumcode en ${city}. Adam Beyer presenta lo mejor del techno sueco.`,
          event_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          venue: city === "Madrid" ? "Goya Social Club" : city === "Barcelona" ? "Apolo" : "Watergate",
          city: city,
          country: city === "Berlin" ? "Germany" : "Spain",
          lineup: ["Adam Beyer", "Ida Engberg", "Bart Skils"],
          image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
          ticket_url: `https://ra.co/events/${Math.floor(Math.random() * 10000)}`,
          language: "es",
          featured: true,
          event_type: "dj" as const,
          ra_event_id: `ra-${Math.floor(Math.random() * 100000)}`,
          ra_synced: true,
        },
        {
          title: `Afterlife Experience ${city}`,
          description: `Tale of Us presenta Afterlife en ${city}. Una experiencia audiovisual única de techno melódico.`,
          event_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          venue: city === "Madrid" ? "Cocó" : city === "Barcelona" ? "Pacha" : "Kater Blau",
          city: city,
          country: city === "Berlin" ? "Germany" : "Spain",
          lineup: ["Tale of Us", "Maceo Plex", "Mind Against"],
          image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
          ticket_url: `https://ra.co/events/${Math.floor(Math.random() * 10000)}`,
          language: "es",
          featured: true,
          event_type: "promoter_festival" as const,
          ra_event_id: `ra-${Math.floor(Math.random() * 100000)}`,
          ra_synced: true,
        },
      ]

      events.push(...sampleEvents)
    } catch (error) {
      console.error(`Error fetching events for ${city}:`, error)
    }
  }

  // Agregar eventos adicionales para llegar a 10
  const additionalEvents = [
    {
      title: "Time Warp Mannheim 2025",
      description: "El festival de techno más prestigioso de Alemania. 3 días de música techno de clase mundial.",
      event_date: new Date("2025-04-05T22:00:00Z").toISOString(),
      venue: "Maimarkthalle",
      city: "Mannheim",
      country: "Germany",
      lineup: ["Richie Hawtin", "Sven Väth", "Nina Kraviz", "Amelie Lens", "Charlotte de Witte"],
      image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
      ticket_url: "https://ra.co/events/time-warp-mannheim-2025",
      language: "es",
      featured: true,
      event_type: "promoter_festival" as const,
      ra_event_id: "ra-timewarp-2025",
      ra_synced: true,
    },
  ]

  events.push(...additionalEvents)

  let added = 0
  let skipped = 0

  for (const event of events.slice(0, 10)) {
    const slug = generateSlug(event.title)
    
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existing) {
      console.log(`⏭️  Evento ya existe: ${event.title}`)
      skipped++
      continue
    }

    const { error } = await supabase.from("events").insert({
      ...event,
      slug,
    })

    if (error) {
      console.error(`❌ Error agregando evento ${event.title}:`, error.message)
    } else {
      console.log(`✅ Evento agregado: ${event.title}`)
      added++
    }
  }

  console.log(`\n📊 Eventos: ${added} agregados, ${skipped} ya existían\n`)
  return { added, skipped }
}

// 2. Agregar lanzamientos desde Spotify (simulados - en producción usarías la API de Spotify)
async function addSpotifyReleases() {
  console.log("🎵 Agregando lanzamientos desde Spotify...")

  const releases = [
    {
      title: "Consciousness",
      artist: "Enrico Sangiuliano",
      label: "Drumcode",
      release_date: new Date("2024-11-15").toISOString().split("T")[0],
      cover_art: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      genre: ["Techno", "Melodic Techno"],
      techno_style: "melodic",
      language: "es",
      featured: true,
      release_type: "album" as const,
      tracklist: ["Consciousness", "Astral Projection", "Symbiosis", "Biomorph"],
      links: {
        spotify: "https://open.spotify.com/album/consciousness",
        beatport: "https://www.beatport.com/release/consciousness/123456",
        soundcloud: "https://soundcloud.com/enrico-sangiuliano/consciousness",
      },
    },
    {
      title: "KNTXT Vol. 1",
      artist: "Charlotte de Witte",
      label: "KNTXT",
      release_date: new Date("2024-10-20").toISOString().split("T")[0],
      cover_art: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
      genre: ["Techno", "Hard Techno"],
      techno_style: "hard",
      language: "es",
      featured: true,
      release_type: "compilation" as const,
      tracklist: ["Selected", "Rave On Time", "Universal Consciousness", "Formula"],
      links: {
        spotify: "https://open.spotify.com/album/kntxt-vol1",
        beatport: "https://www.beatport.com/release/kntxt-vol1/123457",
      },
    },
    {
      title: "Higher",
      artist: "Reinier Zonneveld",
      label: "Filth on Acid",
      release_date: new Date("2024-09-10").toISOString().split("T")[0],
      cover_art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      genre: ["Techno", "Acid Techno"],
      techno_style: "acid",
      language: "es",
      featured: false,
      release_type: "ep" as const,
      tracklist: ["Higher", "Acid Trip", "Mind Control"],
      links: {
        spotify: "https://open.spotify.com/album/higher",
        beatport: "https://www.beatport.com/release/higher/123458",
      },
    },
    {
      title: "Awakenings Festival 2024",
      artist: "Various Artists",
      label: "Awakenings",
      release_date: new Date("2024-08-05").toISOString().split("T")[0],
      cover_art: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
      genre: ["Techno", "Hard Techno"],
      techno_style: "hard",
      language: "es",
      featured: true,
      release_type: "compilation" as const,
      tracklist: ["Live Set 1", "Live Set 2", "Live Set 3"],
      links: {
        spotify: "https://open.spotify.com/album/awakenings-2024",
        soundcloud: "https://soundcloud.com/awakenings/awakenings-2024",
      },
    },
    {
      title: "Plastikman - EX",
      artist: "Richie Hawtin",
      label: "Minus",
      release_date: new Date("2024-07-20").toISOString().split("T")[0],
      cover_art: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      genre: ["Techno", "Minimal Techno"],
      techno_style: "minimal",
      language: "es",
      featured: true,
      release_type: "album" as const,
      tracklist: ["EX", "Spastik", "Plastique"],
      links: {
        spotify: "https://open.spotify.com/album/plastikman-ex",
        beatport: "https://www.beatport.com/release/plastikman-ex/123459",
      },
    },
  ]

  let added = 0
  let skipped = 0

  for (const release of releases) {
    // Verificar si ya existe por título y artista
    const { data: existing } = await supabase
      .from("dj_releases")
      .select("id")
      .eq("title", release.title)
      .eq("artist", release.artist)
      .single()

    if (existing) {
      console.log(`⏭️  Lanzamiento ya existe: ${release.artist} - ${release.title}`)
      skipped++
      continue
    }

    const { error } = await supabase.from("dj_releases").insert(release)

    if (error) {
      console.error(`❌ Error agregando lanzamiento ${release.title}:`, error.message)
    } else {
      console.log(`✅ Lanzamiento agregado: ${release.artist} - ${release.title}`)
      added++
    }
  }

  console.log(`\n📊 Lanzamientos: ${added} agregados, ${skipped} ya existían\n`)
  return { added, skipped }
}

// 3. Agregar 2 reviews de ejemplo
async function addSampleReviews() {
  console.log("📝 Agregando reviews de ejemplo...")

  const reviews = [
    {
      title: "Time Warp Mannheim 2025: Una Experiencia Épica del Techno",
      slug: generateSlug("time-warp-mannheim-2025-review"),
      excerpt: "El festival más prestigioso de techno regresó a Mannheim con una edición histórica. Tres días de música ininterrumpida con los mejores DJs del mundo.",
      content: `
        <h2>Una Experiencia Inolvidable</h2>
        <p>Time Warp Mannheim 2025 ha superado todas las expectativas. Desde el primer momento, la energía en el Maimarkthalle era palpable. El sonido, la producción visual y la calidad de los artistas fue excepcional.</p>
        
        <h3>Highlights del Festival</h3>
        <ul>
          <li><strong>Richie Hawtin</strong>: Una masterclass de techno minimalista que duró 4 horas</li>
          <li><strong>Amelie Lens</strong>: Hard techno puro que hizo vibrar el suelo</li>
          <li><strong>Charlotte de Witte</strong>: Su set fue simplemente perfecto</li>
        </ul>
        
        <p>La organización fue impecable, con múltiples escenarios funcionando simultáneamente. El sistema de sonido Funktion-One en el escenario principal era simplemente increíble.</p>
        
        <h3>Veredicto Final</h3>
        <p>Time Warp sigue siendo el referente absoluto de los festivales de techno. Si solo puedes ir a un festival este año, este es el que debes elegir.</p>
      `,
      author: "Techno Experience Editorial",
      published_date: new Date().toISOString(),
      image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
      category: "event" as const,
      rating: 5.0,
      review_type: "event" as const,
      venue_name: "Maimarkthalle, Mannheim",
      language: "es",
      featured: true,
      tags: ["festival", "techno", "time-warp", "mannheim"],
      view_count: 0,
    },
    {
      title: "Enrico Sangiuliano - Consciousness: Un Álbum que Define el Techno Moderno",
      slug: generateSlug("enrico-sangiuliano-consciousness-review"),
      excerpt: "El productor italiano lanza su obra maestra. 'Consciousness' es un viaje a través del techno melódico que establece nuevos estándares para el género.",
      content: `
        <h2>Una Obra Maestra del Techno Melódico</h2>
        <p>Enrico Sangiuliano ha logrado crear algo verdaderamente especial con 'Consciousness'. Este álbum no es solo una colección de tracks, es una experiencia completa que te transporta a otro nivel de conciencia musical.</p>
        
        <h3>Análisis Track por Track</h3>
        <ul>
          <li><strong>Consciousness</strong>: El track principal es hipnótico y poderoso. La línea de bajo es simplemente perfecta.</li>
          <li><strong>Astral Projection</strong>: Una pieza más atmosférica que muestra la versatilidad de Sangiuliano</li>
          <li><strong>Symbiosis</strong>: El equilibrio perfecto entre melodía y fuerza</li>
          <li><strong>Biomorph</strong>: Un cierre épico que deja al oyente queriendo más</li>
        </ul>
        
        <h3>Producción y Calidad</h3>
        <p>La producción es impecable. Cada elemento está perfectamente balanceado. Los sintetizadores suenan increíbles y la mezcla es de nivel profesional absoluto.</p>
        
        <h3>Veredicto</h3>
        <p>'Consciousness' es sin duda uno de los mejores álbumes de techno del año. Enrico Sangiuliano ha creado algo que será recordado durante años. Un 5/5 sin dudas.</p>
      `,
      author: "Techno Experience Editorial",
      published_date: new Date().toISOString(),
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      category: "dj" as const,
      rating: 5.0,
      review_type: "dj" as const,
      venue_name: null,
      language: "es",
      featured: true,
      tags: ["album", "techno", "enrico-sangiuliano", "drumcode"],
      view_count: 0,
    },
  ]

  let added = 0
  let skipped = 0

  for (const review of reviews) {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("slug", review.slug)
      .single()

    if (existing) {
      console.log(`⏭️  Review ya existe: ${review.title}`)
      skipped++
      continue
    }

    const { error } = await supabase.from("reviews").insert(review)

    if (error) {
      console.error(`❌ Error agregando review ${review.title}:`, error.message)
    } else {
      console.log(`✅ Review agregada: ${review.title}`)
      added++
    }
  }

  console.log(`\n📊 Reviews: ${added} agregadas, ${skipped} ya existían\n`)
  return { added, skipped }
}

// Ejecutar todo
async function main() {
  console.log("🚀 Iniciando agregado de datos de ejemplo...\n")
  console.log(`📡 Conectando a Supabase: ${supabaseUrl.substring(0, 30)}...`)

  try {
    // Verificar conexión
    const { data, error } = await supabase.from("events").select("id").limit(1)
    if (error) {
      console.error("❌ Error de conexión:", error.message)
      process.exit(1)
    }
    console.log("✅ Conexión a Supabase establecida\n")

    await addRAEvents()
    await addSpotifyReleases()
    await addSampleReviews()

    console.log("\n✅ ¡Proceso completado exitosamente!")
    process.exit(0)
  } catch (error: any) {
    console.error("❌ Error en el proceso:", error?.message || error)
    console.error(error?.stack)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("❌ Error fatal:", error)
  process.exit(1)
})

