import { useSearchParams, Link } from "react-router-dom"
import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/animated-background"
import { ROUTES } from "@/constants/routes"

export default function CheckoutErrorPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("order_id")

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white/5 border border-white/10 p-8 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-heading text-white mb-4" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
            ERROR EN EL PAGO
          </h1>
          
          <p className="text-white/70 mb-8">
            No se pudo procesar tu pago. Por favor, intenta de nuevo o contacta con soporte si el problema persiste.
          </p>

          {orderId && (
            <div className="bg-white/5 border border-white/10 p-4 mb-6 rounded">
              <p className="text-white/70 text-sm mb-1">Número de pedido</p>
              <p className="text-white font-bold text-lg">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
            >
              <Link to={ROUTES.CHECKOUT}>
                Intentar de Nuevo
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Link to={ROUTES.STORE}>
                Volver a la Tienda
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

