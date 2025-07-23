import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin } from 'lucide-react';
import { navigationItems } from '../../data/mockData';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t-2 border-gray-dark mt-section">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Branding & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center">
                <span className="font-jetbrains font-bold text-black">TE</span>
              </div>
              <div>
                <h3 className="font-bebas text-xl tracking-wider text-white">
                  TECHNO EXPERIENCE
                </h3>
              </div>
            </div>
            <p className="text-gray-light font-space text-sm leading-relaxed">
              Portal cultural inmersivo dedicado a la escena techno global. 
              Conectamos artistas, eventos y la comunidad underground a través 
              de experiencias digitales únicas.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 border border-gray-dark hover:border-neon-mint hover:text-neon-mint transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 border border-gray-dark hover:border-neon-pink hover:text-neon-pink transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 border border-gray-dark hover:border-neon-yellow hover:text-neon-yellow transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bebas text-lg tracking-wider text-white mb-4 border-b border-gray-dark pb-2">
              NAVEGACIÓN
            </h4>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className="text-gray-light hover:text-white font-space text-sm transition-colors duration-200 flex items-center group"
                  >
                    <span 
                      className="w-2 h-2 mr-3 transition-colors"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Content */}
          <div>
            <h4 className="font-bebas text-lg tracking-wider text-white mb-4 border-b border-gray-dark pb-2">
              CONTENIDO POPULAR
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/articulos/veta-festival-2025" 
                  className="text-gray-light hover:text-neon-mint font-space text-sm transition-colors duration-200 block"
                >
                  VETA Festival 2025: Mine Sound Extraction
                </Link>
              </li>
              <li>
                <Link 
                  to="/eventos/dance-control" 
                  className="text-gray-light hover:text-neon-mint font-space text-sm transition-colors duration-200 block"
                >
                  DANCE CONTROL en Pacha Ibiza
                </Link>
              </li>
              <li>
                <Link 
                  to="/articulos/karretero-work-it" 
                  className="text-gray-light hover:text-neon-mint font-space text-sm transition-colors duration-200 block"
                >
                  Karretero lanza "Work It" EP
                </Link>
              </li>
              <li>
                <Link 
                  to="/artistas/mosha" 
                  className="text-gray-light hover:text-neon-mint font-space text-sm transition-colors duration-200 block"
                >
                  Descubre la esencia de Mosha
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h4 className="font-bebas text-lg tracking-wider text-white mb-4 border-b border-gray-dark pb-2">
              MANTENTE CONECTADO
            </h4>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <p className="text-gray-light font-space text-sm mb-3">
                Suscríbete para recibir las últimas noticias y eventos.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 bg-black border-2 border-gray-dark text-white px-3 py-2 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                />
                <button className="px-4 py-2 bg-neon-mint border-2 border-neon-mint text-black font-bebas text-sm tracking-wider hover:bg-transparent hover:text-neon-mint transition-colors brutal-border">
                  OK
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-light font-space text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@technoexperience.net</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-light font-space text-sm">
                <MapPin className="w-4 h-4" />
                <span>Barcelona, España</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-dark">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-light font-space text-xs">
              © {currentYear} TECHNO EXPERIENCE. Diseñado para la comunidad underground.
            </p>
            <div className="flex space-x-6">
              <Link 
                to="/privacidad" 
                className="text-gray-light hover:text-white font-space text-xs transition-colors"
              >
                Privacidad
              </Link>
              <Link 
                to="/terminos" 
                className="text-gray-light hover:text-white font-space text-xs transition-colors"
              >
                Términos
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-light hover:text-white font-space text-xs transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-neon-mint via-neon-yellow to-neon-pink"></div>
    </footer>
  );
};

export default Footer;
