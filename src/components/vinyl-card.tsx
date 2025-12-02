import { Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Music, Play, ArrowRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { MiniPlayer } from "@/components/mini-player"
import type { Release } from "@/types"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface VinylCardProps {
  release: Release
  index?: number
}

export function VinylCard({ release, index = 0 }: VinylCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [djImages, setDjImages] = useState<string[]>([])
  const [currentDjImageIndex, setCurrentDjImageIndex] = useState(0)
  const releaseDate = new Date(release.release_date)
  const genres = Array.isArray(release.genre) ? release.genre : [release.genre || "Techno"]
  
  // Fetch DJ profile images based on artist name
  useEffect(() => {
    const fetchDjImages = async () => {
      try {
        // Split artist string by common separators (comma, &, vs, etc.)
        const artistNames = release.artist
          .split(/[,&|vs\.]/)
          .map(name => name.trim())
          .filter(name => name.length > 0)

        const images: string[] = []
        
        for (const artistName of artistNames) {
          // Search for profile by name (checking both nombre_artistico and name fields)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('avatar_url, cover_url')
            .or(`nombre_artistico.ilike.%${artistName}%,name.ilike.%${artistName}%`)
            .eq('profile_type', 'dj')
            .limit(1)

          if (profiles && profiles.length > 0) {
            const profile = profiles[0]
            if (profile.avatar_url) images.push(profile.avatar_url)
            else if (profile.cover_url) images.push(profile.cover_url)
          }
        }

        // If no profiles found, use placeholder DJ images
        if (images.length === 0) {
          images.push(
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'
          )
        }

        setDjImages(images)
      } catch (error) {
        console.error('Error fetching DJ images:', error)
        // Fallback images
        setDjImages([
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'
        ])
      }
    }

    fetchDjImages()
  }, [release.artist])

  // Rotate through DJ images if multiple
  useEffect(() => {
    if (djImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentDjImageIndex((prev) => (prev + 1) % djImages.length)
      }, 4000) // Change image every 4 seconds
      return () => clearInterval(interval)
    }
  }, [djImages.length])

  // Continuous rotation animation when hovered
  const handleMouseEnter = () => {
    setIsHovered(true)
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360)
    }, 50)
    return () => clearInterval(interval)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <Link
      to={`/releases/${release.id}`}
      className="group block w-full relative"
      style={{
        scrollSnapAlign: "start",
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
        width: "320px",
        minWidth: "320px"
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative" style={{ perspective: "1200px" }}>
        {/* 3D Vinyl Container with Realistic Rotation */}
        <div 
          className="relative w-full aspect-square transition-transform duration-300"
          style={{
            transformStyle: "preserve-3d",
            transform: isHovered 
              ? `rotateY(${rotation}deg) rotateX(5deg) scale(1.05)` 
              : "rotateY(0deg) rotateX(0deg) scale(1)",
            transition: isHovered ? "none" : "transform 0.5s ease-out"
          }}
        >
          {/* Vinyl Disc - Main Body */}
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-4 border-white/30 shadow-[0_30px_80px_rgba(0,0,0,0.9),0_15px_40px_rgba(0,249,255,0.3),inset_0_0_120px_rgba(0,249,255,0.15)] overflow-hidden"
            style={{
              transform: "translateZ(0px)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.9), 0 15px 40px rgba(0, 249, 255, 0.3), inset 0 0 120px rgba(0, 249, 255, 0.15)"
            }}
          >
            {/* Vinyl Grooves - Realistic Spiral Pattern */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => {
                const radius = 50 - (i * 3.5)
                return (
                  <div
                    key={i}
                    className="absolute rounded-full border border-white/8"
                    style={{
                      width: `${radius}%`,
                      height: `${radius}%`,
                      top: `${50 - radius/2}%`,
                      left: `${50 - radius/2}%`,
                      boxShadow: i % 2 === 0 
                        ? "inset 0 0 2px rgba(255,255,255,0.1)" 
                        : "0 0 1px rgba(255,255,255,0.05)"
                    }}
                  />
                )
              })}
            </div>

            {/* Center Label with Artwork - Raised Effect */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full bg-gradient-to-br from-zinc-800 to-black border-4 border-white/40 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,249,255,0.2)]"
              style={{
                transform: "translateZ(15px) translate(-50%, -50%)",
                boxShadow: "inset 0 0 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,249,255,0.2)"
              }}
            >
              <OptimizedImage
                src={release.cover_art || '/placeholder.svg'}
                alt={`${release.artist} - ${release.title}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{
                  filter: "brightness(0.95) contrast(1.1)"
                }}
              />
              
              {/* Center Hole - Deep 3D Effect */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black border-2 border-white/30 shadow-[inset_0_0_15px_rgba(0,0,0,1),0_0_10px_rgba(0,0,0,0.8)]"
                style={{
                  transform: "translateZ(25px) translate(-50%, -50%)",
                  boxShadow: "inset 0 0 15px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)"
                }}
              />
            </div>

            {/* Play Button Overlay - 3D Positioned */}
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
              style={{ transform: "translateZ(40px)" }}
            >
              <div className="w-24 h-24 bg-[#00F9FF]/95 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/40 shadow-[0_0_40px_rgba(0,249,255,0.6),inset_0_0_20px_rgba(0,249,255,0.3)]">
                <Play className="w-12 h-12 text-black ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Reflection Effect - Realistic Light Reflection */}
            <div 
              className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-full pointer-events-none"
              style={{ 
                transform: "translateZ(8px) rotateX(180deg)",
                filter: "blur(2px)"
              }}
            />

            {/* Vinyl Edge Shadow - Depth Effect */}
            <div 
              className="absolute inset-0 rounded-full border-2 border-black/50 pointer-events-none"
              style={{
                transform: "translateZ(-5px)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)"
              }}
            />
          </div>

          {/* Featured Badge - Floating Above */}
          {release.featured && (
            <div 
              className="absolute -top-3 -right-3 z-40"
              style={{ transform: "translateZ(60px)" }}
            >
              <Badge className="bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] text-black border-0 px-3 py-1.5 shadow-lg shadow-[#00F9FF]/50">
                Destacado
              </Badge>
            </div>
          )}
        </div>

        {/* Info Card Below Vinyl - Enhanced Design with DJ Background */}
        <div className="mt-6 relative overflow-hidden border border-white/10 p-5 group-hover:border-[#00F9FF]/50 transition-all duration-300 shadow-xl shadow-black/60 group-hover:shadow-2xl group-hover:shadow-[#00F9FF]/30">
          {/* DJ Background Image */}
          {djImages.length > 0 && (
            <div className="absolute inset-0 z-0">
              {djImages.map((image, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                    idx === currentDjImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    backgroundImage: `url(${image})`,
                    filter: 'blur(8px) brightness(0.3) contrast(1.2)',
                    transform: 'scale(1.1)'
                  }}
                />
              ))}
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
            </div>
          )}
          
          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-xl font-heading text-white mb-2 line-clamp-1 group-hover:text-[#00F9FF] transition-colors drop-shadow-lg" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
              {release.title}
            </h3>
            <p className="text-[#00F9FF] font-space text-sm mb-3 line-clamp-1 font-semibold drop-shadow-lg">
              {release.artist}
            </p>
            
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {genres.slice(0, 2).map((genre, idx) => (
                <Badge key={idx} className="bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50 text-xs font-semibold backdrop-blur-sm">
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Mini Player */}
            <div className="mb-3">
              <MiniPlayer
                audioUrl={(release as any).preview_url || (release as any).audio_url || undefined}
                title={release.title}
                artist={release.artist}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <span className="text-white/80 font-space text-xs drop-shadow-lg">
                {format(releaseDate, "MMM yyyy", { locale: es })}
              </span>
              <div className="flex items-center gap-1 text-[#00F9FF] group-hover:translate-x-1 transition-transform">
                <span className="text-xs font-space uppercase font-semibold">Ver</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
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
        @keyframes vinylRotate {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </Link>
  )
}
