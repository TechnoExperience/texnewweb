import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  Filter,
  DollarSign,
} from "lucide-react"
import type { Product, Category } from "@/types"
import { TABLES } from "@/constants/tables"
import { toast } from "sonner"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")

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
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return

    const { error } = await supabase.from(TABLES.PRODUCTS).delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar el producto")
      return
    }

    setProducts(products.filter(p => p.id !== id))
    toast.success("Producto eliminado")
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-8 ">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading text-white mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
            GESTIÓN DE PRODUCTOS
          </h1>
          <p className="text-white/70">Administra los productos de la tienda</p>
        </div>
        <Button asChild className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black">
          <Link to="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
                  {product.sku && (
                    <p className="text-white/50 text-sm">SKU: {product.sku}</p>
                  )}
                </div>
                <Badge className={product.is_active ? "bg-green-500" : "bg-red-500"}>
                  {product.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              {product.main_image && (
                <div className="w-full h-48 bg-white/10 rounded mb-4 overflow-hidden">
                  <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Precio:</span>
                  <span className="text-[#00F9FF] font-bold">€{product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Stock:</span>
                  <span className="text-white">{product.stock_quantity}</span>
                </div>
                {product.category_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Categoría:</span>
                    <span className="text-white">
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
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  {product.is_active ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
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
    </div>
  )
}

