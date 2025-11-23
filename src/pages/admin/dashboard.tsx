"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Newspaper, Calendar, Disc, Video, Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    news: 0,
    events: 0,
    releases: 0,
    videos: 0,
  })

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate("/auth/login")
      return
    }

    // Check if user has admin or editor role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "editor"].includes(profile.role)) {
      navigate("/")
      return
    }

    setUser(user)
  }

  async function fetchStats() {
    const [newsCount, eventsCount, releasesCount, videosCount] = await Promise.all([
      supabase.from("news").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("dj_releases").select("id", { count: "exact", head: true }),
      supabase.from("videos").select("id", { count: "exact", head: true }),
    ])

    setStats({
      news: newsCount.count || 0,
      events: eventsCount.count || 0,
      releases: releasesCount.count || 0,
      videos: videosCount.count || 0,
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">{t("common.loading")}</div>
      </div>
    )
  }

  const sections = [
    {
      title: t("cms.manageNews"),
      icon: Newspaper,
      count: stats.news,
      href: "/admin/news",
      color: "text-blue-500",
    },
    {
      title: t("cms.manageEvents"),
      icon: Calendar,
      count: stats.events,
      href: "/admin/events",
      color: "text-green-500",
    },
    {
      title: t("cms.manageReleases"),
      icon: Disc,
      count: stats.releases,
      href: "/admin/releases",
      color: "text-purple-500",
    },
    {
      title: t("cms.manageVideos"),
      icon: Video,
      count: stats.videos,
      href: "/admin/videos",
      color: "text-red-500",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">{t("cms.dashboard")}</h1>
        <Button asChild className="bg-white text-black hover:bg-zinc-200">
          <Link to="/">Volver al Sitio</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.href} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{section.title}</CardTitle>
                <Icon className={`h-5 w-5 ${section.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-4">{section.count}</div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                >
                  <Link to={section.href}>Gestionar</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full bg-white text-black hover:bg-zinc-200">
              <Link to="/admin/news/new">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Noticia
              </Link>
            </Button>
            <Button asChild className="w-full bg-white text-black hover:bg-zinc-200">
              <Link to="/admin/events/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento
              </Link>
            </Button>
            <Button asChild className="w-full bg-white text-black hover:bg-zinc-200">
              <Link to="/admin/releases/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Lanzamiento
              </Link>
            </Button>
            <Button asChild className="w-full bg-white text-black hover:bg-zinc-200">
              <Link to="/admin/videos/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Video
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Role:</span>
                <span className="text-white font-semibold">Admin</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
