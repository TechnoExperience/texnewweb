import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  Filter,
  DollarSign,
  ExternalLink,
} from "lucide-react"
import type { Product, Category } from "@/types"
import { TABLES } from "@/constants/tables"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { OptimizedImage } from "@/components/ui/optimized-image"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  })

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProducts(data)
    } else {
      toast.error("Error al cargar productos")
    }
    setLoading(false)
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select("*")
      .order("name", { ascending: true })

    if (!error && data) {
      setCategories(data)
    }
  }

  async function deleteProduct(id: string) {
    setDeleteConfirm({ open: true, productId: id })
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm.productId) return

    const { error } = await supabase.from(TABLES.PRODUCTS).delete().eq("id", deleteConfirm.productId)

    if (error) {
      logger.error("Error deleting product", error as Error)
      toast.error("Error al eliminar el producto", {
        description: error.message || "No se pudo eliminar el producto.",
      })
    } else {
      setProducts(products.filter(p => p.id !== deleteConfirm.productId))
      toast.success("Producto eliminado correctamente")
    }
    setDeleteConfirm({ open: false, productId: null })
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from(TABLES.PRODUCTS)
      .update({ is_active: !currentStatus })
      .eq("id", id)

    if (error) {
      toast.error("Error al actualizar el producto")
      return
    }

    setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
    toast.success(`Producto ${!currentStatus ? 'activado' : 'desactivado'}`)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || product.category_id === filterCategory
    const matchesActive = filterActive === "all" || 
      (filterActive === "active" && product.is_active) ||
      (filterActive === "inactive" && !product.is_active)
    return matchesSearch && matchesCategory && matchesActive
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F9FF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black py-8 md:py-12">
        <div className="w-full px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                <Badge className="bg-black/20 text-black border-black/30">Gestión</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                GESTIÓN DE PRODUCTOS
              </h1>
              <p className="text-black/90 text-sm sm:text-base">
                Administra los productos de la tienda
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-black/20 hover:bg-black/30 text-black border border-black/30">
                <Link to="/admin/dropshipping">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Dropshipping
                </Link>
              </Button>
              <Button asChild className="bg-black hover:bg-black/90 text-white">
                <Link to="/admin/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-zinc-900 border-zinc-800 hover:border-[#00F9FF]/50 transition-all">
              <CardContent className="p-0">
                {/* Product Image */}
                {product.main_image && (
                  <div className="relative aspect-square bg-zinc-800 overflow-hidden">
                    <OptimizedImage
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className={product.is_active ? "bg-green-500" : "bg-red-500"}>
                        {product.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    {product.dropshipping_enabled && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-[#00F9FF] text-black">
                          Dropshipping
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  
                  {product.sku && (
                    <p className="text-white/50 text-xs mb-3">SKU: {product.sku}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Precio:</span>
                      <span className="text-[#00F9FF] font-bold">€{product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Stock:</span>
                      <span className="text-white">{product.stock_quantity}</span>
                    </div>
                    {product.category_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Categoría:</span>
                        <span className="text-white text-sm">
                          {categories.find(c => c.id === product.category_id)?.name || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(product.id, product.is_active)}
                      className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      {product.is_active ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">No se encontraron productos</p>
          </div>
        )}

        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, productId: deleteConfirm.productId })}
          title="Eliminar Producto"
          description="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={handleDeleteConfirm}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </div>
  )
}
