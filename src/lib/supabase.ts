import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = import.meta.env.PROD
    ? "Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables."
    : "Missing Supabase environment variables. Please check .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  
  console.error("❌ Supabase Configuration Error:", errorMessage)
  console.error("📋 Current environment:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    env: import.meta.env.MODE,
  })
  
  throw new Error(errorMessage)
}

// Configuración optimizada del cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Reducir intentos de refresh cuando hay problemas de conexión
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',
  },
  global: {
    // Headers personalizados
    headers: {
      'x-client-info': 'techno-experience-web',
    },
    // Timeout más corto para evitar esperas largas
    fetch: (url, options = {}) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId)
          return response
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          // Silenciar errores de red/proxy en desarrollo
          if (import.meta.env.DEV && (error.name === 'AbortError' || error.message?.includes('proxy') || error.message?.includes('Failed to fetch'))) {
            // No loggear errores de conexión en desarrollo
            return Promise.reject(error)
          }
          throw error
        })
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

