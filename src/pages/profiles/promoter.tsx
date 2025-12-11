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
  Calendar, 
  Users, 
  TrendingUp, 
  Eye, 
  Ticket,
  ExternalLink,
  Plus,
  Edit,
  MapPin
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TABLES } from "@/constants/tables"
import { ROUTES } from "@/constants/routes"
import type { Event, UserProfile } from "@/types"
import { EventCardHome } from "@/components/event-card-home"
import { OptimizedImage } from "@/components/ui/optimized-image"

export default function PromoterDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalAttendees: 0,
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

  // Cargar eventos del promotor
  const { data: promoterEvents, loading: eventsLoading } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    (query) => {
      if (!user) return query.limit(0)
      return query
        .or(`created_by.eq.${user.id},promoter_id.eq.${user.id}`)
        .order("event_date", { ascending: false })
        .limit(20)
    },
    { enableRealtime: true }
  )

  // Cargar eventos próximos
  const { data: upcomingEvents, loading: upcomingLoading } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    (query) => {
      if (!user) return query.limit(0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return query
        .or(`created_by.eq.${user.id},promoter_id.eq.${user.id}`)
        .gte("event_date", today.toISOString())
        .order("event_date", { ascending: true })
        .limit(10)
    },
    { enableRealtime: true }
  )

  // Calcular estadísticas
  useEffect(() => {
    if (!user || !promoterEvents) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming = promoterEvents.filter(e => new Date(e.event_date) >= today)
    const past = promoterEvents.filter(e => new Date(e.event_date) < today)

    setStats({
      totalEvents: promoterEvents.length,
      upcomingEvents: upcoming.length,
      pastEvents: past.length,
      totalAttendees: 0, // TODO: Implementar contador de asistentes
    })
  }, [user, promoterEvents])

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
            <p className="text-white mb-4">Debes iniciar sesión para ver tu perfil de Promotor</p>
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
                      alt={profile.name || "Promotor"}
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#00F9FF]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-[#00F9FF] flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-[#00F9FF]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {profile?.name || "Promotor Sin Nombre"}
                    </h1>
                    <Badge className="bg-[#00F9FF] text-black">PROMOTOR</Badge>
                  </div>
                  {profile?.bio && (
                    <p className="text-white/70 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {profile?.city && (
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin className="w-4 h-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Total Eventos</p>
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
                  <p className="text-white/60 text-sm mb-1">Próximos</p>
                  <p className="text-3xl font-bold text-green-500">{stats.upcomingEvents}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Pasados</p>
                  <p className="text-3xl font-bold text-white/40">{stats.pastEvents}</p>
                </div>
                <Calendar className="w-8 h-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Asistentes</p>
                  <p className="text-3xl font-bold text-[#00F9FF]">{stats.totalAttendees}</p>
                </div>
                <Users className="w-8 h-8 text-[#00F9FF]/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Contenido */}
        <div className="space-y-8">
          {/* Próximos Eventos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Próximos Eventos</h2>
              <div className="flex gap-2">
                <Button
                  asChild
                  className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                >
                  <Link to={`${ROUTES.ADMIN.EVENTS}/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Evento
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-[#00F9FF]/50 text-[#00F9FF] hover:bg-[#00F9FF]/10"
                >
                  <Link to={ROUTES.ADMIN.EVENTS}>
                    Gestionar Todos
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            {upcomingLoading ? (
              <LoadingSpinner />
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <EventCardHome key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 mb-4">Aún no tienes eventos próximos</p>
                  <Button
                    asChild
                    className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                  >
                    <Link to={`${ROUTES.ADMIN.EVENTS}/new`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Evento
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Todos los Eventos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Todos mis Eventos</h2>
              <Button
                asChild
                variant="outline"
                className="border-[#00F9FF]/50 text-[#00F9FF] hover:bg-[#00F9FF]/10"
              >
                <Link to={ROUTES.ADMIN.EVENTS}>
                  Ver Todos
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            {eventsLoading ? (
              <LoadingSpinner />
            ) : promoterEvents && promoterEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promoterEvents.slice(0, 6).map((event, index) => (
                  <EventCardHome key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No has creado eventos aún</p>
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
                <ProfileForm profileType="promoter" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
