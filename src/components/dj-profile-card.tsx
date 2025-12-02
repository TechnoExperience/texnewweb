/**
 * DJ Profile Card Component
 * Modern colorful card design with background removal and custom color selection
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Check } from "lucide-react"

interface DJProfileCardProps {
  id: string
  nombre_artistico?: string
  name?: string
  avatar_url?: string
  bio?: string
  city?: string
  country?: string
  profile_type?: string
  card_color?: string // Color seleccionado por el DJ
  badge_text?: string // Texto del badge (ej: "Software Engineer")
  description?: string // Descripción corta (ej: "Vue.js Expert")
  className?: string
}

// Colores predefinidos disponibles para los DJs
export const CARD_COLORS = [
  { name: "Verde", value: "from-green-400 to-green-600", hex: "#4ade80" },
  { name: "Azul", value: "from-blue-400 to-blue-600", hex: "#60a5fa" },
  { name: "Rojo/Morado", value: "from-red-400 via-purple-500 to-purple-600", hex: "#f87171" },
  { name: "Amarillo/Naranja", value: "from-yellow-400 via-orange-500 to-orange-600", hex: "#fbbf24" },
  { name: "Rosa/Magenta", value: "from-pink-400 via-rose-500 to-rose-600", hex: "#f472b6" },
  { name: "Cian", value: "from-cyan-400 to-cyan-600", hex: "#22d3ee" },
  { name: "Violeta", value: "from-violet-400 to-violet-600", hex: "#a78bfa" },
  { name: "Índigo", value: "from-indigo-400 to-indigo-600", hex: "#818cf8" },
]

export function DJProfileCard({
  id,
  nombre_artistico,
  name,
  avatar_url,
  bio,
  city,
  country,
  profile_type,
  card_color,
  badge_text,
  description,
  className = "",
}: DJProfileCardProps) {
  const displayName = nombre_artistico || name || "DJ"
  const displayDescription = description || bio || "Techno Artist"
  const badgeLabel = badge_text || "DJ"

  // Determinar el color del gradiente
  const getGradientClass = () => {
    if (card_color) {
      // Si hay un color personalizado guardado, buscar el gradiente correspondiente
      const colorConfig = CARD_COLORS.find(c => c.hex === card_color || c.value.includes(card_color))
      if (colorConfig) {
        return `bg-gradient-to-br ${colorConfig.value}`
      }
      // Si es un hex personalizado, usar inline style
      return ""
    }
    // Color por defecto (cian)
    return "bg-gradient-to-br from-cyan-400 to-cyan-600"
  }

  const gradientClass = getGradientClass()
  const customColorStyle = card_color && !CARD_COLORS.find(c => c.hex === card_color || c.value.includes(card_color))
    ? { background: `linear-gradient(to bottom right, ${card_color}, ${card_color}dd)` }
    : {}

  return (
    <Link
      to={`/profiles/${id}`}
      className={`group block ${className}`}
    >
      <div
        className={`
          relative w-full h-[400px] rounded-2xl overflow-hidden
          border-2 border-white/20
          shadow-2xl shadow-black/50
          hover:shadow-[0_0_40px_rgba(0,249,255,0.4)]
          hover:border-[#00F9FF]/50
          transition-all duration-500
          hover:scale-[1.02]
          ${gradientClass}
        `}
        style={customColorStyle}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badge */}
        <div className="absolute top-4 left-4 z-20">
          <Badge
            className={`
              bg-white/90 backdrop-blur-sm text-black
              border-0 px-3 py-1.5
              shadow-lg
              flex items-center gap-1.5
              font-semibold text-xs
            `}
          >
            <Check className="w-3 h-3" />
            {badgeLabel}
          </Badge>
        </div>

        {/* Profile Image - Sin fondo */}
        <div className="absolute inset-0 flex items-end justify-center pb-8 z-10">
          <div className="relative w-48 h-64">
            {avatar_url ? (
              <OptimizedImage
                src={avatar_url}
                alt={displayName}
                className="w-full h-full object-contain object-bottom"
                style={{
                  filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))",
                }}
              />
            ) : (
              <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/40 text-4xl">🎧</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          <h3 className="text-white font-bold text-xl mb-1 tracking-wide uppercase">
            {displayName}
          </h3>
          <p className="text-white/90 text-sm font-medium">
            {displayDescription}
          </p>
          {(city || country) && (
            <p className="text-white/70 text-xs mt-2">
              {city && country ? `${city}, ${country}` : city || country}
            </p>
          )}
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      </div>
    </Link>
  )
}

