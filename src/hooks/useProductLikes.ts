import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { toast } from "sonner"
import { TABLES } from "@/constants/tables"
import type { ProductLike } from "@/types"

export function useProductLikes() {
  const { user } = useAuth()
  const [likes, setLikes] = useState<ProductLike[]>([])
  const [loading, setLoading] = useState(true)
  const [likedProductIds, setLikedProductIds] = useState<Set<string>>(new Set())

  // Load user's likes
  useEffect(() => {
    if (!user) {
      setLikes([])
      setLikedProductIds(new Set())
      setLoading(false)
      return
    }

    loadLikes()
  }, [user])

  const loadLikes = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCT_LIKES)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setLikes(data || [])
      setLikedProductIds(new Set((data || []).map((like) => like.product_id)))
    } catch (error) {
      console.error("Error loading likes:", error)
      toast.error("Error al cargar favoritos")
    } finally {
      setLoading(false)
    }
  }

  const isLiked = useCallback(
    (productId: string) => {
      return likedProductIds.has(productId)
    },
    [likedProductIds]
  )

  const toggleLike = useCallback(
    async (productId: string) => {
      if (!user) {
        toast.error("Debes iniciar sesión para añadir favoritos")
        return false
      }

      const currentlyLiked = isLiked(productId)

      try {
        if (currentlyLiked) {
          // Remove like
          const { error } = await supabase
            .from(TABLES.PRODUCT_LIKES)
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId)

          if (error) throw error

          setLikes((prev) => prev.filter((like) => like.product_id !== productId))
          setLikedProductIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(productId)
            return newSet
          })
          toast.success("Eliminado de favoritos")
          return false
        } else {
          // Add like
          const { error } = await supabase.from(TABLES.PRODUCT_LIKES).insert({
            user_id: user.id,
            product_id: productId,
          })

          if (error) throw error

          const newLike: ProductLike = {
            id: "", // Will be set by DB
            user_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString(),
          }

          setLikes((prev) => [...prev, newLike])
          setLikedProductIds((prev) => new Set(prev).add(productId))
          toast.success("Añadido a favoritos")
          return true
        }
      } catch (error: any) {
        console.error("Error toggling like:", error)
        if (error.code === "23505") {
          // Unique constraint violation - already liked
          toast.info("Ya está en favoritos")
        } else {
          toast.error("Error al actualizar favoritos")
        }
        return currentlyLiked
      }
    },
    [user, isLiked]
  )

  return {
    likes,
    likedProductIds,
    isLiked,
    toggleLike,
    loading,
    refetch: loadLikes,
  }
}

