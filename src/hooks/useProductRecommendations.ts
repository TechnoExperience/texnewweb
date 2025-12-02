import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { TABLES } from "@/constants/tables"
import type { Product } from "@/types"

interface RecommendationOptions {
  productId?: string
  categoryId?: string
  tags?: string[]
  maxPrice?: number
  minPrice?: number
  limit?: number
}

export function useProductRecommendations(options: RecommendationOptions = {}) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const {
    productId,
    categoryId,
    tags = [],
    maxPrice,
    minPrice,
    limit = 6,
  } = options

  useEffect(() => {
    loadRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, categoryId, maxPrice, minPrice, limit])

  async function loadRecommendations() {
    try {
      setLoading(true)

      // Step 1: Get products frequently bought together (comportamiento de otros usuarios)
      let frequentlyBoughtTogether: string[] = []
      if (productId) {
        // Find orders that contain this product
        const { data: ordersWithProduct } = await supabase
          .from(TABLES.ORDER_ITEMS)
          .select("order_id")
          .eq("product_id", productId)
          .limit(100)

        if (ordersWithProduct && ordersWithProduct.length > 0) {
          const orderIds = ordersWithProduct.map(item => item.order_id)
          
          // Get other products from those orders
          const { data: otherProducts } = await supabase
            .from(TABLES.ORDER_ITEMS)
            .select("product_id")
            .in("order_id", orderIds)
            .neq("product_id", productId)
            .not("product_id", "is", null)

          // Count frequency
          const productCounts: Record<string, number> = {}
          otherProducts?.forEach(item => {
            if (item.product_id) {
              productCounts[item.product_id] = (productCounts[item.product_id] || 0) + 1
            }
          })

          // Get top 10 most frequently bought together
          frequentlyBoughtTogether = Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([id]) => id)
        }
      }

      // Step 2: Build base query
      let query = supabase
        .from(TABLES.PRODUCTS)
        .select("*")
        .eq("is_active", true)

      // Exclude current product if provided
      if (productId) {
        query = query.neq("id", productId)
      }

      // Filter by category if provided
      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      // Filter by price range if provided
      if (minPrice !== undefined) {
        query = query.gte("price", minPrice)
      }
      if (maxPrice !== undefined) {
        query = query.lte("price", maxPrice)
      }

      // Get more products than needed for sorting
      query = query.limit(limit * 3)

      const { data, error } = await query

      if (error) throw error

      let products = (data || []) as Product[]

      // Step 3: Score and sort products
      products = products.map(product => {
        let score = 0

        // High priority: Frequently bought together
        if (frequentlyBoughtTogether.includes(product.id)) {
          score += 100
        }

        // Medium priority: Matching tags
        if (tags && tags.length > 0 && product.tags) {
          const matchingTags = tags.filter(tag => product.tags?.includes(tag)).length
          score += matchingTags * 20
        }

        // Medium priority: Same category
        if (categoryId && product.category_id === categoryId) {
          score += 15
        }

        // Low priority: Featured
        if (product.is_featured) {
          score += 10
        }

        // Low priority: Price similarity (closer to current product price = better)
        if (minPrice !== undefined && maxPrice !== undefined) {
          const priceRange = maxPrice - minPrice
          const productPriceDiff = Math.abs(product.price - (minPrice + maxPrice) / 2)
          score += Math.max(0, 5 - (productPriceDiff / priceRange) * 5)
      }

        // Low priority: View count (popularity)
        score += Math.min(product.view_count || 0, 100) / 20

        return { ...product, _recommendationScore: score }
      })

      // Sort by score (descending)
      products.sort((a: any, b: any) => (b._recommendationScore || 0) - (a._recommendationScore || 0))

      // Remove score from final products
      const finalProducts = products.slice(0, limit).map((product: any) => {
        const { _recommendationScore, ...rest } = product
        return rest
      })

      setRecommendations(finalProducts)
    } catch (error) {
      console.error("Error loading recommendations:", error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  return {
    recommendations,
    loading,
    refetch: loadRecommendations,
  }
}

