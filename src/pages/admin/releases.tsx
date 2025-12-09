import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { TABLES } from "@/constants/tables"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Disc, Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Release {
  id: string
  title: string
  artist: string
  label: string
  release_date: string
  cover_art: string
  genre: string[]
}

export default function AdminReleasesPage() {
  const { t } = useTranslation()
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; releaseId: string | null }>({
    open: false,
    releaseId: null,
  })
  const [genreFilter, setGenreFilter] = useState<string>("all")

  useEffect(() => {
    fetchReleases()
  }, [])

  async function fetchReleases() {
    const { data, error } = await supabase
      .from(TABLES.DJ_RELEASES)
      .select("id, title, artist, label, release_date, cover_art, genre")
      .order("release_date", { ascending: false })

    if (error) {
      console.error("Error fetching releases:", error)
    } else {
      setReleases(data || [])
    }
    setLoading(false)
  }

  async function deleteRelease(id: string) {
    setDeleteConfirm({ open: true, releaseId: id })
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm.releaseId) return

    const { error } = await supabase.from("dj_releases").delete().eq("id", deleteConfirm.releaseId)

    if (error) {
      console.error("Error deleting release:", error)
      toast.error("Error al eliminar el lanzamiento", {
        description: error.message || "No se pudo eliminar el lanzamiento.",
      })
    } else {
      setReleases(releases.filter((release) => release.id !== deleteConfirm.releaseId))
      toast.success("Lanzamiento eliminado correctamente")
    }
    setDeleteConfirm({ open: false, releaseId: null })
  }

  const filteredReleases = releases.filter((release) => {
    const matchesSearch =
      release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = genreFilter === "all" || release.genre?.includes(genreFilter)
    return matchesSearch && matchesGenre
  })

  const genres = ["acid", "hard", "melodic", "minimal", "industrial", "progressive", "raw", "hypnotic"]

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center text-zinc-400">{t("common.loading")}</div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Disc className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white">{t("cms.manageReleases")}</h1>
        </div>
        <Button asChild className="bg-white text-black hover:bg-zinc-200">
          <Link to="/admin/releases/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("cms.createRelease")}
          </Link>
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white">{t("cms.filters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder={t("cms.searchReleases")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={genreFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setGenreFilter("all")}
                className={
                  genreFilter === "all"
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                }
              >
                {t("cms.all")}
              </Button>
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={genreFilter === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGenreFilter(genre)}
                  className={
                    genreFilter === genre
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                  }
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReleases.map((release) => (
          <Card key={release.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group">
            <div className="relative aspect-square">
              <img
                src={release.cover_art || "/placeholder.svg?height=400&width=400"}
                alt={release.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-zinc-200" asChild>
                  <Link to={`/releases/${release.id}`} target="_blank">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-zinc-200" asChild>
                  <Link to={`/admin/releases/edit/${release.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteRelease(release.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {release.genre?.slice(0, 2).map((g) => (
                  <Badge key={g} className="bg-zinc-800 text-zinc-300 text-xs">
                    {g}
                  </Badge>
                ))}
              </div>
              <h3 className="font-semibold text-white mb-1 line-clamp-1">{release.title}</h3>
              <p className="text-sm text-zinc-400 mb-1 line-clamp-1">{release.artist}</p>
              <p className="text-xs text-zinc-500">{release.label}</p>
              {release.release_date && (
                <p className="text-xs text-zinc-500 mt-2">{format(new Date(release.release_date), "dd/MM/yyyy")}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReleases.length === 0 && (
        <div className="text-center py-12">
          <Disc className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t("cms.noReleasesFound")}</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, releaseId: deleteConfirm.releaseId })}
        title="Eliminar Lanzamiento"
        description="¿Estás seguro de que quieres eliminar este lanzamiento? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
