import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface FavoriteButtonProps {
  resourceType: "product" | "event" | "release" | "video" | "news"
  resourceId: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FavoriteButton({ resourceType, resourceId, className = "", size = "md" }: FavoriteButtonProps) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkFavorite()
    }
  }, [user, resourceType, resourceId])

  const checkFavorite = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId)
        .maybeSingle()

      if (error) throw error
      setIsFavorite(!!data)
    } catch (error) {
      console.error("Error checking favorite:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para agregar a favoritos")
      return
    }

    setLoading(true)
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_type", resourceType)
          .eq("resource_id", resourceId)

        if (error) throw error
        setIsFavorite(false)
        toast.success("Eliminado de favoritos")
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            resource_type: resourceType,
            resource_id: resourceId,
          })

        if (error) throw error
        setIsFavorite(true)
        toast.success("Agregado a favoritos")
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error)
      toast.error("Error al actualizar favoritos")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className={`${sizeClasses[size]} p-0 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500 transition-colors ${className} ${
        isFavorite ? "bg-red-500/20 border-red-500 text-red-400" : ""
      }`}
      title={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
    >
      <Heart className={`${iconSizes[size]} ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  )
}

