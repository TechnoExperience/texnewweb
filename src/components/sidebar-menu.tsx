import { Link, useLocation } from "react-router-dom"
import { X, LogIn, UserPlus, LogOut } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
  onSectionChange?: (section: string) => void
}

export function SidebarMenu({ isOpen, onClose, onSectionChange }: SidebarMenuProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const { user, signOut } = useAuth()

  const menuSections = [
    { href: ROUTES.NEWS, label: t("nav.news"), section: "NOTICIAS" },
    { href: ROUTES.EVENTS, label: t("nav.events"), section: "EVENTOS" },
    { href: ROUTES.RELEASES, label: t("nav.releases"), section: "LANZAMIENTOS" },
    { href: ROUTES.VIDEOS, label: t("nav.videos"), section: "VIDEOS" },
    { href: ROUTES.REVIEWS, label: "Reviews", section: "REVIEWS" },
  ]

  const handleSectionClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section)
    }
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Opens from left with 4 cards full height */}
      <aside
        className={`fixed left-0 top-0 h-full w-80 bg-black/95 backdrop-blur-sm border-r border-white/10 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Close button */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Logo size="sm" />
            <button
              onClick={onClose}
              className="text-white hover:text-[#00D9E6] transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu cards - Full height distribution */}
          <div className="flex-1 flex flex-col gap-4 px-4 pb-8">
            {menuSections.map((section) => (
              <Link
                key={section.href}
                to={section.href}
                onClick={() => handleSectionClick(section.section)}
                className={`flex-1 rounded-none border border-white/10 bg-white/5 flex items-center justify-center text-center p-4 transition-all duration-300 hover:bg-white/10 hover:border-[#00D9E6]/50 ${
                  location.pathname === section.href
                    ? "bg-[#00D9E6]/20 border-[#00D9E6]/50"
                    : ""
                }`}
              >
                <span
                  className="text-lg font-heading text-white uppercase tracking-wider"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  {section.label}
                </span>
              </Link>
            ))}

            {/* Auth Section */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              {user ? (
                <Button
                  onClick={async () => {
                    await signOut()
                    onClose()
                  }}
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-[#00D9E6]/50 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-heading uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    Cerrar Sesión
                  </span>
                </Button>
              ) : (
                <>
                  <Link
                    to={ROUTES.AUTH.LOGIN}
                    onClick={onClose}
                    className="w-full rounded-none border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#00D9E6]/50 flex items-center justify-center gap-2 p-4 transition-all duration-300"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="font-heading text-white uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Iniciar Sesión
                    </span>
                  </Link>
                  <Link
                    to={ROUTES.AUTH.SIGNUP}
                    onClick={onClose}
                    className="w-full rounded-none border border-[#00F9FF] bg-[#00F9FF]/20 hover:bg-[#00F9FF]/30 hover:border-[#00F9FF] flex items-center justify-center gap-2 p-4 transition-all duration-300"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="font-heading text-white uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Crear Cuenta
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

