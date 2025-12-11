import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ShoppingBag, Heart, Sparkles } from "lucide-react"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  index?: number
  isLiked?: boolean
  onToggleLike?: (e: React.MouseEvent) => Promise<void>
  onAddToCart?: (e: React.MouseEvent) => Promise<void>
}

export function ProductCard({ 
  product, 
  index = 0,
  isLiked = false,
  onToggleLike,
  onAddToCart 
}: ProductCardProps) {
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const productImage = product.main_image || (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg")

  return (
    <div
      className="group relative"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
      }}
    >
      <Link
        to={`/store/${product.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Ver ${product.name}`}
      />
      
      <div className="relative bg-black border border-white/10 group-hover:border-[#00F9FF]/50 transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-zinc-900 to-black overflow-hidden">
          <OptimizedImage
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {product.is_featured && (
              <Badge className="bg-[#00F9FF] text-black border-0 px-2 py-1 text-xs font-bold">
                <Sparkles className="w-3 h-3 mr-1" />
                Destacado
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-red-600 text-white border-0 px-2 py-1 text-xs font-bold">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onToggleLike && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleLike(e)
                }}
                className={`w-10 h-10 bg-black/80 backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center justify-center ${
                  isLiked
                    ? "text-[#00F9FF] border-[#00F9FF]/50"
                    : "text-white hover:bg-[#00F9FF] hover:text-black hover:border-[#00F9FF]"
                }`}
                aria-label={isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 bg-black">
          <h3 
            className="text-lg font-heading text-white mb-2 line-clamp-2 group-hover:text-[#00F9FF] transition-colors"
            style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
          >
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              {product.compare_at_price && product.compare_at_price > product.price ? (
                <div className="flex items-center gap-2">
                  <span className="text-white/50 line-through text-sm">
                    €{product.compare_at_price.toFixed(2)}
                  </span>
                  <span 
                    className="text-2xl font-heading text-[#00F9FF]"
                    style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                  >
                    €{product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span 
                  className="text-2xl font-heading text-white"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  €{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          {onAddToCart && (
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToCart(e)
              }}
              className="w-full bg-[#00F9FF] hover:bg-[#00D9E6] text-black font-heading uppercase tracking-wider transition-all duration-300"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

