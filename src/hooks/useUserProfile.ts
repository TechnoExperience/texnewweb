import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseQuerySingle } from "@/hooks/useSupabaseQuerySingle"
import { TABLES } from "@/constants/tables"
import type { UserProfile } from "@/types"
import { useCallback } from "react"

export function useUserProfile() {
  const { user } = useAuth()
  
  const profileQuery = useCallback(
    (query: any) => query.eq("id", user?.id || ""),
    [user?.id]
  )

  const { data: profile, loading } = useSupabaseQuerySingle<UserProfile>(
    TABLES.PROFILES,
    profileQuery,
    { enabled: !!user }
  )

  const isAdmin = profile?.role === "admin"
  const isEditor = profile?.role === "editor"
  const isUser = profile?.role === "user"

  return {
    profile,
    loading,
    isAdmin,
    isEditor,
    isUser,
    userId: user?.id,
  }
}

