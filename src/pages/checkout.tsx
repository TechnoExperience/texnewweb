import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AnimatedBackground } from "@/components/animated-background"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Package, 
  MapPin, 
  Check,
  ShoppingBag,
  Truck
} from "lucide-react"
import { ROUTES } from "@/constants/routes"
import type { Address, Product } from "@/types"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { TABLES } from "@/constants/tables"

type CheckoutStep = 1 | 2 | 3

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clearCart, isLoading: cartLoading } = useCart()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Form data
  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: "",
    last_name: "",
    company: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "España",
    phone: "",
  })

  const [billingAddress, setBillingAddress] = useState<Address>({
    first_name: "",
    last_name: "",
    company: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "España",
    phone: "",
  })

  const [useSameAddress, setUseSameAddress] = useState(true)
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard")

  // Fetch products for cart items
  const productIds = items.map(item => item.product_id)
  const { data: products, loading: productsLoading } = useSupabaseQuery<Product>(
    TABLES.PRODUCTS,
    (query) => query.in("id", productIds)
  )

  // Calculate totals from cart items (which have price snapshots)
  const subtotal = items.reduce((sum, item) => {
    const price = item.price || 0
    return sum + (price * item.quantity)
  }, 0)

  const shippingCost = shippingMethod === "express" ? 9.99 : 4.99
  const taxRate = 0.21 // 21% IVA
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount + shippingCost

  // Load user data if logged in
  useEffect(() => {
    if (user) {
      // Load user profile for pre-filling
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setShippingAddress(prev => ({
              ...prev,
              first_name: data.name?.split(" ")[0] || "",
              last_name: data.name?.split(" ").slice(1).join(" ") || "",
            }))
          }
        })
    }
  }, [user])

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      toast.error("Tu carrito está vacío")
      navigate(ROUTES.STORE)
    }
  }, [items, cartLoading, navigate])

  const handleShippingChange = (field: keyof Address, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  const handleBillingChange = (field: keyof Address, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = (): boolean => {
    const required = ["first_name", "last_name", "address_line_1", "city", "postal_code", "country"]
    for (const field of required) {
      if (!shippingAddress[field as keyof Address]) {
        toast.error(`Por favor completa el campo ${field}`)
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as CheckoutStep)
    } else {
      navigate(ROUTES.STORE)
    }
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para completar la compra")
      navigate(ROUTES.AUTH.LOGIN)
      return
    }

    setLoading(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from(TABLES.ORDERS)
        .insert({
          user_id: user.id,
          email: user.email || shippingAddress.first_name + "@example.com",
          status: "pending",
          payment_status: "pending",
          subtotal: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingCost,
          discount_amount: 0,
          total: total,
          currency: "EUR",
          shipping_address: shippingAddress,
          billing_address: useSameAddress ? shippingAddress : billingAddress,
          payment_method: "redsys",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => {
        const product = products?.find(p => p.id === item.product_id)
        return {
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          name: product?.name || "Producto",
          sku: product?.sku || null,
          quantity: item.quantity,
          unit_price: product?.price || 0,
          total_price: (product?.price || 0) * item.quantity,
          attributes: item.attributes || {},
        }
      })

      const { error: itemsError } = await supabase
        .from(TABLES.ORDER_ITEMS)
        .insert(orderItems)

      if (itemsError) throw itemsError

      setOrderId(order.id)

      // Check if any products use dropshipping
      const dropshippingProducts = items.filter(item => {
        const product = products?.find(p => p.id === item.product_id)
        return product?.dropshipping_enabled && product?.dropshipping_url
      })

      // If there are dropshipping products, process them first
      if (dropshippingProducts.length > 0) {
        for (const item of dropshippingProducts) {
          const product = products?.find(p => p.id === item.product_id)
          if (product?.dropshipping_enabled && product?.dropshipping_url) {
            try {
              const { data: dropshippingData, error: dropshippingError } = await supabase.functions.invoke("process-dropshipping-order", {
                body: {
                  order_id: order.id,
                  product_id: product.id,
                  quantity: item.quantity,
                  customer_data: {
                    shipping_address: shippingAddress,
                    email: user.email,
                  }
                },
              })

              if (dropshippingError) {
                logger.error("Error procesando dropshipping", dropshippingError as Error)
                // Continuar con el proceso aunque falle el dropshipping
              } else if (dropshippingData?.redirect_url) {
                // Abrir enlace del proveedor en nueva pestaña
                window.open(dropshippingData.redirect_url, '_blank')
                toast.info(`Redirigiendo a ${dropshippingData.supplier_name || 'proveedor'} para completar el pedido`)
              }
            } catch (error) {
              logger.error("Error en dropshipping", error as Error)
              // Continuar con el proceso
            }
          }
        }
      }

      // Call Edge Function to process payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke("process-payment", {
        body: {
          order_id: order.id,
          amount: total,
          currency: "EUR",
        },
      })

      if (paymentError) throw paymentError

      if (!paymentData?.success) {
        throw new Error(paymentData?.error || "Error al procesar el pago")
      }

      // Create form and submit to Redsys
      if (paymentData.redirect_url && paymentData.parameters && paymentData.signature) {
        const form = document.createElement("form")
        form.method = "POST"
        form.action = paymentData.redirect_url
        form.style.display = "none"

        // Add required Redsys fields
        const paramsInput = document.createElement("input")
        paramsInput.type = "hidden"
        paramsInput.name = "Ds_MerchantParameters"
        paramsInput.value = paymentData.parameters
        form.appendChild(paramsInput)

        const signatureInput = document.createElement("input")
        signatureInput.type = "hidden"
        signatureInput.name = "Ds_SignatureVersion"
        signatureInput.value = "HMAC_SHA256_V1"
        form.appendChild(signatureInput)

        const signatureValueInput = document.createElement("input")
        signatureValueInput.type = "hidden"
        signatureValueInput.name = "Ds_Signature"
        signatureValueInput.value = paymentData.signature
        form.appendChild(signatureValueInput)

        document.body.appendChild(form)
        form.submit()
      } else {
        throw new Error("No se recibieron los datos necesarios para el pago")
      }
    } catch (error: any) {
      logger.error("Error processing payment", error as Error)
      toast.error(error.message || "Error al procesar el pago")
      setLoading(false)
    }
  }

  if (cartLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-black relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <div className="relative z-10 w-full px-4 py-12 ">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-white hover:text-[#00F9FF]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-4xl font-heading text-white mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
            CHECKOUT
          </h1>
          <div className="flex gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step
                      ? "bg-[#00F9FF] border-[#00F9FF] text-black"
                      : "border-white/30 text-white/50"
                  }`}
                >
                  {currentStep > step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-bold">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-0.5 ${
                      currentStep > step ? "bg-[#00F9FF]" : "bg-white/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#00F9FF]" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name" className="text-white/70">
                        Nombre *
                      </Label>
                      <Input
                        id="first_name"
                        value={shippingAddress.first_name}
                        onChange={(e) => handleShippingChange("first_name", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name" className="text-white/70">
                        Apellidos *
                      </Label>
                      <Input
                        id="last_name"
                        value={shippingAddress.last_name}
                        onChange={(e) => handleShippingChange("last_name", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address_line_1" className="text-white/70">
                      Dirección *
                    </Label>
                    <Input
                      id="address_line_1"
                      value={shippingAddress.address_line_1}
                      onChange={(e) => handleShippingChange("address_line_1", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_line_2" className="text-white/70">
                      Dirección 2 (opcional)
                    </Label>
                    <Input
                      id="address_line_2"
                      value={shippingAddress.address_line_2}
                      onChange={(e) => handleShippingChange("address_line_2", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-white/70">
                        Ciudad *
                      </Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleShippingChange("city", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code" className="text-white/70">
                        Código Postal *
                      </Label>
                      <Input
                        id="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleShippingChange("postal_code", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-white/70">
                      País *
                    </Label>
                    <Input
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) => handleShippingChange("country", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white/70">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => handleShippingChange("phone", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#00F9FF]" />
                    Resumen del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-white font-bold mb-2">Método de Envío</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded cursor-pointer hover:bg-white/10">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === "standard"}
                          onChange={(e) => setShippingMethod(e.target.value as "standard" | "express")}
                          className="text-[#00F9FF]"
                        />
                        <Truck className="w-5 h-5 text-[#00F9FF]" />
                        <div className="flex-1">
                          <div className="text-white font-bold">Envío Estándar</div>
                          <div className="text-white/70 text-sm">5-7 días laborables</div>
                        </div>
                        <div className="text-[#00F9FF] font-bold">€4.99</div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded cursor-pointer hover:bg-white/10">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === "express"}
                          onChange={(e) => setShippingMethod(e.target.value as "express" | "standard")}
                          className="text-[#00F9FF]"
                        />
                        <Truck className="w-5 h-5 text-[#00F9FF]" />
                        <div className="flex-1">
                          <div className="text-white font-bold">Envío Express</div>
                          <div className="text-white/70 text-sm">2-3 días laborables</div>
                        </div>
                        <div className="text-[#00F9FF] font-bold">€9.99</div>
                      </label>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div>
                    <h3 className="text-white font-bold mb-2">Productos</h3>
                    <div className="space-y-3">
                      {items.map((item) => {
                        const price = item.price || 0
                        return (
                          <div key={`${item.product_id}-${item.variant_id}`} className="flex items-center gap-4 p-3 bg-white/5 rounded">
                            {item.image && (
                              <div className="w-16 h-16 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                                <img src={item.image} alt={item.name || "Producto"} className="w-full h-full object-cover" />
                              </div>
                            )}
                            {!item.image && (
                              <div className="w-16 h-16 bg-white/10 rounded flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="text-white font-bold">{item.name || "Producto"}</div>
                              <div className="text-white/70 text-sm">Cantidad: {item.quantity}</div>
                            </div>
                            <div className="text-[#00F9FF] font-bold">
                              €{(price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#00F9FF]" />
                    Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-white/70 mb-4">
                      Serás redirigido a BBVA para completar el pago de forma segura
                    </p>
                    <Button
                      onClick={handlePayment}
                      disabled={loading}
                      className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black px-8 py-6 text-lg"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner className="mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Proceder al Pago
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#00F9FF]" />
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>IVA (21%)</span>
                    <span>€{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Envío</span>
                    <span>€{shippingCost.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#00F9FF]">€{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={currentStep < 3 ? handleNext : handlePayment}
                  disabled={loading}
                  className="w-full bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                >
                  {currentStep < 3 ? (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    loading ? "Procesando..." : "Pagar Ahora"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

