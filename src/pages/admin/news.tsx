"use client"

import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  language: string
  published: boolean
  featured: boolean
  view_count: number
  published_at: string
  created_at: string
}

export default function AdminNewsPage() {
  const { t } = useTranslation() // Removed unused i18n variable
  const navigate = useNavigate()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [languageFilter, setLanguageFilter] = useState<string>("all")

  useEffect(() => {
    checkAuth()
    fetchNews()
  }, [languageFilter])

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate("/auth/login")
      return
    }
  }

  async function fetchNews() {
    let query = supabase.from("news").select("*").order("created_at", { ascending: false })

    if (languageFilter !== "all") {
      query = query.eq("language", languageFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching news:", error)
      toast.error("Error al cargar noticias")
    } else {
      setNews(data || [])
    }
    setLoading(false)
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    const { error } = await supabase.from("news").update({ published: !currentStatus }).eq("id", id)

    if (error) {
      toast.error("Error al actualizar estado")
    } else {
      toast.success(currentStatus ? "Noticia despublicada" : "Noticia publicada")
      fetchNews()
    }
  }

  async function toggleFeatured(id: string, currentStatus: boolean) {
    const { error } = await supabase.from("news").update({ featured: !currentStatus }).eq("id", id)

    if (error) {
      toast.error("Error al actualizar destacado")
    } else {
      toast.success(currentStatus ? "Eliminado de destacados" : "Marcado como destacado")
      fetchNews()
    }
  }

  async function deleteNews(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return

    const { error } = await supabase.from("news").delete().eq("id", id)

    if (error) {
      toast.error("Error al eliminar noticia")
    } else {
      toast.success("Noticia eliminada")
      fetchNews()
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">{t("common.loading")}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">{t("cms.manageNews")}</h1>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 bg-transparent">
            <Link to="/admin">Dashboard</Link>
          </Button>
          <Button asChild className="bg-white text-black hover:bg-zinc-200">
            <Link to="/admin/news/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("cms.create")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "es", "en", "de", "it"].map((lang) => (
          <Button
            key={lang}
            onClick={() => setLanguageFilter(lang)}
            variant={languageFilter === lang ? "default" : "outline"}
            size="sm"
            className={
              languageFilter === lang
                ? "bg-white text-black hover:bg-zinc-200"
                : "border-zinc-700 text-white hover:bg-zinc-800"
            }
          >
            {lang === "all" ? "Todos" : lang.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {news.map((article) => (
          <Card key={article.id} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">{article.title}</h3>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                      {article.language.toUpperCase()}
                    </Badge>
                    {article.featured && <Badge className="bg-white text-black">Destacado</Badge>}
                    {article.published ? (
                      <Badge className="bg-green-600">Publicado</Badge>
                    ) : (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                        Borrador
                      </Badge>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm mb-2">{article.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Categoría: {article.category}</span>
                    <span>Vistas: {article.view_count}</span>
                    <span>Creado: {new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => togglePublished(article.id, article.published)}
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    {article.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => toggleFeatured(article.id, article.featured)}
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    ★
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                  >
                    <Link to={`/admin/news/edit/${article.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    onClick={() => deleteNews(article.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-700 text-red-500 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
