import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Filter,
} from "lucide-react"
import type { Category } from "@/types"
import { TABLES } from "@/constants/tables"
import { toast } from "sonner"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: null as string | null,
    is_active: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select("*")
      .order("name", { ascending: true })

    if (!error && data) {
      setCategories(data)
    } else {
      toast.error("Error al cargar categorías")
    }
    setLoading(false)
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    const slug = formData.slug || generateSlug(formData.name)

    if (editingId) {
      // Update
      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .update({
          name: formData.name,
          slug,
          description: formData.description || null,
          parent_id: formData.parent_id || null,
          is_active: formData.is_active,
        })
        .eq("id", editingId)

      if (error) {
        toast.error("Error al actualizar la categoría")
        return
      }

      toast.success("Categoría actualizada")
      setEditingId(null)
    } else {
      // Create
      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert({
          name: formData.name,
          slug,
          description: formData.description || null,
          parent_id: formData.parent_id || null,
          is_active: formData.is_active,
        })

      if (error) {
        toast.error("Error al crear la categoría")
        return
      }

      toast.success("Categoría creada")
      setIsCreating(false)
    }

    resetForm()
    loadCategories()
  }

  function resetForm() {
    setFormData({
      name: "",
      slug: "",
      description: "",
      parent_id: null,
      is_active: true,
    })
    setEditingId(null)
    setIsCreating(false)
  }

  function startEdit(category: Category) {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parent_id: category.parent_id || null,
      is_active: category.is_active,
    })
    setEditingId(category.id)
    setIsCreating(true)
  }

  async function deleteCategory(id: string) {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return

    const { error } = await supabase.from(TABLES.CATEGORIES).delete().eq("id", id)

    if (error) {
      toast.error("Error al eliminar la categoría")
      return
    }

    toast.success("Categoría eliminada")
    loadCategories()
  }

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const parentCategories = categories.filter(c => !c.parent_id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F9FF]"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading text-white mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
            GESTIÓN DE CATEGORÍAS
          </h1>
          <p className="text-white/70">Administra las categorías de productos</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? "Editar Categoría" : "Nueva Categoría"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Nombre *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (!editingId) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Categoría Padre</label>
                  <select
                    value={formData.parent_id || ""}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded"
                  >
                    <option value="">Ninguna (Categoría principal)</option>
                    {parentCategories
                      .filter(c => !editingId || c.id !== editingId)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-white/70">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Activa
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black">
                  {editingId ? "Actualizar" : "Crear"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="border-white/20 text-white">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const parent = category.parent_id
            ? categories.find(c => c.id === category.parent_id)
            : null

          return (
            <Card key={category.id} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">{category.name}</h3>
                    <p className="text-white/50 text-sm mb-1">/{category.slug}</p>
                    {parent && (
                      <Badge className="bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50 text-xs">
                        Subcategoría de: {parent.name}
                      </Badge>
                    )}
                  </div>
                  <Badge className={category.is_active ? "bg-green-500" : "bg-red-500"}>
                    {category.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                {category.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(category)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">No se encontraron categorías</p>
        </div>
      )}
    </div>
  )
}

