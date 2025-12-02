import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RichTextEditor } from "@/components/rich-text-editor"
import { analyzeSeo } from "@/lib/seo-analyzer"
import type { Review } from "@/types"

const REVIEW_TYPES = ["event", "dj", "club", "promoter", "general"]
const REVIEW_CATEGORIES = ["event", "dj", "club", "promoter", "general"]

export default function AdminReviewsEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [review, setReview] = useState<Partial<Review>>({
    review_type: "general",
    category: "general",
    language: "es",
    featured: false,
    rating: 0,
    view_count: 0,
    published_date: new Date().toISOString(),
  })
  const [seo, setSeo] = useState({
    focusKeyword: "",
    metaTitle: "",
    metaDescription: "",
  })
  const [seoScore, setSeoScore] = useState<ReturnType<typeof analyzeSeo> | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [djs, setDjs] = useState<any[]>([])
  const [promoters, setPromoters] = useState<any[]>([])

  useEffect(() => {
    // Load related data for FK dropdowns
    const loadRelatedData = async () => {
      const [eventsRes, clubsRes, djsRes, promotersRes] = await Promise.all([
        supabase.from("events").select("id, title").order("event_date", { ascending: false }).limit(50),
        supabase.from("profiles").select("id, name, nombre_artistico").eq("profile_type", "club").limit(50),
        supabase.from("profiles").select("id, name, nombre_artistico").eq("profile_type", "dj").limit(50),
        supabase.from("profiles").select("id, name, nombre_artistico").eq("profile_type", "promoter").limit(50),
      ])
      if (eventsRes.data) setEvents(eventsRes.data)
      if (clubsRes.data) setClubs(clubsRes.data)
      if (djsRes.data) setDjs(djsRes.data)
      if (promotersRes.data) setPromoters(promotersRes.data)
    }
    loadRelatedData()

    if (!isEditMode) {
      setLoading(false)
      return
    }

    const loadReview = async () => {
      const { data, error } = await supabase.from("reviews").select("*").eq("id", id).single()
      if (error) {
        console.error("Error loading review:", error)
        alert("Error al cargar la review")
        navigate("/admin/reviews")
      } else if (data) {
        setReview(data)
        setSeo({
          focusKeyword: data.seo_focus_keyword || "",
          metaTitle: data.seo_title || data.title || "",
          metaDescription: data.seo_description || data.excerpt || "",
        })
      }
      setLoading(false)
    }

    loadReview()
  }, [id, isEditMode, navigate])

  useEffect(() => {
    if (!seo.focusKeyword && !seo.metaTitle && !seo.metaDescription && !review.content) {
      setSeoScore(null)
      return
    }

    const result = analyzeSeo({
      title: seo.metaTitle || review.title || "",
      description: seo.metaDescription || review.excerpt || "",
      contentHtml: review.content || "",
      focusKeyword: seo.focusKeyword || "",
    })
    setSeoScore(result)
  }, [seo.focusKeyword, seo.metaTitle, seo.metaDescription, review.content, review.title, review.excerpt])

  const handleChange = (field: keyof Review, value: any) => {
    setReview((prev) => ({ ...prev, [field]: value }))
  }

  const handleSeoChange = (field: keyof typeof seo, value: string) => {
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
              folder: "reviews",
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
    if (!review.title || !review.slug || !review.excerpt || !review.content) {
      alert("Título, slug, extracto y contenido son obligatorios.")
      return
    }

    // Validar que al menos una relación esté establecida (según constraint de la tabla)
    const hasRelation = 
      review.related_event_id || 
      review.related_dj_id || 
      review.related_club_id || 
      review.related_promoter_id ||
      review.venue_name

    if (!hasRelation && !isEditMode) {
      alert("Debes seleccionar al menos una relación: evento, DJ, club, promotor o ingresar un nombre de venue.")
      return
    }

    setSaving(true)

    const payload: any = {
      title: review.title,
      slug: review.slug,
      excerpt: review.excerpt,
      content: review.content,
      author: review.author || "Editor",
      published_date: review.published_date || new Date().toISOString(), // Campo obligatorio
      category: review.category || "general",
      review_type: review.review_type || review.category || "general",
      image_url: review.image_url || null,
      rating: review.rating ? parseFloat(review.rating.toString()) : null,
      language: review.language || "es",
      featured: review.featured ?? false,
      view_count: review.view_count || 0,
      tags: review.tags || [],
      // FK references
      related_event_id: review.related_event_id || null,
      related_club_id: review.related_club_id || null,
      related_dj_id: review.related_dj_id || null,
      related_promoter_id: review.related_promoter_id || null,
      venue_name: review.venue_name || null,
    }

    try {
      if (isEditMode) {
        const { error } = await supabase.from("reviews").update(payload).eq("id", id)
        if (error) {
          console.error("Error saving review:", error)
          alert(`Error al guardar la review: ${error.message}`)
          throw error
        }
      } else {
        const { error } = await supabase.from("reviews").insert(payload)
        if (error) {
          console.error("Error saving review:", error)
          alert(`Error al guardar la review: ${error.message}`)
          throw error
        }
      }
      navigate("/admin/reviews")
    } catch (error: any) {
      console.error("Error saving review:", error)
      // El error ya se muestra en el alert anterior
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
            <CardTitle className="text-white">{isEditMode ? "Editar review" : "Crear review"}</CardTitle>
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
                  value={review.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Slug *</label>
                  <Input
                    value={review.slug || ""}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Tipo *</label>
                  <select
                    value={review.review_type || "general"}
                    onChange={(e) => {
                      handleChange("review_type", e.target.value)
                      handleChange("category", e.target.value)
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    {REVIEW_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Autor *</label>
                  <Input
                    value={review.author || ""}
                    onChange={(e) => handleChange("author", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="Nombre del autor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Fecha de publicación *</label>
                  <Input
                    type="datetime-local"
                    value={review.published_date ? new Date(review.published_date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => handleChange("published_date", new Date(e.target.value).toISOString())}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Rating (0-5)</label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={review.rating || 0}
                    onChange={(e) => handleChange("rating", parseFloat(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                  <p className="mt-1 text-xs text-zinc-400">Calificación de 0 a 5 estrellas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Tags (separados por comas)</label>
                  <Input
                    value={Array.isArray(review.tags) ? review.tags.join(", ") : ""}
                    onChange={(e) => handleChange("tags", e.target.value.split(",").map(t => t.trim()).filter(t => t))}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="techno, underground, berlin..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Extracto *</label>
                <Textarea
                  value={review.excerpt || ""}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Contenido *</label>
                <RichTextEditor
                  content={review.content || ""}
                  onChange={(html) => handleChange("content", html)}
                  placeholder="Escribe tu review aquí..."
                  className="min-h-[400px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Referencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-zinc-400 mb-4">
                * Debes seleccionar al menos una relación: evento, DJ, club, promotor o ingresar un nombre de venue.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Evento relacionado</label>
                  <select
                    value={review.related_event_id || ""}
                    onChange={(e) => handleChange("related_event_id", e.target.value || null)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="">Ninguno</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">DJ relacionado</label>
                  <select
                    value={review.related_dj_id || ""}
                    onChange={(e) => handleChange("related_dj_id", e.target.value || null)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="">Ninguno</option>
                    {djs.map((dj) => (
                      <option key={dj.id} value={dj.id}>
                        {dj.nombre_artistico || dj.name || dj.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Club relacionado</label>
                  <select
                    value={review.related_club_id || ""}
                    onChange={(e) => handleChange("related_club_id", e.target.value || null)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="">Ninguno</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.nombre_artistico || club.name || club.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Promotor relacionado</label>
                  <select
                    value={review.related_promoter_id || ""}
                    onChange={(e) => handleChange("related_promoter_id", e.target.value || null)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="">Ninguno</option>
                    {promoters.map((promoter) => (
                      <option key={promoter.id} value={promoter.id}>
                        {promoter.nombre_artistico || promoter.name || promoter.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-white">Nombre de venue (si no hay club relacionado)</label>
                  <Input
                    value={review.venue_name || ""}
                    onChange={(e) => handleChange("venue_name", e.target.value || null)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="Nombre del venue o club"
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    Usa este campo si el club no está registrado en el sistema
                  </p>
                </div>
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
                  Recomendado: mínimo 1200x675px, peso máximo 1-2MB. Esta imagen se usa en las tarjetas del frontend.
                </p>
              </div>
              {review.image_url && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Vista previa</label>
                  <img
                    src={review.image_url}
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
                  placeholder="techno review madrid..."
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
              onClick={() => navigate("/admin/reviews")}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]" disabled={saving}>
              {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


