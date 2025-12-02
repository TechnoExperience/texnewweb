import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Share2, 
  ZoomIn, 
  Minus, 
  Plus,
  Check,
  Sparkles,
  Truck,
  Shield,
  RotateCw
} from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ProductRecommendations } from "@/components/product-recommendations"
import { ROUTES } from "@/constants/routes"
import { useSupabaseQuerySingle } from "@/hooks/useSupabaseQuerySingle"
import { useProductLikes } from "@/hooks/useProductLikes"
import { useCart } from "@/contexts/cart-context"
import { supabase } from "@/lib/supabase"
import { TABLES } from "@/constants/tables"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import type { Product, ProductVariant } from "@/types"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isLiked, toggleLike } = useProductLikes()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Fetch product from Supabase
  const { data: product, loading, error } = useSupabaseQuerySingle<Product>(
    TABLES.PRODUCTS,
    (query) => query.eq("id", id).eq("is_active", true),
    { enabled: !!id }
  )

  // Fetch variants
  useEffect(() => {
    if (product?.id) {
      supabase
        .from(TABLES.PRODUCT_VARIANTS)
        .select("*")
        .eq("product_id", product.id)
        .eq("is_active", true)
        .then(({ data, error }) => {
          if (!error && data) {
            setVariants(data as ProductVariant[])
            if (data.length > 0) {
              setSelectedVariant(data[0])
            }
          }
        })
    }
  }, [product?.id])

  // Increment view count
  useEffect(() => {
    if (product?.id) {
      supabase
        .from(TABLES.PRODUCTS)
        .update({ view_count: (product.view_count || 0) + 1 })
        .eq("id", product.id)
        .then(() => {})
    }
  }, [product?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/60 font-space text-lg mb-4">Producto no encontrado</div>
          <Button asChild variant="outline" className="border-white/20 text-white">
            <Link to={ROUTES.STORE}>Volver a la tienda</Link>
          </Button>
        </div>
      </div>
    )
  }

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.main_image 
      ? [product.main_image] 
      : ["/placeholder.svg"]

  const currentPrice = selectedVariant?.price ?? product.price
  const isProductLiked = isLiked(product.id)

  const handleAddToCart = async () => {
    await addItem(product, selectedVariant || undefined, quantity)
    toast.success("Producto añadido al carrito")
  }

  const handleToggleLike = async () => {
    await toggleLike(product.id)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    })
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <div className="sticky top-16 z-30 bg-black/98 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <Link to={ROUTES.STORE}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Store
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleLike}
                className={`text-white/70 hover:text-white hover:bg-white/10 ${
                  isProductLiked ? "text-[#00F9FF]" : ""
                }`}
              >
                <Heart className={`w-4 h-4 ${isProductLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Product Images */}
          <div className="space-y-6">
            {/* Main Image - 3D Interactive */}
            <div 
              className="relative aspect-square bg-gradient-to-br from-black to-zinc-900 border-2 border-white/10 overflow-hidden group cursor-crosshair"
              onMouseMove={handleMouseMove}
              style={{
                perspective: "1000px"
              }}
            >
              <div
                className="absolute inset-0 transition-transform duration-300"
                style={{
                  transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.1}deg) rotateY(${(mousePosition.x - 50) * 0.1}deg)`,
                  transformStyle: "preserve-3d"
                }}
              >
                <OptimizedImage
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-all duration-500"
                  style={{
                    filter: "drop-shadow(0 30px 60px rgba(0, 249, 255, 0.4))",
                    transform: "translateZ(50px)"
                  }}
                />
                
                {/* 3D Glow Effect */}
                <div 
                  className="absolute inset-0 bg-gradient-radial from-[#00F9FF]/20 via-transparent to-transparent pointer-events-none"
                  style={{
                    transform: "translateZ(30px)",
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0, 249, 255, 0.3) 0%, transparent 70%)`
                  }}
                />
              </div>

              {/* Zoom Button */}
              <div className="absolute top-4 right-4 z-20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-white/20"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] text-black border-0 px-3 py-1.5">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Destacado
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge className="bg-red-600 text-white border-0 px-3 py-1.5">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 border-2 transition-all duration-300 overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-[#00F9FF] scale-110"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${product.name} - Vista ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {product.category_id && (
                <Badge className="bg-white/10 text-white border-white/20">
                    Categoría
                </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] text-black border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Destacado
                  </Badge>
                )}
              </div>

              <h1 
                className="text-5xl md:text-6xl font-heading text-white mb-6 leading-tight"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span 
                  className="text-5xl font-heading text-[#00F9FF]"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  €{currentPrice.toFixed(2)}
                </span>
                {product.compare_at_price && product.compare_at_price > currentPrice && (
                  <>
                    <span className="text-2xl text-white/50 font-space line-through">
                      €{product.compare_at_price.toFixed(2)}
                    </span>
                    <Badge className="bg-red-600 text-white border-0">
                      -{discount}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h3 
                  className="text-2xl font-heading text-white mb-4"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  DESCRIPCIÓN
                </h3>
                <p className="text-white/80 font-space leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variant Selection */}
            {variants.length > 0 && (
              <div>
                <h3 
                  className="text-xl font-heading text-white mb-4"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  VARIANTE
                </h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-3 border-2 transition-all duration-300 font-heading text-lg ${
                        selectedVariant?.id === variant.id
                          ? "bg-[#00F9FF] border-[#00F9FF] text-black scale-105"
                          : "bg-transparent border-white/20 text-white/70 hover:border-[#00F9FF]/50 hover:text-white"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                    >
                      {variant.name}
                      {selectedVariant?.id === variant.id && (
                        <Check className="w-4 h-4 inline-block ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 
                className="text-xl font-heading text-white mb-4"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                CANTIDAD
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-white/20 text-white hover:border-[#00F9FF] hover:bg-[#00F9FF] hover:text-black transition-all duration-300 flex items-center justify-center"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span 
                  className="text-3xl font-heading text-white w-16 text-center"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border-2 border-white/20 text-white hover:border-[#00F9FF] hover:bg-[#00F9FF] hover:text-black transition-all duration-300 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.is_active || (product.track_inventory && (selectedVariant?.stock_quantity ?? product.stock_quantity) < quantity)}
              className="w-full bg-[#00F9FF] hover:bg-[#00D9E6] text-black py-6 text-xl font-heading uppercase tracking-wider shadow-2xl hover:shadow-[#00F9FF]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              <ShoppingBag className="w-6 h-6 mr-3" />
              {!product.is_active 
                ? "Producto no disponible" 
                : product.track_inventory && (selectedVariant?.stock_quantity ?? product.stock_quantity) < quantity
                  ? "Stock insuficiente"
                  : `Añadir al Carrito - €${(currentPrice * quantity).toFixed(2)}`
              }
            </Button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/70">
                <Truck className="w-5 h-5 text-[#00F9FF]" />
                <div>
                  <div className="font-space text-sm font-bold text-white">Envío Gratis</div>
                  <div className="font-space text-xs">En pedidos +€50</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Shield className="w-5 h-5 text-[#00F9FF]" />
                <div>
                  <div className="font-space text-sm font-bold text-white">Garantía</div>
                  <div className="font-space text-xs">30 días</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <RotateCw className="w-5 h-5 text-[#00F9FF]" />
                <div>
                  <div className="font-space text-sm font-bold text-white">Devoluciones</div>
                  <div className="font-space text-xs">Fáciles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Recommendations */}
      {product && (
        <ProductRecommendations
          productId={product.id}
          categoryId={product.category_id || undefined}
          tags={product.tags || []}
          maxPrice={product.price * 1.5}
          minPrice={product.price * 0.5}
          title="Productos Relacionados"
          limit={4}
        />
      )}

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

