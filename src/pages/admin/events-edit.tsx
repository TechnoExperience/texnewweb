import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { saveToCMS } from "@/lib/cms-sync"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RichTextEditor } from "@/components/rich-text-editor"
import type { Event } from "@/types"

export default function AdminEventsEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<Partial<Event>>({
    status: "PUBLISHED",
    featured: false,
    language: "es",
  })

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false)
      return
    }

    const loadEvent = async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single()
      if (error) {
        console.error("Error loading event:", error)
        alert("Error al cargar el evento")
        navigate("/admin/events")
      } else if (data) {
        setEvent(data)
      }
      setLoading(false)
    }

    loadEvent()
  }, [id, isEditMode, navigate])

  const handleChange = (field: keyof Event, value: any) => {
    setEvent((prev) => ({ ...prev, [field]: value }))
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
              folder: "events",
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
    if (!event.title || !event.slug || !event.event_date || !event.city || !event.country) {
      alert("Título, slug, fecha, ciudad y país son obligatorios.")
      return
    }

    setSaving(true)

    const payload: any = {
      title: event.title,
      slug: event.slug,
      description: event.description || "",
      event_date: event.event_date,
      venue: event.venue || "",
      city: event.city,
      country: event.country,
      lineup: event.lineup || [],
      image_url: event.image_url || "",
      ticket_url: event.ticket_url || "",
      featured: event.featured ?? false,
      language: event.language || "es",
      status: event.status || "PUBLISHED",
    }

    // Campos extendidos de la migración 00024
    if (event.end_datetime) payload.end_datetime = event.end_datetime
    if (event.venue_id) payload.venue_id = event.venue_id
    if (event.promoter_id) payload.promoter_id = event.promoter_id
    if (event.cover_image_url) payload.cover_image_url = event.cover_image_url
    if (event.ticket_link_url) payload.ticket_link_url = event.ticket_link_url
    if (event.price_info) payload.price_info = event.price_info

    try {
      const result = await saveToCMS("events", payload, isEditMode ? id : undefined)
      if (!result.success) {
        throw result.error || new Error("Error al guardar el evento")
      }
      navigate("/admin/events")
    } catch (error) {
      console.error("Error saving event:", error)
      alert("Error al guardar el evento")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        <Card className="mb-6 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">{isEditMode ? "Editar evento" : "Crear evento"}</CardTitle>
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
                  value={event.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Slug *</label>
                  <Input
                    value={event.slug || ""}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Fecha y hora *</label>
                  <Input
                    type="datetime-local"
                    value={event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => handleChange("event_date", new Date(e.target.value).toISOString())}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Ciudad *</label>
                  <Input
                    value={event.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">País *</label>
                  <Input
                    value={event.country || ""}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Venue/Local</label>
                <Input
                  value={event.venue || ""}
                  onChange={(e) => handleChange("venue", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Descripción</label>
                <RichTextEditor
                  content={event.description || ""}
                  onChange={(html) => handleChange("description", html)}
                  placeholder="Describe el evento, lineup, información importante..."
                  className="min-h-[300px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Lineup (uno por línea)</label>
                <Textarea
                  value={Array.isArray(event.lineup) ? event.lineup.join("\n") : ""}
                  onChange={(e) => handleChange("lineup", e.target.value.split("\n").filter((l) => l.trim()))}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
                  placeholder="DJ 1&#10;DJ 2&#10;DJ 3"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Imagen y enlaces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Imagen de portada</label>
                <Input type="file" accept="image/*" onChange={handleCoverUpload} />
                {event.image_url && (
                  <img src={event.image_url} alt="Portada" className="mt-2 w-full max-w-md h-auto border border-zinc-700" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">URL de tickets</label>
                <Input
                  type="url"
                  value={event.ticket_url || ""}
                  onChange={(e) => handleChange("ticket_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="https://..."
                />
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
                    checked={event.featured ?? false}
                    onChange={(e) => handleChange("featured", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Destacado
                </label>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Estado</label>
                  <select
                    value={event.status || "PUBLISHED"}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="SOLD_OUT">Agotado</option>
                    <option value="CANCELLED">Cancelado</option>
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
              onClick={() => navigate("/admin/events")}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]" disabled={saving}>
              {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear evento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

