import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { UserProfile } from "@/types"
import { toast } from "sonner"

const PROFILE_TYPES = ["dj", "promoter", "clubber", "label", "agency", "club"] as const
const ROLES = ["user", "editor", "admin"] as const

export default function AdminProfilesEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    role: "user",
    profile_type: "dj",
  })

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false)
      return
    }

    const loadProfile = async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
      if (error) {
        console.error("Error loading profile:", error)
        toast.error("Error al cargar el perfil")
        navigate("/admin/profiles")
      } else if (data) {
        setProfile(data)
      }
      setLoading(false)
    }

    loadProfile()
  }, [id, isEditMode, navigate])

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader()
    return new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        try {
          const fileData = reader.result as string
          const { data, error } = await supabase.functions.invoke("upload-media", {
            body: {
              fileData,
              fileName: file.name,
              fileType: file.type,
              folder: "profiles",
            },
          })
          if (error) {
            console.error("Upload error:", error)
            reject(error)
          } else {
            resolve(data?.data?.publicUrl || "")
          }
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await handleImageUpload(file)
    if (url) {
      handleChange("avatar_url", url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.email) {
      toast.error("El email es obligatorio")
      return
    }

    setSaving(true)

    // Construir payload dinámicamente, omitiendo campos que pueden no existir
    const payload: any = {
      email: profile.email,
      role: profile.role || "user",
      profile_type: profile.profile_type || null,
      name: profile.name || null,
      bio: profile.bio || null,
      avatar_url: profile.avatar_url || null,
    }

    // Agregar campos opcionales solo si existen en el schema
    if (profile.is_active !== undefined) payload.is_active = profile.is_active ?? true
    if (profile.is_verified !== undefined) payload.is_verified = profile.is_verified ?? false
    if (profile.verification_status !== undefined) payload.verification_status = profile.verification_status || "PENDING"
    
    // Solo agregar city y country si tienen valor (evitar error si no existen en schema)
    if (profile.city !== undefined && profile.city !== null && profile.city !== "") {
      payload.city = profile.city
    }
    if (profile.country !== undefined && profile.country !== null && profile.country !== "") {
      payload.country = profile.country
    }

    // Si es un perfil nuevo, necesitamos crear el usuario en auth primero
    if (!isEditMode) {
      // Para crear un perfil nuevo, necesitamos que el usuario ya exista en auth.users
      // Por ahora, solo permitimos editar perfiles existentes
      toast.error("Para crear un nuevo perfil, el usuario debe registrarse primero")
      setSaving(false)
      return
    }

    try {
      let { error } = await supabase.from("profiles").update(payload).eq("id", id)
      
      if (error) {
        // Si el error es por columnas que no existen (city, country), intentar sin ellas
        if (error.message?.includes("city") || error.message?.includes("country")) {
          const { city, country, ...payloadWithoutLocation } = payload
          const { error: retryError } = await supabase
            .from("profiles")
            .update(payloadWithoutLocation)
            .eq("id", id)
          
          if (retryError) throw retryError
        } else {
          throw error
        }
      }
      
      toast.success("Perfil actualizado correctamente")
      navigate("/admin/profiles")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast.error("Error al guardar el perfil: " + (error.message || "Error desconocido"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 py-6 sm:py-8 ">
        <Card className="mb-6 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditMode ? "Editar perfil" : "Crear perfil"}
            </CardTitle>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Email *</label>
                <Input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  disabled={isEditMode}
                />
                {isEditMode && (
                  <p className="mt-1 text-xs text-zinc-400">El email no se puede modificar</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Nombre</label>
                  <Input
                    value={profile.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Nombre artístico</label>
                  <Input
                    value={(profile as any).nombre_artistico || ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, nombre_artistico: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="Nombre artístico o nombre del club/label"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Tipo de perfil</label>
                  <select
                    value={profile.profile_type || ""}
                    onChange={(e) => handleChange("profile_type", e.target.value || null)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    <option value="">Selecciona tipo</option>
                    {PROFILE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Rol</label>
                  <select
                    value={profile.role || "user"}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Biografía</label>
                <Textarea
                  value={profile.bio || ""}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
                  placeholder="Descripción del perfil..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Ciudad</label>
                  <Input
                    value={profile.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">País</label>
                  <Input
                    value={profile.country || ""}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Avatar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Subir avatar</label>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
                <p className="mt-1 text-xs text-zinc-400">
                  Recomendado: 400x400px, formato JPG/PNG, máximo 1MB.
                </p>
              </div>
              {profile.avatar_url && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Vista previa</label>
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full border border-zinc-700 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Estado y verificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={profile.is_active ?? true}
                    onChange={(e) => handleChange("is_active", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Perfil activo
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={profile.is_verified ?? false}
                    onChange={(e) => handleChange("is_verified", e.target.checked)}
                    className="w-4 h-4"
                  />
                  Verificado
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Estado de verificación</label>
                <select
                  value={profile.verification_status || "PENDING"}
                  onChange={(e) => handleChange("verification_status", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="APPROVED">Aprobado</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600"
              onClick={() => navigate("/admin/profiles")}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]" disabled={saving}>
              {saving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear perfil"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

