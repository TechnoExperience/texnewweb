import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { TABLES } from "@/constants/tables"
import type { NewsArticle } from "@/types"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, LogOut } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { LanguageSwitcher } from "./language-switcher"
import { FloatingLogosBackground } from "./floating-logos-background"
import { Logo } from "./logo"

interface HeroHeaderProps {
  onMenuToggle?: () => void
}

export function HeroHeader({ onMenuToggle }: HeroHeaderProps) {
  const { user, signOut } = useAuth()
  
  // Fetch las últimas noticias (más actuales) - 16 cards needed (4 columns x 4 cards)
  const { data: latestArticles, loading: loadingLatest } = useSupabaseQuery<NewsArticle>(
    TABLES.NEWS,
    (query) => query.order("published_date", { ascending: false }).limit(16)
  )

  const isLoading = loadingLatest

  // Usar las últimas noticias (más actuales)
  const newsArticles = latestArticles && latestArticles.length > 0 ? latestArticles : []
  
  // Dividir en 4 columnas de 4 tarjetas cada una
  const column1 = newsArticles.slice(0, 4)
  const column2 = newsArticles.slice(4, 8)
  const column3 = newsArticles.slice(8, 12)
  const column4 = newsArticles.slice(12, 16)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [showInitialLogo, setShowInitialLogo] = useState(true) // Mostrar logo inicial primero
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Ocultar logo inicial después de 3 segundos y mostrar logos flotantes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLogo(false)
    }, 3000) // 3 segundos mostrando el logo inicial

    return () => clearTimeout(timer)
  }, [])

  // Auto-rotate every few seconds (solo cuando no hay hover y hay artículos)
  // Rota las 16 cards (4 columnas x 4 cards)
  useEffect(() => {
    const totalCards = Math.min(newsArticles.length, 16)
    if (totalCards > 0 && !isHovering && !showInitialLogo) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % totalCards)
      }, 4000) // más rápido para que la cabecera se sienta más viva

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [newsArticles.length, isHovering, showInitialLogo])

  // Get active article from all news articles
  const activeArticle = newsArticles.length > 0 
    ? (newsArticles[activeIndex] || newsArticles[0])
    : null

  const handleCardHover = (index: number) => {
    setIsHovering(true)
    setActiveIndex(index)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }


  const handleCardLeave = () => {
    setIsHovering(false)
  }

  // Mostrar loading solo si realmente está cargando (máximo 3 segundos)
  const [showLoading, setShowLoading] = useState(true)
  useEffect(() => {
    if (!isLoading) {
      // Esperar un poco antes de ocultar el loading para evitar parpadeos
      const timer = setTimeout(() => setShowLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (isLoading && showLoading) {
    return (
      <header className="relative w-full h-screen overflow-hidden bg-black">
        {/* Fondo de LOGOS incluso durante la carga */}
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          <FloatingLogosBackground logoText="TECHNO EXPERIENCE" count={100} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" style={{ zIndex: 10 }} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
          <div className="text-white/50 text-lg font-space">Cargando contenido...</div>
        </div>
      </header>
    )
  }

  // Si no hay artículos pero ya terminó de cargar, mostrar el header con logos pero sin contenido de noticias
  if (!activeArticle || newsArticles.length === 0) {
  return (
      <header className="relative w-full h-screen overflow-hidden bg-black">
        {/* Fondo de LOGOS: lluvia de logos que llena la cabecera */}
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          <FloatingLogosBackground logoText="TECHNO EXPERIENCE" count={100} />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" style={{ zIndex: 10 }} />

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6" style={{ zIndex: 30 }}>
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {user ? (
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] hidden sm:flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    Cerrar Sesión
                  </span>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] hidden sm:flex items-center gap-2"
                  >
                    <Link to={ROUTES.AUTH.LOGIN}>
                      <LogIn className="w-4 h-4" />
                      <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                        Iniciar Sesión
                      </span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#00F9FF] hover:bg-[#00D9E6] text-white hidden sm:flex items-center gap-2"
                  >
                    <Link to={ROUTES.AUTH.SIGNUP}>
                      <UserPlus className="w-4 h-4" />
                      <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                        Crear Cuenta
                      </span>
                    </Link>
                  </Button>
                </>
              )}
              <button
                onClick={onMenuToggle}
                className="text-white hover:text-[#00F9FF] transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Sin noticias */}
        <div className="relative h-full flex items-center justify-center" style={{ zIndex: 20 }}>
          <div className="text-center px-8">
            <div className="flex flex-col items-center justify-center mb-6">
              <Logo size="lg" className="justify-center" />
            </div>
            <p className="text-white/80 text-lg md:text-xl lg:text-2xl font-space">
              Tu fuente definitiva de música techno underground
            </p>
          </div>
        </div>
      </header>
    )
  }
      
  return (
    <header className="relative w-full h-screen overflow-hidden bg-black">
      {/* Fondo de LOGOS: lluvia de logos que llena la cabecera - Empiezan a caer desde el principio */}
      <div className="absolute inset-0" style={{ zIndex: 5, opacity: showInitialLogo ? 0.3 : 1, transition: 'opacity 1s ease-in-out' }}>
        <FloatingLogosBackground logoText="TECHNO EXPERIENCE" count={100} />
      </div>

      {/* Dark Overlay - un poco más ligera para que se aprecien los logos */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" style={{ zIndex: 10 }} />

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0" style={{ zIndex: 30, paddingLeft: '10%', paddingRight: '10%', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Auth Buttons */}
            {user ? (
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] hidden sm:flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  Cerrar Sesión
                </span>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] hidden sm:flex items-center gap-2"
                >
                  <Link to={ROUTES.AUTH.LOGIN}>
                    <LogIn className="w-4 h-4" />
                    <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Iniciar Sesión
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#00F9FF] hover:bg-[#00D9E6] text-white hidden sm:flex items-center gap-2"
                >
                  <Link to={ROUTES.AUTH.SIGNUP}>
                    <UserPlus className="w-4 h-4" />
                    <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Crear Cuenta
                    </span>
                  </Link>
                </Button>
              </>
            )}
            {/* Menu button */}
            <button
              onClick={onMenuToggle}
              className="text-white hover:text-[#00F9FF] transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex items-center" style={{ zIndex: 20 }}>
        {/* Logo inicial y frase - Solo se muestra al principio */}
        {showInitialLogo ? (
          <div className="w-full flex flex-col items-center justify-center px-8" style={{ zIndex: 25 }}>
            <div className="mb-8 animate-fadeIn">
              <div className="flex justify-center">
                <img 
                  src="/logo.svg" 
                  alt="Techno Experience" 
                  className="w-auto hero-initial-logo"
                  style={{ 
                    height: '16rem',
                    maxWidth: '90vw'
                  }}
                />
              </div>
              <style>{`
                .hero-initial-logo {
                  height: 16rem !important;
                }
                @media (min-width: 768px) {
                  .hero-initial-logo {
                    height: 20rem !important;
                  }
                }
                @media (min-width: 1024px) {
                  .hero-initial-logo {
                    height: 24rem !important;
                  }
                }
                @media (min-width: 1280px) {
                  .hero-initial-logo {
                    height: 28rem !important;
                  }
                }
              `}</style>
            </div>
            <p className="text-white/90 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-space text-center max-w-4xl animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              Tu fuente definitiva de música techno underground
            </p>
          </div>
        ) : (
          <>
            {/* Left Section - Giant Title (SOLO TEXTO, SIN FOTO DE FONDO) */}
            <div className="flex-1 px-8 lg:px-20">
              <div className="max-w-4xl">
                {/* Caja contenedora para el título */}
                <div className="bg-white/5 border border-white/10 p-6 md:p-8 lg:p-10 mb-6 min-h-[200px] md:min-h-[250px] lg:min-h-[300px] flex items-center justify-center">
                  <h1
                    key={activeArticle.id}
                    className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-heading text-white leading-[1.1] transition-all duration-700 ease-in-out line-clamp-4 md:line-clamp-5"
                    style={{
                      fontFamily: "'Bebas Neue', system-ui, sans-serif",
                      fontWeight: 900,
                      letterSpacing: '-0.02em',
                      textShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5)',
                      animation: 'fadeInSlide 0.7s ease-in-out',
                      display: '-webkit-box',
                      WebkitLineClamp: 'var(--line-clamp, 4)',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {activeArticle.title}
                  </h1>
                </div>
                {activeArticle.excerpt && (
                  <p className="text-white/80 text-lg md:text-xl lg:text-2xl font-space max-w-3xl line-clamp-3">
                    {activeArticle.excerpt}
                  </p>
                )}
                <Link
                  to={`/news/${activeArticle.slug}`}
                  className="inline-block mt-8 text-white/90 hover:text-white text-lg font-space uppercase tracking-wider border-b-2 border-[#00F9FF] hover:border-white transition-colors duration-300"
                >
                  Leer más →
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Right Section - 4 Columns of 4 Cards Each - Solo se muestra después del logo inicial */}
        {!showInitialLogo && (
          <div className="hidden lg:flex gap-4 pr-8 lg:pr-20 h-[80vh] justify-center overflow-y-auto">
          {/* Column 1 - 4 Cards */}
          <div className="flex flex-col gap-3">
            {column1.map((article, index) => {
              const isActive = index === activeIndex
              return (
                <div
                  key={article.id}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                  className={`relative w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-96 rounded-none overflow-hidden transition-all duration-700 ease-in-out ${
                    isActive
                      ? "scale-110 brightness-125 shadow-2xl shadow-[#00F9FF]/50 border-2 border-white/30 z-20"
                      : "scale-100 brightness-50 opacity-70 border-2 border-white/10 z-10"
                  }`}
                  style={{
                    filter: isActive
                      ? "saturate(120%) contrast(110%)"
                      : "saturate(50%) contrast(90%)",
                  }}
                >
                  <Link
                    to={`/news/${article.slug}`}
                    className="absolute inset-0 z-30 cursor-pointer"
                    onClick={() => {
                      setActiveIndex(index)
                    }}
                  />
                  {/* Card Image with Parallax Effect */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                    style={{
                      backgroundImage: `url(${article.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'})`,
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  
                  {/* Overlay - Darker for inactive cards */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      isActive
                        ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60"
                        : "bg-black/70 opacity-100"
                    }`}
                  />

                  {/* Active Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00F9FF]/20 via-transparent to-transparent pointer-events-none animate-pulse" />
                  )}

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col justify-end p-4 md:p-5 lg:p-6 z-10">
                    <h3
                      className={`text-white font-bold line-clamp-3 transition-all duration-700 ${
                        isActive
                          ? "text-base md:text-lg lg:text-xl scale-105"
                          : "text-sm md:text-base lg:text-lg scale-100"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                    >
                      {article.title}
                    </h3>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Column 2 - 4 Cards */}
          <div className="flex flex-col gap-3">
            {column2.map((article, index) => {
              const cardIndex = index + 4
              const isActive = cardIndex === activeIndex
              return (
                <div
                  key={article.id}
                  onMouseEnter={() => handleCardHover(cardIndex)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => setActiveIndex(cardIndex)}
                  className={`relative w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-96 rounded-none overflow-hidden transition-all duration-700 ease-in-out cursor-pointer ${
                    isActive
                      ? "scale-110 brightness-125 shadow-2xl shadow-[#00F9FF]/50 border-2 border-white/30 z-20"
                      : "scale-100 brightness-50 opacity-70 border-2 border-white/10 z-10"
                  }`}
                  style={{
                    filter: isActive
                      ? "saturate(120%) contrast(110%)"
                      : "saturate(50%) contrast(90%)",
                  }}
                >
                  <Link
                    to={`/news/${article.slug}`}
                    className="absolute inset-0 z-30 cursor-pointer"
                    onClick={() => setActiveIndex(cardIndex)}
                  />
                  {/* Card Image with Parallax Effect */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                    style={{
                      backgroundImage: `url(${article.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'})`,
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  
                  {/* Overlay - Darker for inactive cards */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      isActive
                        ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60"
                        : "bg-black/70 opacity-100"
                    }`}
                  />

                  {/* Active Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00F9FF]/20 via-transparent to-transparent pointer-events-none animate-pulse" />
                  )}

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col justify-end p-4 md:p-5 lg:p-6 z-10">
                    <h3
                      className={`text-white font-bold line-clamp-3 transition-all duration-700 ${
                        isActive
                          ? "text-base md:text-lg lg:text-xl scale-105"
                          : "text-sm md:text-base lg:text-lg scale-100"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                    >
                      {article.title}
                    </h3>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Column 3 - 4 Cards */}
          <div className="flex flex-col gap-3">
            {column3.map((article, index) => {
              const cardIndex = index + 8
              const isActive = cardIndex === activeIndex
              return (
                <div
                  key={article.id}
                  onMouseEnter={() => handleCardHover(cardIndex)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => setActiveIndex(cardIndex)}
                  className={`relative w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-96 rounded-none overflow-hidden transition-all duration-700 ease-in-out cursor-pointer ${
                    isActive
                      ? "scale-110 brightness-125 shadow-2xl shadow-[#00F9FF]/50 border-2 border-white/30 z-20"
                      : "scale-100 brightness-50 opacity-70 border-2 border-white/10 z-10"
                  }`}
                  style={{
                    filter: isActive
                      ? "saturate(120%) contrast(110%)"
                      : "saturate(50%) contrast(90%)",
                  }}
                >
                  <Link
                    to={`/news/${article.slug}`}
                    className="absolute inset-0 z-30 cursor-pointer"
                    onClick={() => setActiveIndex(cardIndex)}
                  />
                  {/* Card Image with Parallax Effect */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                    style={{
                      backgroundImage: `url(${article.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'})`,
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  
                  {/* Overlay - Darker for inactive cards */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      isActive
                        ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60"
                        : "bg-black/70 opacity-100"
                    }`}
                  />

                  {/* Active Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00F9FF]/20 via-transparent to-transparent pointer-events-none animate-pulse" />
                  )}

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col justify-end p-4 md:p-5 lg:p-6 z-10">
                    <h3
                      className={`text-white font-bold line-clamp-3 transition-all duration-700 ${
                        isActive
                          ? "text-base md:text-lg lg:text-xl scale-105"
                          : "text-sm md:text-base lg:text-lg scale-100"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                    >
                      {article.title}
                    </h3>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Column 4 - 4 Cards */}
          <div className="flex flex-col gap-3">
            {column4.map((article, index) => {
              const cardIndex = index + 12
              const isActive = cardIndex === activeIndex
              return (
                <div
                  key={article.id}
                  onMouseEnter={() => handleCardHover(cardIndex)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => setActiveIndex(cardIndex)}
                  className={`relative w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-96 rounded-none overflow-hidden transition-all duration-700 ease-in-out cursor-pointer ${
                    isActive
                      ? "scale-110 brightness-125 shadow-2xl shadow-[#00F9FF]/50 border-2 border-white/30 z-20"
                      : "scale-100 brightness-50 opacity-70 border-2 border-white/10 z-10"
                  }`}
                  style={{
                    filter: isActive
                      ? "saturate(120%) contrast(110%)"
                      : "saturate(50%) contrast(90%)",
                  }}
                >
                  <Link
                    to={`/news/${article.slug}`}
                    className="absolute inset-0 z-30 cursor-pointer"
                    onClick={() => setActiveIndex(cardIndex)}
                  />
                  {/* Card Image with Parallax Effect */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                    style={{
                      backgroundImage: `url(${article.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'})`,
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  
                  {/* Overlay - Darker for inactive cards */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      isActive
                        ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60"
                        : "bg-black/70 opacity-100"
                    }`}
                  />

                  {/* Active Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00F9FF]/20 via-transparent to-transparent pointer-events-none animate-pulse" />
                  )}

                  {/* Card Content */}
                  <div className="relative h-full flex flex-col justify-end p-4 md:p-5 lg:p-6 z-10">
                    <h3
                      className={`text-white font-bold line-clamp-3 transition-all duration-700 ${
                        isActive
                          ? "text-base md:text-lg lg:text-xl scale-105"
                          : "text-sm md:text-base lg:text-lg scale-100"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                    >
                      {article.title}
                    </h3>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}

        {/* Mobile - Horizontal Slider - Solo se muestra después del logo inicial */}
        {!showInitialLogo && (
          <div className="lg:hidden absolute bottom-8 left-0 right-0 px-4 overflow-x-auto" style={{ zIndex: 20 }}>
          <div className="flex gap-4 pb-4" style={{ scrollSnapType: "x mandatory" }}>
            {newsArticles.slice(0, 15).map((article, index) => {
              const isActive = index === activeIndex
              return (
                <Link
                  key={article.id}
                  to={`/news/${article.slug}`}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                  onClick={() => setActiveIndex(index)}
                  className={`relative w-64 h-80 flex-shrink-0 rounded-none overflow-hidden transition-all duration-700 ease-in-out ${
                    isActive
                      ? "scale-105 brightness-125 shadow-2xl shadow-[#00F9FF]/50 border-2 border-white/30"
                      : "scale-100 brightness-50 opacity-70 border-2 border-white/10"
                  }`}
                  style={{
                    scrollSnapAlign: "center",
                    filter: isActive
                      ? "saturate(120%) contrast(110%)"
                      : "saturate(50%) contrast(90%)",
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${article.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'})`,
                    }}
                  />
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      isActive
                        ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60"
                        : "bg-black/70 opacity-100"
                    }`}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00F9FF]/20 via-transparent to-transparent pointer-events-none" />
                  )}
                  <div className="relative h-full flex flex-col justify-end p-5 sm:p-6 md:p-8 z-10">
                    <h3
                      className={`text-white font-bold line-clamp-3 transition-all duration-700 ${
                        isActive ? "text-xl sm:text-2xl md:text-3xl" : "text-lg sm:text-xl md:text-2xl"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                    >
                      {article.title}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
        )}
      </div>

      {/* Scroll Indicator - Solo se muestra después del logo inicial */}
      {!showInitialLogo && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center hidden lg:block" style={{ zIndex: 30 }}>
        <div className="text-white/60 text-xs mb-2 font-space uppercase tracking-wider">Scroll</div>
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F9FF] mb-1 animate-bounce" />
          <div className="w-px h-6 bg-[#00F9FF]/50" />
        </div>
      </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </header>
  )
}

