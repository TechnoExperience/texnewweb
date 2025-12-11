// Supabase Edge Function: Scrape Dropshipping Product
// Extrae datos de productos desde enlaces de proveedores

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL es requerida' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Validar que es una URL válida
    let productUrl: URL
    try {
      productUrl = new URL(url)
    } catch {
      return new Response(
        JSON.stringify({ error: 'URL inválida' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Fetch HTML del producto
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Error al acceder a la URL: ${response.status}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        }
      )
    }

    const html = await response.text()

    // Extraer datos usando regex y parsing básico
    // Esto es un scraper genérico que intenta detectar patrones comunes
    
    // Título - buscar en varios lugares comunes
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/<h1[^>]*class[^>]*product[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/property="og:title"[^>]*content="([^"]+)"/i) ||
                      html.match(/name="twitter:title"[^>]*content="([^"]+)"/i)
    
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'Producto sin título'

    // Precio - buscar patrones comunes
    const pricePatterns = [
      /€\s*(\d+[.,]\d{2})/g,
      /EUR\s*(\d+[.,]\d{2})/g,
      /price["\s:]*(\d+[.,]\d{2})/gi,
      /data-price["\s=]*["']?(\d+[.,]\d{2})/gi,
      /class[^>]*price[^>]*>.*?(\d+[.,]\d{2})/gi,
    ]

    let price = 0
    for (const pattern of pricePatterns) {
      const matches = [...html.matchAll(pattern)]
      if (matches.length > 0) {
        const priceStr = matches[0][1].replace(',', '.')
        const parsedPrice = parseFloat(priceStr)
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
          price = parsedPrice
          break
        }
      }
    }

    // Precio comparado (descuento)
    const comparePricePatterns = [
      /compare.*?price["\s:]*(\d+[.,]\d{2})/gi,
      /original.*?price["\s:]*(\d+[.,]\d{2})/gi,
      /was.*?€\s*(\d+[.,]\d{2})/gi,
    ]

    let comparePrice: number | undefined
    for (const pattern of comparePricePatterns) {
      const matches = [...html.matchAll(pattern)]
      if (matches.length > 0) {
        const priceStr = matches[0][1].replace(',', '.')
        const parsedPrice = parseFloat(priceStr)
        if (!isNaN(parsedPrice) && parsedPrice > price) {
          comparePrice = parsedPrice
          break
        }
      }
    }

    // Descripción
    const descriptionPatterns = [
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<div[^>]*class[^>]*description[^>]*>([\s\S]{0,500})<\/div>/i,
      /<p[^>]*class[^>]*description[^>]*>([\s\S]{0,500})<\/p>/i,
    ]

    let description = ''
    for (const pattern of descriptionPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        description = match[1]
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 2000)
        if (description.length > 50) break
      }
    }

    // Imágenes - buscar todas las imágenes del producto
    const imagePatterns = [
      /<img[^>]*src=["']([^"']+)["'][^>]*class[^>]*product[^>]*>/gi,
      /<img[^>]*class[^>]*product[^>]*src=["']([^"']+)["']/gi,
      /data-src=["']([^"']+)["'][^>]*class[^>]*product/gi,
      /property="og:image"[^>]*content="([^"]+)"/gi,
      /name="twitter:image"[^>]*content="([^"]+)"/gi,
    ]

    const images: string[] = []
    const imageSet = new Set<string>()

    for (const pattern of imagePatterns) {
      const matches = [...html.matchAll(pattern)]
      for (const match of matches) {
        if (match[1]) {
          let imgUrl = match[1]
          // Convertir URLs relativas a absolutas
          if (imgUrl.startsWith('//')) {
            imgUrl = `${productUrl.protocol}${imgUrl}`
          } else if (imgUrl.startsWith('/')) {
            imgUrl = `${productUrl.origin}${imgUrl}`
          } else if (!imgUrl.startsWith('http')) {
            imgUrl = `${productUrl.origin}/${imgUrl}`
          }
          
          // Filtrar imágenes pequeñas, iconos, etc.
          if (!imgUrl.includes('icon') && 
              !imgUrl.includes('logo') && 
              !imgUrl.includes('avatar') &&
              imgUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
            if (!imageSet.has(imgUrl)) {
              imageSet.add(imgUrl)
              images.push(imgUrl)
            }
          }
        }
      }
    }

    // Limitar a 10 imágenes
    const finalImages = images.slice(0, 10)

    // Variantes - intentar detectar tallas, colores, etc.
    const variants: Array<{
      name: string
      price?: number
      attributes: Record<string, string>
      stock?: number
    }> = []

    // Buscar selectores de variantes
    const variantSelectPatterns = [
      /<select[^>]*name[^>]*size[^>]*>([\s\S]*?)<\/select>/gi,
      /<select[^>]*name[^>]*color[^>]*>([\s\S]*?)<\/select>/gi,
      /data-variant[^>]*>([\s\S]{0,200})/gi,
    ]

    for (const pattern of variantSelectPatterns) {
      const matches = [...html.matchAll(pattern)]
      for (const match of matches) {
        const optionMatches = [...match[1].matchAll(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi)]
        for (const optMatch of optionMatches) {
          if (optMatch[2] && !optMatch[2].includes('Seleccionar') && !optMatch[2].includes('Choose')) {
            variants.push({
              name: optMatch[2].trim(),
              attributes: { value: optMatch[1] },
            })
          }
        }
      }
    }

    // Si no se encontraron variantes, crear una por defecto
    if (variants.length === 0) {
      variants.push({
        name: 'Única',
        attributes: {},
      })
    }

    const result = {
      success: true,
      product: {
        title,
        price: price || 0,
        comparePrice: comparePrice || undefined,
        description: description || 'Sin descripción disponible',
        images: finalImages.length > 0 ? finalImages : [],
        variants: variants.length > 0 ? variants : undefined,
        supplierUrl: url,
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error scraping product:', error)
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

