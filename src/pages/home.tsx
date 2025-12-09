import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, ShoppingBag } from "lucide-react"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { EventsCarousel } from "@/components/events-carousel"
import { VinylCard } from "@/components/vinyl-card"
import { NewsSlider } from "@/components/news-slider"
import { UnifiedCard } from "@/components/unified-card"
import { BrandMarquee } from "@/components/brand-marquee"
import { TABLES } from "@/constants/tables"
import type { Event, Release, Review, NewsArticle } from "@/types"

export default function HomePage() {
  // Cargar todos los eventos próximos (sin límite restrictivo)
  // Mostrar todos los eventos futuros, independientemente del status
  const { data: upcomingEvents } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    (query) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return query.gte("event_date", today.toISOString()).order("event_date", { ascending: true }).limit(20)
    }
  )

  // Cargar todos los lanzamientos recientes
  const { data: latestReleases } = useSupabaseQuery<Release>(
    TABLES.RELEASES,
    (query) => query.order("release_date", { ascending: false }).limit(20)
  )

  // Cargar todas las reviews recientes
  const { data: latestReviews } = useSupabaseQuery<Review>(
    TABLES.REVIEWS,
    (query) => query.order("published_date", { ascending: false }).limit(10)
  )

  // Cargar todas las noticias destacadas
  const { data: featuredNews } = useSupabaseQuery<NewsArticle>(
    TABLES.NEWS,
    (query) => query.eq("featured", true).order("published_date", { ascending: false }).limit(20)
  )

  // Cargar todas las noticias recientes
  const { data: latestNews } = useSupabaseQuery<NewsArticle>(
    TABLES.NEWS,
    (query) => query.order("published_date", { ascending: false }).limit(20)
  )

  // Use featured news if available, otherwise use latest news
  const newsArticles = (featuredNews && featuredNews.length > 0) ? featuredNews : (latestNews || [])

  return (
    <div className="relative min-h-screen bg-black">
      {/* Main content - Hero header is rendered in App.tsx */}
      <div className="relative z-10">
        {/* Marquee de marca / ecosistema (inspirado en somosespuma.com) */}
        <BrandMarquee />

        <div className="w-full relative z-10" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
          {/* Upcoming Events Section - Improved Cards */}
          <section className="py-12 md:py-16 relative overflow-hidden">

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-10 md:mb-12">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-1 bg-[#00F9FF] transform rotate-12" />
                    <h2 
                      className="text-5xl md:text-6xl font-heading text-white"
                      style={{ 
                        fontFamily: "'Bebas Neue', system-ui, sans-serif",
                        textShadow: "0 4px 20px rgba(0, 249, 255, 0.3), 0 2px 10px rgba(0, 0, 0, 0.8)"
                      }}
                    >
                      PRÓXIMOS EVENTOS
                    </h2>
                  </div>
                  <p className="text-white/60 font-space">No te pierdas ni una cita</p>
                </div>
                <Link to="/events">
                  <Button
                    variant="ghost"
                    className="group text-white hover:text-[#00F9FF] transition-colors border border-white/10 hover:border-[#00F9FF]/50"
                  >
                    Ver agenda completa
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* Events Carousel */}
              <EventsCarousel events={upcomingEvents || []} />
            </div>
          </section>

          {/* Latest Releases Section - Vinyl View */}
          <section className="py-12 md:py-16 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 md:mb-12">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-1 bg-[#00F9FF] transform rotate-12" />
                  <h2 
                    className="text-5xl md:text-6xl font-heading text-white"
                    style={{ 
                      fontFamily: "'Bebas Neue', system-ui, sans-serif",
                      textShadow: "0 4px 20px rgba(0, 249, 255, 0.3), 0 2px 10px rgba(0, 0, 0, 0.8)"
                    }}
                  >
                    ÚLTIMOS LANZAMIENTOS
                  </h2>
                </div>
                <p className="text-white/60 font-space">Los tracks más frescos en formato vinilo</p>
              </div>
              <Link to="/releases">
                <Button
                  variant="ghost"
                  className="group text-white hover:text-[#00F9FF] transition-colors border border-white/10 hover:border-[#00F9FF]/50"
                >
                  Ver discografía
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Releases Carousel - Single Row - Equal Cards */}
            {latestReleases && latestReleases.length > 0 ? (
              <div className="relative w-full overflow-visible">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 gap-4 lg:gap-6" style={{ width: 'calc(100% + 20%)', marginLeft: '-10%', paddingLeft: '10%', paddingRight: '10%' }}>
                  {latestReleases.map((release, index) => (
                    <div 
                      key={release.id} 
                      className="flex-shrink-0 snap-center"
                      style={{ width: "320px", minWidth: "320px" }}
                    >
                      <VinylCard release={release} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 py-12">
                No hay lanzamientos disponibles
              </div>
            )}
          </section>

          {/* News Section - Slider with Single Article */}
          {newsArticles && newsArticles.length > 0 && (
            <section className="py-12 md:py-16 relative bg-black">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 md:mb-12">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-1 bg-[#00F9FF] transform rotate-12" />
                    <h2 
                      className="text-5xl md:text-6xl font-heading text-white"
                      style={{ 
                        fontFamily: "'Bebas Neue', system-ui, sans-serif",
                        textShadow: "0 4px 20px rgba(0, 249, 255, 0.3), 0 2px 10px rgba(0, 0, 0, 0.8)"
                      }}
                    >
                      ÚLTIMAS NOTICIAS
                    </h2>
                  </div>
                  <p className="text-white/60 font-space">Mantente al día con la escena techno</p>
                </div>
                <Link to="/news">
                  <Button
                    variant="ghost"
                    className="group text-white hover:text-[#00F9FF] transition-colors border border-white/10 hover:border-[#00F9FF]/50"
                  >
                    Ver todas
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              <NewsSlider articles={newsArticles} />
            </section>
          )}

          {/* Reviews & Store Section - Split Screen */}
          <section className="py-8 md:py-12 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Reviews - Left Side */}
              <div className="relative overflow-hidden border border-white/10 p-4 md:p-6 bg-black">
                
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-[#00F9FF]" />
                      <h2 
                        className="text-3xl sm:text-4xl md:text-5xl font-heading text-white"
                        style={{ 
                          fontFamily: "'Bebas Neue', system-ui, sans-serif",
                          textShadow: "0 3px 15px rgba(0, 249, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.8)"
                        }}
                      >
                        REVIEWS
                      </h2>
                    </div>
                    <p className="text-white/60 font-space text-xs sm:text-sm">Análisis y críticas</p>
                  </div>
                  <Link to="/reviews">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-[#00F9FF] transition-colors text-xs sm:text-sm"
                    >
                      Ver todas
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    </Button>
                  </Link>
                </div>

                {latestReviews && latestReviews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {latestReviews.slice(0, 2).map((review, index) => (
                      <UnifiedCard key={review.id} type="review" data={review} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/60 py-8">
                    No hay reviews disponibles
                  </div>
                )}
                </div>
              </div>

              {/* Store - Right Side */}
              <div className="relative overflow-hidden border border-white/10 p-4 md:p-6 bg-black">
                
                <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-[#00F9FF]" />
                      <h2 
                        className="text-3xl sm:text-4xl md:text-5xl font-heading text-white"
                        style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                      >
                        STORE
                      </h2>
                    </div>
                    <p className="text-white/60 font-space text-xs sm:text-sm">Merchandising oficial</p>
                  </div>
                  <Link to="/store">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-[#00F9FF] transition-colors text-xs sm:text-sm"
                    >
                      Ver tienda
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Sample Store Items - Solo 2 productos */}
                  {[
                    { name: "TECHNO EXPERIENCE Logo Tee", price: "€29.99", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
                    { name: "Underground Black Tee", price: "€24.99", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400" },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to="/store"
                      className="group block bg-white/5 border border-white/10 hover:border-[#00F9FF]/50 transition-all duration-300 overflow-hidden"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-2 sm:p-3">
                        <h3 className="text-white font-heading text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-[#00F9FF] transition-colors" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                          {item.name}
                        </h3>
                        <p className="text-[#00F9FF] font-space text-xs sm:text-sm font-bold">
                          {item.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 3D Grid Animation */
        .grid-3d-container {
          position: absolute;
          inset: 0;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .grid-3d-line {
          position: absolute;
          width: 2px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(0, 249, 255, 0.3),
            transparent
          );
          left: calc(var(--index, 0) * 5%);
          animation: gridMove var(--duration, 20s) var(--delay, 0s) infinite linear;
          transform: translateZ(0);
        }

        @keyframes gridMove {
          0% {
            transform: translateY(-100%) rotateX(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateX(360deg);
            opacity: 0;
          }
        }

        /* Floating 3D Shapes */
        .floating-3d-shape {
          position: absolute;
          width: 200px;
          height: 200px;
          border: 2px solid rgba(0, 249, 255, 0.2);
          transform-style: preserve-3d;
          animation: float3d var(--duration, 25s) var(--delay, 0s) infinite ease-in-out;
        }

        .floating-3d-shape::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(0, 249, 255, 0.1);
          transform: rotateY(45deg) rotateX(45deg);
        }

        .floating-3d-shape::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(0, 249, 255, 0.1);
          transform: rotateY(-45deg) rotateX(-45deg);
        }

        @keyframes float3d {
          0%, 100% {
            transform: translateY(0) translateX(0) rotateY(0deg) rotateX(0deg) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-50px) translateX(30px) rotateY(90deg) rotateX(45deg) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-100px) translateX(0) rotateY(180deg) rotateX(0deg) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-50px) translateX(-30px) rotateY(270deg) rotateX(-45deg) scale(1.1);
            opacity: 0.5;
          }
        }

        /* Cyan Particles */
        .cyan-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(0, 249, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 249, 255, 0.6), 0 0 20px rgba(0, 249, 255, 0.4);
          animation: particleFloat var(--duration, 15s) var(--delay, 0s) infinite ease-in-out;
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-30px) translateX(20px) scale(1.2);
            opacity: 1;
          }
          50% {
            transform: translateY(-60px) translateX(-10px) scale(0.8);
            opacity: 0.7;
          }
          75% {
            transform: translateY(-30px) translateX(-20px) scale(1.1);
            opacity: 0.9;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .floating-3d-shape {
            width: 100px;
            height: 100px;
          }
        }
        
        /* Hide scrollbar for releases carousel */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
