import { useEffect } from "react"

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

export function SEOHead({
  title = "Techno Experience - Underground Techno Music Platform",
  description = "Tu fuente definitiva de noticias, eventos, lanzamientos y videos de música techno. Descubre el underground y mantente conectado con la comunidad techno global.",
  image = "https://technoexperience.com/og-image.jpg",
  url = "https://technoexperience.com",
  type = "website",
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
      if (!element) {
        element = document.createElement("meta")
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute("content", content)
    }

    // Basic meta tags
    updateMetaTag("description", description)
    updateMetaTag("keywords", "techno, música techno, eventos techno, lanzamientos techno, underground, techno music, techno experience")
    updateMetaTag("author", "Techno Experience")

    // Open Graph tags
    updateMetaTag("og:title", title, "property")
    updateMetaTag("og:description", description, "property")
    updateMetaTag("og:image", image, "property")
    updateMetaTag("og:url", url, "property")
    updateMetaTag("og:type", type, "property")
    updateMetaTag("og:site_name", "Techno Experience", "property")
    updateMetaTag("og:locale", "es_ES", "property")

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image")
    updateMetaTag("twitter:title", title)
    updateMetaTag("twitter:description", description)
    updateMetaTag("twitter:image", image)

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.setAttribute("rel", "canonical")
      document.head.appendChild(canonical)
    }
    canonical.setAttribute("href", url)
  }, [title, description, image, url, type])

  return null
}

