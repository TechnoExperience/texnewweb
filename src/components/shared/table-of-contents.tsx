import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TableOfContentsProps {
  content: string
  className?: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content, className = "" }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Extraer encabezados del contenido HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6")

    const tocItems: TocItem[] = []
    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`
      if (!heading.id) {
        heading.id = id
      }
      tocItems.push({
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.charAt(1)),
      })
    })

    setItems(tocItems)
  }, [content])

  useEffect(() => {
    // Detectar el encabezado activo al hacer scroll
    const handleScroll = () => {
      const headings = items.map((item) => {
        const element = document.getElementById(item.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          return { id: item.id, top: rect.top }
        }
        return null
      }).filter(Boolean) as Array<{ id: string; top: number }>

      const currentHeading = headings
        .filter((h) => h.top <= 100)
        .sort((a, b) => b.top - a.top)[0]

      if (currentHeading) {
        setActiveId(currentHeading.id)
      }
    }

    if (items.length > 0) {
      window.addEventListener("scroll", handleScroll)
      handleScroll()
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [items])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  if (items.length === 0) return null

  return (
    <div className={`bg-zinc-900/50 backdrop-blur-sm rounded-lg p-4 border border-white/10 ${className}`}>
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Tabla de Contenidos</h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeId === item.id
                ? "bg-[#00F9FF]/20 text-[#00F9FF] border-l-2 border-[#00F9FF]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${activeId === item.id ? "opacity-100" : "opacity-0"}`} />
            <span className="line-clamp-1">{item.text}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

