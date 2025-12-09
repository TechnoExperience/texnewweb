import { useState, memo, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    fallbackSrc?: string
    priority?: boolean // Para imágenes críticas (above the fold)
    blurDataURL?: string // Para blur placeholder
}

export const OptimizedImage = memo(function OptimizedImage({
    src,
    alt,
    fallbackSrc = "/placeholder.svg",
    className,
    priority = false,
    blurDataURL,
    ...props
}: OptimizedImageProps) {
    const [error, setError] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [isInView, setIsInView] = useState(priority)
    const imgRef = useRef<HTMLImageElement>(null)

    // Intersection Observer para lazy loading mejorado
    useEffect(() => {
        if (priority || !imgRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            {
                rootMargin: '50px', // Cargar antes de que sea visible
                threshold: 0.01
            }
        )

        observer.observe(imgRef.current)

        return () => observer.disconnect()
    }, [priority])

    const handleError = useCallback(() => {
        setError(true)
        setLoaded(true) // Mostrar placeholder en caso de error
    }, [])

    const handleLoad = useCallback(() => {
        setLoaded(true)
    }, [])

    const imageSrc = error ? fallbackSrc : (isInView ? src : blurDataURL || fallbackSrc)

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {/* Blur placeholder */}
            {blurDataURL && !loaded && !error && (
                <img
                    src={blurDataURL}
                    alt=""
                    className={cn("absolute inset-0 w-full h-full object-cover filter blur-md scale-110", className)}
                    aria-hidden="true"
                    loading="eager"
                />
            )}
            
            {/* Loading skeleton */}
            {!loaded && !error && !blurDataURL && (
                <div className={cn("absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800", className)} aria-hidden="true" />
            )}

            {/* Imagen real */}
            <img
                ref={imgRef}
                src={imageSrc}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority ? "high" : "auto"}
                onError={handleError}
                onLoad={handleLoad}
                className={cn(
                    "transition-opacity duration-300",
                    className,
                    loaded ? "opacity-100" : "opacity-0",
                    error && "opacity-100"
                )}
                {...props}
            />
        </div>
    )
})
