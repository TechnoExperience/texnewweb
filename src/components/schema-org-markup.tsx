import { useEffect } from "react"

interface SchemaOrgMarkupProps {
  type: "Article" | "Event" | "MusicRelease" | "Video" | "Organization" | "WebSite"
  data: Record<string, any>
}

export function SchemaOrgMarkup({ type, data }: SchemaOrgMarkupProps) {
  useEffect(() => {
    // Remove existing schema markup
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    let schema: any = {}

    switch (type) {
      case "Article":
        schema = {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: data.title,
          description: data.description || data.excerpt,
          image: data.image,
          datePublished: data.published_date,
          dateModified: data.updated_at || data.published_date,
          author: {
            "@type": "Person",
            name: data.author,
          },
          publisher: {
            "@type": "Organization",
            name: "Techno Experience",
            logo: {
              "@type": "ImageObject",
              url: "https://technoexperience.com/logo.png",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": data.url,
          },
        }
        break

      case "Event":
        schema = {
          "@context": "https://schema.org",
          "@type": "Event",
          name: data.title,
          description: data.description,
          startDate: data.event_date,
          endDate: data.end_datetime || data.event_date,
          location: {
            "@type": "Place",
            name: data.venue,
            address: {
              "@type": "PostalAddress",
              addressLocality: data.city,
              addressCountry: data.country,
            },
          },
          image: data.image_url,
          organizer: {
            "@type": "Organization",
            name: data.promoter || "Techno Experience",
          },
        }
        break

      case "MusicRelease":
        schema = {
          "@context": "https://schema.org",
          "@type": "MusicAlbum",
          name: data.title,
          byArtist: {
            "@type": "MusicGroup",
            name: data.artist,
          },
          recordLabel: {
            "@type": "Organization",
            name: data.label,
          },
          datePublished: data.release_date,
          image: data.cover_art,
        }
        break

      case "Video":
        schema = {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: data.title,
          description: data.description,
          thumbnailUrl: data.thumbnail_url,
          uploadDate: data.published_date,
          duration: data.duration,
        }
        break

      case "Organization":
        schema = {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Techno Experience",
          url: "https://technoexperience.com",
          logo: "https://technoexperience.com/logo.png",
          sameAs: [
            "https://www.facebook.com/technoexperience",
            "https://www.instagram.com/technoexperience",
            "https://www.twitter.com/technoexperience",
          ],
        }
        break

      case "WebSite":
        schema = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Techno Experience",
          url: "https://technoexperience.com",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://technoexperience.com/search?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }
        break
    }

    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [type, data])

  return null
}

