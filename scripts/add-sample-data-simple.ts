/**
 * Script simplificado para agregar datos de ejemplo
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cfgfshoobuvycrbhnvkd.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg"

const supabase = createClient(supabaseUrl, supabaseKey)

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}

async function main() {
  process.stdout.write("🚀 Iniciando...\n")
  process.stdout.write(`📡 Conectando a: ${supabaseUrl}\n`)
  
  // Test connection
  const { data: testData, error: testError } = await supabase.from("events").select("id").limit(1)
  if (testError) {
    process.stderr.write(`❌ Error de conexión: ${testError.message}\n`)
    process.exit(1)
  }
  process.stdout.write("✅ Conexión establecida\n\n")
  
  // 1. Agregar 10 eventos
  console.log("\n📅 Agregando eventos...")
  const events = [
    {
      title: "Techno Night Madrid - Amelie Lens",
      slug: generateSlug("Techno Night Madrid - Amelie Lens"),
      description: "Una noche épica de techno con Amelie Lens en Madrid.",
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Fabrik",
      city: "Madrid",
      country: "Spain",
      lineup: ["Amelie Lens", "Charlotte de Witte"],
      language: "es",
      featured: true,
      event_type: "dj",
    },
    {
      title: "Techno Night Barcelona - Enrico Sangiuliano",
      slug: generateSlug("Techno Night Barcelona - Enrico Sangiuliano"),
      description: "Enrico Sangiuliano en Barcelona.",
      event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Razzmatazz",
      city: "Barcelona",
      country: "Spain",
      lineup: ["Enrico Sangiuliano", "ANNA"],
      language: "es",
      featured: true,
      event_type: "dj",
    },
    {
      title: "Techno Night Berlin - Adam Beyer",
      slug: generateSlug("Techno Night Berlin - Adam Beyer"),
      description: "Adam Beyer en Berghain.",
      event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Berghain",
      city: "Berlin",
      country: "Germany",
      lineup: ["Adam Beyer", "Ida Engberg"],
      language: "es",
      featured: true,
      event_type: "dj",
    },
    {
      title: "Afterlife Experience Madrid",
      slug: generateSlug("Afterlife Experience Madrid"),
      description: "Tale of Us presenta Afterlife en Madrid.",
      event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Cocó",
      city: "Madrid",
      country: "Spain",
      lineup: ["Tale of Us", "Maceo Plex"],
      language: "es",
      featured: true,
      event_type: "promoter_festival",
    },
    {
      title: "Drumcode Night Barcelona",
      slug: generateSlug("Drumcode Night Barcelona"),
      description: "La noche oficial de Drumcode en Barcelona.",
      event_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Apolo",
      city: "Barcelona",
      country: "Spain",
      lineup: ["Adam Beyer", "Bart Skils"],
      language: "es",
      featured: false,
      event_type: "dj",
    },
    {
      title: "Underground Session Madrid - Reinier Zonneveld",
      slug: generateSlug("Underground Session Madrid - Reinier Zonneveld"),
      description: "Reinier Zonneveld en Madrid.",
      event_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Mondo Disko",
      city: "Madrid",
      country: "Spain",
      lineup: ["Reinier Zonneveld", "Amelie Lens"],
      language: "es",
      featured: false,
      event_type: "dj",
    },
    {
      title: "Time Warp Mannheim 2025",
      slug: generateSlug("Time Warp Mannheim 2025"),
      description: "El festival de techno más prestigioso de Alemania.",
      event_date: new Date("2025-04-05T22:00:00Z").toISOString(),
      venue: "Maimarkthalle",
      city: "Mannheim",
      country: "Germany",
      lineup: ["Richie Hawtin", "Sven Väth", "Nina Kraviz"],
      language: "es",
      featured: true,
      event_type: "promoter_festival",
    },
    {
      title: "Techno Night Barcelona - Charlotte de Witte",
      slug: generateSlug("Techno Night Barcelona - Charlotte de Witte"),
      description: "Charlotte de Witte en Barcelona.",
      event_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Input",
      city: "Barcelona",
      country: "Spain",
      lineup: ["Charlotte de Witte", "Amelie Lens"],
      language: "es",
      featured: true,
      event_type: "dj",
    },
    {
      title: "Techno Night Berlin - Nina Kraviz",
      slug: generateSlug("Techno Night Berlin - Nina Kraviz"),
      description: "Nina Kraviz en Berlin.",
      event_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Tresor",
      city: "Berlin",
      country: "Germany",
      lineup: ["Nina Kraviz", "Amelie Lens"],
      language: "es",
      featured: false,
      event_type: "dj",
    },
    {
      title: "Techno Night Madrid - Richie Hawtin",
      slug: generateSlug("Techno Night Madrid - Richie Hawtin"),
      description: "Richie Hawtin en Madrid.",
      event_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      venue: "Goya Social Club",
      city: "Madrid",
      country: "Spain",
      lineup: ["Richie Hawtin", "Adam Beyer"],
      language: "es",
      featured: true,
      event_type: "dj",
    },
  ]

  let eventsAdded = 0
  for (const event of events) {
    const { error } = await supabase.from("events").insert(event)
    if (error) {
      if (error.code === '23505') { // Duplicate key
        console.log(`⏭️  Evento ya existe: ${event.title}`)
      } else {
        console.error(`❌ Error: ${event.title} - ${error.message}`)
      }
    } else {
      console.log(`✅ Evento: ${event.title}`)
      eventsAdded++
    }
  }
  console.log(`📊 Eventos agregados: ${eventsAdded}/${events.length}\n`)

  // 2. Agregar lanzamientos
  console.log("🎵 Agregando lanzamientos...")
  const releases = [
    {
      title: "Consciousness",
      artist: "Enrico Sangiuliano",
      label: "Drumcode",
      release_date: "2024-11-15",
      genre: ["Techno", "Melodic Techno"],
      techno_style: "melodic",
      language: "es",
      featured: true,
      release_type: "album",
      tracklist: ["Consciousness", "Astral Projection"],
      links: {
        spotify: "https://open.spotify.com/album/consciousness",
        beatport: "https://www.beatport.com/release/consciousness/123456",
      },
    },
    {
      title: "KNTXT Vol. 1",
      artist: "Charlotte de Witte",
      label: "KNTXT",
      release_date: "2024-10-20",
      genre: ["Techno", "Hard Techno"],
      techno_style: "hard",
      language: "es",
      featured: true,
      release_type: "compilation",
      tracklist: ["Selected", "Rave On Time"],
      links: {
        spotify: "https://open.spotify.com/album/kntxt-vol1",
      },
    },
    {
      title: "Higher",
      artist: "Reinier Zonneveld",
      label: "Filth on Acid",
      release_date: "2024-09-10",
      genre: ["Techno", "Acid Techno"],
      techno_style: "acid",
      language: "es",
      featured: false,
      release_type: "ep",
      tracklist: ["Higher", "Acid Trip"],
      links: {
        spotify: "https://open.spotify.com/album/higher",
      },
    },
    {
      title: "Awakenings Festival 2024",
      artist: "Various Artists",
      label: "Awakenings",
      release_date: "2024-08-05",
      genre: ["Techno", "Hard Techno"],
      techno_style: "hard",
      language: "es",
      featured: true,
      release_type: "compilation",
      tracklist: ["Live Set 1", "Live Set 2"],
      links: {
        spotify: "https://open.spotify.com/album/awakenings-2024",
      },
    },
    {
      title: "Plastikman - EX",
      artist: "Richie Hawtin",
      label: "Minus",
      release_date: "2024-07-20",
      genre: ["Techno", "Minimal Techno"],
      techno_style: "minimal",
      language: "es",
      featured: true,
      release_type: "album",
      tracklist: ["EX", "Spastik"],
      links: {
        spotify: "https://open.spotify.com/album/plastikman-ex",
      },
    },
  ]

  let releasesAdded = 0
  for (const release of releases) {
    const { error } = await supabase.from("dj_releases").insert(release)
    if (error) {
      if (error.code === '23505') {
        console.log(`⏭️  Lanzamiento ya existe: ${release.artist} - ${release.title}`)
      } else {
        console.error(`❌ Error: ${release.title} - ${error.message}`)
      }
    } else {
      console.log(`✅ Lanzamiento: ${release.artist} - ${release.title}`)
      releasesAdded++
    }
  }
  console.log(`📊 Lanzamientos agregados: ${releasesAdded}/${releases.length}\n`)

  // 3. Agregar reviews
  console.log("📝 Agregando reviews...")
  const reviews = [
    {
      title: "Time Warp Mannheim 2025: Una Experiencia Épica del Techno",
      slug: generateSlug("Time Warp Mannheim 2025: Una Experiencia Épica del Techno"),
      excerpt: "El festival más prestigioso de techno regresó a Mannheim con una edición histórica.",
      content: "<h2>Una Experiencia Inolvidable</h2><p>Time Warp Mannheim 2025 ha superado todas las expectativas.</p>",
      author: "Techno Experience Editorial",
      published_date: new Date().toISOString(),
      category: "event",
      rating: 5.0,
      review_type: "event",
      venue_name: "Maimarkthalle, Mannheim",
      language: "es",
      featured: true,
      tags: ["festival", "techno"],
      view_count: 0,
    },
    {
      title: "Enrico Sangiuliano - Consciousness: Un Álbum que Define el Techno Moderno",
      slug: generateSlug("Enrico Sangiuliano - Consciousness: Un Álbum que Define el Techno Moderno"),
      excerpt: "El productor italiano lanza su obra maestra.",
      content: "<h2>Una Obra Maestra</h2><p>Enrico Sangiuliano ha logrado crear algo verdaderamente especial.</p>",
      author: "Techno Experience Editorial",
      published_date: new Date().toISOString(),
      category: "dj",
      rating: 5.0,
      review_type: "dj",
      venue_name: null,
      language: "es",
      featured: true,
      tags: ["album", "techno"],
      view_count: 0,
    },
  ]

  let reviewsAdded = 0
  for (const review of reviews) {
    const { error } = await supabase.from("reviews").insert(review)
    if (error) {
      if (error.code === '23505') {
        console.log(`⏭️  Review ya existe: ${review.title}`)
      } else {
        console.error(`❌ Error: ${review.title} - ${error.message}`)
      }
    } else {
      console.log(`✅ Review: ${review.title}`)
      reviewsAdded++
    }
  }
  console.log(`📊 Reviews agregadas: ${reviewsAdded}/${reviews.length}\n`)

  console.log("✅ ¡Proceso completado!")
}

main().catch((error) => {
  process.stderr.write(`❌ Error fatal: ${error.message}\n`)
  if (error.stack) {
    process.stderr.write(`${error.stack}\n`)
  }
  process.exit(1)
})

