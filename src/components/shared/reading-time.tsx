import { useMemo } from "react"
import { Clock } from "lucide-react"

interface ReadingTimeProps {
  content: string
  className?: string
}

export function ReadingTime({ content, className = "" }: ReadingTimeProps) {
  const readingTime = useMemo(() => {
    // Remover HTML tags para contar palabras
    const text = content.replace(/<[^>]*>/g, "")
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const wordsPerMinute = 200 // Velocidad promedio de lectura
    const minutes = Math.ceil(words.length / wordsPerMinute)
    return minutes
  }, [content])

  return (
    <div className={`flex items-center gap-2 text-white/60 text-sm ${className}`}>
      <Clock className="w-4 h-4" />
      <span>{readingTime} min de lectura</span>
    </div>
  )
}

