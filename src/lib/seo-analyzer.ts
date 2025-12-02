export type SeoScoreColor = "GREEN" | "YELLOW" | "RED"

interface SeoInput {
  title: string
  description: string
  contentHtml: string
  focusKeyword: string
}

interface SeoResult {
  score: SeoScoreColor
  messages: string[]
}

export function analyzeSeo({ title, description, contentHtml, focusKeyword }: SeoInput): SeoResult {
  const messages: string[] = []
  let points = 0

  const keyword = (focusKeyword || "").toLowerCase().trim()
  const plainContent = contentHtml.replace(/<[^>]+>/g, " ").toLowerCase()

  // Longitud del título
  if (title.length >= 40 && title.length <= 60) {
    points++
  } else {
    messages.push("El título debería tener entre 40 y 60 caracteres.")
  }

  // Longitud de la descripción
  if (description.length >= 120 && description.length <= 160) {
    points++
  } else {
    messages.push("La descripción debería tener entre 120 y 160 caracteres.")
  }

  if (keyword) {
    // Keyword en título
    if (title.toLowerCase().includes(keyword)) {
      points++
    } else {
      messages.push("La palabra clave no aparece en el título.")
    }

    // Keyword en descripción
    if (description.toLowerCase().includes(keyword)) {
      points++
    } else {
      messages.push("La palabra clave no aparece en la descripción.")
    }

    // Keyword en primer párrafo
    const firstChunk = plainContent.slice(0, 250)
    if (firstChunk.includes(keyword)) {
      points++
    } else {
      messages.push("Intenta incluir la palabra clave en el primer párrafo.")
    }

    // Keyword en subtítulos (H2–H6)
    const headings = (contentHtml.match(/<h[2-6][^>]*>.*?<\/h[2-6]>/gi) || []).join(" ").toLowerCase()
    if (headings && headings.includes(keyword)) {
      points++
    } else {
      messages.push("Añade la palabra clave en algún subtítulo (H2–H6).")
    }
  }

  // Longitud total del contenido
  if (plainContent.length > 800) {
    points++
  } else {
    messages.push("El contenido es algo corto, intenta superar las 800 palabras.")
  }

  // Uso de imágenes
  const imageCount = (contentHtml.match(/<img\b/gi) || []).length
  if (imageCount > 0) {
    points++
  } else {
    messages.push("Incluye alguna imagen para enriquecer el contenido.")
  }

  let score: SeoScoreColor
  if (points >= 7) {
    score = "GREEN"
  } else if (points >= 4) {
    score = "YELLOW"
  } else {
    score = "RED"
  }

  return { score, messages }
}


