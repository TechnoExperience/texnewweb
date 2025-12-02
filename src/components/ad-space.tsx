/**
 * Ad Space Component
 * Displays advertisements from CMS in sidebar areas
 * Optimized for SEO and performance
 * 
 * TEMPORARILY DISABLED - Remove comments to re-enable
 */

// import { useCallback } from "react"
// import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
// import { OptimizedImage } from "@/components/ui/optimized-image"
// import { TABLES } from "@/constants/tables"
// import type { Ad } from "@/types"

interface AdSpaceProps {
  position: "sidebar_top" | "sidebar_middle" | "sidebar_bottom"
  className?: string
}

export function AdSpace({ position, className = "" }: AdSpaceProps) {
  // Temporarily disabled - returns empty div
  return (
    <div className={className} style={{ display: 'none' }} />
  )
  
  /* ORIGINAL CODE - Uncomment to re-enable
  /*
  const adsQuery = useCallback(
    (query: any) => {
      return query
        .eq("position", position)
        .eq("active", true)
        .order("priority", { ascending: false })
        .limit(1)
    },
    [position]
  )

  const { data: ads } = useSupabaseQuery<Ad>(
    TABLES.ADS,
    adsQuery
  )

  // Filter ads by date range
  const activeAd = ads?.find(ad => {
    const now = new Date()
    const startDate = ad.start_date ? new Date(ad.start_date) : null
    const endDate = ad.end_date ? new Date(ad.end_date) : null
    
    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false
    return true
  })

  if (!activeAd) {
    return (
      <div className={`bg-white/5 border border-white/10 p-4 ${className}`}>
        <div className="text-xs text-white/40 text-center py-8">
          Espacio publicitario
        </div>
      </div>
    )
  }

  const handleClick = async () => {
    // Track click (you can implement this with a function call)
    // The <a> tag will handle navigation automatically via href and target="_blank"
    try {
      // await supabase.rpc('increment_ad_click_count', { ad_id: activeAd.id })
    } catch (error) {
      console.error('Error tracking ad click:', error)
    }
    // No need to prevent default or call window.open() - let the <a> tag handle navigation
  }

  return (
    <div className={`bg-white/5 border border-white/10 overflow-hidden ${className}`}>
      {activeAd.link_url ? (
        <a
          href={activeAd.link_url}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block hover:opacity-90 transition-opacity"
          aria-label={`Publicidad: ${activeAd.title}`}
        >
          <OptimizedImage
            src={activeAd.image_url}
            alt={activeAd.title || "Publicidad"}
            width={activeAd.width || 300}
            height={activeAd.height || 250}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </a>
      ) : (
        <div>
          <OptimizedImage
            src={activeAd.image_url}
            alt={activeAd.title || "Publicidad"}
            width={activeAd.width || 300}
            height={activeAd.height || 250}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      )}
      {activeAd.description && (
        <div className="p-2 text-xs text-white/60 text-center">
          {activeAd.description}
        </div>
      )}
    </div>
  )
  */
}

