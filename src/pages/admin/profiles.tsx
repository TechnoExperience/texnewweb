import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Filter,
  Music,
  Building2,
  Disc,
} from "lucide-react"
import type { UserProfile } from "@/types"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const PROFILE_TYPES = [
  { value: "all", label: "Todos", icon: Users },
  { value: "dj", label: "DJs / Artistas", icon: Music },
  { value: "club", label: "Clubs", icon: Building2 },
  { value: "label", label: "Discográficas", icon: Disc },
  { value: "promoter", label: "Promotores", icon: Users },
  { value: "agency", label: "Agencias", icon: Building2 },
]

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; profileId: string | null }>({
    open: false,
    profileId: null,
  })

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProfiles(data)
    } else {
      toast.error("Error al cargar perfiles")
    }
    setLoading(false)
  }

  async function deleteProfile(id: string) {
    setDeleteConfirm({ open: true, profileId: id })
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm.profileId) return

    const { error } = await supabase.from("profiles").delete().eq("id", deleteConfirm.profileId)

    if (error) {
      console.error("Error deleting profile:", error)
      toast.error("Error al eliminar el perfil", {
        description: error.message || "No se pudo eliminar el perfil.",
      })
    } else {
      setProfiles(profiles.filter((p) => p.id !== deleteConfirm.profileId))
      toast.success("Perfil eliminado correctamente")
    }
    setDeleteConfirm({ open: false, profileId: null })
  }

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile as any).nombre_artistico?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || profile.profile_type === filterType
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F9FF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 py-8 ">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-heading text-white mb-2"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              GESTIÓN DE PERFILES
            </h1>
            <p className="text-white/70">Gestiona artistas, clubs, discográficas y más</p>
          </div>
          <Button asChild className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]">
            <Link to="/admin/profiles/new">
              <Plus className="h-4 w-4 mr-2" />
              Crear Perfil
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <Input
                    placeholder="Buscar por email, nombre o nombre artístico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {PROFILE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFilterType(type.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        filterType === type.value
                          ? "bg-[#00F9FF] text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const ProfileIcon = PROFILE_TYPES.find((t) => t.value === profile.profile_type)?.icon || Users
            return (
              <Card key={profile.id} className="bg-white/5 border-white/10 hover:border-[#00F9FF]/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#00F9FF]/20 flex items-center justify-center">
                        <ProfileIcon className="w-6 h-6 text-[#00F9FF]" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {(profile as any).nombre_artistico || profile.name || "Sin nombre"}
                        </h3>
                        <p className="text-white/60 text-sm">{profile.email}</p>
                      </div>
                    </div>
                    {profile.role === "admin" && (
                      <Badge className="bg-[#00F9FF] text-black">Admin</Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {profile.profile_type && (
                      <Badge className="bg-white/10 text-white/70 text-xs">
                        {profile.profile_type}
                      </Badge>
                    )}
                    {profile.city && profile.country && (
                      <p className="text-white/60 text-sm">
                        {profile.city}, {profile.country}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="text-white/70 text-sm line-clamp-2">{profile.bio}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                    <span>
                      Creado: {format(new Date(profile.created_at || new Date()), "d MMM yyyy", { locale: es })}
                    </span>
                    {profile.is_verified && (
                      <Badge className="bg-emerald-500 text-white text-xs">Verificado</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Link to={`/admin/profiles/edit/${profile.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProfile(profile.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">No se encontraron perfiles</p>
          </div>
        )}

        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, profileId: deleteConfirm.profileId })}
          title="Eliminar Perfil"
          description="¿Estás seguro de que quieres eliminar este perfil? Esta acción no se puede deshacer."
          onConfirm={handleDeleteConfirm}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </div>
  )
}

