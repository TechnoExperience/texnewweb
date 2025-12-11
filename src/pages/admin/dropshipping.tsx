import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { toast } from "sonner"
import { 
  Link as LinkIcon, 
  Download, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ExternalLink,
  DollarSign,
  Tag,
  Image as ImageIcon
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface ScrapedProduct {
  title: string
  price: number
  comparePrice?: number
  description: string
  images: string[]
  variants?: Array<{
    name: string
    price?: number
    attributes: Record<string, string>
    stock?: number
  }>
  sku?: string
  supplierUrl: string
}

export default function AdminDropshippingPage() {
  const [supplierUrl, setSupplierUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [scrapedProduct, setScrapedProduct] = useState<ScrapedProduct | null>(null)
  const [markupPercentage, setMarkupPercentage] = useState(30)
  const [supplierName, setSupplierName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  // Load categories
  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

  const handleScrape = async () => {
    if (!supplierUrl.trim()) {
      toast.error("Por favor, ingresa una URL válida")
      return
    }

    setLoading(true)
    setScrapedProduct(null)

    try {
      const { data, error } = await supabase.functions.invoke("scrape-dropshipping-product", {
        body: { url: supplierUrl }
      })

      if (error) throw error

      if (!data?.success) {
        throw new Error(data?.error || "Error al extraer datos del producto")
      }

      setScrapedProduct(data.product)
      toast.success("Producto extraído correctamente")
    } catch (error: any) {
      logger.error("Error scraping product", error as Error)
      toast.error(error.message || "Error al extraer datos del producto")
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!scrapedProduct || !supplierName.trim()) {
      toast.error("Completa todos los campos requeridos")
      return
    }

    setLoading(true)

    try {
      // Calcular precios
      const basePrice = scrapedProduct.price
      const finalPrice = basePrice * (1 + markupPercentage / 100)

      // Generar SKU
      const sku = `DS-${supplierName.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-6)}`

      // Generar slug
      const slug = scrapedProduct.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Crear producto
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: scrapedProduct.title,
          slug,
          description: scrapedProduct.description,
          short_description: scrapedProduct.description.substring(0, 200),
          price: finalPrice,
          compare_at_price: scrapedProduct.comparePrice || null,
          sku,
          category_id: categoryId || null,
          images: scrapedProduct.images || [],
          main_image: scrapedProduct.images?.[0] || null,
          stock_quantity: 999, // Dropshipping no controla stock
          track_inventory: false,
          is_active: true,
          is_featured: false,
          tags: [],
          metadata: {},
          // Dropshipping fields
          dropshipping_enabled: true,
          dropshipping_url: supplierUrl,
          dropshipping_supplier_name: supplierName,
          dropshipping_base_price: basePrice,
          dropshipping_markup_percentage: markupPercentage,
        })
        .select()
        .single()

      if (productError) throw productError

      // Crear variantes si existen
      if (scrapedProduct.variants && scrapedProduct.variants.length > 0) {
        const variants = scrapedProduct.variants.map(variant => ({
          product_id: product.id,
          name: variant.name,
          price: variant.price || finalPrice,
          stock_quantity: variant.stock || 999,
          attributes: variant.attributes,
          is_active: true,
        }))

        await supabase.from("product_variants").insert(variants)
      }

      toast.success("Producto importado correctamente")
      setScrapedProduct(null)
      setSupplierUrl("")
      
      // Redirigir a edición del producto
      window.location.href = `/admin/products/edit/${product.id}`
    } catch (error: any) {
      logger.error("Error importing product", error as Error)
      toast.error(error.message || "Error al importar el producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black py-8 md:py-12">
        <div className="w-full px-4">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8" />
            <Badge className="bg-black/20 text-black border-black/30">Dropshipping</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            Importar Producto desde Proveedor
          </h1>
          <p className="text-black/90 text-sm sm:text-base">
            Pega el enlace del producto del proveedor y lo importaremos automáticamente
          </p>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* URL Input */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#00F9FF]" />
                Enlace del Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supplier-url" className="text-white mb-2 block">
                  URL del Producto *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="supplier-url"
                    value={supplierUrl}
                    onChange={(e) => setSupplierUrl(e.target.value)}
                    placeholder="https://proveedor.com/producto/123"
                    className="bg-zinc-900 border-zinc-700 text-white flex-1"
                  />
                  <Button
                    onClick={handleScrape}
                    disabled={loading || !supplierUrl.trim()}
                    className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Extraer Datos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scraped Product Preview */}
          {scrapedProduct && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Vista Previa del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Images */}
                {scrapedProduct.images && scrapedProduct.images.length > 0 && (
                  <div>
                    <Label className="text-white mb-2 block">Imágenes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {scrapedProduct.images.slice(0, 8).map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-zinc-800 rounded overflow-hidden">
                          <OptimizedImage
                            src={img}
                            alt={`Imagen ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white mb-2 block">Título</Label>
                    <p className="text-white/90 font-bold text-lg">{scrapedProduct.title}</p>
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Precio Base</Label>
                    <p className="text-[#00F9FF] font-bold text-2xl">€{scrapedProduct.price.toFixed(2)}</p>
                  </div>
                </div>

                {scrapedProduct.description && (
                  <div>
                    <Label className="text-white mb-2 block">Descripción</Label>
                    <p className="text-white/70 text-sm line-clamp-4">{scrapedProduct.description}</p>
                  </div>
                )}

                {/* Variants */}
                {scrapedProduct.variants && scrapedProduct.variants.length > 0 && (
                  <div>
                    <Label className="text-white mb-2 block">Variantes Detectadas</Label>
                    <div className="flex flex-wrap gap-2">
                      {scrapedProduct.variants.map((variant, idx) => (
                        <Badge key={idx} className="bg-zinc-800 text-white border-zinc-700">
                          {variant.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import Configuration */}
                <div className="border-t border-zinc-700 pt-6 space-y-4">
                  <h3 className="text-white font-bold text-lg mb-4">Configuración de Importación</h3>
                  
                  <div>
                    <Label htmlFor="supplier-name" className="text-white mb-2 block">
                      Nombre del Proveedor *
                    </Label>
                    <Input
                      id="supplier-name"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="Ej: Printful, TeeSpring"
                      className="bg-zinc-900 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="markup" className="text-white mb-2 block">
                        Markup (%)
                      </Label>
                      <Input
                        id="markup"
                        type="number"
                        value={markupPercentage}
                        onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-white mb-2 block">
                        Categoría
                      </Label>
                      <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                      >
                        <option value="">Sin categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div className="bg-[#00F9FF]/10 border border-[#00F9FF]/30 p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70">Precio Base:</span>
                      <span className="text-white font-bold">€{scrapedProduct.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70">Markup ({markupPercentage}%):</span>
                      <span className="text-white font-bold">
                        €{(scrapedProduct.price * (markupPercentage / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#00F9FF]/30">
                      <span className="text-[#00F9FF] font-bold text-lg">Precio Final:</span>
                      <span className="text-[#00F9FF] font-bold text-2xl">
                        €{(scrapedProduct.price * (1 + markupPercentage / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={loading || !supplierName.trim()}
                    className="w-full bg-[#00F9FF] hover:bg-[#00D9E6] text-black py-6 text-lg font-bold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Package className="w-5 h-5 mr-2" />
                        Importar Producto
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#00F9FF]" />
                Instrucciones
              </h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>• Pega el enlace completo del producto del proveedor</li>
                <li>• El sistema extraerá automáticamente: título, precio, imágenes, descripción y variantes</li>
                <li>• Configura el markup (porcentaje de ganancia) sobre el precio base</li>
                <li>• El SKU se generará automáticamente</li>
                <li>• Después de importar, podrás editar el producto normalmente</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

