import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import type { Product, Category } from "@/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TABLES } from "@/constants/tables"
import { toast } from "sonner"
import { X, Plus, Upload, Save, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function AdminProductsEditPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: 0,
    compare_at_price: 0,
    sku: "",
    category_id: "",
    images: [],
    main_image: "",
    stock_quantity: 0,
    track_inventory: true,
    is_active: true,
    is_featured: false,
    weight_kg: 0,
    tags: [],
    metadata: {},
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    loadCategories()

    if (!isEditMode) {
      setLoading(false)
      return
    }

    const loadProduct = async () => {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error loading product:", error)
        toast.error("Error al cargar el producto")
        navigate("/admin/products")
      } else if (data) {
        setProduct({
          ...data,
          images: data.images || [],
          tags: data.tags || [],
          metadata: data.metadata || {},
        })
      }
      setLoading(false)
    }

    loadProduct()
  }, [id, isEditMode, navigate])

  async function loadCategories() {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (!error && data) {
      setCategories(data)
    }
  }

  const handleChange = (field: keyof Product, value: any) => {
    setProduct((prev) => {
      const updated = { ...prev, [field]: value }
      // Auto-generate slug from name
      if (field === "name" && !isEditMode) {
        updated.slug = generateSlug(value)
      }
      return updated
    })
  }

  const handleImageUpload = async (file: File, isMain: boolean = false) => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file)

      if (uploadError) {
        toast.error("Error al subir la imagen")
        return
      }

      const { data } = supabase.storage.from("media").getPublicUrl(filePath)
      const imageUrl = data.publicUrl

      if (isMain) {
        handleChange("main_image", imageUrl)
      } else {
        const currentImages = product.images || []
        handleChange("images", [...currentImages, imageUrl])
      }

      toast.success("Imagen subida correctamente")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Error al subir la imagen")
    }
  }

  const removeImage = (index: number) => {
    const currentImages = product.images || []
    handleChange("images", currentImages.filter((_, i) => i !== index))
  }

  const setMainImage = (imageUrl: string) => {
    handleChange("main_image", imageUrl)
  }

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = product.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        handleChange("tags", [...currentTags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = product.tags || []
    handleChange("tags", currentTags.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product.name || !product.slug || product.price === undefined) {
      toast.error("Nombre, slug y precio son obligatorios")
      return
    }

    setSaving(true)

    const payload: any = {
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      short_description: product.short_description || "",
      price: parseFloat(product.price.toString()),
      compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price.toString()) : null,
      sku: product.sku || null,
      category_id: product.category_id || null,
      images: product.images || [],
      main_image: product.main_image || null,
      stock_quantity: parseInt(product.stock_quantity?.toString() || "0"),
      track_inventory: product.track_inventory ?? true,
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      weight_kg: product.weight_kg ? parseFloat(product.weight_kg.toString()) : null,
      tags: product.tags || [],
      metadata: product.metadata || {},
    }

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from(TABLES.PRODUCTS)
          .update(payload)
          .eq("id", id)

        if (error) {
          console.error("Error saving product:", error)
          toast.error(`Error al guardar el producto: ${error.message}`)
          throw error
        }
      } else {
        const { error } = await supabase.from(TABLES.PRODUCTS).insert(payload)

        if (error) {
          console.error("Error saving product:", error)
          toast.error(`Error al guardar el producto: ${error.message}`)
          throw error
        }
      }

      toast.success(`Producto ${isEditMode ? "actualizado" : "creado"} correctamente`)
      navigate("/admin/products")
    } catch (error: any) {
      console.error("Error saving product:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                <Badge className="bg-black/20 text-black border-black/30">Gestión</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                {isEditMode ? "Editar Producto" : "Nuevo Producto"}
              </h1>
              <p className="text-black/90 text-sm sm:text-base">
                {isEditMode ? "Modifica la información del producto" : "Crea un nuevo producto para la tienda"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Nombre del Producto *</label>
                <Input
                  value={product.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="Ej: Camiseta Techno Experience"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Slug *</label>
                <Input
                  value={product.slug || ""}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="ejemplo-camiseta-techno"
                  required
                />
                <p className="text-xs text-zinc-400 mt-1">URL amigable (se genera automáticamente desde el nombre)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">SKU</label>
                <Input
                  value={product.sku || ""}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="SKU-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Categoría</label>
                <select
                  value={product.category_id || ""}
                  onChange={(e) => handleChange("category_id", e.target.value || null)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Descripción Corta</label>
                <Textarea
                  value={product.short_description || ""}
                  onChange={(e) => handleChange("short_description", e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white min-h-[80px]"
                  placeholder="Breve descripción del producto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Descripción Completa</label>
                <RichTextEditor
                  content={product.description || ""}
                  onChange={(html) => handleChange("description", html)}
                  placeholder="Descripción detallada del producto..."
                  className="min-h-[300px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Precios e Inventario */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Precios e Inventario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Precio *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.price || 0}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Precio Comparado</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.compare_at_price || 0}
                    onChange={(e) => handleChange("compare_at_price", parseFloat(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="Precio original (para mostrar descuento)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={product.stock_quantity || 0}
                    onChange={(e) => handleChange("stock_quantity", parseInt(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Peso (kg)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.weight_kg || 0}
                    onChange={(e) => handleChange("weight_kg", parseFloat(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={product.track_inventory ?? true}
                    onChange={(e) => handleChange("track_inventory", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Controlar inventario</span>
                </label>

                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={product.is_active ?? true}
                    onChange={(e) => handleChange("is_active", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Producto activo</span>
                </label>

                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={product.is_featured ?? false}
                    onChange={(e) => handleChange("is_featured", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Producto destacado</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Imágenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Imagen Principal</label>
                {product.main_image ? (
                  <div className="relative inline-block">
                    <img
                      src={product.main_image}
                      alt="Imagen principal"
                      className="w-32 h-32 object-cover rounded border border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange("main_image", "")}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-zinc-700 rounded cursor-pointer hover:border-[#00F9FF] transition-colors">
                    <Upload className="w-6 h-6 text-zinc-400" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, true)
                      }}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">Imágenes Adicionales</label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {(product.images || []).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border border-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {!product.main_image && (
                        <button
                          type="button"
                          onClick={() => setMainImage(image)}
                          className="absolute bottom-0 left-0 bg-[#00F9FF] text-black text-xs px-2 py-1 rounded"
                        >
                          Principal
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-zinc-700 rounded cursor-pointer hover:border-[#00F9FF] transition-colors">
                  <Plus className="w-6 h-6 text-zinc-400" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, false)
                    }}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="bg-zinc-900 border-zinc-700 text-white"
                  placeholder="Añadir etiqueta..."
                />
                <Button type="button" onClick={addTag} className="bg-[#00F9FF] text-black hover:bg-[#00D9E6]">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.tags || []).map((tag) => (
                  <Badge key={tag} className="bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
              className="border-zinc-600 text-zinc-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-white text-black hover:bg-zinc-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : isEditMode ? "Actualizar Producto" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

