export type EmbedProvider =
  | "youtube"
  | "soundcloud"
  | "spotify"
  | "bandcamp"
  | "mixcloud"
  | "instagram"
  | "tiktok"
  | "unknown"

export interface EmbedData {
  provider: EmbedProvider
  embed_html: string
  thumbnail_url?: string
  original_url: string
}

/**
 * Extrae el iframe de una URL si es un HTML completo o contiene un iframe
 */
function extractIframeFromHtml(html: string): string | null {
  // Buscar iframe en el HTML
  const iframeMatch = html.match(/<iframe[^>]*>.*?<\/iframe>/is)
  if (iframeMatch) {
    return iframeMatch[0]
  }
  
  // Buscar script que genere iframe
  const scriptMatch = html.match(/<script[^>]*>.*?<\/script>/is)
  if (scriptMatch) {
    // Si es un script de embed, intentar extraer la URL
    const srcMatch = scriptMatch[0].match(/src=["']([^"']+)["']/)
    if (srcMatch) {
      return `<iframe src="${srcMatch[1]}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="w-full h-full"></iframe>`
    }
  }
  
  return null
}

export function getEmbedFromUrl(rawUrl: string): EmbedData {
  // Si la URL parece ser HTML directo (contiene <iframe o <script)
  if (rawUrl.trim().startsWith("<") || rawUrl.includes("<iframe") || rawUrl.includes("<script")) {
    const iframeHtml = extractIframeFromHtml(rawUrl)
    if (iframeHtml) {
      return {
        provider: "custom",
        embed_html: iframeHtml,
        original_url: rawUrl,
      }
    }
    // Si no se puede extraer, devolver el HTML tal cual
    return {
      provider: "custom",
      embed_html: rawUrl,
      original_url: rawUrl,
    }
  }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return {
      provider: "unknown",
      embed_html: "",
      original_url: rawUrl,
    }
  }

  const host = url.hostname.replace("www.", "")

  // YouTube
  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    const videoId =
      url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop()

    if (!videoId) {
      return {
        provider: "youtube",
        embed_html: "",
        original_url: rawUrl,
      }
    }

    return {
      provider: "youtube",
      original_url: rawUrl,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embed_html: `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe>`,
    }
  }

  // SoundCloud (simple oEmbed iframe)
  if (host.includes("soundcloud.com")) {
    const encoded = encodeURIComponent(rawUrl)
    return {
      provider: "soundcloud",
      original_url: rawUrl,
      embed_html: `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encoded}"></iframe>`,
    }
  }

  // Spotify
  if (host.includes("spotify.com")) {
    const path = url.pathname.replace(/^\/embed\//, "/")
    return {
      provider: "spotify",
      original_url: rawUrl,
      embed_html: `<iframe src="https://open.spotify.com/embed${path}" width="100%" height="152" frameborder="0" allow="encrypted-media" class="w-full h-full"></iframe>`,
    }
  }

  // Mixcloud
  if (host.includes("mixcloud.com")) {
    const encoded = encodeURIComponent(rawUrl)
    return {
      provider: "mixcloud",
      original_url: rawUrl,
      embed_html: `<iframe width="100%" height="180" src="https://www.mixcloud.com/widget/iframe/?feed=${encoded}" frameborder="0" class="w-full h-full"></iframe>`,
    }
  }

  // Bandcamp: dejamos el HTML vacío y delegamos en embeds manuales si hace falta
  if (host.includes("bandcamp.com")) {
    return {
      provider: "bandcamp",
      original_url: rawUrl,
      embed_html: "",
    }
  }

  // Instagram / TikTok: placeholder, se podría mejorar con oEmbed
  if (host.includes("instagram.com")) {
    return {
      provider: "instagram",
      original_url: rawUrl,
      embed_html: "",
    }
  }

  if (host.includes("tiktok.com")) {
    return {
      provider: "tiktok",
      original_url: rawUrl,
      embed_html: "",
    }
  }

  return {
    provider: "unknown",
    embed_html: "",
    original_url: rawUrl,
  }
}

/**
 * Detecta el tipo de reproductor basado en los datos disponibles
 */
export function detectPlayerType(release: {
  tracklist?: string[]
  player_url?: string
  embed_html?: string
  player_type?: "tracklist" | "embed" | "auto"
}): "tracklist" | "embed" {
  // Si hay un tipo explícito y no es "auto", usarlo
  if (release.player_type && release.player_type !== "auto") {
    return release.player_type
  }

  // Si hay embed_html o player_url, usar embed
  if (release.embed_html || release.player_url) {
    return "embed"
  }

  // Si hay tracklist, usar tracklist
  if (release.tracklist && release.tracklist.length > 0) {
    return "tracklist"
  }

  // Por defecto, embed si no hay nada
  return "embed"
}


