import { Link } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Check } from "lucide-react"

export function SiteFooter() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return

    setIsLoading(true)
    // Simular suscripción (aquí puedes integrar con tu servicio de email)
    setTimeout(() => {
      setSubscribed(true)
      setIsLoading(false)
      setEmail("")
      setTimeout(() => setSubscribed(false), 5000)
    }, 1000)
  }

  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black mt-auto">
      {/* Newsletter Subscription Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-black via-zinc-900 to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="w-8 h-8 text-[#00F9FF]" />
              <h3 
                className="text-3xl md:text-4xl font-heading text-white"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                SUSCRÍBETE A NUESTRO NEWSLETTER
              </h3>
            </div>
            <p className="text-white/70 mb-6 font-space text-sm md:text-base">
              Recibe las últimas noticias, eventos exclusivos y lanzamientos directamente en tu bandeja de entrada
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#00F9FF] focus:ring-[#00F9FF]"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black font-semibold px-8 whitespace-nowrap"
                >
                  {isLoading ? "Enviando..." : "Suscribirse"}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-[#00F9FF]">
                <Check className="w-5 h-5" />
                <p className="font-space">¡Gracias por suscribirte! Te hemos enviado un email de confirmación.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
              TECHNO EXPERIENCE
            </h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Tu fuente definitiva de noticias, eventos, lanzamientos y videos de música techno. Descubre el underground
              y mantente conectado con la comunidad techno global.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Navegar</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Noticias
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/releases" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Lanzamientos
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/store" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Store
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Comunidad</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Enviar Contenido
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <p className="text-sm text-zinc-500 text-center">
            © {new Date().getFullYear()} Techno Experience. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
