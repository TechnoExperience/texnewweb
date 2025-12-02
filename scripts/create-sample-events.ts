import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
})

const sampleEvents = [
  {
    title: "Techno Underground Madrid",
    slug: "techno-underground-madrid",
    description: "<p>Una noche épica de techno underground en el corazón de Madrid. Los mejores DJs del panorama nacional e internacional se reúnen para una sesión inolvidable.</p>",
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora a las 23:00
    venue: "Fabrik",
    city: "Madrid",
    country: "España",
    event_type: "club",
    lineup: ["Charlotte de Witte", "Amelie Lens", "Reinier Zonneveld", "Nina Kraviz"],
    image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: true,
    header_featured: true,
    status: "PUBLISHED"
  },
  {
    title: "Barcelona Techno Festival",
    slug: "barcelona-techno-festival",
    description: "<p>El festival de techno más importante de Barcelona. Tres días de música electrónica con los artistas más destacados del momento.</p>",
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(), // 14 días desde ahora a las 20:00
    venue: "Poble Espanyol",
    city: "Barcelona",
    country: "España",
    event_type: "promoter_festival",
    lineup: ["Adam Beyer", "Cirez D", "Drumcode", "Maceo Plex"],
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: true,
    header_featured: true,
    status: "PUBLISHED"
  },
  {
    title: "Valencia Techno Night",
    slug: "valencia-techno-night",
    description: "<p>Una noche intensa de techno en Valencia. Sonidos oscuros y profundos que te transportarán a otro nivel.</p>",
    event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000).toISOString(), // 10 días desde ahora a las 22:00
    venue: "La Fábrica de Hielo",
    city: "Valencia",
    country: "España",
    event_type: "club",
    lineup: ["Dax J", "Kobosil", "I Hate Models", "999999999"],
    image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: false,
    header_featured: false,
    status: "PUBLISHED"
  },
  {
    title: "Bilbao Industrial Techno",
    slug: "bilbao-industrial-techno",
    description: "<p>Techno industrial y hard techno en Bilbao. Una experiencia sonora brutal para los amantes del techno más duro.</p>",
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 21 días desde ahora a las 23:30
    venue: "Kafe Antzokia",
    city: "Bilbao",
    country: "España",
    event_type: "club",
    lineup: ["Paula Temple", "Anetha", "VTSS", "Shlømo"],
    image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: true,
    header_featured: false,
    status: "PUBLISHED"
  },
  {
    title: "Sevilla Deep Techno",
    slug: "sevilla-deep-techno",
    description: "<p>Techno profundo y atmosférico en Sevilla. Una noche para perderse en los sonidos más profundos del techno.</p>",
    event_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 18 días desde ahora a las 22:30
    venue: "Sala Custom",
    city: "Sevilla",
    country: "España",
    event_type: "club",
    lineup: ["Stephan Bodzin", "Oliver Huntemann", "Extrawelt", "Dominik Eulberg"],
    image_url: "https://images.unsplash.com/photo-1501281668745-f7f63ba5f4ba?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: false,
    header_featured: false,
    status: "PUBLISHED"
  },
  {
    title: "Málaga Beach Techno",
    slug: "malaga-beach-techno",
    description: "<p>Techno en la playa de Málaga. Una experiencia única combinando música electrónica y ambiente playero.</p>",
    event_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(), // 25 días desde ahora a las 18:00
    venue: "Playa de la Misericordia",
    city: "Málaga",
    country: "España",
    event_type: "promoter_festival",
    lineup: ["Solomun", "Dixon", "Tale Of Us", "Afterlife"],
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: true,
    header_featured: true,
    status: "PUBLISHED"
  },
  {
    title: "Zaragoza Minimal Techno",
    slug: "zaragoza-minimal-techno",
    description: "<p>Minimal techno en Zaragoza. Sonidos limpios y precisos para una noche de baile perfecta.</p>",
    event_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000).toISOString(), // 12 días desde ahora a las 23:00
    venue: "Sala Oasis",
    city: "Zaragoza",
    country: "España",
    event_type: "club",
    lineup: ["Ricardo Villalobos", "Sven Väth", "Richie Hawtin", "Dubfire"],
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: false,
    header_featured: false,
    status: "PUBLISHED"
  },
  {
    title: "Murcia Techno Underground",
    slug: "murcia-techno-underground",
    description: "<p>La escena underground de Murcia se reúne para una noche de techno puro y duro.</p>",
    event_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 16 días desde ahora a las 23:30
    venue: "Sala REM",
    city: "Murcia",
    country: "España",
    event_type: "club",
    lineup: ["Regal", "D.Dan", "Blawan", "Karenn"],
    image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80",
    ticket_url: "https://example.com/tickets",
    featured: false,
    header_featured: false,
    status: "PUBLISHED"
  }
]

async function createSampleEvents() {
  console.log("Creating sample events...")
  
  for (const event of sampleEvents) {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert(event)
        .select()
        .single()

      if (error) {
        // Si el evento ya existe (por slug), intentar actualizarlo
        if (error.code === "23505") {
          console.log(`Event ${event.slug} already exists, updating...`)
          const { data: updated, error: updateError } = await supabase
            .from("events")
            .update(event)
            .eq("slug", event.slug)
            .select()
            .single()

          if (updateError) {
            console.error(`Error updating event ${event.slug}:`, updateError)
          } else {
            console.log(`✓ Updated event: ${event.title}`)
          }
        } else {
          console.error(`Error creating event ${event.slug}:`, error)
        }
      } else {
        console.log(`✓ Created event: ${event.title}`)
      }
    } catch (err) {
      console.error(`Error processing event ${event.slug}:`, err)
    }
  }

  console.log("\n✅ Sample events creation completed!")
}

createSampleEvents()
  .then(() => {
    console.log("\n🎉 All done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })

