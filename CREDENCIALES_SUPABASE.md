# 🔐 Credenciales de Supabase - Configuración para Vercel

## ✅ Credenciales Confirmadas

### 1. VITE_SUPABASE_URL
```
https://cfgfshoobuvycrbhnvkd.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg
```

## 🚀 Pasos para Configurar en Vercel

### Paso 1: Ir a Vercel
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **TechnoExperience**

### Paso 2: Agregar Variables de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Haz clic en **Add New**

#### Variable 1: VITE_SUPABASE_URL
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://cfgfshoobuvycrbhnvkd.supabase.co`
- **Environments:** 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Haz clic en **Save**

#### Variable 2: VITE_SUPABASE_ANON_KEY
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg`
- **Environments:**
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Haz clic en **Save**

### Paso 3: Redesplegar (IMPORTANTE)

**CRÍTICO:** Después de agregar las variables, DEBES redesplegar:

1. Ve a **Deployments**
2. Haz clic en los **tres puntos (⋯)** del último deployment
3. Selecciona **Redeploy**
4. Espera a que termine (2-3 minutos)

### Paso 4: Verificar

1. Abre tu sitio desplegado en Vercel
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. ✅ NO debe aparecer: "Missing Supabase environment variables"
5. ✅ La página debe cargar normalmente

## ⚠️ Importante

- **NO agregues espacios** al copiar los valores
- **NO agregues comillas** alrededor de los valores
- **Asegúrate** de seleccionar **todos los ambientes** (Production, Preview, Development)
- **SIEMPRE redesplega** después de agregar/modificar variables

## ✅ Checklist Final

- [ ] Variable `VITE_SUPABASE_URL` agregada
- [ ] Variable `VITE_SUPABASE_ANON_KEY` agregada
- [ ] Ambas configuradas para Production, Preview y Development
- [ ] Redesplegado después de agregar variables
- [ ] Verificado en la consola del navegador (sin errores)

---

**Dashboard de Supabase:** https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd

