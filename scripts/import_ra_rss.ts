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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// RA RSS Feed URL (Example - normally you would use a specific city feed)
const RA_RSS_URL = "https://ra.co/xml/events.xml" // This is a placeholder URL

async function fetchRSS() {
    try {
        console.log(`Fetching RSS feed from ${RA_RSS_URL}...`)
        const response = await fetch(RA_RSS_URL)
        if (!response.ok) {
            throw new Error(`Failed to fetch RSS: ${response.statusText}`)
        }
        const xml = await response.text()
        return xml
    } catch (error) {
        console.error("Error fetching RSS:", error)
        return null
    }
}

function parseRSS(xml: string) {
    // Simple regex-based parser for demonstration
    // In production, use a proper XML parser like fast-xml-parser
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemContent = match[1]
        const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(itemContent) || /<title>(.*?)<\/title>/.exec(itemContent)
        const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent)
        const dateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemContent)
        const descriptionMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(itemContent) || /<description>(.*?)<\/description>/.exec(itemContent)

        if (titleMatch && linkMatch) {
            items.push({
                title: titleMatch[1],
                link: linkMatch[1],
                pubDate: dateMatch ? new Date(dateMatch[1]) : new Date(),
                description: descriptionMatch ? descriptionMatch[1] : "",
            })
        }
    }
    return items
}

async function importEvents() {
    const xml = await fetchRSS()
    if (!xml) return

    const events = parseRSS(xml)
    console.log(`Found ${events.length} events in RSS feed`)

    let importedCount = 0
    let updatedCount = 0

    for (const event of events) {
        // Extract slug from link
        const slug = event.link.split("/").pop() || event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")

        // Check if event exists
        const { data: existing } = await supabase
            .from("events")
            .select("id")
            .eq("slug", slug)
            .single()

        const eventData = {
            title: event.title,
            slug: slug,
            description: event.description.substring(0, 500), // Truncate description
            event_date: event.pubDate.toISOString(),
            ticket_url: event.link,
            venue: "Unknown Venue", // RA RSS might not have venue easily parsable without better XML parsing
            city: "Unknown City",
            country: "Unknown Country",
            featured: false,
            status: "draft" // Los eventos importados se crean como borrador para moderación
        }

        if (existing) {
            // Update existing event
            // const { error } = await supabase.from("events").update(eventData).eq("id", existing.id)
            // if (!error) updatedCount++
            // For now, we skip updates to preserve local changes
            console.log(`Skipping existing event: ${event.title}`)
        } else {
            // Insert new event
            const { error } = await supabase.from("events").insert(eventData)
            if (error) {
                console.error(`Error inserting event ${event.title}:`, error)
            } else {
                importedCount++
                console.log(`Imported: ${event.title}`)
            }
        }
    }

    console.log(`Import completed. Imported: ${importedCount}, Updated: ${updatedCount}`)
}

// Run the import
importEvents().catch(console.error)
