import { useParams, Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useSupabaseQuerySingle } from "@/hooks/useSupabaseQuerySingle"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { TABLES } from "@/constants/tables"
import type { NewsArticle } from "@/types"
import { useCallback, useEffect, useState } from "react"
import { 
  Clock, 
  User, 
  Calendar, 
  ArrowLeft, 
  Tag, 
  BookOpen,
  ChevronRight
} from "lucide-react"
import { SocialShare } from "@/components/social-share"
import { ReadingTime } from "@/components/reading-time"
import { TableOfContents } from "@/components/table-of-contents"
import { RelatedArticles } from "@/components/related-articles"
import { CommentsSection } from "@/components/comments-section"
import { SchemaOrgMarkup } from "@/components/schema-org-markup"
import { ROUTES } from "@/constants/routes"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FloatingBackButton } from "@/components/floating-back-button"

export default function NewsDetailPage() {
  const { slug: rawSlug } = useParams<{ slug: string }>()
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([])
  const [tableOfContents, setTableOfContents] = useState<Array<{ id: string; text: string; level: number }>>([])

  // Decodificar el slug de la URL y normalizar
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : ""
  
  // Función para normalizar slug (convertir espacios a guiones)
  const normalizeSlug = (s: string): string => {
    return s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  
  const normalizedSlug = decodedSlug ? normalizeSlug(decodedSlug) : ""
  
  // Buscar el artículo con diferentes variaciones del slug
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!rawSlug) {
      setLoading(false)
      return
    }

    const searchArticle = async () => {
      setLoading(true)
      setError(null)

      const slugsToTry = [
        decodedSlug, // Slug exacto con espacios
        normalizedSlug, // Slug normalizado con guiones
        decodedSlug.toLowerCase(), // Slug en minúsculas
        normalizedSlug.toLowerCase(), // Slug normalizado en minúsculas
        // Variaciones adicionales
        decodedSlug.replace(/\s+/g, '-'), // Espacios a guiones
        decodedSlug.replace(/-/g, ' '), // Guiones a espacios
        decodedSlug.replace(/[^a-z0-9-]/gi, ''), // Solo alfanuméricos y guiones
        normalizedSlug.replace(/[^a-z0-9-]/gi, ''), // Normalizado sin caracteres especiales
      ].filter(Boolean) // Eliminar valores vacíos

      // Eliminar duplicados
      const uniqueSlugs = [...new Set(slugsToTry)]

      console.log('[NewsDetail] Intentando buscar con slugs:', uniqueSlugs)

      // Intentar buscar con cada variación del slug
      for (const slug of uniqueSlugs) {
        try {
          // Primero intentar búsqueda exacta con join a profiles si existe created_by
          let { data, error: queryError } = await supabase
            .from(TABLES.NEWS)
            .select("*")
            .eq("slug", slug)
            .maybeSingle()

          if (queryError && queryError.code !== 'PGRST116') {
            console.warn(`[NewsDetail] Error buscando slug "${slug}":`, queryError.message)
            // Si hay un error de permisos, intentar búsqueda más amplia
            if (queryError.message?.includes('permission') || queryError.message?.includes('policy')) {
              // Intentar buscar todos y filtrar en el cliente (solo para debugging)
              const { data: allData } = await supabase
                .from(TABLES.NEWS)
                .select("id, slug, title, status")
                .limit(100)
              
              console.log('[NewsDetail] Artículos disponibles (primeros 100):', allData?.map(a => ({ slug: a.slug, title: a.title, status: a.status })))
            }
            continue
          }

          if (data) {
            console.log(`[NewsDetail] Artículo encontrado con slug: "${slug}"`)
            setArticle(data)
            setLoading(false)
            setError(null)
            return
          }

          // Si no se encontró con búsqueda exacta, intentar búsqueda case-insensitive
          // usando ilike (si está disponible en Supabase)
          if (slug !== slug.toLowerCase()) {
            const { data: caseData, error: caseError } = await supabase
              .from(TABLES.NEWS)
              .select("*")
              .ilike("slug", slug)
              .maybeSingle()

            if (!caseError && caseData) {
              console.log(`[NewsDetail] Artículo encontrado con búsqueda case-insensitive: "${slug}"`)
              setArticle(caseData)
              setLoading(false)
              setError(null)
              return
            }
          }
        } catch (err: any) {
          console.warn(`[NewsDetail] Excepción buscando slug "${slug}":`, err.message)
          continue
        }
      }

      // Como último recurso, intentar buscar todos los artículos y filtrar en el cliente
      // Esto es ineficiente pero puede ayudar a debuggear
      try {
        console.log('[NewsDetail] Intentando búsqueda amplia como último recurso...')
        const { data: allArticles, error: allError } = await supabase
          .from(TABLES.NEWS)
          .select("id, slug, title, status")
          .limit(500)

        if (!allError && allArticles) {
          console.log('[NewsDetail] Artículos encontrados en BD:', allArticles.length)
          // Buscar coincidencias parciales
          const matching = allArticles.find(a => 
            a.slug?.toLowerCase() === decodedSlug.toLowerCase() ||
            a.slug?.toLowerCase() === normalizedSlug.toLowerCase() ||
            a.slug?.toLowerCase().replace(/-/g, ' ') === decodedSlug.toLowerCase() ||
            a.slug?.toLowerCase().replace(/\s+/g, '-') === normalizedSlug.toLowerCase()
          )

          if (matching) {
            console.log('[NewsDetail] Coincidencia encontrada en búsqueda amplia:', matching)
            // Ahora buscar el artículo completo con el slug correcto
            const { data: fullArticle } = await supabase
              .from(TABLES.NEWS)
              .select("*")
              .eq("id", matching.id)
              .maybeSingle()

            if (fullArticle) {
              setArticle(fullArticle)
              setLoading(false)
              setError(null)
              return
            }
          }
        }
      } catch (err: any) {
        console.warn('[NewsDetail] Error en búsqueda amplia:', err.message)
      }

      // Si no se encontró con ninguna variación
      console.error('[NewsDetail] No se encontró el artículo con ningún slug:', uniqueSlugs)
      setArticle(null)
      setError(new Error(`No se encontró el artículo con slug: ${decodedSlug}`))
      setLoading(false)
    }

    searchArticle()
  }, [rawSlug, decodedSlug, normalizedSlug])

  // Debug: Log para ver qué slug se está buscando
  useEffect(() => {
    if (rawSlug) {
      console.log('[NewsDetail] Slug search:', {
        rawSlug,
        decodedSlug,
        normalizedSlug,
        hasArticle: !!article
      })
    }
  }, [rawSlug, decodedSlug, normalizedSlug, article])

  // Fetch related articles
  useEffect(() => {
    if (article) {
      const fetchRelated = async () => {
        const { data } = await supabase
          .from(TABLES.NEWS)
          .select("*")
          .eq("category", article.category)
          .neq("id", article.id)
          .order("published_date", { ascending: false })
          .limit(3)
        
        setRelatedArticles(data || [])
      }
      fetchRelated()

      // Generate table of contents from HTML content
      if (article.content) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(article.content, "text/html")
        const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6")
        const toc: Array<{ id: string; text: string; level: number }> = []
        
        headings.forEach((heading, index) => {
          const id = `heading-${index}`
          heading.id = id
          toc.push({
            id,
            text: heading.textContent || "",
            level: parseInt(heading.tagName.charAt(1))
          })
        })
        
        setTableOfContents(toc)
      }
    }
  }, [article])

  // SEO Meta Tags
  useEffect(() => {
    if (article) {
      document.title = `${article.meta_title || article.title} | Techno Experience`
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute("content", article.meta_description || article.excerpt)
      } else {
        const meta = document.createElement("meta")
        meta.name = "description"
        meta.content = article.meta_description || article.excerpt
        document.head.appendChild(meta)
      }

      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute("content", article.og_title || article.title)
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute("content", article.og_description || article.excerpt)
      }
      
      const ogImage = document.querySelector('meta[property="og:image"]')
      if (ogImage && article.og_image) {
        ogImage.setAttribute("content", article.og_image)
      } else if (ogImage && article.image_url) {
        ogImage.setAttribute("content", article.image_url)
      }
    }
  }, [article])

  // Schema.org markup
  useEffect(() => {
    if (article) {
      // This will be handled by SchemaOrgMarkup component
    }
  }, [article])

  if (loading) return <LoadingSpinner />
  if (error || !article) {
    return (
      <>
        <ErrorMessage message={`No se pudo cargar el artículo. Slug buscado: ${decodedSlug || rawSlug || 'N/A'}`} />
      </>
    )
  }

  return (
    <>
      <SchemaOrgMarkup
        type="Article"
        data={{
          title: article.title,
          description: article.excerpt,
          image: article.image_url,
          published_date: article.published_date,
          updated_at: article.updated_at,
          author: article.author,
          url: typeof window !== "undefined" ? window.location.href : "",
        }}
      />
      <article className="min-h-screen bg-black">
        <FloatingBackButton />
      {/* Hero Section - Spotify Style */}
      <div className="relative w-full">
      {article.image_url && (
          <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
          <OptimizedImage
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
          </div>
        )}
        
        {/* Content Overlay - Spotify Style */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12">
          <div className="w-full ">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/10 text-white border-white/20 text-xs uppercase tracking-wider">
              {article.category}
            </Badge>
          </div>

            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
                </div>
              <span>•</span>
                <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={article.published_date}>
                    {format(new Date(article.published_date), "d 'de' MMMM, yyyy", { locale: es })}
                  </time>
                </div>
              <span>•</span>
                <ReadingTime content={article.content} />
            </div>
          </div>
                </div>
              </div>

      {/* Article Content - Clean Spotify Style */}
      <div className="w-full px-4 sm:px-6 lg:px-8  py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Table of Contents - Sticky */}
            {tableOfContents.length > 0 && (
              <div className="mb-8">
                <TableOfContents content={article.content} />
              </div>
            )}
            {/* Excerpt */}
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed mb-8 font-light">
                {article.excerpt}
              </p>

              {/* Share Buttons */}
            <div className="mb-12 pb-8 border-b border-white/10">
              <SocialShare 
                url={`/news/${article.slug}`}
                title={article.title}
                description={article.excerpt}
                image={article.image_url}
              />
            </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-12">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`${ROUTES.NEWS}?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-white/70 text-sm hover:border-[#00F9FF]/50 hover:text-[#00F9FF] transition-colors rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

            {/* Article Content - Clean Typography */}
              <div
              className="prose prose-invert prose-lg  text-white/90 leading-relaxed
                prose-headings:text-white prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6
                  prose-headings:leading-tight
                prose-h1:text-4xl
                prose-h2:text-3xl
                prose-h3:text-2xl
                prose-h4:text-xl
                prose-p:text-white/90 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                prose-a:text-[#00F9FF] prose-a:no-underline hover:prose-a:text-[#00D9E6] hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-semibold
                prose-em:text-white/80 prose-em:italic
                prose-blockquote:border-l-[#00F9FF] prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-white/70 prose-blockquote:my-8
                prose-hr:border-white/10 prose-hr:my-12
                prose-ul:text-white/90 prose-ol:text-white/90 prose-ul:my-6 prose-ol:my-6
                prose-li:marker:text-[#00F9FF] prose-li:my-2
                prose-img:rounded-lg prose-img:my-8 prose-img:shadow-2xl prose-img:w-full prose-img:h-auto
                prose-code:text-[#00F9FF] prose-code:bg-white/5 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                prose-pre:bg-black prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:p-6"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#00F9FF]" />
                  <h3 className="text-lg font-bold text-white">
                    Índice
                  </h3>
                </div>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm text-white/70 hover:text-[#00F9FF] transition-colors ${
                        item.level === 1 ? "font-semibold pl-0" : 
                        item.level === 2 ? "pl-4" : 
                        "pl-8 text-xs"
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Author Card */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#00F9FF]/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#00F9FF]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{article.author}</h4>
                  <p className="text-xs text-white/60">Autor</p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Artículo publicado el {format(new Date(article.published_date), "d 'de' MMMM 'de' yyyy", { locale: es })}.
              </p>
            </div>

            {/* Category Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Categoría</h4>
              <Link
                to={`${ROUTES.NEWS}?category=${encodeURIComponent(article.category)}`}
                className="inline-flex items-center gap-2 text-[#00F9FF] hover:text-[#00D9E6] transition-colors text-sm"
              >
                {article.category}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-white/10 mt-16 pt-12">
        <div className="w-full px-4 sm:px-6 lg:px-8 ">
          <CommentsSection resourceType="news" resourceId={article.id} />
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="border-t border-white/10 mt-16 pt-12">
          <div className="w-full px-4 sm:px-6 lg:px-8 ">
            <RelatedArticles 
              articles={relatedArticles}
              currentArticleId={article.id}
              limit={3}
            />
          </div>
        </div>
      )}
    </article>
    </>
  )
}
