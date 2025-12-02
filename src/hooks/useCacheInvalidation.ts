import { useCallback, useEffect } from "react"

// Cache global para invalidación
const cacheInvalidationListeners = new Map<string, Set<() => void>>()

export function useCacheInvalidation() {
  // Escuchar eventos de invalidación desde CMS
  useEffect(() => {
    const handleCacheInvalidate = (event: CustomEvent<{ table: string }>) => {
      const { table } = event.detail
      console.log(`[Cache] Evento de invalidación recibido para: ${table}`)
      const listeners = cacheInvalidationListeners.get(table)
      if (listeners) {
        listeners.forEach((listener) => listener())
      }
    }

    window.addEventListener("cache-invalidate", handleCacheInvalidate as EventListener)
    
    return () => {
      window.removeEventListener("cache-invalidate", handleCacheInvalidate as EventListener)
    }
  }, [])

  const invalidateCache = useCallback((table: string) => {
    console.log(`[Cache] Invalidando cache para tabla: ${table}`)
    const listeners = cacheInvalidationListeners.get(table)
    if (listeners) {
      listeners.forEach((listener) => listener())
    }
    // También invalidar todas las tablas relacionadas
    if (table === "news") {
      cacheInvalidationListeners.get("news")?.forEach((listener) => listener())
    }
  }, [])

  const registerInvalidationListener = useCallback(
    (table: string, callback: () => void) => {
      if (!cacheInvalidationListeners.has(table)) {
        cacheInvalidationListeners.set(table, new Set())
      }
      cacheInvalidationListeners.get(table)!.add(callback)

      return () => {
        cacheInvalidationListeners.get(table)?.delete(callback)
      }
    },
    []
  )

  return { invalidateCache, registerInvalidationListener }
}

