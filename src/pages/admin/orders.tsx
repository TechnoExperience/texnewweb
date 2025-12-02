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
  Search,
  Eye,
  Package,
  Filter,
  DollarSign,
  Calendar,
  User,
  Truck,
} from "lucide-react"
import type { Order } from "@/types"
import { TABLES } from "@/constants/tables"
import { toast } from "sonner"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            name,
            main_image
          )
        ),
        users:user_id (
          email,
          profiles (
            nombre_artistico,
            name
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data as any)
    } else {
      toast.error("Error al cargar pedidos")
    }
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from(TABLES.ORDERS)
      .update({ status: newStatus })
      .eq("id", orderId)

    if (error) {
      toast.error("Error al actualizar el pedido")
      return
    }

    toast.success("Estado del pedido actualizado")
    loadOrders()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

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
            GESTIÓN DE PEDIDOS
          </h1>
          <p className="text-white/70">Administra los pedidos de la tienda</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/70 text-sm">Total Pedidos</p>
            <p className="text-2xl font-bold text-[#00F9FF]">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Buscar por número, email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const orderItems = (order as any).order_items || []
          const user = (order as any).users

          return (
            <Card key={order.id} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">
                          Pedido #{order.order_number || order.id.slice(0, 8)}
                        </h3>
                        <div className="flex items-center gap-4 text-white/70 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                          </div>
                          {user?.email && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-white/70 text-sm mb-1">Cliente</p>
                        <p className="text-white">{order.customer_name || "N/A"}</p>
                        <p className="text-white/60 text-sm">{order.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Dirección</p>
                        <p className="text-white text-sm">
                          {order.shipping_address?.street || "N/A"}
                          {order.shipping_address?.city && `, ${order.shipping_address.city}`}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <p className="text-white/70 text-sm mb-2">Productos:</p>
                      <div className="space-y-2">
                        {orderItems.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 bg-white/5 p-2 rounded">
                            {item.products?.main_image && (
                              <img
                                src={item.products.main_image}
                                alt={item.products.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-white text-sm">{item.products?.name || "Producto"}</p>
                              <p className="text-white/60 text-xs">
                                Cantidad: {item.quantity} × €{item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white/70 text-sm">Subtotal</p>
                          <p className="text-white font-bold">€{order.subtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-white/70 text-sm">Total</p>
                          <p className="text-[#00F9FF] font-bold text-lg">€{order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col gap-2">
                    <p className="text-white/70 text-sm mb-2">Cambiar Estado:</p>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded text-sm mb-2"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="processing">Procesando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    {order.payment_status === "paid" && (
                      <Badge className="bg-green-500 text-center">Pagado</Badge>
                    )}
                    {order.payment_status === "pending" && (
                      <Badge className="bg-yellow-500 text-center">Pago Pendiente</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">No se encontraron pedidos</p>
        </div>
      )}
    </div>
  )
}

