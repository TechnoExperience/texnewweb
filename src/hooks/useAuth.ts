import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// Helper para detectar errores de red
const isNetworkError = (error: any) => {
  return error?.message?.includes('Failed to fetch') ||
         error?.message?.includes('proxy') ||
         error?.message?.includes('network') ||
         error?.name === 'AbortError' ||
         error?.code === 'ERR_PROXY_CONNECTION_FAILED'
}

// Helper para filtrar errores de refresh token de Supabase (solo en desarrollo)
const shouldSilenceError = (error: any, args: any[]): boolean => {
  if (!import.meta.env.DEV) return false
  return isNetworkError(error) && 
         args.some(arg => typeof arg === 'string' && arg.includes('refresh_token'))
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        let subscription: { unsubscribe: () => void } | null = null

        // Get initial session con manejo de errores
        supabase.auth.getUser()
            .then(({ data: { user }, error }) => {
                if (!mounted) return
                if (error && !shouldSilenceError(error, [error.message || ''])) {
                    console.error('Auth error:', error)
                }
                setUser(user)
                setLoading(false)
            })
            .catch((error) => {
                if (!mounted) return
                if (!shouldSilenceError(error, [error.message || ''])) {
                    console.error('Auth error:', error)
                }
                setLoading(false)
            })

        // Listen for auth changes con manejo de errores silencioso
        try {
            const {
                data: { subscription: sub },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                if (!mounted) return
                setUser(session?.user ?? null)
                setLoading(false)
            })
            subscription = sub
        } catch (error) {
            if (!shouldSilenceError(error, [error?.message || ''])) {
                console.error('Auth subscription error:', error)
            }
            setLoading(false)
        }

        return () => {
            mounted = false
            subscription?.unsubscribe()
        }
    }, [])

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            if (!shouldSilenceError(error, [error?.message || ''])) {
                console.error('Sign out error:', error)
            }
        }
    }, [])

    return { user, loading, signOut }
}
