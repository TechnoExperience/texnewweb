import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { TABLES } from "@/constants/tables"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Filter
} from "lucide-react"
import type { NewsArticle } from "@/types"
import { analyzeSeo } from "@/lib/seo-analyzer"
import { useUserProfile } from "@/hooks/useUserProfile"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function AdminNewsPage() {
  const { isAdmin, isEditor, userId } = useUserProfile()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  useEffect(() => {
    loadNews()
  }, [isAdmin, isEditor, userId])

  async function loadNews() {
    let query = supabase
      .from(TABLES.NEWS)
      .select("*")

    // Si es editor, solo cargar su propio contenido (si existe created_by)
    if (isEditor && userId && !isAdmin) {
      query = query.eq("created_by", userId)
    }

    const { data, error } = await query.order("published_date", { ascending: false })

    if (!error && data) {
      setNews(data)
    }
    setLoading(false)
  }

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; articleId: string | null }>({
    open: false,
    articleId: null,
  })

  async function deleteArticle(id: string) {
    setDeleteConfirm({ open: true, articleId: id })
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm.articleId) return

    const { error } = await supabase.from(TABLES.NEWS).delete().eq("id", deleteConfirm.articleId)

    if (error) {
      console.error("Error deleting article:", error)
      toast.error("Error al eliminar la noticia", {
        description: error.message || "No se pudo eliminar la noticia.",
      })
    } else {
      setNews(news.filter(n => n.id !== deleteConfirm.articleId))
      toast.success("Noticia eliminada correctamente")
    }
    setDeleteConfirm({ open: false, articleId: null })
  }

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || article.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(news.map(n => n.category)))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F9FF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black py-8 md:py-12">
        <div className="w-full px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                <Badge className="bg-black/20 text-black border-black/30">Gestión</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Noticias</h1>
              <p className="text-black/90 text-sm sm:text-base">Administra todas las noticias publicadas</p>
            </div>
            <Button asChild size="lg" className="bg-black text-[#00F9FF] hover:bg-black/90 whitespace-nowrap">
              <Link to="/admin/news/new">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Nueva Noticia
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Filters and Search - Responsive */}
        <Card className="mb-8 bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  placeholder="Buscar noticias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-zinc-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 h-10 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "Todas las categorías" : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl font-bold text-[#00F9FF]">{news.length}</div>
              <div className="text-sm text-zinc-400">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl font-bold text-[#00F9FF]">{news.filter(n => n.featured).length}</div>
              <div className="text-sm text-zinc-400">Destacadas</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl font-bold text-[#00F9FF]">{categories.length - 1}</div>
              <div className="text-sm text-zinc-400">Categorías</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl font-bold text-[#00F9FF]">{filteredNews.length}</div>
              <div className="text-sm text-zinc-400">Filtradas</div>
            </CardContent>
          </Card>
        </div>

        {/* News List */}
        {filteredNews.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 sm:p-12 text-center">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-zinc-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">No hay noticias</h3>
              <p className="text-zinc-400 mb-4 text-sm sm:text-base">
                {searchTerm || filterCategory !== "all"
                  ? "No se encontraron resultados con los filtros actuales"
                  : "Comienza creando tu primera noticia"}
              </p>
              <Button asChild className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]">
                <Link to="/admin/news/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear noticia
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg hover:shadow-[#00F9FF]/20 transition-all group border-2 border-zinc-800 hover:border-[#00F9FF] bg-zinc-900">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-0">
                  {/* Image */}
                  <div className="relative aspect-video md:aspect-auto overflow-hidden bg-zinc-800">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-zinc-400" />
                      </div>
                    )}
                    {article.featured && (
                      <Badge className="absolute top-2 left-2 bg-[#00F9FF] text-black">Destacado</Badge>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-wrap items-start gap-3 mb-3 justify-between">
                      <div className="flex flex-wrap items-start gap-3">
                        <Badge className="bg-zinc-800 text-zinc-300">{article.category}</Badge>
                        <Badge variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                          {format(new Date(article.published_date), "d MMM yyyy", { locale: es })}
                        </Badge>
                      </div>
                      {/* Indicador SEO rápido */}
                      {article.seo_focus_keyword && (
                        (() => {
                          const { score } = analyzeSeo({
                            title: article.meta_title || article.title,
                            description: article.meta_description || article.excerpt || "",
                            contentHtml: article.content || "",
                            focusKeyword: article.seo_focus_keyword || "",
                          })
                          const color =
                            score === "GREEN"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : score === "YELLOW"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : "bg-red-500/20 text-red-400 border-red-500/40"
                          const label =
                            score === "GREEN" ? "SEO OK" : score === "YELLOW" ? "SEO mejorable" : "SEO bajo"
                          return (
                            <Badge className={`${color} text-[10px] uppercase tracking-wide`}>
                              {label}
                            </Badge>
                          )
                        })()
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[#00F9FF] transition-colors text-white">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-zinc-400">
                      <span className="font-medium">Por {article.author}</span>
                      <span>•</span>
                      <span className="truncate">ID: {article.slug}</span>
                    </div>
                  </CardContent>

                  {/* Actions - Responsive */}
                  <div className="flex flex-row md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l border-zinc-800">
                    <Button asChild variant="ghost" size="sm" className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-white hover:text-[#00F9FF]">
                      <Link to={`/news/${article.slug}`} target="_blank">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-white hover:text-[#00F9FF]">
                      <Link to={`/admin/news/${article.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteArticle(article.id)}
                      className="flex-1 md:flex-none bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open: boolean) => setDeleteConfirm({ open, articleId: deleteConfirm.articleId })}
        title="Eliminar Noticia"
        description="¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
      </div>
    </div>
  )
}
