import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Eye, FileText, Calendar, Music, Video, Star } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface PendingContent {
  id: string
  resource_type: "news" | "event" | "release" | "video" | "review"
  resource_id: string
  title: string
  author: string
  created_at: string
  status: string
  data: any
}

export default function ModerationPage() {
  const [loading, setLoading] = useState(true)
  const [pendingNews, setPendingNews] = useState<PendingContent[]>([])
  const [pendingEvents, setPendingEvents] = useState<PendingContent[]>([])
  const [pendingReleases, setPendingReleases] = useState<PendingContent[]>([])
  const [pendingVideos, setPendingVideos] = useState<PendingContent[]>([])
  const [pendingReviews, setPendingReviews] = useState<PendingContent[]>([])

  useEffect(() => {
    loadPendingContent()
  }, [])

  const loadPendingContent = async () => {
    try {
      setLoading(true)

      // Load pending news
      const { data: newsData } = await supabase
        .from("news")
        .select("*")
        .eq("status", "PENDING_REVIEW")
        .order("created_at", { ascending: false })

      setPendingNews(
        (newsData || []).map((item) => ({
          id: item.id,
          resource_type: "news" as const,
          resource_id: item.id,
          title: item.title,
          author: item.author,
          created_at: item.created_at,
          status: item.status,
          data: item,
        }))
      )

      // Load pending events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("status", "PENDING_REVIEW")
        .order("created_at", { ascending: false })

      setPendingEvents(
        (eventsData || []).map((item) => ({
          id: item.id,
          resource_type: "event" as const,
          resource_id: item.id,
          title: item.title,
          author: item.created_by || "",
          created_at: item.created_at,
          status: item.status,
          data: item,
        }))
      )

      // Load pending releases
      const { data: releasesData } = await supabase
        .from("dj_releases")
        .select("*")
        .eq("status", "PENDING_REVIEW")
        .order("created_at", { ascending: false })

      setPendingReleases(
        (releasesData || []).map((item) => ({
          id: item.id,
          resource_type: "release" as const,
          resource_id: item.id,
          title: item.title,
          author: item.artist,
          created_at: item.created_at,
          status: item.status,
          data: item,
        }))
      )

      // Load pending videos
      const { data: videosData } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "PENDING_REVIEW")
        .order("created_at", { ascending: false })

      setPendingVideos(
        (videosData || []).map((item) => ({
          id: item.id,
          resource_type: "video" as const,
          resource_id: item.id,
          title: item.title,
          author: item.artist,
          created_at: item.created_at,
          status: item.status,
          data: item,
        }))
      )

      // Load pending reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "PENDING_REVIEW")
        .order("created_at", { ascending: false })

      setPendingReviews(
        (reviewsData || []).map((item) => ({
          id: item.id,
          resource_type: "review" as const,
          resource_id: item.id,
          title: item.title,
          author: item.author,
          created_at: item.created_at,
          status: item.status,
          data: item,
        }))
      )
    } catch (error: any) {
      console.error("Error loading pending content:", error)
      toast.error("Error al cargar contenido pendiente")
    } finally {
      setLoading(false)
    }
  }

  const approveContent = async (resourceType: string, resourceId: string) => {
    try {
      const tableName = getTableName(resourceType)
      const { error } = await supabase
        .from(tableName)
        .update({ status: "pub" })
        .eq("id", resourceId)

      if (error) throw error

      toast.success("Contenido aprobado")
      loadPendingContent()
    } catch (error: any) {
      console.error("Error approving content:", error)
      toast.error("Error al aprobar contenido")
    }
  }

  const rejectContent = async (resourceType: string, resourceId: string, reason?: string) => {
    try {
      const tableName = getTableName(resourceType)
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status: "rej",
          verification_notes: reason || "Contenido rechazado por el administrador"
        })
        .eq("id", resourceId)

      if (error) throw error

      toast.success("Contenido rechazado")
      loadPendingContent()
    } catch (error: any) {
      console.error("Error rejecting content:", error)
      toast.error("Error al rechazar contenido")
    }
  }

  const getTableName = (resourceType: string): string => {
    const tableMap: Record<string, string> = {
      news: "news",
      event: "events",
      release: "dj_releases",
      video: "videos",
      review: "reviews",
    }
    return tableMap[resourceType] || "news"
  }

  const getEditUrl = (resourceType: string, resourceId: string): string => {
    const urlMap: Record<string, string> = {
      news: `/admin/news/${resourceId}/edit`,
      event: `/admin/events/edit/${resourceId}`,
      release: `/admin/releases/edit/${resourceId}`,
      video: `/admin/videos/${resourceId}/edit`,
      review: `/admin/reviews/edit/${resourceId}`,
    }
    return urlMap[resourceType] || "#"
  }

  const ContentCard = ({ content }: { content: PendingContent }) => {
    const iconMap = {
      news: FileText,
      event: Calendar,
      release: Music,
      video: Video,
      review: Star,
    }

    const Icon = iconMap[content.resource_type] || FileText

    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {content.data.image_url && (
              <div className="flex-shrink-0">
                <OptimizedImage
                  src={content.data.image_url}
                  alt={content.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#00F9FF]" />
                  <h3 className="text-white font-semibold line-clamp-1">{content.title}</h3>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Pendiente
                </Badge>
              </div>
              <p className="text-white/60 text-sm mb-3 line-clamp-2">
                {content.data.excerpt || content.data.description || "Sin descripción"}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                <span>Por: {content.author}</span>
                <span>•</span>
                <span>
                  {format(new Date(content.created_at), "d MMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => approveContent(content.resource_type, content.resource_id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const reason = prompt("Motivo del rechazo (opcional):")
                    rejectContent(content.resource_type, content.resource_id, reason || undefined)
                  }}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Link to={getEditUrl(content.resource_type, content.resource_id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver/Editar
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const totalPending =
    pendingNews.length +
    pendingEvents.length +
    pendingReleases.length +
    pendingVideos.length +
    pendingReviews.length

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Panel de Moderación</h1>
          <p className="text-white/60">
            Revisa y aprueba el contenido pendiente de usuarios
          </p>
          {totalPending > 0 && (
            <Badge className="mt-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {totalPending} {totalPending === 1 ? "elemento" : "elementos"} pendiente{totalPending !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              Todos ({totalPending})
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              Noticias ({pendingNews.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              Eventos ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="releases" className="data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              Lanzamientos ({pendingReleases.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              Videos ({pendingVideos.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              Reviews ({pendingReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {totalPending === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">¡Todo al día!</h3>
                    <p className="text-white/60">No hay contenido pendiente de revisión</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {pendingNews.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                  {pendingEvents.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                  {pendingReleases.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                  {pendingVideos.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                  {pendingReviews.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <div className="space-y-4">
              {pendingNews.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <p className="text-white/60">No hay noticias pendientes</p>
                  </CardContent>
                </Card>
              ) : (
                pendingNews.map((item) => <ContentCard key={item.id} content={item} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              {pendingEvents.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <p className="text-white/60">No hay eventos pendientes</p>
                  </CardContent>
                </Card>
              ) : (
                pendingEvents.map((item) => <ContentCard key={item.id} content={item} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="releases" className="mt-6">
            <div className="space-y-4">
              {pendingReleases.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <p className="text-white/60">No hay lanzamientos pendientes</p>
                  </CardContent>
                </Card>
              ) : (
                pendingReleases.map((item) => <ContentCard key={item.id} content={item} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="space-y-4">
              {pendingVideos.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <p className="text-white/60">No hay videos pendientes</p>
                  </CardContent>
                </Card>
              ) : (
                pendingVideos.map((item) => <ContentCard key={item.id} content={item} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {pendingReviews.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <p className="text-white/60">No hay reviews pendientes</p>
                  </CardContent>
                </Card>
              ) : (
                pendingReviews.map((item) => <ContentCard key={item.id} content={item} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

