import { useCallback } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseQuerySingle } from "@/hooks/useSupabaseQuerySingle"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ROUTES } from "@/constants/routes"
import { TABLES } from "@/constants/tables"
import type { UserProfile } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Solo permite acceso a admin/editor */
  requireAdmin?: boolean
  /** Requiere que el perfil esté verificado/aprobado y activo */
  requireVerified?: boolean
  /** Lista explícita de roles permitidos (además de admin/editor si requireAdmin=true) */
  allowedRoles?: UserProfile["role"][]
  /** Limita el acceso a ciertos tipos de perfil (dj, promoter, club, label, agency, club...) */
  allowedProfileTypes?: UserProfile["profile_type"][]
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireVerified = false,
  allowedRoles,
  allowedProfileTypes,
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()

  const profileQuery = useCallback(
    (query: any) => query.eq("id", user?.id || ""),
    [user?.id]
  )

  const { data: profile, loading: profileLoading } = useSupabaseQuerySingle<UserProfile>(
    TABLES.PROFILES,
    profileQuery,
    { enabled: !!user } // siempre que haya usuario cargamos su perfil una vez
  )

  const loading = authLoading || profileLoading

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  // Si aún no tenemos perfil y las reglas dependen de él, espera
  if (!profile && (requireAdmin || requireVerified || allowedRoles || allowedProfileTypes)) {
    return <LoadingSpinner />
  }

  const role = profile?.role
  const profileType = profile?.profile_type
  const isAdminOrEditor = role === "admin" || role === "editor"

  // Regla 1: solo admin/editor si requireAdmin
  if (requireAdmin && !isAdminOrEditor) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  // Regla 2: roles permitidos explícitos (por ejemplo, solo admin/editor/user)
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  // Regla 3: limitar por tipo de perfil (dj, promoter, club, label, agency, club...)
  if (allowedProfileTypes && profileType && !allowedProfileTypes.includes(profileType)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  // Regla 4: requiere usuario verificado/activo para acceder
  if (requireVerified && !isAdminOrEditor) {
    const isVerifiedAndActive =
      profile?.is_active &&
      profile?.is_verified &&
      profile?.verification_status === "APPROVED"

    if (!isVerifiedAndActive) {
      // Redirigimos a selección/completado de perfil para que termine el proceso
      return <Navigate to="/auth/profile-selection" replace />
    }
  }

  return <>{children}</>
}
