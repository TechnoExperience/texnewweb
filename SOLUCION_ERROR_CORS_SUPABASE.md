# 🔧 Solución: Error CORS y URLs Incorrectas de Supabase

## ❌ Problema Actual

Los errores muestran que las peticiones están yendo a:
```
https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/rest/v1/...
```

Cuando deberían ir a:
```
https://cfgfshoobuvycrbhnvkd.supabase.co/rest/v1/...
```

## ✅ Solución: Corregir Variables de Entorno en Vercel

### Paso 1: Ir a Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **techno-experience**

### Paso 2: Verificar/Corregir Variables de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Busca la variable `VITE_SUPABASE_URL`

#### ❌ VALOR INCORRECTO (actual):
```
https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd
```

#### ✅ VALOR CORRECTO (debe ser):
```
https://cfgfshoobuvycrbhnvkd.supabase.co
```

### Paso 3: Actualizar la Variable

1. Haz clic en **Edit** en la variable `VITE_SUPABASE_URL`
2. **BORRA** el valor actual
3. **PEGA** el valor correcto: `https://cfgfshoobuvycrbhnvkd.supabase.co`
4. **IMPORTANTE**: 
   - ✅ NO agregues `/rest/v1` al final
   - ✅ NO agregues espacios
   - ✅ NO agregues comillas
   - ✅ Asegúrate de que esté seleccionado para **Production**, **Preview** y **Development**
5. Haz clic en **Save**

### Paso 4: Verificar VITE_SUPABASE_ANON_KEY

Asegúrate de que `VITE_SUPABASE_ANON_KEY` tenga el valor correcto:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg
```

### Paso 5: Redesplegar (CRÍTICO)

**IMPORTANTE**: Después de cambiar las variables, DEBES redesplegar:

1. Ve a **Deployments**
2. Haz clic en los **tres puntos (⋯)** del último deployment
3. Selecciona **Redeploy**
4. Espera a que termine (2-3 minutos)

### Paso 6: Verificar

1. Abre tu sitio desplegado: https://techno-experience.vercel.app
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Network** (Red)
4. Recarga la página
5. Busca peticiones a `cfgfshoobuvycrbhnvkd.supabase.co`
6. ✅ Deben aparecer como **200 OK** (no errores CORS)

## 📋 Checklist de Verificación

- [ ] `VITE_SUPABASE_URL` = `https://cfgfshoobuvycrbhnvkd.supabase.co` (sin `/rest/v1`)
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (completo)
- [ ] Ambas variables configuradas para Production, Preview y Development
- [ ] Redesplegado después de cambiar las variables
- [ ] Verificado en Network tab (peticiones exitosas a `.supabase.co`)

## 🔍 Cómo Verificar la URL Correcta

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd
2. Ve a **Settings** → **API**
3. En **Project URL**, verás: `https://cfgfshoobuvycrbhnvkd.supabase.co`
4. **ESA** es la URL que debes usar (no la del dashboard)

## ⚠️ Errores Comunes

1. **Usar la URL del dashboard**: `https://supabase.com/dashboard/project/...` ❌
2. **Agregar `/rest/v1` al final**: `https://xxx.supabase.co/rest/v1` ❌
3. **Agregar espacios o comillas**: `"https://xxx.supabase.co"` ❌
4. **No redesplegar después de cambiar variables** ❌

## ✅ URL Correcta vs Incorrecta

| ❌ Incorrecto | ✅ Correcto |
|--------------|------------|
| `https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd` | `https://cfgfshoobuvycrbhnvkd.supabase.co` |
| `https://cfgfshoobuvycrbhnvkd.supabase.co/rest/v1` | `https://cfgfshoobuvycrbhnvkd.supabase.co` |
| `https://cfgfshoobuvycrbhnvkd.supabase.co/` | `https://cfgfshoobuvycrbhnvkd.supabase.co` |

---

**Dashboard de Supabase:** https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd

