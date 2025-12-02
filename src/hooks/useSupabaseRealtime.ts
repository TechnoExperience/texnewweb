import { useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"

interface UseSupabaseRealtimeOptions {
  table: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  filter?: string // Ejemplo: "status=eq.PUBLISHED"
  enabled?: boolean
}

export function useSupabaseRealtime({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter,
  enabled = true,
}: UseSupabaseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete })

  // Actualizar callbacks cuando cambian
  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate, onDelete }
  }, [onInsert, onUpdate, onDelete])

  useEffect(() => {
    if (!enabled) return

    // Crear canal de Realtime
    const channelName = `realtime:${table}${filter ? `:${filter}` : ""}`
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`[Realtime] INSERT en ${table}:`, payload.new)
          callbacksRef.current.onInsert?.(payload)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`[Realtime] UPDATE en ${table}:`, payload.new)
          callbacksRef.current.onUpdate?.(payload)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`[Realtime] DELETE en ${table}:`, payload.old)
          callbacksRef.current.onDelete?.(payload)
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Suscrito a ${table}`)
        } else if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Error en canal ${table}`)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, filter, enabled])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  return { unsubscribe }
}

