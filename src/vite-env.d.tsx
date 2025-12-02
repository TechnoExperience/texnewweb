/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.json" {
  const value: Record<string, string>
  export default value
}

// Add Node.js Error.captureStackTrace for better error tracking
interface ErrorConstructor {
  captureStackTrace?(target: object, constructor?: Function): void
}
