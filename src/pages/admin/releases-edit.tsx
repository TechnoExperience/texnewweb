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
import type { Release } from "@/types"

const GENRES = ["acid", "hard", "melodic", "minimal", "industrial", "progressive", "raw", "hypnotic", "dark", "experimental"]
const RELEASE_TYPES = ["single", "ep", "album", "remix", "compilation"]

export default function AdminReleasesEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [release, setRelease] = useState<Partial<Release>>({
    status: "PUBLISHED",
    featured: false,
    language: "es",
    genre: [],
    tracklist: [],
  })
  const [playerUrl, setPlayerUrl] = useState("")
  const [embedHtml, setEmbedHtml] = useState("")
  const [embedPreview, setEmbedPreview] = useState<any>(null)

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false)
      return
    }

    const loadRelease = async () => {
      const { data, error } = await supabase.from("dj_releases").select("*").eq("id", id).single()
      if (error) {
        console.error("Error loading release:", error)
        toast.error("Error al cargar el lanzamiento", {
          description: error.message || "No se pudo cargar el lanzamiento. Redirigiendo...",
        })
        navigate("/admin/releases")
      } else if (data) {
        setRelease({
          ...data,
          images: data.images || [] // Asegurar que images sea un array
        })
        setPlayerUrl(data.player_url || "")
        setEmbedHtml(data.embed_html || "")
        if (data.player_url) {
          const embed = getEmbedFromUrl(data.player_url)
          setEmbedPreview(embed)
        } else if (data.embed_html) {
          // Si hay HTML directo, crear un preview
          setEmbedPreview({
            provider: "custom",
            embed_html: data.embed_html,
            original_url: data.embed_html
          })
        }
      }
      setLoading(false)
    }

    loadRelease()
  }, [id, isEditMode, navigate])

  const handleChange = (field: keyof Release, value: any) => {
    setRelease((prev) => ({ ...prev, [field]: value }))
  }

  const handlePlayerUrlChange = (url: string) => {
    setPlayerUrl(url)
    if (url) {
      const embed = getEmbedFromUrl(url)
      setEmbedPreview(embed)
      handleChange("player_url", url)
      handleChange("player_provider", embed?.provider || null)
    } else {
      setEmbedPreview(null)
      handleChange("player_url", null)
      handleChange("player_provider", null)
    }
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
              folder: "releases",
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
    
    // Validar que la imagen sea cuadrada (1:1)
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl)
      const aspectRatio = img.width / img.height
      
      // Permitir un margen de error del 5% (0.95 a 1.05)
      if (aspectRatio < 0.95 || aspectRatio > 1.05) {
        toast.error("Imagen no válida", {
          description: "La imagen debe ser cuadrada (relación 1:1). Por favor, recorta la imagen antes de subirla.",
          duration: 5000,
        })
        return
      }
      
      const url = await handleImageUpload(file)
      if (url) {
        handleChange("cover_art", url)
      }
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      toast.error("Error al cargar la imagen", {
        description: "Por favor, verifica que sea un archivo de imagen válido.",
      })
    }
    
    img.src = objectUrl
  }

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const currentImages = release.images || []
    const newImages: string[] = []
    
    for (const file of files) {
      try {
        const url = await handleImageUpload(file)
        if (url) {
          newImages.push(url)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }
    
    if (newImages.length > 0) {
      handleChange("images", [...currentImages, ...newImages])
    }
  }

  const removeAdditionalImage = (index: number) => {
    const currentImages = release.images || []
    handleChange("images", currentImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!release.title || !release.artist || !release.label || !release.release_date) {
      toast.error("Campos obligatorios faltantes", {
        description: "Título, artista, label y fecha son obligatorios.",
      })
      return
    }
    
    // Validar que la portada sea obligatoria
    if (!release.cover_art) {
      toast.error("Portada obligatoria", {
        description: "La portada (imagen cuadrada 1:1) es obligatoria.",
      })
      return
    }

    setSaving(true)

    const payload: any = {
      title: release.title,
      artist: release.artist,
      label: release.label,
      release_date: release.release_date,
      cover_art: release.cover_art, // Obligatorio
      images: release.images || [], // Fotos adicionales
      genre: release.genre || [],
      techno_style: release.techno_style || "",
      language: release.language || "es",
      featured: release.featured ?? false,
      release_type: release.release_type || null,
      tracklist: release.tracklist || [],
      links: release.links || {},
      status: release.status || "PUBLISHED",
      player_url: release.player_url || null,
      player_provider: release.player_provider || null,
      embed_html: release.embed_html || null,
      player_type: release.player_type || "auto",
    }

    try {
      const result = await saveToCMS("dj_releases", payload, isEditMode ? id : undefined)
      if (!result.success) {
        throw result.error || new Error("Error al guardar el lanzamiento")
      }
      navigate("/admin/releases")
    } catch (error: any) {
      console.error("Error saving release:", error)
      toast.error("Error al guardar el lanzamiento", {
        description: error?.message || "No se pudo guardar el lanzamiento. Intenta de nuevo.",
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
            <CardTitle className="text-white">{isEditMode ? "Editar lanzamiento" : "Crear lanzamiento"}</CardTitle>
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
                  value={release.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Artista *</label>
                  <Input
                    value={release.artist || ""}
                    onChange={(e) => handleChange("artist", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Label *</label>
                  <Input
                    value={release.label || ""}
                    onChange={(e) => handleChange("label", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Fecha de lanzamiento *</label>
                  <Input
                    type="date"
                    value={release.release_date ? new Date(release.release_date).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleChange("release_date", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Tipo</label>
                  <select
                    value={release.release_type || ""}
                    onChange={(e) => handleChange("release_type", e.target.value || null)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="">Selecciona tipo</option>
                    {RELEASE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Géneros</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {GENRES.map((genre) => (
                    <label key={genre} className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={release.genre?.includes(genre) || false}
                        onChange={(e) => {
                          const currentGenres = release.genre || []
                          if (e.target.checked) {
                            handleChange("genre", [...currentGenres, genre])
                          } else {
                            handleChange(
                              "genre",
                              currentGenres.filter((g) => g !== genre)
                            )
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Tracklist (uno por línea)</label>
                <Textarea
                  value={Array.isArray(release.tracklist) ? release.tracklist.join("\n") : ""}
                  onChange={(e) => handleChange("tracklist", e.target.value.split("\n").filter((l) => l.trim()))}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
                  placeholder="Track 1&#10;Track 2&#10;Track 3"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Portada y reproductor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Portada (cover art) <span className="text-red-400">*</span>
                </label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverUpload}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  <strong>OBLIGATORIO:</strong> Imagen cuadrada (relación 1:1). Recomendado: 1200x1200px, formato JPG/PNG, máximo 2MB.
                </p>
                {release.cover_art && (
                  <div className="mt-4">
                    <img
                      src={release.cover_art}
                      alt="Portada"
                      className="w-64 h-64 object-cover border border-zinc-700 rounded-lg"
                    />
                    <p className="mt-2 text-xs text-green-400">✓ Portada cargada correctamente</p>
                  </div>
                )}
                {!release.cover_art && (
                  <p className="mt-2 text-xs text-red-400">⚠ Debes subir una portada cuadrada (1:1)</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Fotos adicionales (opcional)
                </label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleAdditionalImageUpload}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Puedes añadir múltiples fotos adicionales del lanzamiento (artwork, fotos del artista, etc.)
                </p>
                {release.images && release.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {release.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Foto adicional ${index + 1}`}
                          className="w-full h-32 object-cover border border-zinc-700 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Tipo de Reproductor</label>
                  <select
                    value={release.player_type || "auto"}
                    onChange={(e) => handleChange("player_type", e.target.value as "tracklist" | "embed" | "auto")}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="auto">Auto (detecta según datos disponibles)</option>
                    <option value="tracklist">Tracklist (usa lista de tracks)</option>
                    <option value="embed">Embed/Iframe (reproductor embebido)</option>
                  </select>
                  <p className="mt-1 text-xs text-zinc-400">
                    Elige cómo se mostrará el reproductor en la página de detalle
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Opción 1: URL del reproductor (SoundCloud, Spotify, YouTube, etc.)</label>
                  <Input
                    type="url"
                    value={playerUrl}
                    onChange={(e) => handlePlayerUrlChange(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="https://soundcloud.com/..."
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    Soporta: SoundCloud, Spotify, YouTube, Bandcamp, Mixcloud
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
                </div>

                <div className="border-t border-zinc-700 pt-4">
                  <label className="block text-sm font-medium mb-1 text-white">Opción 2: HTML del Embed/Iframe (pegar directamente)</label>
                  <Textarea
                    value={embedHtml}
                    onChange={(e) => {
                      const html = e.target.value
                      setEmbedHtml(html)
                      handleChange("embed_html", html)
                      // Si se pega HTML, limpiar player_url para evitar conflictos
                      if (html.trim()) {
                        setPlayerUrl("")
                        handleChange("player_url", null)
                        setEmbedPreview({
                          provider: "custom",
                          embed_html: html,
                          original_url: html
                        })
                      } else {
                        setEmbedPreview(null)
                      }
                    }}
                    className="bg-zinc-900 border-zinc-700 text-white min-h-[120px] font-mono text-xs"
                    placeholder='<iframe src="https://..." frameborder="0"></iframe>'
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    Pega aquí el código HTML completo del iframe o embed. Si usas esto, no necesitas la URL arriba.
                  </p>
                  {embedHtml && (
                    <div className="mt-4">
                      <Badge className="mb-2 bg-blue-500/20 text-blue-300 border-blue-500/40">
                        Preview: HTML personalizado
                      </Badge>
                      <div className="mt-2 w-full aspect-video bg-black/50 rounded-lg overflow-hidden">
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: embedHtml }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                    checked={release.featured ?? false}
                    onChange={(e) => handleChange("featured", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Destacado
                </label>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Estado</label>
                  <select
                    value={release.status || "PUBLISHED"}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="PUBLISHED">Publicado</option>
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
              onClick={() => navigate("/admin/releases")}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]" disabled={saving}>
              {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear lanzamiento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

