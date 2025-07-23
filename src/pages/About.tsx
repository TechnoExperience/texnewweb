import React from 'react';
import { Users, Target, Zap, Globe } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="mb-section">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-neon-yellow brutal-border border-neon-yellow flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-bebas text-4xl md:text-6xl tracking-wider text-white">
              NOSOTROS
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-bebas text-3xl tracking-wider text-neon-mint mb-6">
                MANIFIESTO TECHNO
              </h2>
              <div className="space-y-4 text-gray-light font-space leading-relaxed">
                <p>
                  TECHNO EXPERIENCE nace del underground digital como respuesta a la necesidad 
                  de conectar la comunidad techno global a través de experiencias inmersivas 
                  y contenido de calidad superior.
                </p>
                <p>
                  Creemos en el poder transformador de la música electrónica para trascender 
                  fronteras, romper esquemas y crear conexiones auténticas entre personas 
                  que comparten la pasión por los beats que definen nuestra época.
                </p>
                <p>
                  Nuestra misión es ser el puente entre artistas emergentes y consolidados, 
                  entre eventos underground y festivales masivos, entre la cultura local 
                  y el movimiento global techno.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="/images/electronic-stage.jpg"
                alt="Techno Culture"
                className="w-full h-96 object-cover brutal-border border-2 border-gray-dark"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-bebas text-4xl text-white mb-2">2025</div>
                  <div className="font-space text-sm text-neon-mint">AÑOS DE EXPERIENCIA</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="mb-section">
          <h2 className="font-bebas text-3xl tracking-wider text-white mb-component text-center">
            NUESTROS VALORES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-dark bg-opacity-30 p-8 brutal-border border-gray-dark text-center">
              <div className="w-12 h-12 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-bebas text-xl tracking-wider text-neon-mint mb-3">
                AUTENTICIDAD
              </h3>
              <p className="text-gray-light font-space text-sm leading-relaxed">
                Promovemos el contenido genuino y las experiencias reales que reflejan 
                la esencia del underground techno sin comprometer su integridad.
              </p>
            </div>

            <div className="bg-gray-dark bg-opacity-30 p-8 brutal-border border-gray-dark text-center">
              <div className="w-12 h-12 bg-neon-pink brutal-border border-neon-pink flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bebas text-xl tracking-wider text-neon-pink mb-3">
                CONEXIÓN GLOBAL
              </h3>
              <p className="text-gray-light font-space text-sm leading-relaxed">
                Creamos puentes entre escenas locales y el movimiento techno mundial, 
                facilitando el intercambio cultural y artístico.
              </p>
            </div>

            <div className="bg-gray-dark bg-opacity-30 p-8 brutal-border border-gray-dark text-center">
              <div className="w-12 h-12 bg-neon-yellow brutal-border border-neon-yellow flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-bebas text-xl tracking-wider text-neon-yellow mb-3">
                INNOVACIÓN
              </h3>
              <p className="text-gray-light font-space text-sm leading-relaxed">
                Exploramos constantemente nuevas formas de presentar y experimentar 
                la cultura techno a través de tecnología y narrativas innovadoras.
              </p>
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="mb-section">
          <h2 className="font-bebas text-3xl tracking-wider text-white mb-component text-center">
            NUESTRO EQUIPO
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Ana Martínez',
                role: 'Directora Editorial',
                description: 'Periodista especializada en cultura underground con 10+ años cubriendo la escena techno europea.',
                image: '/images/dj-setup-techno.jpg'
              },
              {
                name: 'Carlos Rodríguez',
                role: 'Curador de Eventos',
                description: 'Ex-promotor y DJ con profundo conocimiento de la escena clubbing ibérica.',
                image: '/images/vinyl-turntable.jpg'
              },
              {
                name: 'Laura Fernández',
                role: 'Directora Creativa',
                description: 'Diseñadora visual y experta en experiencias digitales inmersivas.',
                image: '/images/techno-party-neon.jpg'
              },
              {
                name: 'Diego Sánchez',
                role: 'Community Manager',
                description: 'Especialista en redes sociales y construcción de comunidades digitales.',
                image: '/images/electronic-stage.jpg'
              }
            ].map((member, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover brutal-border border-2 border-gray-dark group-hover:border-neon-mint transition-colors"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <div className="font-bebas text-lg text-white">{member.name}</div>
                      <div className="font-space text-sm text-neon-mint">{member.role}</div>
                    </div>
                  </div>
                </div>
                <h4 className="font-bebas text-lg tracking-wider text-white mb-1">
                  {member.name}
                </h4>
                <p className="font-space text-sm text-neon-mint mb-2">
                  {member.role}
                </p>
                <p className="font-space text-xs text-gray-light leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Estadísticas */}
        <section className="py-component bg-gray-dark bg-opacity-30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-bebas text-4xl text-neon-mint mb-2">500+</div>
              <div className="font-space text-sm text-gray-light">Artículos Publicados</div>
            </div>
            <div>
              <div className="font-bebas text-4xl text-neon-yellow mb-2">50+</div>
              <div className="font-space text-sm text-gray-light">Eventos Cubiertos</div>
            </div>
            <div>
              <div className="font-bebas text-4xl text-neon-pink mb-2">25K+</div>
              <div className="font-space text-sm text-gray-light">Lectores Mensuales</div>
            </div>
            <div>
              <div className="font-bebas text-4xl text-white mb-2">100+</div>
              <div className="font-space text-sm text-gray-light">Artistas Colaboradores</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
