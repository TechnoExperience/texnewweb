import { Link } from "react-router-dom"
import { useProductRecommendations } from "@/hooks/useProductRecommendations"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ShoppingBag, Sparkles } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import type { Product } from "@/types"

interface ProductRecommendationsProps {
  productId?: string
  categoryId?: string
  tags?: string[]
  maxPrice?: number
  minPrice?: number
  title?: string
  limit?: number
}

export function ProductRecommendations({
  productId,
  categoryId,
  tags,
  maxPrice,
  minPrice,
  title = "Te puede interesar",
  limit = 6,
}: ProductRecommendationsProps) {
  const { recommendations, loading } = useProductRecommendations({
    productId,
    categoryId,
    tags: tags || [],
    maxPrice,
    minPrice,
    limit,
  })

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-[#00F9FF]" />
          <h2
            className="text-3xl font-heading text-white"
            style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
          >
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <Link
              key={product.id}
              to={`${ROUTES.STORE}/${product.id}`}
              className="group"
            >
              <Card className="bg-white/5 border-white/10 hover:border-[#00F9FF]/50 transition-all duration-300 overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-white/10">
                  <OptimizedImage
                    src={product.main_image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-[#00F9FF] text-black">
                      Destacado
                    </Badge>
                  )}
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-white font-bold mb-2 line-clamp-2 group-hover:text-[#00F9FF] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      {product.compare_at_price && product.compare_at_price > product.price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 line-through text-sm">
                            €{product.compare_at_price.toFixed(2)}
                          </span>
                          <span className="text-[#00F9FF] font-bold">
                            €{product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#00F9FF] font-bold">
                          €{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.stock_quantity > 0 ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        En stock
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                        Agotado
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

