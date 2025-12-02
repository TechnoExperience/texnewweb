import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"
import {
  FileText,
  Calendar,
  Music,
  Video,
  Users,
  TrendingUp,
  Eye,
  Edit,
  BarChart3,
  Plus,
  ArrowRight,
  Sparkles,
  Package,
  FolderTree,
  ShoppingCart,
} from "lucide-react"
// import { AdminStatsCharts } from "@/components/admin-stats-charts" // TODO: Usar cuando se implementen gráficos
import type { User } from "@supabase/supabase-js"
import { useUserProfile } from "@/hooks/useUserProfile"

interface Stats {
  totalNews: number
  totalEvents: number
  totalReleases: number
  totalVideos: number
  recentNews: number
  upcomingEvents: number
}

export default function AdminDashboard() {
  const { isAdmin, isEditor, userId } = useUserProfile()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalNews: 0,
    totalEvents: 0,
    totalReleases: 0,
    totalVideos: 0,
    recentNews: 0,
    upcomingEvents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      // Fetch all stats in parallel
      // Si es editor, solo contar su propio contenido
      let newsQuery = supabase.from("news").select("*", { count: "exact", head: true })
      let eventsQuery = supabase.from("events").select("*", { count: "exact", head: true })
      let releasesQuery = supabase.from("dj_releases").select("*", { count: "exact", head: true })
      let videosQuery = supabase.from("videos").select("*", { count: "exact", head: true })
      let recentNewsQuery = supabase.from("news").select("*", { count: "exact", head: true }).gte("published_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      let upcomingEventsQuery = supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", new Date().toISOString())

      if (isEditor && userId) {
        newsQuery = newsQuery.eq("created_by", userId)
        eventsQuery = eventsQuery.eq("created_by", userId)
        releasesQuery = releasesQuery.eq("created_by", userId)
        videosQuery = videosQuery.eq("created_by", userId)
        recentNewsQuery = recentNewsQuery.eq("created_by", userId)
        upcomingEventsQuery = upcomingEventsQuery.eq("created_by", userId)
      }

      const [newsCount, eventsCount, releasesCount, videosCount, recentNewsCount, upcomingEventsCount] = await Promise.all([
        newsQuery,
        eventsQuery,
        releasesQuery,
        videosQuery,
        recentNewsQuery,
        upcomingEventsQuery,
      ])

      setStats({
        totalNews: newsCount.count || 0,
        totalEvents: eventsCount.count || 0,
        totalReleases: releasesCount.count || 0,
        totalVideos: videosCount.count || 0,
        recentNews: recentNewsCount.count || 0,
        upcomingEvents: upcomingEventsCount.count || 0,
      })

      setLoading(false)
    }

    loadData()
  }, [isAdmin, isEditor, userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Noticias",
      value: stats.totalNews,
      icon: FileText,
      change: `+${stats.recentNews} esta semana`,
      color: "from-[#00F9FF] to-[#00D9E6]",
      link: "/admin/news",
    },
    {
      title: "Eventos",
      value: stats.totalEvents,
      icon: Calendar,
      change: `${stats.upcomingEvents} próximos`,
      color: "from-[#00F9FF] to-[#00D9E6]",
      link: "/admin/events",
    },
    {
      title: "Lanzamientos",
      value: stats.totalReleases,
      icon: Music,
      change: "En biblioteca",
      color: "from-[#00F9FF] to-[#00D9E6]",
      link: "/admin/releases",
    },
    {
      title: "Videos",
      value: stats.totalVideos,
      icon: Video,
      change: "Publicados",
      color: "from-[#00F9FF] to-[#00D9E6]",
      link: "/admin/videos",
    },
  ]

  const quickActions = [
    { title: "Nueva Noticia", icon: FileText, link: "/admin/news/new", color: "bg-[#00F9FF]" },
    { title: "Nuevo Evento", icon: Calendar, link: "/admin/events/new", color: "bg-[#00F9FF]" },
    { title: "Nuevo Lanzamiento", icon: Music, link: "/admin/releases/new", color: "bg-[#00F9FF]" },
    { title: "Nuevo Video", icon: Video, link: "/admin/videos/new", color: "bg-[#00F9FF]" },
    { title: "Nueva Review", icon: FileText, link: "/admin/reviews/new", color: "bg-[#00F9FF]" },
    { title: "Gestionar Perfiles", icon: Users, link: "/admin/profiles", color: "bg-[#00F9FF]" },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <Badge className="bg-white/20 text-white border-white/30">Admin</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Panel de Administración
          </h1>
          <p className="text-white/90 text-lg">
            Bienvenido, {user?.email}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="overflow-hidden hover:shadow-xl hover:shadow-[#00F9FF]/20 transition-all duration-300 hover:-translate-y-1 border-2 border-zinc-800 hover:border-[#00F9FF] bg-zinc-900">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <stat.icon className="w-8 h-8 text-[#00F9FF]" />
                    <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {stat.title}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-[#00F9FF]" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.title} to={action.link}>
                    <Button
                      className="w-full h-auto py-6 flex-col gap-3 group hover:scale-105 transition-all bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-[#00F9FF]"
                      variant="outline"
                    >
                      <div className={`${action.color} p-3 rounded-full text-black`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className="font-semibold">{action.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="bg-gradient-to-br from-[#00F9FF]/10 to-[#00D9E6]/5 border-2 border-[#00F9FF]/20 bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5 text-[#00F9FF]" />
                Analíticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-none border border-zinc-700">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#00F9FF]" />
                  <span className="text-sm font-medium text-white">Vistas totales</span>
                </div>
                <span className="text-xl font-bold text-white">-</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-none border border-zinc-700">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#00F9FF]" />
                  <span className="text-sm font-medium text-white">Tendencia</span>
                </div>
                <Badge className="bg-[#00F9FF] text-black">↑ </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-none border border-zinc-700">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#00F9FF]" />
                  <span className="text-sm font-medium text-white">Usuarios</span>
                </div>
                <span className="text-xl font-bold text-white">-</span>
              </div>

              <Button className="w-full mt-4 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-[#00F9FF]" variant="outline">
                Ver analíticas completas
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Management Links - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { title: "Gestionar Noticias", icon: Edit, link: "/admin/news", items: stats.totalNews },
            { title: "Gestionar Eventos", icon: Calendar, link: "/admin/events", items: stats.totalEvents },
            { title: "Gestionar Releases", icon: Music, link: "/admin/releases", items: stats.totalReleases },
            { title: "Gestionar Videos", icon: Video, link: "/admin/videos", items: stats.totalVideos },
          ].map((item) => (
            <Link key={item.title} to={item.link}>
              <Card className="hover:shadow-lg hover:shadow-[#00F9FF]/20 transition-all hover:-translate-y-0.5 group border border-zinc-800 hover:border-[#00F9FF] bg-zinc-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">{item.title}</p>
                      <p className="text-2xl font-bold text-white">{item.items}</p>
                    </div>
                    <item.icon className="w-8 h-8 text-[#00F9FF] group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* E-commerce Management Links */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white">E-commerce</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Productos", icon: Package, link: "/admin/products", color: "text-[#00F9FF]" },
              { title: "Categorías", icon: FolderTree, link: "/admin/categories", color: "text-[#00F9FF]" },
              { title: "Pedidos", icon: ShoppingCart, link: "/admin/orders", color: "text-[#00F9FF]" },
              { title: "Usuarios", icon: Users, link: "/admin/users", color: "text-[#00F9FF]" },
            ].map((item) => (
              <Link key={item.title} to={item.link}>
                <Card className="hover:shadow-lg hover:shadow-[#00F9FF]/20 transition-all hover:-translate-y-0.5 group border border-zinc-800 hover:border-[#00F9FF] bg-zinc-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">{item.title}</p>
                      </div>
                      <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
