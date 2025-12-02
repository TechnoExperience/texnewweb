import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Filter, Heart, Sparkles, TrendingUp, Zap } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { StoreBackground } from "@/components/backgrounds/store-background"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { useProductLikes } from "@/hooks/useProductLikes"
import { useCart } from "@/contexts/cart-context"
import { TABLES } from "@/constants/tables"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import type { Product, Category } from "@/types"

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const { isLiked, toggleLike } = useProductLikes()
  const { addItem } = useCart()

  // Fetch products from Supabase
  const { data: products, loading: productsLoading } = useSupabaseQuery<Product>(
    TABLES.PRODUCTS,
    (query) => query.eq("is_active", true).order("created_at", { ascending: false })
  )

  // Fetch categories
  const { data: categoriesData } = useSupabaseQuery<Category>(
    TABLES.CATEGORIES,
    (query) => query.eq("is_active", true).order("display_order", { ascending: true })
  )

  // Build categories list for filter
  const categories = useMemo(() => {
    const cats = [{ value: "all", label: "Todos", icon: Sparkles }]
    if (categoriesData) {
      categoriesData.forEach(cat => {
        cats.push({ value: cat.id, label: cat.name, icon: ShoppingBag })
      })
    }
    return cats
  }, [categoriesData])

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!products) return []
    if (selectedCategory === "all") return products
    return products.filter(p => p.category_id === selectedCategory)
  }, [products, selectedCategory])

  const featuredProducts = useMemo(() => {
    return filteredProducts.filter(p => p.is_featured)
  }, [filteredProducts])

  const handleToggleLike = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleLike(productId)
  }

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await addItem(product)
    toast.success("Producto añadido al carrito")
  }

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-black relative">
        <StoreBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      <StoreBackground />
      <div className="relative z-10">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F9FF]/20 via-[#00D9E6]/10 to-black" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300F9FF' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-1 bg-[#00F9FF] transform rotate-12" />
              <h1 
                className="text-7xl md:text-8xl lg:text-9xl font-heading text-white"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                STORE
              </h1>
              <div className="w-16 h-1 bg-[#00F9FF] transform -rotate-12" />
            </div>
            <p className="text-white/70 font-space text-lg md:text-xl max-w-2xl mx-auto">
              Merchandising oficial de TECHNO EXPERIENCE - Diseño exclusivo y calidad premium
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Badge className="bg-[#00F9FF] text-black border-0 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Envío Gratis
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Nuevos Productos
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Sticky */}
      <header className="sticky top-16 z-40 bg-black/98 backdrop-blur-md border-b border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3 flex-wrap">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`group flex items-center gap-2 px-6 py-3 text-sm font-space transition-all duration-300 ${
                      selectedCategory === cat.value
                        ? "bg-[#00F9FF] text-black shadow-lg shadow-[#00F9FF]/50 scale-105"
                        : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 hover:border-[#00F9FF]/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform ${selectedCategory === cat.value ? "scale-110" : ""}`} />
                    {cat.label}
                  </button>
                )
              })}
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/50 text-sm font-space">
              <Filter className="w-4 h-4" />
              <span>{filteredProducts.length} productos</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Products Section */}
      {selectedCategory === "all" && featuredProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-black to-zinc-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="w-8 h-8 text-[#00F9FF]" />
              <h2 
                className="text-4xl md:text-5xl font-heading text-white"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                PRODUCTOS DESTACADOS
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                  isHovered={hoveredProduct === product.id}
                  onHover={() => setHoveredProduct(product.id)}
                  onLeave={() => setHoveredProduct(null)}
                  isLiked={isLiked(product.id)}
                  onToggleLike={(e: React.MouseEvent) => handleToggleLike(product.id, e)}
                  onAddToCart={(e: React.MouseEvent) => handleAddToCart(product, e)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Products Grid */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index}
              isHovered={hoveredProduct === product.id}
              onHover={() => setHoveredProduct(product.id)}
              onLeave={() => setHoveredProduct(null)}
                isLiked={isLiked(product.id)}
                onToggleLike={(e) => handleToggleLike(product.id, e)}
                onAddToCart={(e) => handleAddToCart(product, e)}
            />
            ))
          ) : (
            <div className="col-span-full text-center py-24">
              <ShoppingBag className="w-20 h-20 mx-auto text-white/20 mb-6" />
              <h3 
                className="text-3xl font-heading text-white/60 mb-2" 
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                No hay productos
              </h3>
              <p className="text-white/40 font-space">
                No hay productos disponibles en esta categoría.
              </p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <ShoppingBag className="w-20 h-20 mx-auto text-white/20 mb-6" />
            <h3 
              className="text-3xl font-heading text-white/60 mb-2" 
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              No hay productos
            </h3>
            <p className="text-white/40 font-space">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </div>
    </div>
  )
}

// Modern Product Card Component
interface ProductCardProps {
  product: Product
  index: number
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  isLiked?: boolean
  onToggleLike?: (e: React.MouseEvent) => Promise<void>
  onAddToCart?: (e: React.MouseEvent) => Promise<void>
}

function ProductCard({ product, index, isHovered, onHover, onLeave, isLiked = false, onToggleLike, onAddToCart }: ProductCardProps) {
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  const productImage = product.main_image || (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg")

  return (
    <div
      className="group block relative"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      <Link
        to={`/store/${product.id}`}
        className="absolute inset-0 z-10"
      />
      <div className="relative h-[500px] sm:h-[550px] lg:h-[600px] bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-white/10 group-hover:border-[#00F9FF]/50 transition-all duration-700 overflow-hidden">
        {/* 3D Product Display */}
        <div className="relative w-full h-full" style={{ perspective: "1000px" }}>
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-700"
            style={{
              transform: isHovered ? "rotateY(15deg) rotateX(-5deg) scale(1.05)" : "rotateY(0deg) rotateX(0deg) scale(1)",
              transformStyle: "preserve-3d"
            }}
          >
            <div className="relative w-48 h-64 sm:w-56 sm:h-72 md:w-60 md:h-80">
              <OptimizedImage
                src={productImage}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-700"
                style={{
                  filter: isHovered 
                    ? "drop-shadow(0 30px 60px rgba(0, 249, 255, 0.5)) brightness(1.1)" 
                    : "drop-shadow(0 20px 40px rgba(0, 249, 255, 0.3))",
                  transform: isHovered ? "translateZ(40px)" : "translateZ(20px)"
                }}
              />
              
              {/* 3D Glow Effect */}
              <div 
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: "translateZ(10px)",
                  background: "radial-gradient(circle, rgba(0, 249, 255, 0.3) 0%, rgba(0, 249, 255, 0.1) 50%, transparent 100%)"
                }}
              />
            </div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[#00F9FF] rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] text-black border-0 px-3 py-1.5 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Destacado
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-red-600 text-white border-0 px-3 py-1.5 shadow-lg">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div 
          className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ transform: "translateZ(50px)" }}
        >
          {onToggleLike && (
          <button 
              className={`w-10 h-10 bg-black/70 backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center justify-center shadow-lg ${
                isLiked 
                  ? "text-[#00F9FF] bg-[#00F9FF]/20 border-[#00F9FF]/50" 
                  : "text-white hover:bg-[#00F9FF] hover:text-black"
              }`}
              onClick={onToggleLike}
          >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          </button>
          )}
        </div>

        {/* Product Info - Bottom Overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/98 via-black/90 to-transparent backdrop-blur-sm"
          style={{
            transform: "translateZ(30px)"
          }}
        >
          {product.category_id && (
          <div className="flex items-center gap-2 mb-2 text-xs text-white/50 font-space">
              <span>Categoría</span>
          </div>
          )}
          <h3 
            className="text-2xl font-heading text-white mb-3 line-clamp-2 group-hover:text-[#00F9FF] transition-colors" 
            style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
          >
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div>
              {product.compare_at_price && product.compare_at_price > product.price ? (
                <div className="flex items-center gap-2">
                  <span className="text-white/50 line-through text-sm">
                    €{product.compare_at_price.toFixed(2)}
                  </span>
                  <span 
                    className="text-3xl font-heading text-[#00F9FF] block" 
                    style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                  >
                    €{product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
              <span 
                className="text-3xl font-heading text-white block" 
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                €{product.price.toFixed(2)}
                </span>
              )}
            </div>
            {onAddToCart ? (
              <Button 
                onClick={onAddToCart}
                className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black px-6 py-3 font-heading uppercase tracking-wider shadow-lg hover:shadow-[#00F9FF]/50 transition-all duration-300 group-hover:scale-105"
                style={{ 
                  fontFamily: "'Bebas Neue', system-ui, sans-serif",
                  transform: "translateZ(40px)"
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            ) : (
            <Button 
              className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black px-6 py-3 font-heading uppercase tracking-wider shadow-lg hover:shadow-[#00F9FF]/50 transition-all duration-300 group-hover:scale-105"
              style={{ 
                fontFamily: "'Bebas Neue', system-ui, sans-serif",
                transform: "translateZ(40px)"
              }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver
            </Button>
            )}
          </div>
        </div>

        {/* Animated Border Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(0, 249, 255, 0.3) 0%, transparent 70%)",
            transform: "translateZ(10px)"
          }}
        />

        {/* Corner Accents */}
        <div 
          className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#00F9FF]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
          style={{ transform: "translateZ(50px)" }}
        />
        <div 
          className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#00F9FF]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ transform: "translateZ(50px)" }}
        />
      </div>
    </div>
  )
}
