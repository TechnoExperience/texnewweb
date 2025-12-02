import { useState, memo, useCallback } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    fallbackSrc?: string
}

export const OptimizedImage = memo(function OptimizedImage({
    src,
    alt,
    fallbackSrc = "/placeholder.svg",
    className,
    ...props
}: OptimizedImageProps) {
    const [error, setError] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const handleError = useCallback(() => {
        setError(true)
    }, [])

    const handleLoad = useCallback(() => {
        setLoaded(true)
    }, [])

    return (
        <>
            {!loaded && (
                <div className={cn("animate-pulse bg-zinc-800", className)} aria-hidden="true" />
            )}
            <img
                src={error ? fallbackSrc : src}
                alt={alt}
                loading="lazy"
                decoding="async"
                onError={handleError}
                onLoad={handleLoad}
                className={cn(
                    className,
                    !loaded && "hidden"
                )}
                {...props}
            />
        </>
    )
})
