import { createClient } from "@supabase/supabase-js"

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar y corregir URL de Supabase si es necesario
if (supabaseUrl) {
  // Si la URL contiene 'supabase.com/dashboard', es incorrecta
  if (supabaseUrl.includes('supabase.com/dashboard')) {
    console.error("❌ URL de Supabase incorrecta detectada")
    if (import.meta.env.DEV) {
      console.error("💡 La URL debe ser: https://[project-id].supabase.co")
    }
    // Extraer el project ID de la URL incorrecta
    const projectIdMatch = supabaseUrl.match(/project\/([^\/]+)/)
    if (projectIdMatch) {
      const projectId = projectIdMatch[1]
      supabaseUrl = `https://${projectId}.supabase.co`
      if (import.meta.env.DEV) {
        console.warn("⚠️ URL corregida automáticamente")
      }
    }
  }
  
  // Limpiar la URL: remover trailing slash y /rest/v1 si existe
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1.*$/, '').replace(/\/$/, '')
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = import.meta.env.PROD
    ? "Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables."
    : "Missing Supabase environment variables. Please check .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  
  console.error("❌ Supabase Configuration Error:", errorMessage)
  // NO mostrar valores sensibles en consola en producción
  if (import.meta.env.DEV) {
    console.error("📋 Current environment:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
      env: import.meta.env.MODE,
    })
  }
  
  throw new Error(errorMessage)
}

// Validar formato de URL
if (!supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
  console.error("❌ Formato de URL de Supabase incorrecto:", supabaseUrl)
  console.error("✅ Formato correcto: https://[project-id].supabase.co")
  console.error("💡 Ejemplo: https://cfgfshoobuvycrbhnvkd.supabase.co")
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

