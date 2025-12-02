# 🚀 Solución Rápida - Variables de Entorno en Vercel

## ⚡ Pasos Rápidos (5 minutos)

### 1. Obtener tus credenciales de Supabase

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a: **Settings** → **API**
4. Copia estos dos valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (una cadena larga que empieza con `eyJ...`)

### 2. Agregar en Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **TechnoExperience**
3. Ve a: **Settings** → **Environment Variables**
4. Haz clic en **Add New**

#### Variable 1:
- **Key:** `VITE_SUPABASE_URL`
- **Value:** Pega la **Project URL** que copiaste
- **Environments:** ✅ Production ✅ Preview ✅ Development
- **Save**

#### Variable 2:
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Pega la **anon public** key que copiaste
- **Environments:** ✅ Production ✅ Preview ✅ Development
- **Save**

### 3. Redesplegar

1. Ve a **Deployments**
2. Haz clic en los **tres puntos (⋯)** del último deployment
3. Selecciona **Redeploy**
4. Espera a que termine (2-3 minutos)

### 4. Verificar

1. Abre tu sitio desplegado
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. ✅ NO debe aparecer el error de variables faltantes
5. ✅ La página debe cargar normalmente

## ✅ Listo!

Si después de estos pasos sigue sin funcionar, revisa:
- Que los valores NO tengan espacios al inicio/final
- Que estén configuradas para **todos los ambientes**
- Que hayas hecho **Redeploy** después de agregarlas

