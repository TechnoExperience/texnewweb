import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

interface UseSupabaseQuerySingleResult<T> {
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => void
}

export function useSupabaseQuerySingle<T>(
    table: string,
    queryFn?: (query: any) => any,
    options: { enabled?: boolean } = {}
): UseSupabaseQuerySingleResult<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const isMountedRef = useRef(true)
    const hasFetchedRef = useRef(false)

    useEffect(() => {
        isMountedRef.current = true

        // Only fetch once per mount
        if (hasFetchedRef.current || options.enabled === false) {
            return
        }
        hasFetchedRef.current = true

        async function fetchData() {
            try {
                setLoading(true)
                setError(null)

                let query = supabase.from(table).select("*")

                if (queryFn) {
                    query = queryFn(query)
                }

                const { data: result, error: queryError } = await query.single()

                if (!isMountedRef.current) {
                    setLoading(false)
                    return
                }

                if (queryError) {
                    // Verificar si es un error de red o "no rows"
                    const isNetworkError = queryError.message?.includes('Failed to fetch') || 
                                           queryError.message?.includes('ERR_PROXY_CONNECTION_FAILED') ||
                                           queryError.message?.includes('network')
                    const isNoRows = queryError.code === 'PGRST116'
                    
                    if (isNetworkError) {
                        console.warn(`[useSupabaseQuerySingle] Network error fetching from ${table}:`, queryError.message)
                    } else if (!isNoRows) {
                    console.error(`[useSupabaseQuerySingle] Error fetching from ${table}:`, queryError)
                    }
                    setError(queryError as Error)
                    setData(null)
                    setLoading(false)
                } else {
                    setData(result)
                    setLoading(false)
                    setError(null)
                }
            } catch (err: any) {
                if (!isMountedRef.current) {
                    setLoading(false)
                    return
                }
                
                // Detectar errores de red
                const isNetworkError = err?.message?.includes('Failed to fetch') || 
                                       err?.message?.includes('timeout') ||
                                       err?.name === 'TypeError' ||
                                       err?.code === 'ERR_PROXY_CONNECTION_FAILED' ||
                                       err?.message?.includes('ERR_PROXY_CONNECTION_FAILED')
                
                if (isNetworkError) {
                    console.warn(`[useSupabaseQuerySingle] Network error fetching from ${table}:`, err.message || err)
                } else {
                console.error(`[useSupabaseQuerySingle] Exception fetching from ${table}:`, err)
                }
                setError(err as Error)
                setData(null)
                    setLoading(false)
            }
        }

        fetchData()

        return () => {
            isMountedRef.current = false
        }
    }, [options.enabled])

    const refetch = () => {
        hasFetchedRef.current = false
        setLoading(true)
    }

    return { data, loading, error, refetch }
}
