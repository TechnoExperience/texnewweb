import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Video, Search, Eye, Edit, Trash2, Filter, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AdminVideo {
  id: string
  title: string
  description: string
  video_url?: string
  youtube_url?: string
  thumbnail_url?: string
  artist: string
  event_name?: string
  video_date: string
  category: string
  status?: "PENDING_REVIEW" | "PUBLISHED" | "REJECTED"
  provider?: string
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED">("all")

  useEffect(() => {
    loadVideos()
  }, [])

  async function loadVideos() {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("video_date", { ascending: false })

    if (error) {
      console.error("Error loading videos:", error)
    } else {
      setVideos(data as AdminVideo[])
    }
    setLoading(false)
  }

  async function deleteVideo(id: string) {
    if (!window.confirm("¿Seguro que quieres eliminar este vídeo?")) return

    const { error } = await supabase.from("videos").delete().eq("id", id)
    if (error) {
      console.error("Error deleting video:", error)
      alert("Error al eliminar el vídeo")
      return
    }
    setVideos((prev) => prev.filter((v) => v.id !== id))
  }

  async function updateStatus(id: string, status: "PENDING_REVIEW" | "PUBLISHED" | "REJECTED") {
    const { error } = await supabase.from("videos").update({ status }).eq("id", id)
    if (error) {
      console.error("Error updating status:", error)
      alert("Error al actualizar el estado del vídeo")
      return
    }
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v)),
    )
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.event_name || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || (video.status || "PENDING_REVIEW") === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Video className="w-8 h-8" />
                <Badge className="bg-white/20 text-white border-white/30">Gestión</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Vídeos</h1>
              <p className="text-white/90">Administra los vídeos enviados y publicados</p>
            </div>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/admin/videos/new">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Vídeo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar vídeos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="PENDING_REVIEW">Pendientes de revisión</option>
                  <option value="PUBLISHED">Publicados</option>
                  <option value="REJECTED">Rechazados</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No hay vídeos</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron resultados con los filtros actuales"
                  : "Comienza creando o importando un nuevo vídeo"}
              </p>
              <Button asChild>
                <Link to="/admin/videos/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear vídeo
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/50">
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-video md:aspect-auto overflow-hidden bg-muted">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {video.status && (
                      <Badge
                        className={
                          video.status === "PUBLISHED"
                            ? "absolute top-2 left-2 bg-green-500"
                            : video.status === "PENDING_REVIEW"
                            ? "absolute top-2 left-2 bg-yellow-500"
                            : "absolute top-2 left-2 bg-red-500"
                        }
                      >
                        {video.status === "PENDING_REVIEW" ? "Pendiente" : video.status === "PUBLISHED" ? "Publicado" : "Rechazado"}
                      </Badge>
                    )}
                  </div>

                  {/* Contenido */}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {video.artist}
                          {video.event_name ? ` · ${video.event_name}` : ""}
                        </p>
                      </div>
                      {video.provider && (
                        <Badge variant="outline" className="text-xs uppercase">
                          {video.provider}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {video.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary">{video.category}</Badge>
                      <span>·</span>
                      <span>
                        {format(new Date(video.video_date), "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                  </CardContent>

                  {/* Acciones */}
                  <div className="flex flex-row md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l">
                    <Button asChild variant="ghost" size="sm" className="flex-1 md:flex-none">
                      <Link to={`/videos/${video.id}`} target="_blank">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="flex-1 md:flex-none">
                      <Link to={`/admin/videos/${video.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVideo(video.id)}
                      className="flex-1 md:flex-none text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                    <div className="flex flex-row md:flex-col gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => updateStatus(video.id, "PUBLISHED")}
                      >
                        Publicar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => updateStatus(video.id, "REJECTED")}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


