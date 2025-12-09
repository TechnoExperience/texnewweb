import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { saveToCMS } from "@/lib/cms-sync"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmbeddedPlayer } from "@/components/embedded-player"
import { getEmbedFromUrl } from "@/lib/embeds"
import { toast } from "sonner"
import type { Video } from "@/types"

const VIDEO_TYPES = ["aftermovie", "live_set", "music_video", "dj_mix"]
const VIDEO_CATEGORIES = ["techno", "house", "minimal", "industrial", "experimental", "other"]

export default function AdminVideosEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [video, setVideo] = useState<Partial<Video>>({
    status: "pend",
    featured: false,
    language: "es",
    view_count: 0,
    duration: 0,
  })
  const [videoUrl, setVideoUrl] = useState("")
  const [embedPreview, setEmbedPreview] = useState<any>(null)

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false)
      return
    }

    const loadVideo = async () => {
      const { data, error } = await supabase.from("videos").select("*").eq("id", id).single()
      if (error) {
        console.error("Error loading video:", error)
        toast.error("Error al cargar el vídeo", {
          description: error.message || "No se pudo cargar el vídeo. Redirigiendo...",
        })
        navigate("/admin/videos")
      } else if (data) {
        setVideo(data)
        const url = data.video_url || data.youtube_url || ""
        setVideoUrl(url)
        if (url) {
          const embed = getEmbedFromUrl(url)
          setEmbedPreview(embed)
        }
      }
      setLoading(false)
    }

    loadVideo()
  }, [id, isEditMode, navigate])

  const handleChange = (field: keyof Video, value: any) => {
    setVideo((prev) => ({ ...prev, [field]: value }))
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    if (url) {
      const embed = getEmbedFromUrl(url)
      setEmbedPreview(embed)
      handleChange("video_url", url)
      handleChange("provider", embed?.provider || null)
      handleChange("embed_data", embed || null)
      // Infer thumbnail from embed if available
      if (embed?.thumbnail_url) {
        handleChange("thumbnail_url", embed.thumbnail_url)
      }
    } else {
      setEmbedPreview(null)
      handleChange("video_url", null)
      handleChange("provider", null)
      handleChange("embed_data", null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!video.title || !video.video_url) {
      toast.error("Campos obligatorios faltantes", {
        description: "Título y URL del vídeo son obligatorios.",
      })
      return
    }

    setSaving(true)

    const payload: any = {
      title: video.title,
      description: video.description || "",
      video_url: video.video_url,
      youtube_url: video.video_url, // Mantener compatibilidad
      thumbnail_url: video.thumbnail_url || embedPreview?.thumbnail_url || "",
      artist: video.artist || "",
      event_name: video.event_name || null,
      video_date: video.video_date || new Date().toISOString(),
      duration: video.duration || 0,
      category: video.category || "techno",
      video_type: video.video_type || null,
      language: video.language || "es",
      featured: video.featured ?? false,
      view_count: video.view_count || 0,
      status: video.status || "pend",
      provider: video.provider || embedPreview?.provider || null,
      embed_data: video.embed_data || embedPreview || null,
      uploader_id: video.uploader_id || null,
    }

    try {
      // Obtener usuario actual para uploader_id (solo en creación)
      if (!isEditMode) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single()
          if (profile) {
            payload.uploader_id = profile.id
          }
        }
      }
      
      const result = await saveToCMS("videos", payload, isEditMode ? id : undefined)
      if (!result.success) {
        throw result.error || new Error("Error al guardar el vídeo")
      }
      navigate("/admin/videos")
    } catch (error: any) {
      console.error("Error saving video:", error)
      toast.error("Error al guardar el vídeo", {
        description: error?.message || "No se pudo guardar el vídeo. Intenta de nuevo.",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 py-6 sm:py-8 ">
        <Card className="mb-6 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">{isEditMode ? "Editar vídeo" : "Crear vídeo"}</CardTitle>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Título *</label>
                <Input
                  value={video.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Artista</label>
                  <Input
                    value={video.artist || ""}
                    onChange={(e) => handleChange("artist", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Evento (opcional)</label>
                  <Input
                    value={video.event_name || ""}
                    onChange={(e) => handleChange("event_name", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Tipo</label>
                  <select
                    value={video.video_type || ""}
                    onChange={(e) => handleChange("video_type", e.target.value || null)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="">Selecciona tipo</option>
                    {VIDEO_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Categoría</label>
                  <select
                    value={video.category || "techno"}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    {VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Descripción</label>
                <Textarea
                  value={video.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Fecha del vídeo</label>
                  <Input
                    type="date"
                    value={video.video_date ? new Date(video.video_date).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleChange("video_date", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Duración (minutos)</label>
                  <Input
                    type="number"
                    min="0"
                    value={video.duration || 0}
                    onChange={(e) => handleChange("duration", parseInt(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">URL del vídeo y preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">URL del vídeo *</label>
                <Input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="https://youtube.com/watch?v=... o https://soundcloud.com/..."
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Soporta: YouTube, SoundCloud, Spotify, Bandcamp, Mixcloud, Instagram, TikTok
                </p>
                {embedPreview && (
                  <div className="mt-4">
                    <Badge className="mb-2 bg-green-500/20 text-green-300 border-green-500/40">
                      Preview: {embedPreview.provider}
                    </Badge>
                    <div className="mt-2">
                      <EmbeddedPlayer embed={embedPreview} className="w-full" />
                    </div>
                  </div>
                )}
                {videoUrl && !embedPreview && (
                  <Badge className="mt-2 bg-red-500/20 text-red-300 border-red-500/40">
                    URL no reconocida o no soportada
                  </Badge>
                )}
              </div>
              {video.thumbnail_url && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Thumbnail</label>
                  <img
                    src={video.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full  h-auto border border-zinc-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={video.featured ?? false}
                    onChange={(e) => handleChange("featured", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Destacado
                </label>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Estado</label>
                  <select
                    value={video.status || "PENDING_REVIEW"}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="PENDING_REVIEW">Pendiente de revisión</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="REJECTED">Rechazado</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
              onClick={() => navigate("/admin/videos")}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]" disabled={saving}>
              {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear vídeo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

