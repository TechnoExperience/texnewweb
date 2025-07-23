import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Calendar, MapPin } from 'lucide-react';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  const heroSlides = [
    {
      id: 1,
      title: 'TECHNO EXPERIENCE',
      subtitle: 'Portal Cultural Inmersivo',
      description: 'Conectando la escena underground global',
      image: '/images/hero-techno-festival.jpg',
      cta: 'EXPLORAR EVENTOS',
      ctaLink: '/eventos'
    },
    {
      id: 2,
      title: 'DANCE CONTROL',
      subtitle: 'Pacha Ibiza · 15 Julio',
      description: 'La experiencia techno definitiva',
      image: '/images/techno-party-neon.jpg',
      cta: 'VER EVENTO',
      ctaLink: '/eventos/1'
    },
    {
      id: 3,
      title: 'UNDERGROUND CULTURE',
      subtitle: 'Archivo Digital Techno',
      description: 'Sets, flyers, historia y cultura',
      image: '/images/electronic-stage.jpg',
      cta: 'EXPLORAR ARCHIVO',
      ctaLink: '/archivo'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    }, 4000);

    return () => clearInterval(glitchInterval);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentHero.image}
          alt={currentHero.title}
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="border-r border-neon-mint animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            
            {/* Main Title with Glitch Effect */}
            <h1 
              className={`
                font-bebas text-5xl md:text-7xl lg:text-8xl tracking-wider text-white mb-4
                ${isGlitching ? 'text-glitch' : ''}
              `}
              data-text={currentHero.title}
            >
              {currentHero.title}
            </h1>

            {/* Subtitle */}
            <h2 className="font-jetbrains text-xl md:text-2xl text-neon-mint mb-6 tracking-wide">
              {currentHero.subtitle}
            </h2>

            {/* Description */}
            <p className="text-gray-light font-space text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
              {currentHero.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to={currentHero.ctaLink}
                className="group px-8 py-4 bg-neon-mint text-black font-bebas text-lg tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border flex items-center justify-center"
              >
                <span>{currentHero.cta}</span>
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                to="/articulos"
                className="group px-8 py-4 bg-transparent text-white font-bebas text-lg tracking-wider hover:bg-white hover:text-black border-2 border-white transition-all duration-300 brutal-border flex items-center justify-center"
              >
                <Play className="mr-2 w-5 h-5" />
                <span>EXPLORAR CONTENIDO</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-black bg-opacity-80 p-4 border-2 border-gray-dark brutal-border">
                <div className="flex items-center space-x-2 text-neon-yellow mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bebas text-sm tracking-wider">PRÓXIMOS EVENTOS</span>
                </div>
                <div className="font-jetbrains text-2xl text-white">25+</div>
                <div className="font-space text-xs text-gray-light">En toda España</div>
              </div>

              <div className="bg-black bg-opacity-80 p-4 border-2 border-gray-dark brutal-border">
                <div className="flex items-center space-x-2 text-neon-pink mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-bebas text-sm tracking-wider">CIUDADES</span>
                </div>
                <div className="font-jetbrains text-2xl text-white">12</div>
                <div className="font-space text-xs text-gray-light">Experiencias únicas</div>
              </div>

              <div className="bg-black bg-opacity-80 p-4 border-2 border-gray-dark brutal-border">
                <div className="flex items-center space-x-2 text-neon-mint mb-2">
                  <Play className="w-5 h-5" />
                  <span className="font-bebas text-sm tracking-wider">CONTENIDO</span>
                </div>
                <div className="font-jetbrains text-2xl text-white">500+</div>
                <div className="font-space text-xs text-gray-light">Artículos y sets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 border-2 transition-all duration-300 brutal-border ${
              index === currentSlide 
                ? 'bg-neon-mint border-neon-mint' 
                : 'bg-transparent border-gray-light hover:border-white'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="flex flex-col items-center space-y-2 text-white">
          <span className="font-space text-xs tracking-wider rotate-90 origin-center">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
