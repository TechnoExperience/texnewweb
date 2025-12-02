/**
 * Profile Form Component
 * Reusable form for editing profiles (DJ, Promoter, Club, Label, Clubber)
 * Handles both profiles table and auxiliary tables
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/useAuth"

interface ProfileFormProps {
  profileType: "dj" | "promoter" | "club" | "label" | "clubber"
}

export function ProfileForm({ profileType }: ProfileFormProps) {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>({})
  const [auxProfile, setAuxProfile] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user || authLoading) return
    loadProfile()
  }, [user, authLoading])

  const loadProfile = async () => {
    if (!user) return

    try {
      // Load main profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError)
      }

      if (profileData) {
        setProfile(profileData)
      }

      // Load auxiliary profile
      const auxTableName = getAuxTableName(profileType)
      if (auxTableName) {
        const { data: auxData, error: auxError } = await supabase
          .from(auxTableName)
          .select("*")
          .eq("profile_id", user.id)
          .single()

        if (auxError && auxError.code !== "PGRST116") {
          console.error(`Error loading ${auxTableName}:`, auxError)
        }

        if (auxData) {
          setAuxProfile(auxData)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading profile:", error)
      setLoading(false)
    }
  }

  const getAuxTableName = (type: string): string | null => {
    const map: Record<string, string> = {
      dj: "dj_profiles",
      promoter: "promoters_profiles",
      club: "clubs_profiles",
      label: "labels_profiles",
      clubber: "clubbers_profiles",
    }
    return map[type] || null
  }

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateUrl = (url: string): boolean => {
    if (!url) return true // Optional URLs
    try {
      const parsed = new URL(url)
      return parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Optional for non-promoters
    if (profileType === "promoter" && !phone) return false
    // Basic phone validation (international format)
    const re = /^[\d\s\-\+\(\)]+$/
    return re.test(phone) && phone.length >= 9
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Common validations
    if (!profile.email || !validateEmail(profile.email)) {
      newErrors.email = "Email válido requerido"
    }

    if (profile.bio && profile.bio.length > 2000) {
      newErrors.bio = "La biografía no puede exceder 2000 caracteres"
    }

    // Profile type specific validations
    if (profileType === "promoter") {
      if (!auxProfile.phone || !validatePhone(auxProfile.phone)) {
        newErrors.phone = "Teléfono válido requerido (mínimo 9 dígitos)"
      }
    }

    if (profileType === "dj") {
      if (!auxProfile.instagram_url || !validateUrl(auxProfile.instagram_url)) {
        newErrors.instagram_url = "URL de Instagram válida requerida (https://)"
      }
      if (auxProfile.soundcloud_url && !validateUrl(auxProfile.soundcloud_url)) {
        newErrors.soundcloud_url = "URL debe comenzar con https://"
      }
      if (auxProfile.spotify_url && !validateUrl(auxProfile.spotify_url)) {
        newErrors.spotify_url = "URL debe comenzar con https://"
      }
    }

    if (profileType === "club") {
      if (!auxProfile.name_of_club) {
        newErrors.name_of_club = "Nombre del club requerido"
      }
    }

    if (profileType === "label") {
      if (!auxProfile.label_name) {
        newErrors.label_name = "Nombre del sello requerido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAuxChange = (field: string, value: any) => {
    setAuxProfile((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleImageUpload = async (file: File, field: "avatar_url" | "cover_url") => {
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
            const url = data?.data?.publicUrl || ""
            handleProfileChange(field, url)
            resolve(url)
          }
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      alert("Por favor, corrige los errores en el formulario")
      return
    }

    setSaving(true)

    try {
      // Update main profile
      // Construir payload dinámicamente solo con campos que existen
      const profilePayload: any = {
        email: profile.email,
        profile_type: profileType,
      }

      // Agregar campos opcionales solo si tienen valor y existen en el schema
      if (profile.name !== undefined) profilePayload.name = profile.name || null
      if (profile.nombre_artistico !== undefined) profilePayload.nombre_artistico = profile.nombre_artistico || null
      if (profile.bio !== undefined) profilePayload.bio = profile.bio || null
      if (profile.avatar_url !== undefined) profilePayload.avatar_url = profile.avatar_url || null
      
      // Solo agregar city y country si tienen valor (evitar error si no existen en schema)
      // Nota: Si estos campos no existen en tu BD, comenta estas líneas o crea una migración
      if (profile.city !== undefined && profile.city !== null && profile.city !== "") {
        profilePayload.city = profile.city
      }
      if (profile.country !== undefined && profile.country !== null && profile.country !== "") {
        profilePayload.country = profile.country
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, ...profilePayload }, { onConflict: "id" })

      if (profileError) {
        console.error("Error saving profile:", profileError)
        // Si el error es por columnas que no existen, intentar sin ellas
        if (profileError.message?.includes("city") || profileError.message?.includes("country")) {
          const { city, country, ...payloadWithoutLocation } = profilePayload
          const { error: retryError } = await supabase
            .from("profiles")
            .upsert({ id: user!.id, ...payloadWithoutLocation }, { onConflict: "id" })
          
          if (retryError) throw retryError
        } else {
          throw profileError
        }
      }

      // Update auxiliary profile
      const auxTableName = getAuxTableName(profileType)
      if (auxTableName) {
        const auxPayload: any = {
          profile_id: user!.id,
          ...getAuxPayload(profileType),
        }

        const { error: auxError } = await supabase
          .from(auxTableName)
          .upsert(auxPayload, { onConflict: "profile_id" })

        if (auxError) throw auxError
      }

      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error al guardar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const getAuxPayload = (type: string): any => {
    switch (type) {
      case "dj":
        return {
          instagram_url: auxProfile.instagram_url || "",
          soundcloud_url: auxProfile.soundcloud_url || null,
          spotify_url: auxProfile.spotify_url || null,
          bandcamp_url: auxProfile.bandcamp_url || null,
          mixcloud_url: auxProfile.mixcloud_url || null,
          presskit_url: auxProfile.presskit_url || null,
        }
      case "promoter":
        return {
          phone: auxProfile.phone || "",
          instagram_url: auxProfile.instagram_url || null,
          web_url: auxProfile.web_url || null,
          short_description: auxProfile.short_description || null,
        }
      case "club":
        return {
          name_of_club: auxProfile.name_of_club || "",
          location: auxProfile.location || null,
          description: auxProfile.description || null,
        }
      case "label":
        return {
          label_name: auxProfile.label_name || "",
          bandcamp_url: auxProfile.bandcamp_url || null,
          beatport_url: auxProfile.beatport_url || null,
          spotify_url: auxProfile.spotify_url || null,
          soundcloud_url: auxProfile.soundcloud_url || null,
          web_url: auxProfile.web_url || null,
        }
      case "clubber":
        return {
          interests: auxProfile.interests || [],
        }
      default:
        return {}
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Email <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              value={profile.email || ""}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              className={`bg-zinc-900 border-zinc-700 text-white ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Nombre</label>
              <Input
                value={profile.name || ""}
                onChange={(e) => handleProfileChange("name", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                {profileType === "dj" ? "Nombre artístico" : profileType === "club" ? "Nombre del club" : "Nombre comercial"}
              </label>
              <Input
                value={profile.nombre_artistico || auxProfile.name_of_club || auxProfile.label_name || ""}
                onChange={(e) => {
                  if (profileType === "club") {
                    handleAuxChange("name_of_club", e.target.value)
                  } else if (profileType === "label") {
                    handleAuxChange("label_name", e.target.value)
                  } else {
                    handleProfileChange("nombre_artistico", e.target.value)
                  }
                }}
                className={`bg-zinc-900 border-zinc-700 text-white ${
                  errors.name_of_club || errors.label_name ? "border-red-500" : ""
                }`}
              />
              {(errors.name_of_club || errors.label_name) && (
                <p className="mt-1 text-xs text-red-400">{errors.name_of_club || errors.label_name}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Ciudad</label>
              <Input
                value={profile.city || ""}
                onChange={(e) => handleProfileChange("city", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">País</label>
              <Input
                value={profile.country || ""}
                onChange={(e) => handleProfileChange("country", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Biografía {profile.bio && `(${profile.bio.length}/2000)`}
            </label>
            <Textarea
              value={profile.bio || ""}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
              className={`bg-zinc-900 border-zinc-700 text-white min-h-[120px] ${errors.bio ? "border-red-500" : ""}`}
              maxLength={2000}
            />
            {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Campos específicos por tipo */}
      {profileType === "dj" && (
        <Card>
          <CardHeader>
            <CardTitle>Redes sociales y enlaces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Instagram URL <span className="text-red-400">*</span>
              </label>
              <Input
                type="url"
                value={auxProfile.instagram_url || ""}
                onChange={(e) => handleAuxChange("instagram_url", e.target.value)}
                className={`bg-zinc-900 border-zinc-700 text-white ${errors.instagram_url ? "border-red-500" : ""}`}
                placeholder="https://instagram.com/..."
              />
              {errors.instagram_url && <p className="mt-1 text-xs text-red-400">{errors.instagram_url}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">SoundCloud URL</label>
                <Input
                  type="url"
                  value={auxProfile.soundcloud_url || ""}
                  onChange={(e) => handleAuxChange("soundcloud_url", e.target.value)}
                  className={`bg-zinc-900 border-zinc-700 text-white ${errors.soundcloud_url ? "border-red-500" : ""}`}
                  placeholder="https://soundcloud.com/..."
                />
                {errors.soundcloud_url && <p className="mt-1 text-xs text-red-400">{errors.soundcloud_url}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Spotify URL</label>
                <Input
                  type="url"
                  value={auxProfile.spotify_url || ""}
                  onChange={(e) => handleAuxChange("spotify_url", e.target.value)}
                  className={`bg-zinc-900 border-zinc-700 text-white ${errors.spotify_url ? "border-red-500" : ""}`}
                  placeholder="https://open.spotify.com/..."
                />
                {errors.spotify_url && <p className="mt-1 text-xs text-red-400">{errors.spotify_url}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Bandcamp URL</label>
                <Input
                  type="url"
                  value={auxProfile.bandcamp_url || ""}
                  onChange={(e) => handleAuxChange("bandcamp_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="https://...bandcamp.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Mixcloud URL</label>
                <Input
                  type="url"
                  value={auxProfile.mixcloud_url || ""}
                  onChange={(e) => handleAuxChange("mixcloud_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="https://mixcloud.com/..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Press Kit URL</label>
              <Input
                type="url"
                value={auxProfile.presskit_url || ""}
                onChange={(e) => handleAuxChange("presskit_url", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {profileType === "promoter" && (
        <Card>
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Teléfono <span className="text-red-400">*</span>
              </label>
              <Input
                type="tel"
                value={auxProfile.phone || ""}
                onChange={(e) => handleAuxChange("phone", e.target.value)}
                className={`bg-zinc-900 border-zinc-700 text-white ${errors.phone ? "border-red-500" : ""}`}
                placeholder="+34 600 000 000"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Instagram URL</label>
              <Input
                type="url"
                value={auxProfile.instagram_url || ""}
                onChange={(e) => handleAuxChange("instagram_url", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Web URL</label>
              <Input
                type="url"
                value={auxProfile.web_url || ""}
                onChange={(e) => handleAuxChange("web_url", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Descripción corta</label>
              <Textarea
                value={auxProfile.short_description || ""}
                onChange={(e) => handleAuxChange("short_description", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {profileType === "club" && (
        <Card>
          <CardHeader>
            <CardTitle>Información del club</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Nombre del club <span className="text-red-400">*</span>
              </label>
              <Input
                value={auxProfile.name_of_club || ""}
                onChange={(e) => handleAuxChange("name_of_club", e.target.value)}
                className={`bg-zinc-900 border-zinc-700 text-white ${errors.name_of_club ? "border-red-500" : ""}`}
              />
              {errors.name_of_club && <p className="mt-1 text-xs text-red-400">{errors.name_of_club}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Ubicación</label>
              <Input
                value={auxProfile.location || ""}
                onChange={(e) => handleAuxChange("location", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Descripción</label>
              <Textarea
                value={auxProfile.description || ""}
                onChange={(e) => handleAuxChange("description", e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {profileType === "label" && (
        <Card>
          <CardHeader>
            <CardTitle>Información del sello</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Nombre del sello <span className="text-red-400">*</span>
              </label>
              <Input
                value={auxProfile.label_name || ""}
                onChange={(e) => handleAuxChange("label_name", e.target.value)}
                className={`bg-zinc-900 border-zinc-700 text-white ${errors.label_name ? "border-red-500" : ""}`}
              />
              {errors.label_name && <p className="mt-1 text-xs text-red-400">{errors.label_name}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Bandcamp URL</label>
                <Input
                  type="url"
                  value={auxProfile.bandcamp_url || ""}
                  onChange={(e) => handleAuxChange("bandcamp_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Beatport URL</label>
                <Input
                  type="url"
                  value={auxProfile.beatport_url || ""}
                  onChange={(e) => handleAuxChange("beatport_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Spotify URL</label>
                <Input
                  type="url"
                  value={auxProfile.spotify_url || ""}
                  onChange={(e) => handleAuxChange("spotify_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">SoundCloud URL</label>
                <Input
                  type="url"
                  value={auxProfile.soundcloud_url || ""}
                  onChange={(e) => handleAuxChange("soundcloud_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Web URL</label>
                <Input
                  type="url"
                  value={auxProfile.web_url || ""}
                  onChange={(e) => handleAuxChange("web_url", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Avatar</label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  await handleImageUpload(file, "avatar_url")
                }
              }}
            />
            <p className="mt-1 text-xs text-zinc-400">Recomendado: 400x400px, formato JPG/PNG, máximo 1MB</p>
            {profile.avatar_url && (
              <img src={profile.avatar_url} alt="Avatar" className="mt-2 w-24 h-24 rounded-full object-cover" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estado de verificación */}
      {profile.verification_status && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de verificación</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                profile.verification_status === "APPROVED"
                  ? "bg-green-500/20 text-green-300 border-green-500/40"
                  : profile.verification_status === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                    : "bg-red-500/20 text-red-300 border-red-500/40"
              }
            >
              {profile.verification_status === "APPROVED"
                ? "Verificado"
                : profile.verification_status === "PENDING"
                  ? "Pendiente"
                  : "Rechazado"}
            </Badge>
            {profile.verification_notes && (
              <p className="mt-2 text-sm text-zinc-400">{profile.verification_notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" className="bg-white text-black hover:bg-zinc-200" disabled={saving}>
          {saving ? "Guardando..." : "Guardar perfil"}
        </Button>
      </div>
    </form>
  )
}

