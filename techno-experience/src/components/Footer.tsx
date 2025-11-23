import { Music, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-techno-cyan-dark border-t-2 border-techno-neon-green mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Music className="w-8 h-8 text-techno-neon-green" />
              <div>
                <h3 className="text-lg font-bold text-white">Techno Experience</h3>
                <p className="text-xs text-techno-azure">Magazine</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              La plataforma líder de cultura techno. Eventos, noticias, lanzamientos y más.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/noticias" className="hover:text-techno-neon-green transition">Noticias</Link></li>
              <li><Link to="/eventos" className="hover:text-techno-neon-green transition">Eventos</Link></li>
              <li><Link to="/lanzamientos" className="hover:text-techno-neon-green transition">Lanzamientos</Link></li>
              <li><Link to="/videos" className="hover:text-techno-neon-green transition">Videos</Link></li>
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <h4 className="text-white font-semibold mb-4">Comunidad</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/registro" className="hover:text-techno-neon-green transition">Registrarse</Link></li>
              <li><Link to="/perfil" className="hover:text-techno-neon-green transition">Mi Perfil</Link></li>
              <li><a href="#" className="hover:text-techno-neon-green transition">Términos</a></li>
              <li><a href="#" className="hover:text-techno-neon-green transition">Privacidad</a></li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="text-white font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-techno-neon-green transition">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-techno-azure transition">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-techno-magenta transition">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>2025 Techno Experience Magazine. Todos los derechos reservados.</p>
          <p className="mt-2">Plataforma desarrollada por MiniMax Agent</p>
        </div>
      </div>
    </footer>
  );
}
