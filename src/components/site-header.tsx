"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Menu, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { LanguageSwitcher } from "./language-switcher"

export function SiteHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  const navLinks = [
    { href: "/", label: t("nav.news") },
    { href: "/events", label: t("nav.events") },
    { href: "/releases", label: t("nav.releases") },
    { href: "/videos", label: t("nav.videos") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">TECHNO EXPERIENCE</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    location.pathname === link.href ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-zinc-400">{user.email}</span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
                >
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden md:inline-flex border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
              >
                <Link to="/auth/login">{t("nav.login")}</Link>
              </Button>
            )}

            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    location.pathname === link.href ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 w-full"
                >
                  {t("nav.logout")}
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 w-full"
                >
                  <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
