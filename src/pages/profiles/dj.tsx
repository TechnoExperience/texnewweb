import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { supabase } from "@/lib/supabase"
import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Link } from "react-router-dom"
import { 
  Music, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Star,
  ExternalLink,
  Plus,
  Edit
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TABLES } from "@/constants/tables"
import { ROUTES } from "@/constants/routes"
import type { Release, Event, UserProfile } from "@/types"
import { VinylCard } from "@/components/vinyl-card"
import { EventCardHome } from "@/components/event-card-home"
import { OptimizedImage } from "@/components/ui/optimized-image"

export default function DJDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReleases: 0,
    totalEvents: 0,
    totalViews: 0,
  })

  // Cargar perfil del usuario
  useEffect(() => {
    if (!user || authLoading) return

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select("*")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
      } else if (data) {
        setProfile(data)
      }
      setLoading(false)
    }

    loadProfile()
  }, [user, authLoading])

  // Cargar releases del DJ
  const { data: djReleases, loading: releasesLoading } = useSupabaseQuery<Release>(
    TABLES.RELEASES,
    (query) => {
      if (!user) return query.limit(0)
      return query
        .eq("artist", profile?.name || "")
        .or(`created_by.eq.${user.id}`)
        .order("release_date", { ascending: false })
        .limit(10)
    },
    { enableRealtime: true }
  )

  // Cargar eventos donde actúa el DJ
  const { data: djEvents, loading: eventsLoading } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    (query) => {
      if (!user || !profile?.name) return query.limit(0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return query
        .gte("event_date", today.toISOString())
        .contains("lineup", [profile.name])
        .order("event_date", { ascending: true })
        .limit(10)
    },
    { enableRealtime: true }
  )

  // Calcular estadísticas
  useEffect(() => {
    if (!user || !profile) return

    const calculateStats = async () => {
      // Contar releases
      const { count: releasesCount } = await supabase
        .from(TABLES.RELEASES)
        .select("*", { count: "exact", head: true })
        .or(`artist.eq.${profile.name},created_by.eq.${user.id}`)

      // Contar eventos futuros
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: eventsCount } = await supabase
        .from(TABLES.EVENTS)
        .select("*", { count: "exact", head: true })
        .gte("event_date", today.toISOString())
        .contains("lineup", [profile.name])

      setStats({
        totalReleases: releasesCount || 0,
        totalEvents: eventsCount || 0,
        totalViews: 0, // TODO: Implementar contador de vistas
      })
    }

    calculateStats()
  }, [user, profile])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center">
            <p className="text-white mb-4">Debes iniciar sesión para ver tu perfil de DJ</p>
            <Button asChild className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black">
              <Link to={ROUTES.AUTH.LOGIN}>Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black w-full">
      <div className="w-full px-4 py-8">
        {/* Header con Avatar y Stats */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-zinc-900 to-black border-zinc-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <OptimizedImage
                      src={profile.avatar_url}
                      alt={profile.name || "DJ"}
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#00F9FF]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-[#00F9FF] flex items-center justify-center">
                      <Music className="w-12 h-12 text-[#00F9FF]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {profile?.name || "DJ Sin Nombre"}
                    </h1>
                    <Badge className="bg-[#00F9FF] text-black">DJ</Badge>
                  </div>
                  {profile?.bio && (
                    <p className="text-white/70 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {profile?.city && (
                      <div className="flex items-center gap-2 text-white/60">
                        <span>{profile.city}</span>
                        {profile.country && <span>, {profile.country}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Lanzamientos</p>
                  <p className="text-3xl font-bold text-[#00F9FF]">{stats.totalReleases}</p>
                </div>
                <Music className="w-8 h-8 text-[#00F9FF]/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Próximos Eventos</p>
                  <p className="text-3xl font-bold text-[#00F9FF]">{stats.totalEvents}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#00F9FF]/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Visualizaciones</p>
                  <p className="text-3xl font-bold text-[#00F9FF]">{stats.totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-[#00F9FF]/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Contenido */}
        <div className="space-y-8">
          {/* Mis Lanzamientos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Mis Lanzamientos</h2>
              <Button
                asChild
                className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
              >
                <Link to={`${ROUTES.ADMIN.RELEASES}/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Lanzamiento
                </Link>
              </Button>
            </div>
            {releasesLoading ? (
              <LoadingSpinner />
            ) : djReleases && djReleases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {djReleases.map((release) => (
                  <VinylCard key={release.id} release={release} />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Music className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 mb-4">Aún no tienes lanzamientos</p>
                  <Button
                    asChild
                    className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                  >
                    <Link to={`${ROUTES.ADMIN.RELEASES}/new`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Lanzamiento
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Próximos Eventos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Próximos Eventos</h2>
              <Button
                asChild
                variant="outline"
                className="border-[#00F9FF]/50 text-[#00F9FF] hover:bg-[#00F9FF]/10"
              >
                <Link to={ROUTES.EVENTS}>
                  Ver Todos
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            {eventsLoading ? (
              <LoadingSpinner />
            ) : djEvents && djEvents.length > 0 ? (
              <div className="space-y-4">
                {djEvents.map((event, index) => (
                  <EventCardHome key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No tienes eventos próximos programados</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Editar Perfil */}
          <div>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Configuración del Perfil</span>
                  <Edit className="w-5 h-5 text-[#00F9FF]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm profileType="dj" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
