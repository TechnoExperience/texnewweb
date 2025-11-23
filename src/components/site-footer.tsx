import { Link } from "react-router-dom"

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">TECHNO EXPERIENCE</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Tu fuente definitiva de noticias, eventos, lanzamientos y videos de música techno. Descubre el underground
              y mantente conectado con la comunidad techno global.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navegar</h4>
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
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Comunidad</h4>
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
