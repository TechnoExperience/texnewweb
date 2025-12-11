import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Plus, Search, Edit, Trash2, Eye, Star } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Review } from "@/types"
import { analyzeSeo } from "@/lib/seo-analyzer"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; reviewId: string | null }>({
    open: false,
    reviewId: null,
  })

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("published_date", { ascending: false })

    if (!error && data) {
      setReviews(data)
    }
    setLoading(false)
  }

  async function deleteReview(id: string) {
    setDeleteConfirm({ open: true, reviewId: id })
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm.reviewId) return

    const { error } = await supabase.from("reviews").delete().eq("id", deleteConfirm.reviewId)

    if (error) {
      console.error("Error deleting review:", error)
      toast.error("Error al eliminar la review", {
        description: error.message || "No se pudo eliminar la review.",
      })
    } else {
      setReviews(reviews.filter((r) => r.id !== deleteConfirm.reviewId))
      toast.success("Review eliminada correctamente")
    }
    setDeleteConfirm({ open: false, reviewId: null })
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || review.review_type === filterType
    return matchesSearch && matchesType
  })

  const types = ["all", ...Array.from(new Set(reviews.map((r) => r.review_type || "general")))]

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center text-zinc-400">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Star className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Gestionar Reviews</h1>
        </div>
        <Button asChild className="bg-white text-black hover:bg-zinc-200">
          <Link to="/admin/reviews/new">
            <Plus className="h-4 w-4 mr-2" />
            Crear Review
          </Link>
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Buscar reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {types.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className={
                    filterType === type
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                  }
                >
                  {type === "all" ? "Todos" : type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => {
          const seoResult = analyzeSeo({
            title: review.seo_title || review.title || "",
            description: review.seo_description || review.excerpt || "",
            contentHtml: review.content || "",
            focusKeyword: review.seo_focus_keyword || "",
          })

          const seoColor =
            seoResult.score === "GREEN"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : seoResult.score === "YELLOW"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-red-500/20 text-red-300 border-red-500/40"

          return (
            <Card key={review.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group">
              <div className="relative aspect-video">
                <img
                  src={review.image_url || "/placeholder.svg?height=300&width=600"}
                  alt={review.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-zinc-200" asChild>
                    <Link to={`/reviews/${review.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-zinc-200" asChild>
                    <Link to={`/admin/reviews/edit/${review.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-zinc-800 text-zinc-300 text-xs">{review.review_type || "general"}</Badge>
                  {review.rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold">{review.rating}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-2 line-clamp-2">{review.title}</h3>
                <p className="text-sm text-zinc-400 mb-2 line-clamp-2">{review.excerpt}</p>
                <div className="flex items-center justify-between mt-3">
                  <Badge className={seoColor} variant="outline">
                    {seoResult.score === "GREEN" ? "SEO OK" : seoResult.score === "YELLOW" ? "SEO mejorable" : "SEO bajo"}
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    {review.published_date ? format(new Date(review.published_date), "dd/MM/yyyy") : "Sin fecha"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No se encontraron reviews</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, reviewId: deleteConfirm.reviewId })}
        title="Eliminar Review"
        description="¿Estás seguro de que quieres eliminar esta review? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}

