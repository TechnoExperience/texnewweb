import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, User, Shield, Mail, Calendar, Filter, Ban, CheckCircle, Edit, Settings, UserPlus, Download } from "lucide-react"
import { toast } from "sonner"

interface UserProfileData {
  id: string
  email: string
  role?: string
  profile_type?: string
  name?: string
  nombre_artistico?: string
  is_active?: boolean
  is_verified?: boolean
  verification_status?: "PENDING" | "APPROVED" | "REJECTED" | null
}

interface UserData {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  role?: string
  profile?: UserProfileData | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterVerification, setFilterVerification] = useState<string>("all")

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      // Obtener todos los perfiles (que incluyen usuarios)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, role, profile_type, name, nombre_artistico, is_active, is_verified, verification_status, created_at, updated_at")
        .order("created_at", { ascending: false })

      if (profilesError) {
        console.error("Error loading profiles:", profilesError)
        toast.error("Error al cargar usuarios")
        setLoading(false)
        return
      }

      // Mapear perfiles a formato de usuario
      const usersData: UserData[] = (profiles || []).map((profile) => {
        const mappedProfile: UserProfileData = {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          profile_type: profile.profile_type,
          name: profile.name,
          nombre_artistico: (profile as any).nombre_artistico,
          is_active: profile.is_active ?? true,
          is_verified: profile.is_verified ?? false,
          verification_status: profile.verification_status,
        }

        return {
          id: profile.id,
          email: profile.email,
          created_at: profile.created_at || new Date().toISOString(),
          email_confirmed_at: null, // No disponible desde profiles
          last_sign_in_at: null, // No disponible desde profiles
          role: profile.role,
          profile: mappedProfile,
        }
      })

      setUsers(usersData)
      setLoading(false)
    } catch (error: any) {
      console.error("Error loading users:", error)
      toast.error("Error al cargar usuarios: " + (error.message || "Error desconocido"))
      setLoading(false)
    }
  }

  async function updateUserStatus(userId: string, isActive: boolean) {
    // Actualizar el estado en la tabla profiles
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user status:", error)
      toast.error("Error al actualizar el estado del usuario")
      return
    }

    toast.success(`Usuario ${isActive ? "activado" : "desactivado"}`)
    loadUsers()
  }

  async function updateVerification(
    profileId: string,
    status: "PENDING" | "APPROVED" | "REJECTED",
  ) {
    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        is_verified: status === "APPROVED",
      })
      .eq("id", profileId)

    if (error) {
      toast.error("Error al actualizar verificación")
      return
    }

    toast.success("Verificación actualizada")
    loadUsers()
  }

  const filteredUsers = users.filter((user) => {
    const profile = user.profile

    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile?.nombre_artistico || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile?.name || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && (profile?.role === "admin" || user.role === "admin")) ||
      (filterRole === "editor" && profile?.role === "editor") ||
      (filterRole === "user" &&
        (!profile?.role || profile.role === "user") &&
        (!user.role || user.role === "authenticated"))

    const verification = profile?.verification_status || "PENDING"
    const matchesVerification =
      filterVerification === "all" ||
      (filterVerification === "verified" && profile?.is_verified) ||
      (filterVerification === "pending" && verification === "PENDING") ||
      (filterVerification === "rejected" && verification === "REJECTED")

    return matchesSearch && matchesRole && matchesVerification
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
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black py-8 md:py-12">
        <div className="w-full px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                <Badge className="bg-black/20 text-black border-black/30">Gestión</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Gestión de Usuarios</h1>
              <p className="text-black/90 text-sm sm:text-base">Administra usuarios, roles y verificaciones</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="bg-black/10 text-black border-black/30 hover:bg-black/20">
                <Link to="/admin/profiles/new">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nuevo Perfil
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 ">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Total Usuarios</p>
                  <p className="text-2xl font-bold text-[#00F9FF]">{users.length}</p>
                </div>
                <User className="w-8 h-8 text-[#00F9FF]/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Administradores</p>
                  <p className="text-2xl font-bold text-[#00F9FF]">
                    {users.filter(u => u.profile?.role === "admin" || u.role === "admin").length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-[#00F9FF]/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Verificados</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {users.filter(u => u.profile?.is_verified).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {users.filter(u => u.profile?.verification_status === "PENDING" || !u.profile?.verification_status).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/60" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded text-sm"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="editor">Editores</option>
                  <option value="user">Usuarios</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/60" />
                <select
                  value={filterVerification}
                  onChange={(e) => setFilterVerification(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="verified">Verificados</option>
                  <option value="pending">Pendientes</option>
                  <option value="rejected">Rechazados</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const profile = user.profile
          const isActive = profile?.is_active ?? true
          const isAdmin = profile?.role === "admin" || user.role === "admin"
          const verification = profile?.verification_status || "PENDING"

          return (
            <Card key={user.id} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-bold text-lg">
                        {profile?.nombre_artistico || profile?.name || "Usuario"}
                      </h3>
                      {isAdmin && (
                        <Badge className="bg-[#00F9FF] text-black">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-white/60 text-sm mb-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {profile?.profile_type && (
                        <Badge className="bg-white/10 text-white/70 text-xs">
                          {profile.profile_type}
                        </Badge>
                      )}
                      {profile?.role && (
                        <Badge variant="outline" className="border-white/30 text-white/70 text-xs">
                          Rol: {profile.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={isActive ? "bg-green-500" : "bg-red-500"}>
                      {isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge
                      className={
                        profile?.is_verified
                          ? "bg-emerald-500"
                          : verification === "REJECTED"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }
                    >
                      {profile?.is_verified
                        ? "Verificado"
                        : verification === "REJECTED"
                        ? "Rechazado"
                        : "Pendiente"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Registrado: {format(new Date(user.created_at), "dd MMM yyyy", { locale: es })}
                    </span>
                  </div>
                  {user.email_confirmed_at && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Email confirmado
                    </div>
                  )}
                  {user.last_sign_in_at && (
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      Último acceso: {format(new Date(user.last_sign_in_at), "dd MMM yyyy", { locale: es })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  {/* Edit Profile Link */}
                  {profile && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full border-[#00F9FF]/50 text-[#00F9FF] hover:bg-[#00F9FF]/10"
                    >
                      <Link to={`/admin/profiles/edit/${profile.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </Link>
                    </Button>
                  )}

                  {/* Status Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUserStatus(user.id, !isActive)}
                    className={`w-full ${
                      isActive
                        ? "border-red-500/50 text-red-500 hover:bg-red-500/10"
                        : "border-green-500/50 text-green-500 hover:bg-green-500/10"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activar
                      </>
                    )}
                  </Button>

                  {/* Verification Actions */}
                  {profile && (
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                        onClick={() => updateVerification(profile.id, "APPROVED")}
                        title="Aprobar verificación"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                        onClick={() => updateVerification(profile.id, "PENDING")}
                        title="Marcar como pendiente"
                      >
                        <Calendar className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                        onClick={() => updateVerification(profile.id, "REJECTED")}
                        title="Rechazar verificación"
                      >
                        <Ban className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">No se encontraron usuarios</p>
        </div>
      )}
      </div>
    </div>
  )
}

