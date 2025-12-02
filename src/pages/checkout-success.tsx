import { useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useCart } from "@/contexts/cart-context"
import { Check, Package, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/animated-background"
import { ROUTES } from "@/constants/routes"

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("order_id")
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear cart on successful payment
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white/5 border border-white/10 p-8 text-center">
          <div className="w-20 h-20 bg-[#00F9FF] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-black" />
          </div>
          
          <h1 className="text-4xl font-heading text-white mb-4" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
            ¡PAGO REALIZADO CON ÉXITO!
          </h1>
          
          <p className="text-white/70 mb-8">
            Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación en breve.
          </p>

          {orderId && (
            <div className="bg-white/5 border border-white/10 p-4 mb-6 rounded">
              <p className="text-white/70 text-sm mb-1">Número de pedido</p>
              <p className="text-[#00F9FF] font-bold text-lg">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
            >
              <Link to={ROUTES.STORE}>
                <Package className="w-4 h-4 mr-2" />
                Seguir Comprando
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Link to={ROUTES.HOME}>
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

