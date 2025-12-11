import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Filter, Sparkles, TrendingUp, Zap } from "lucide-react"
import { StoreBackground } from "@/components/backgrounds/store-background"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { useProductLikes } from "@/hooks/useProductLikes"
import { useCart } from "@/contexts/cart-context"
import { ProductCard } from "@/components/store/product-card"
import { TABLES } from "@/constants/tables"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import type { Product, Category } from "@/types"

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
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
    return filteredProducts.filter(p => p.is_featured).slice(0, 4)
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
        {/* Hero Section - Compact */}
        <section className="relative w-full py-16 md:py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-0.5 bg-[#00F9FF]" />
                <h1 
                  className="text-6xl md:text-7xl lg:text-8xl font-heading text-white"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  STORE
                </h1>
                <div className="w-12 h-0.5 bg-[#00F9FF]" />
              </div>
              <p className="text-white/70 font-space text-base md:text-lg mb-6">
                Merchandising oficial de TECHNO EXPERIENCE
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge className="bg-[#00F9FF] text-black border-0 px-4 py-1.5">
                  <Zap className="w-3 h-3 mr-1.5" />
                  Envío Gratis
                </Badge>
                <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5">
                  <TrendingUp className="w-3 h-3 mr-1.5" />
                  Nuevos Productos
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Filters - Sticky */}
        <header className="sticky top-16 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`group flex items-center gap-2 px-4 py-2 text-sm font-space transition-all duration-300 ${
                        selectedCategory === cat.value
                          ? "bg-[#00F9FF] text-black shadow-lg shadow-[#00F9FF]/50"
                          : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 hover:border-[#00F9FF]/50"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-transform ${selectedCategory === cat.value ? "scale-110" : ""}`} />
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
          <section className="py-12 bg-gradient-to-b from-black to-zinc-900/50">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-6 h-6 text-[#00F9FF]" />
                <h2 
                  className="text-3xl md:text-4xl font-heading text-white"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  PRODUCTOS DESTACADOS
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    isLiked={isLiked(product.id)}
                    onToggleLike={(e) => handleToggleLike(product.id, e)}
                    onAddToCart={(e) => handleAddToCart(product, e)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Products Grid */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isLiked={isLiked(product.id)}
                  onToggleLike={(e) => handleToggleLike(product.id, e)}
                  onAddToCart={(e) => handleAddToCart(product, e)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="No hay productos"
              description="No hay productos disponibles en esta categoría."
            />
          )}
        </main>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
