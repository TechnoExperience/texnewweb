import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import type { NewsArticle, ArticleCategory } from "@/types"
import { analyzeSeo } from "@/lib/seo-analyzer"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useUserProfile } from "@/hooks/useUserProfile"

const CATEGORIES: ArticleCategory[] = [
  "Entrevistas",
  "Críticas",
  "Crónicas",
  "Tendencias",
  "Editoriales",
  "Festivales",
  "Clubs",
  "Lanzamientos",
  "Industria",
  "Otros",
]

interface SeoState {
  focusKeyword: string
  metaTitle: string
  metaDescription: string
}

export default function AdminNewsEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id
  const { isAdmin, isEditor, userId } = useUserProfile()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<Partial<NewsArticle>>({})
  const [seo, setSeo] = useState<SeoState>({
    focusKeyword: "",
    metaTitle: "",
    metaDescription: "",
  })
  const [seoScore, setSeoScore] = useState<ReturnType<typeof analyzeSeo> | null>(null)

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false)
      return
    }

    const loadArticle = async () => {
      const { data, error } = await supabase.from("news").select("*").eq("id", id).single()
      if (error) {
        console.error("Error loading article:", error)
      } else if (data) {
        setArticle(data)
        setSeo({
          focusKeyword: data.seo_focus_keyword || "",
          metaTitle: data.meta_title || data.title || "",
          metaDescription: data.meta_description || data.excerpt || "",
        })
      }
      setLoading(false)
    }

    loadArticle()
  }, [id, isEditMode])

  useEffect(() => {
    if (!seo.focusKeyword && !seo.metaTitle && !seo.metaDescription && !article.content) {
      setSeoScore(null)
      return
    }

    const result = analyzeSeo({
      title: seo.metaTitle || article.title || "",
      description: seo.metaDescription || article.excerpt || "",
      contentHtml: article.content || "",
      focusKeyword: seo.focusKeyword || "",
    })
    setSeoScore(result)
  }, [seo.focusKeyword, seo.metaTitle, seo.metaDescription, article.content, article.title, article.excerpt])

  // Función para generar slug desde el título
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleChange = (field: keyof NewsArticle, value: any) => {
    setArticle((prev) => ({ ...prev, [field]: value }))
    
    // Auto-generar slug desde el título si no está en modo edición o si el slug está vacío
    if (field === "title" && (!isEditMode || !article.slug)) {
      const newSlug = generateSlug(value)
      setArticle((prev) => ({ ...prev, slug: newSlug }))
    }
  }

  const handleSeoChange = (field: keyof SeoState, value: string) => {
    setSeo((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader()
    return new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        try {
          const fileData = reader.result as string
          const { data, error } = await supabase.functions.invoke("upload-media", {
            body: {
              fileData,
              fileName: file.name,
              fileType: file.type,
              folder: "news",
            },
          })
          if (error) {
            console.error("Upload error:", error)
            reject(error)
          } else {
            resolve(data?.data?.publicUrl || "")
          }
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await handleImageUpload(file)
    if (url) {
      handleChange("image_url", url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!article.title || !article.slug || !article.excerpt || !article.content || !article.author || !article.category) {
      alert("Título, slug, extracto, contenido, autor y categoría son obligatorios.")
      return
    }

    setSaving(true)

    const payload: any = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      category: article.category,
      image_url: article.image_url,
      featured: article.featured ?? false,
      language: article.language || "es",
      reading_time: article.reading_time || Math.ceil((article.content || "").split(/\s+/).length / 200),
      meta_title: seo.metaTitle || article.title,
      meta_description: seo.metaDescription || article.excerpt,
      seo_focus_keyword: seo.focusKeyword || null,
      seo_slug: article.slug,
    }

    // Establecer created_by y status según el rol
    if (!isEditMode) {
      // Al crear: establecer created_by
      if (userId) {
        payload.created_by = userId
      }
      
      // Establecer status según el rol
      if (isAdmin || isEditor) {
        // Admins y editores: publicar directamente
        payload.status = "PUBLISHED"
      } else {
        // Usuarios normales: requiere aprobación
        payload.status = "PENDING_REVIEW"
      }
    } else {
      // Al editar: solo actualizar status si es admin
      // Los editores no pueden cambiar el status
      if (isAdmin && article.status) {
        payload.status = article.status
      }
    }

    try {
      if (isEditMode) {
        const { error } = await supabase.from("news").update(payload).eq("id", id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("news").insert(payload)
        if (error) throw error
      }
      navigate("/admin/news")
    } catch (error) {
      console.error("Error saving article:", error)
      alert("Error al guardar la noticia")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const seoColor =
    seoScore?.score === "GREEN"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : seoScore?.score === "YELLOW"
        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
        : "bg-red-500/20 text-red-300 border-red-500/40"

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        <Card className="mb-6 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">{isEditMode ? "Editar noticia" : "Crear noticia"}</CardTitle>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Título *</label>
                <Input
                  value={article.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Slug *</label>
                  <Input
                    value={article.slug || ""}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Autor *</label>
                  <Input
                    value={article.author || ""}
                    onChange={(e) => handleChange("author", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Categoría *</label>
                <select
                  value={article.category || ""}
                  onChange={(e) => handleChange("category", e.target.value as ArticleCategory)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                >
                  <option value="">Selecciona categoría</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Extracto *</label>
                <Textarea
                  value={article.excerpt || ""}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Contenido *</label>
                <RichTextEditor
                  content={article.content || ""}
                  onChange={(html) => handleChange("content", html)}
                  placeholder="Escribe tu contenido aquí... Usa la barra de herramientas para formatear texto, añadir encabezados, listas, enlaces, citas e imágenes."
                  className="min-h-[400px]"
                />
                <p className="mt-2 text-xs text-zinc-400">
                  Editor rich text tipo WordPress. Puedes formatear texto, añadir encabezados (H1-H6), listas, enlaces, citas e
                  imágenes. Arrastra imágenes directamente al editor o usa el botón de imagen para subirlas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Imagen de portada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Subir imagen</label>
                <Input type="file" accept="image/*" onChange={handleCoverUpload} />
                <p className="mt-1 text-xs text-zinc-400">
                  Recomendado: mínimo 1200x675px, peso máximo 1-2MB.
                </p>
              </div>
              {article.image_url && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Vista previa</label>
                  <img
                    src={article.image_url}
                    alt="Portada"
                    className="w-full max-w-md h-auto border border-zinc-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Estado SEO</span>
                {seoScore && (
                  <Badge className={seoColor}>
                    {seoScore.score === "GREEN"
                      ? "SEO OK"
                      : seoScore.score === "YELLOW"
                        ? "SEO mejorable"
                        : "SEO bajo"}
                  </Badge>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Palabra clave principal</label>
                <Input
                  value={seo.focusKeyword}
                  onChange={(e) => handleSeoChange("focusKeyword", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="techno underground madrid..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Meta título</label>
                <Input
                  value={seo.metaTitle}
                  onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  {seo.metaTitle.length} caracteres (recomendado 40–60).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Meta descripción</label>
                <Textarea
                  value={seo.metaDescription}
                  onChange={(e) => handleSeoChange("metaDescription", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[80px]"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  {seo.metaDescription.length} caracteres (recomendado 120–160).
                </p>
              </div>
              {seoScore && seoScore.messages.length > 0 && (
                <div className="mt-2 space-y-1">
                  {seoScore.messages.map((msg, idx) => (
                    <p key={idx} className="text-xs text-zinc-400">
                      • {msg}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
              onClick={() => navigate("/admin/news")}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]" disabled={saving}>
              {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear noticia"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
