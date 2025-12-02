import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, LogOut, Settings, LayoutDashboard } from "lucide-react"
import { LanguageSwitcher } from "./language-switcher"
import { Logo } from "./logo"
import { TechSceneNav } from "./tech-scene-nav"
import { useAuth } from "@/hooks/useAuth"
import { ROUTES } from "@/constants/routes"
import { useCallback } from "react"
import { useSupabaseQuerySingle } from "@/hooks/useSupabaseQuerySingle"
import { TABLES } from "@/constants/tables"
import type { UserProfile } from "@/types"

interface SiteHeaderProps {
  onMenuToggle?: () => void
  currentSection?: string
}

export function SiteHeader({ onMenuToggle }: SiteHeaderProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  const profileQuery = useCallback(
    (query: any) => query.eq("id", user?.id || ""),
    [user?.id]
  )

  const { data: profile } = useSupabaseQuerySingle<UserProfile>(
    TABLES.PROFILES,
    profileQuery,
    { enabled: !!user }
  )

  const isAdmin = profile?.role === 'admin' || profile?.role === 'editor'

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-sm border-b border-white/10">
      {/* Barra de navegación de clubs y festivales */}
      <TechSceneNav />
      
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Logo size="md" className="flex-shrink-0 w-auto sm:w-full" />
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            {/* CMS Button - Always visible when in admin routes */}
            {isAdminRoute && (
              <Button
                asChild
                size="sm"
                className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black font-bold flex items-center gap-1 sm:gap-2 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2"
              >
                <Link to={ROUTES.ADMIN.DASHBOARD}>
                  <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline font-heading uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    CMS
                  </span>
                </Link>
              </Button>
            )}

            {/* Admin Dashboard Button - Visible when logged in as admin but not in admin routes */}
            {user && isAdmin && !isAdminRoute && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] flex items-center gap-2 flex-shrink-0"
              >
                <Link to={ROUTES.ADMIN.DASHBOARD}>
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    CMS
                  </span>
                </Link>
              </Button>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Auth Buttons - Responsive with consistent colors */}
            {user ? (
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 flex items-center gap-2 flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  Cerrar Sesión
                </span>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 flex items-center gap-2 flex-shrink-0"
                >
                  <Link to={ROUTES.AUTH.LOGIN}>
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Iniciar Sesión
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black font-bold flex items-center gap-1 sm:gap-2 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2"
                >
                  <Link to={ROUTES.AUTH.SIGNUP}>
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline font-heading uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Crear Cuenta
                    </span>
                  </Link>
                </Button>
              </>
            )}
            
            {/* Menu button */}
            <button
              onClick={onMenuToggle}
              className="text-white hover:text-[#00F9FF] transition-colors flex-shrink-0 p-2 -mr-2 sm:mr-0"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
