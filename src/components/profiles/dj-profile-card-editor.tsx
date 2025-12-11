/**
 * DJ Profile Card Editor
 * Permite al DJ seleccionar el color de fondo de su tarjeta
 */

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DJProfileCard, CARD_COLORS } from "./dj-profile-card"
import { toast } from "sonner"
import { Save, Palette } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { TABLES } from "@/constants/tables"

interface DJProfileCardEditorProps {
  profileId: string
  onSave?: () => void
}

export function DJProfileCardEditor({ profileId, onSave }: DJProfileCardEditorProps) {
  const { user } = useAuth()
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [badgeText, setBadgeText] = useState<string>("DJ")
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadProfile()
  }, [profileId])

  async function loadProfile() {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select("*")
      .eq("id", profileId)
      .single()

    if (error) {
      toast.error("Error al cargar el perfil")
      return
    }

    if (data) {
      setProfile(data)
      setSelectedColor(data.card_color || CARD_COLORS[5].hex) // Default: cian
      setBadgeText(data.badge_text || "DJ")
      setDescription(data.short_description || data.bio || "")
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!user || user.id !== profileId) {
      toast.error("No tienes permiso para editar este perfil")
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from(TABLES.PROFILES)
      .update({
        card_color: selectedColor,
        badge_text: badgeText,
        short_description: description,
      })
      .eq("id", profileId)

    if (error) {
      toast.error("Error al guardar los cambios")
      setSaving(false)
      return
    }

    toast.success("Cambios guardados")
    setSaving(false)
    if (onSave) onSave()
    loadProfile()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F9FF]"></div>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-white/70 p-8">Perfil no encontrado</div>
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#00F9FF]" />
            Vista Previa de tu Tarjeta
          </h3>
          <div className="max-w-xs mx-auto">
            <DJProfileCard
              id={profile.id}
              nombre_artistico={profile.nombre_artistico}
              name={profile.name}
              avatar_url={profile.avatar_url}
              bio={profile.bio}
              city={profile.city}
              country={profile.country}
              profile_type={profile.profile_type}
              card_color={selectedColor}
              badge_text={badgeText}
              description={description}
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Selector */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-white font-bold mb-4">Selecciona el Color de Fondo</h3>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {CARD_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.hex)}
                className={`
                  relative aspect-square rounded-lg
                  bg-gradient-to-br ${color.value}
                  border-2 transition-all
                  ${selectedColor === color.hex
                    ? "border-[#00F9FF] scale-110 shadow-lg shadow-[#00F9FF]/50"
                    : "border-white/20 hover:border-white/40"
                  }
                `}
                title={color.name}
              >
                {selectedColor === color.hex && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-white/60 text-sm mt-4">
            Elige el color que mejor represente tu estilo. La foto se mostrará sin fondo sobre este color.
          </p>
        </CardContent>
      </Card>

      {/* Badge Text */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <label className="block text-white font-semibold mb-2">
            Texto del Badge (ej: "DJ", "Producer", "Techno Artist")
          </label>
          <input
            type="text"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded"
            placeholder="DJ"
            maxLength={30}
          />
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <label className="block text-white font-semibold mb-2">
            Descripción Corta (aparece debajo del nombre)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded"
            placeholder="Techno Artist"
            rows={2}
            maxLength={100}
          />
          <p className="text-white/60 text-xs mt-2">
            {description.length}/100 caracteres
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#00F9FF] hover:bg-[#00D9E6] text-black font-bold"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </>
        )}
      </Button>
    </div>
  )
}

