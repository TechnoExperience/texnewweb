import { VinylCard } from "@/components/releases/vinyl-card"
import type { Release } from "@/types"
import { motion } from "framer-motion"

interface ReleasesCarouselProps {
  releases: Release[]
}

export function ReleasesCarousel({ releases }: ReleasesCarouselProps) {
  if (releases.length === 0) {
    return (
      <div className="w-full h-[600px] bg-black border border-white/10 flex items-center justify-center">
        <p className="text-white/60 font-space">No hay lanzamientos disponibles</p>
      </div>
    )
  }

  // Limitar a 5 releases para el grid
  const releasesToShow = releases.slice(0, 5)

  return (
    <div className="relative w-full overflow-hidden">
      {/* Grid Container - Responsive con 5 tarjetas en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        {releasesToShow.map((release, index) => (
          <motion.div
            key={release.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="w-full overflow-hidden"
          >
            <VinylCard release={release} index={index} hideFeatured={true} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

