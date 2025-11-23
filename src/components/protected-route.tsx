"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [requireAdmin])

  async function checkAuth() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      if (requireAdmin) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        setAuthorized(profile?.role === "admin" || profile?.role === "editor")
      } else {
        setAuthorized(true)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}
