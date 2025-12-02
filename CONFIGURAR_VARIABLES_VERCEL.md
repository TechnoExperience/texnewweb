# 🔧 Configurar Variables de Entorno en Vercel

## ⚠️ Error Actual
```
Missing Supabase environment variables. Please check .env file and ensure 
VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
```

## 📋 Variables de Entorno Requeridas

Necesitas configurar las siguientes variables de entorno en Vercel:

### Variables Obligatorias:
1. **`VITE_SUPABASE_URL`**
   - Tu URL de Supabase (ej: `https://xxxxx.supabase.co`)
   - Se encuentra en: Supabase Dashboard → Settings → API → Project URL

2. **`VITE_SUPABASE_ANON_KEY`**
   - Tu clave anónima de Supabase
   - Se encuentra en: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### Variables Opcionales (si las usas):
- `VITE_APP_URL` - URL de tu aplicación
- `SUPABASE_SERVICE_ROLE_KEY` - Solo si usas funciones de servidor (NO exponer en cliente)

## 🚀 Pasos para Configurar en Vercel

### Opción 1: Desde el Dashboard de Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **Settings** (Configuración)
3. Ve a **Environment Variables** (Variables de Entorno)
4. Agrega cada variable:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Tu URL de Supabase
   - **Environment**: Production, Preview, Development (selecciona todos)
   - Haz clic en **Save**
5. Repite para `VITE_SUPABASE_ANON_KEY`

### Opción 2: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Configurar variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

## ✅ Verificar Configuración

Después de agregar las variables:

1. **Redesplegar** el proyecto en Vercel
   - Ve a **Deployments**
   - Haz clic en los tres puntos (⋯) del último deployment
   - Selecciona **Redeploy**

2. O espera a que Vercel detecte el nuevo commit y despliegue automáticamente

## 🔒 Seguridad

- ✅ **SÍ exponer** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (son públicas)
- ❌ **NO exponer** `SUPABASE_SERVICE_ROLE_KEY` (solo para servidor)
- Las variables que empiezan con `VITE_` se exponen en el cliente

## 📝 Nota

Las variables de entorno deben estar configuradas **antes** del despliegue. Si ya desplegaste sin ellas, necesitas:
1. Agregar las variables
2. Redesplegar manualmente

---

**¿Dónde encontrar tus credenciales de Supabase?**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia **Project URL** y **anon public** key

