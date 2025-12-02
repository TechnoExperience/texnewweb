import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { ROUTES } from "@/constants/routes"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-white/60 mb-6" aria-label="Breadcrumb">
      <Link 
        to={ROUTES.HOME} 
        className="hover:text-[#00F9FF] transition-colors flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-white/40" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-[#00F9FF] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

