import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

// Principales clubs techno y festivales de España
const TECHNO_SCENE = {
  festivals: [
    { name: "A Summer Story", slug: "a-summer-story" },
    { name: "Monegros Desert Festival", slug: "monegros" },
    { name: "Sónar", slug: "sonar" },
    { name: "Awakenings", slug: "awakenings" },
    { name: "Time Warp", slug: "time-warp" },
    { name: "DGTL", slug: "dgtl" },
    { name: "Brunch in the Park", slug: "brunch-park" },
  ],
  clubs: [
    { name: "METRO DANCE CLUB", slug: "metro-dance-club" },
    { name: "Fabrik", slug: "fabrik" },
    { name: "Kapital", slug: "kapital" },
    { name: "Opium", slug: "opium" },
    { name: "Pacha", slug: "pacha" },
    { name: "Space", slug: "space" },
    { name: "Input", slug: "input" },
    { name: "Razzmatazz", slug: "razzmatazz" },
    { name: "Sala Apolo", slug: "sala-apolo" },
    { name: "Moog", slug: "moog" },
    { name: "Luz de Gas", slug: "luz-de-gas" },
    { name: "Bassiani", slug: "bassiani" },
  ],
  labels: [
    { name: "POLE GROUP", slug: "pole-group" },
    { name: "Industrial Copera", slug: "industrial-copera" },
    { name: "Warm Up Recordings", slug: "warm-up" },
    { name: "Semantica", slug: "semantica" },
    { name: "Informa Records", slug: "informa" },
    { name: "Analogue Attic", slug: "analogue-attic" },
  ],
}

interface TechSceneNavProps {
  className?: string
}

export function TechSceneNav({ className = "" }: TechSceneNavProps) {
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={`w-full bg-black/80 backdrop-blur-md border-b border-white/10 ${className}`}>
      <div className="container mx-auto px-2 sm:px-4 md:px-6">
        {/* Desktop: Horizontal scroll con categorías */}
        <div className="hidden md:flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
          {/* Festivals */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[#00F9FF] font-heading uppercase text-xs tracking-wider whitespace-nowrap" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
              FESTIVALES
            </span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-4">
              {TECHNO_SCENE.festivals.map((festival) => (
                <Link
                  key={festival.slug}
                  to={`/events?search=${encodeURIComponent(festival.name)}`}
                  className="text-white/70 hover:text-[#00F9FF] transition-colors text-xs font-space whitespace-nowrap"
                >
                  {festival.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-white/20" />

          {/* Clubs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[#00F9FF] font-heading uppercase text-xs tracking-wider whitespace-nowrap" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
              CLUBS
            </span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-4">
              {TECHNO_SCENE.clubs.map((club) => (
                <Link
                  key={club.slug}
                  to={`/events?search=${encodeURIComponent(club.name)}`}
                  className="text-white/70 hover:text-[#00F9FF] transition-colors text-xs font-space whitespace-nowrap"
                >
                  {club.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-white/20" />

          {/* Labels */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[#00F9FF] font-heading uppercase text-xs tracking-wider whitespace-nowrap" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
              LABELS
            </span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-4">
              {TECHNO_SCENE.labels.map((label) => (
                <Link
                  key={label.slug}
                  to={`/releases?search=${encodeURIComponent(label.name)}`}
                  className="text-white/70 hover:text-[#00F9FF] transition-colors text-xs font-space whitespace-nowrap"
                >
                  {label.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Scroll horizontal compacto */}
        <div className="md:hidden py-2">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {/* Festivals */}
            <div className="flex items-center gap-2 flex-shrink-0 snap-center">
              <span className="text-[#00F9FF] font-heading uppercase text-[10px] tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                FESTIVALES
              </span>
              <div className="flex items-center gap-2">
                {TECHNO_SCENE.festivals.slice(0, 3).map((festival) => (
                  <Link
                    key={festival.slug}
                    to={`/events?search=${encodeURIComponent(festival.name)}`}
                    className="text-white/70 hover:text-[#00F9FF] transition-colors text-[10px] font-space whitespace-nowrap px-1"
                  >
                    {festival.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-3 w-px bg-white/20 flex-shrink-0" />

            {/* Clubs */}
            <div className="flex items-center gap-2 flex-shrink-0 snap-center">
              <span className="text-[#00F9FF] font-heading uppercase text-[10px] tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                CLUBS
              </span>
              <div className="flex items-center gap-2">
                {TECHNO_SCENE.clubs.slice(0, 4).map((club) => (
                  <Link
                    key={club.slug}
                    to={`/events?search=${encodeURIComponent(club.name)}`}
                    className="text-white/70 hover:text-[#00F9FF] transition-colors text-[10px] font-space whitespace-nowrap px-1"
                  >
                    {club.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-3 w-px bg-white/20 flex-shrink-0" />

            {/* Labels */}
            <div className="flex items-center gap-2 flex-shrink-0 snap-center">
              <span className="text-[#00F9FF] font-heading uppercase text-[10px] tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                LABELS
              </span>
              <div className="flex items-center gap-2">
                {TECHNO_SCENE.labels.slice(0, 3).map((label) => (
                  <Link
                    key={label.slug}
                    to={`/releases?search=${encodeURIComponent(label.name)}`}
                    className="text-white/70 hover:text-[#00F9FF] transition-colors text-[10px] font-space whitespace-nowrap px-1"
                  >
                    {label.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

