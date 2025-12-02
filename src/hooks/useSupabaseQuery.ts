import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"

interface UseSupabaseQueryResult<T> {
    data: T[]
    loading: boolean
    error: Error | null
    refetch: () => void
}

// Cache simple para evitar múltiples requests simultáneos a la misma tabla
const queryCache = new Map<string, { data: any[]; timestamp: number; promise?: Promise<any> }>()
const CACHE_DURATION = 30000 // 30 segundos

export function useSupabaseQuery<T>(
    table: string,
    queryFn?: (query: any) => any
): UseSupabaseQueryResult<T> {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const isMountedRef = useRef(true)
    const queryFnRef = useRef(queryFn)
    const cacheKeyRef = useRef<string>('')

    // Update queryFn ref when it changes
    useEffect(() => {
        queryFnRef.current = queryFn
    }, [queryFn])

    // Generar cache key basado en tabla
    // Nota: No podemos usar queryFn en el key porque cambia en cada render
    // En su lugar, usamos solo la tabla y confiamos en que las queries similares compartan cache
    useEffect(() => {
        cacheKeyRef.current = `${table}_${queryFn ? 'custom' : 'default'}`
    }, [table, queryFn])

    const fetchData = useCallback(async () => {
        if (!isMountedRef.current) {
            setLoading(false)
            return
        }

        const cacheKey = cacheKeyRef.current
        const cached = queryCache.get(cacheKey)
        const now = Date.now()

        // Usar cache si existe y no ha expirado
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            if (isMountedRef.current) {
                setData(cached.data as T[])
                setLoading(false)
                setError(null)
            }
            return
        }

        // Si hay una petición en curso, esperarla
        if (cached?.promise) {
            try {
                const result = await cached.promise
                if (isMountedRef.current) {
                    setData(result as T[])
                    setLoading(false)
                    setError(null)
                }
                return
            } catch (err) {
                // Continuar con la petición normal si falla el cache
            }
        }

        try {
            setLoading(true)
            setError(null)

            let query = supabase.from(table).select("*")

            if (queryFnRef.current) {
                query = queryFnRef.current(query)
            }

            // Crear promise y guardarla en cache para evitar duplicados
            const queryPromise = query
            queryCache.set(cacheKey, { 
                data: [], 
                timestamp: now, 
                promise: Promise.resolve(queryPromise.then(r => r.data || [])) 
            })

            const { data: result, error: queryError } = await queryPromise

            // Actualizar cache con resultado
            if (result) {
                queryCache.set(cacheKey, { data: result, timestamp: Date.now() })
            }

            // Siempre establecer loading a false, incluso si el componente se desmontó
            if (!isMountedRef.current) {
                setLoading(false)
                return
            }

            if (queryError) {
                // Verificar si es un error de red
                const isNetworkError = queryError.message?.includes('Failed to fetch') || 
                                       queryError.message?.includes('ERR_PROXY_CONNECTION_FAILED') ||
                                       queryError.message?.includes('network') ||
                                       queryError.code === 'PGRST116' // No rows returned
                
                // Verificar si es un error de RLS (Row Level Security)
                const isRLSError = queryError.code === '42501' || 
                                 queryError.message?.includes('permission denied') ||
                                 queryError.message?.includes('row-level security')
                
                // Verificar si es un error de tabla no encontrada
                const isTableError = queryError.code === '42P01' ||
                                   queryError.message?.includes('does not exist') ||
                                   queryError.message?.includes('relation')
                
                if (isRLSError) {
                    console.error(`[useSupabaseQuery] 🔒 RLS Policy Error for table ${table}:`, {
                        code: queryError.code,
                        message: queryError.message,
                        hint: queryError.hint,
                        details: queryError.details
                    })
                    console.error(`[useSupabaseQuery] 💡 Tip: Check RLS policies for table '${table}' in Supabase dashboard`)
                } else if (isTableError) {
                    console.error(`[useSupabaseQuery] 📋 Table Error for ${table}:`, {
                        code: queryError.code,
                        message: queryError.message,
                        hint: 'Table might not exist or name is incorrect'
                    })
                } else if (isNetworkError) {
                    // Para errores de red, intentar usar cache si existe
                    if (cached && cached.data.length > 0) {
                        setData(cached.data as T[])
                        setError(null)
                    } else {
                        console.warn(`[useSupabaseQuery] 🌐 Network error fetching from ${table}, returning empty data:`, queryError.message)
                        setError(queryError as Error)
                        setData([])
                    }
                } else {
                    console.error(`[useSupabaseQuery] ❌ Error fetching from ${table}:`, {
                        code: queryError.code,
                        message: queryError.message,
                        details: queryError.details,
                        hint: queryError.hint
                    })
                setError(queryError as Error)
                setData([])
                }
                setLoading(false)
            } else {
                setData(result || [])
                setLoading(false)
                setError(null)
            }
        } catch (err: any) {
            // Limpiar promise del cache en caso de error
            const cached = queryCache.get(cacheKey)
            if (cached) {
                queryCache.set(cacheKey, { data: cached.data, timestamp: cached.timestamp })
            }

            // Siempre establecer loading a false en caso de error
            if (!isMountedRef.current) {
                setLoading(false)
                return
            }
            
            // Detectar errores de red/proxy
            const isNetworkError = err?.message?.includes('Failed to fetch') || 
                                   err?.message?.includes('timeout') ||
                                   err?.name === 'TypeError' ||
                                   err?.code === 'ERR_PROXY_CONNECTION_FAILED' ||
                                   err?.message?.includes('ERR_PROXY_CONNECTION_FAILED') ||
                                   err?.message?.includes('network')
            
            if (isNetworkError) {
                // Intentar usar cache si existe
                const cached = queryCache.get(cacheKey)
                if (cached && cached.data.length > 0) {
                    setData(cached.data as T[])
                    setError(null)
                } else {
                    console.warn(`[useSupabaseQuery] Network error fetching from ${table}, returning empty data:`, err.message || err)
                    setError(err as Error)
                    setData([])
                }
            } else {
            console.error(`[useSupabaseQuery] Exception fetching from ${table}:`, err)
            setError(err as Error)
            setData([])
            }
            setLoading(false)
        }
    }, [table])

    useEffect(() => {
        isMountedRef.current = true
        fetchData()

        return () => {
            isMountedRef.current = false
        }
    }, [fetchData])

    const refetch = useCallback(() => {
        // Limpiar cache al refetch
        queryCache.delete(cacheKeyRef.current)
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch }
}
