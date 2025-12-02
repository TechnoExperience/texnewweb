import { supabase } from "./supabase"

// Función para invalidar cache después de guardar en CMS
export async function invalidateCacheAfterSave(table: string) {
  // Emitir evento de invalidación (usado por useCacheInvalidation)
  const event = new CustomEvent("cache-invalidate", { detail: { table } })
  window.dispatchEvent(event)
  
  // También limpiar cache local si existe
  if (typeof window !== "undefined" && (window as any).queryCache) {
    // El cache se invalidará automáticamente a través de los listeners
    console.log(`[CMS Sync] Cache invalidado para tabla: ${table}`)
  }
}

// Función helper para guardar en CMS y sincronizar con frontend
export async function saveToCMS<T>(
  table: string,
  data: Partial<T>,
  id?: string
): Promise<{ success: boolean; data?: T; error?: Error }> {
  try {
    let result
    
    if (id) {
      // Update
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select()
        .single()
      
      if (error) throw error
      result = updatedData
    } else {
      // Insert
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      result = insertedData
    }

    // Invalidar cache para que el frontend se actualice
    await invalidateCacheAfterSave(table)

    return { success: true, data: result as T }
  } catch (error: any) {
    console.error(`[CMS Sync] Error guardando en ${table}:`, error)
    return { success: false, error }
  }
}

// Función para eliminar y sincronizar
export async function deleteFromCMS(
  table: string,
  id: string
): Promise<{ success: boolean; error?: Error }> {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id)
    
    if (error) throw error

    // Invalidar cache
    await invalidateCacheAfterSave(table)

    return { success: true }
  } catch (error: any) {
    console.error(`[CMS Sync] Error eliminando de ${table}:`, error)
    return { success: false, error }
  }
}

