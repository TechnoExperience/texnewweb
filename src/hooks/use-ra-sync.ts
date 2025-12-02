// NOTE: Este hook requiere @tanstack/react-query que no está instalado
// Comentado temporalmente hasta que se instale la dependencia o se implemente sin ella
/*
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'

export function useDraftEvents() {
    return useQuery({
        queryKey: ['events', 'draft'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('status', 'draft')
                .eq('source', 'resident_advisor')
                .order('event_date', { ascending: true })

            if (error) throw error
            return data as Event[]
        },
        staleTime: 30 * 1000 // 30 seconds
    })
}

export function usePublishEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (eventId: string) => {
            const { error } = await supabase
                .from('events')
                .update({ status: 'published' })
                .eq('id', eventId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', 'draft'] })
            queryClient.invalidateQueries({ queryKey: ['events'] })
        }
    })
}

export function useRejectEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (eventId: string) => {
            const { error } = await supabase
                .from('events')
                .update({ status: 'cancelled' })
                .eq('id', eventId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', 'draft'] })
        }
    })
}

export function useSyncStats() {
    return useQuery({
        queryKey: ['sync-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sync_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            return data
        },
        refetchInterval: 60 * 1000 // Refresh every minute
    })
}
*/
