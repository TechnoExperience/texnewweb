import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useProductLikes } from "@/hooks/useProductLikes"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedBackground } from "@/components/animated-background"
import { DJProfileCardEditor } from "@/components/dj-profile-card-editor"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import {
  User,
  Package,
  Heart,
  Edit,
  MapPin,
  Mail,
  Calendar,
  ShoppingBag,
  CreditCard,
  Settings,
  Lock,
} from "lucide-react"
import { ChangePasswordForm } from "@/components/change-password-form"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Order, Product, UserProfile } from "@/types"
import { TABLES } from "@/constants/tables"
import { ROUTES } from "@/constants/routes"
import { useNavigate } from "react-router-dom"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { likes, loading: likesLoading } = useProductLikes()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: "",
    city: "",
    country: "",
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate(ROUTES.AUTH.LOGIN)
        return
      }
      loadProfile()
      loadOrders()
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (likes.length > 0) {
      loadFavoriteProducts()
    }
  }, [likes])

  async function loadProfile() {
    if (!user) return

    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error loading profile:", error)
      return
    }

    if (data) {
      setProfile(data)
      setEditForm({
        bio: data.bio || "",
        city: data.city || "",
        country: data.country || "",
      })
    }
    setLoading(false)
  }

  async function loadOrders() {
    if (!user) return

    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error loading orders:", error)
      return
    }

    setOrders(data || [])
  }

  async function loadFavoriteProducts() {
    const productIds = likes.map(like => like.product_id)
    if (productIds.length === 0) return

    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select("*")
      .in("id", productIds)
      .eq("is_active", true)

    if (error) {
      console.error("Error loading favorite products:", error)
      return
    }

    setFavoriteProducts(data || [])
  }

  async function saveProfile() {
    if (!user) return

    // Construir payload solo con campos que SEGURO existen en el schema
    // NO incluir 'name' porque puede no existir en algunas instalaciones
    const updatePayload: any = {
      bio: editForm.bio,
      updated_at: new Date().toISOString(),
    }

    // Solo agregar city y country si tienen valor
    if (editForm.city !== undefined && editForm.city !== null && editForm.city !== "") {
      updatePayload.city = editForm.city
    }
    if (editForm.country !== undefined && editForm.country !== null && editForm.country !== "") {
      updatePayload.country = editForm.country
    }

    const { error } = await supabase
      .from(TABLES.PROFILES)
      .update(updatePayload)
      .eq("id", user.id)

    if (error) {
      console.error("Error saving profile:", error)
      
      // Si el error es por city/country que no existen, intentar solo con bio
      if (error.message?.includes("city") || error.message?.includes("country")) {
        const { city, country, ...payloadMinimal } = updatePayload
        const { error: retryError } = await supabase
          .from(TABLES.PROFILES)
          .update(payloadMinimal)
          .eq("id", user.id)
        
        if (retryError) {
          toast.error("Error al guardar el perfil: " + retryError.message)
          return
        }
      } else {
        toast.error("Error al guardar el perfil: " + error.message)
        return
      }
    }

    await loadProfile()
    setEditing(false)
    toast.success("Perfil actualizado")
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      paid: "bg-green-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-600",
      cancelled: "bg-red-500",
      refunded: "bg-gray-500",
    }
    return colors[status] || "bg-gray-500"
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAdmin = profile?.role === "admin"

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <div className="relative z-10 w-full px-4 py-12 ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-heading text-white mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                MI PERFIL
              </h1>
              <p className="text-white/70">Gestiona tu cuenta y pedidos</p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  asChild
                  className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                >
                  <Link to="/admin/dashboard">
                    <Settings className="w-4 h-4 mr-2" />
                    CMS
                  </Link>
                </Button>
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="border-[#00F9FF]/50 text-[#00F9FF] hover:bg-[#00F9FF]/10"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
              <Lock className="w-4 h-4 mr-2" />
              Seguridad
            </TabsTrigger>
            {!isAdmin && (
              <>
                <TabsTrigger value="orders" className="text-white data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Pedidos
                </TabsTrigger>
                <TabsTrigger value="favorites" className="text-white data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
                  <Heart className="w-4 h-4 mr-2" />
                  Favoritos
                </TabsTrigger>
                {profile?.profile_type === "dj" && (
                  <TabsTrigger value="card" className="text-white data-[state=active]:bg-[#00F9FF] data-[state=active]:text-black">
                    <Edit className="w-4 h-4 mr-2" />
                    Personalizar Tarjeta
                  </TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Información Personal</CardTitle>
                  <Button
                    onClick={() => editing ? saveProfile() : setEditing(true)}
                    className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editing ? "Guardar" : "Editar"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Email</label>
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>


                <div>
                  <label className="text-white/70 text-sm mb-1 block">Biografía</label>
                  {editing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded min-h-[100px]"
                    />
                  ) : (
                    <p className="text-white">{profile?.bio || "No hay biografía"}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Ciudad</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded"
                      />
                    ) : (
                      <p className="text-white">{profile?.city || "No especificado"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">País</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded"
                      />
                    ) : (
                      <p className="text-white">{profile?.country || "No especificado"}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <ChangePasswordForm />
            </div>
          </TabsContent>

          {/* Orders Tab - Only for non-admin users */}
          {!isAdmin && (
            <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="py-12 text-center">
                    <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">No tienes pedidos aún</p>
                    <Button
                      asChild
                      className="mt-4 bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                    >
                      <Link to={ROUTES.STORE}>Ir a la Tienda</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">
                            Pedido #{order.order_number}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {format(new Date(order.created_at), "d MMMM yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-white/70 text-sm">Total</p>
                          <p className="text-[#00F9FF] font-bold text-lg">€{order.total.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Estado de Pago</p>
                          <Badge className={order.payment_status === "paid" ? "bg-green-500" : "bg-yellow-500"}>
                            {order.payment_status === "paid" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>

                      {order.shipping_address && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-white/70 text-sm mb-1">Dirección de envío</p>
                          <p className="text-white text-sm">
                            {order.shipping_address.address_line_1}, {order.shipping_address.city}, {order.shipping_address.postal_code}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          )}

          {/* Favorites Tab - Only for non-admin users */}
          {!isAdmin && (
            <TabsContent value="favorites">
            {likesLoading ? (
              <LoadingSpinner />
            ) : favoriteProducts.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <Heart className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 mb-4">No tienes productos favoritos</p>
                  <Button
                    asChild
                    className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                  >
                    <Link to={ROUTES.STORE}>Explorar Productos</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProducts.map((product) => (
                  <Card key={product.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-0">
                      <Link to={`${ROUTES.STORE}/${product.id}`}>
                        {product.main_image && (
                          <div className="w-full h-48 bg-white/10 overflow-hidden">
                            <img
                              src={product.main_image}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-white font-bold mb-2">{product.name}</h3>
                          <p className="text-[#00F9FF] font-bold text-lg">€{product.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          )}

          {/* Card Customization Tab - Only for DJs and non-admin */}
          {!isAdmin && profile?.profile_type === "dj" && (
            <TabsContent value="card">
              <DJProfileCardEditor
                profileId={user?.id || ""}
                onSave={() => loadProfile()}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

