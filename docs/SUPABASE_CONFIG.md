# Configuración de Supabase

## Variables de Entorno

### Para Edge Functions (Deno)

En las Edge Functions de Supabase, las variables están disponibles automáticamente:

```typescript
// Estas variables están disponibles automáticamente en Edge Functions
const supabaseUrl = Deno.env.get('SUPABASE_URL')  // ✅ Disponible automáticamente
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')  // ✅ Disponible automáticamente
```

**No necesitas configurarlas como secrets** - Supabase las proporciona automáticamente.

### Para Scripts Locales (Node.js/TypeScript)

En scripts locales, usa variables de entorno del archivo `.env`:

```typescript
import { config } from 'dotenv'
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY  // Para operaciones públicas
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY  // Para operaciones administrativas
```

### Para Frontend (React/Vite)

En el frontend, usa variables con prefijo `VITE_`:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## Valores Actuales del Proyecto

- **URL**: `https://cfgfshoobuvycrbhnvkd.supabase.co`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc`

## Nota sobre SUPABASE_KEY

Si estás usando `SUPABASE_KEY`, deberías usar:
- `VITE_SUPABASE_ANON_KEY` para el frontend (operaciones públicas)
- `SUPABASE_SERVICE_ROLE_KEY` para scripts y Edge Functions (operaciones administrativas)

