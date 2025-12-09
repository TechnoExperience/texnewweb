import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, LogOut, Settings, LayoutDashboard } from "lucide-react"
import { LanguageSwitcher } from "./language-switcher"
import { Logo } from "./logo"
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
      <div className="w-full" style={{ paddingLeft: '10%', paddingRight: '10%', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            {/* CMS Button - Always visible when in admin routes */}
            {isAdminRoute && (
              <Button
                asChild
                size="sm"
                className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black font-bold flex items-center gap-2"
              >
                <Link to={ROUTES.ADMIN.DASHBOARD}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
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
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] flex items-center gap-2"
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
            
            {/* Auth Buttons */}
            {user ? (
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] hidden sm:flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  Cerrar Sesión
                </span>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00F9FF] hidden sm:flex items-center gap-2"
                >
                  <Link to={ROUTES.AUTH.LOGIN}>
                    <LogIn className="w-4 h-4" />
                    <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Iniciar Sesión
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#00F9FF] hover:bg-[#00D9E6] text-white hidden sm:flex items-center gap-2"
                >
                  <Link to={ROUTES.AUTH.SIGNUP}>
                    <UserPlus className="w-4 h-4" />
                    <span className="font-heading uppercase tracking-wider text-sm" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      Crear Cuenta
                    </span>
                  </Link>
                </Button>
              </>
            )}
            {/* Menu button */}
            <button
              onClick={onMenuToggle}
              className="text-white hover:text-[#00F9FF] transition-colors"
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
