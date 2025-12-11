# 🔐 Configurar Variables de Entorno en Vercel

## 📋 Variables Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar estas variables de entorno:

### Variables de Supabase

```
VITE_SUPABASE_URL=https://cfgfshoobuvycrbhnvkd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg
```

## 🚀 Pasos para Configurar en Vercel

### 1. Acceder a la Configuración del Proyecto

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### 2. Agregar Variables

Para cada variable:

1. Click en **"Add New"**
2. Ingresa el **Name** (ejemplo: `VITE_SUPABASE_URL`)
3. Ingresa el **Value** (el valor correspondiente)
4. **IMPORTANTE:** Marca los checkboxes para:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Click en **"Save"**

### 3. Variables a Configurar

#### Variable 1: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://cfgfshoobuvycrbhnvkd.supabase.co`
- **Ambientes:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg`
- **Ambientes:** ✅ Production, ✅ Preview, ✅ Development

## ⚠️ Importante

### Después de Agregar Variables

1. **Redeploy necesario:** Después de agregar/modificar variables, necesitas hacer un nuevo deployment
2. **Verificar:** Las variables solo estarán disponibles en nuevos deployments, no en los existentes

### Para Aplicar las Variables

**Opción A: Desde Dashboard**
1. Ve a **Deployments**
2. Click en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Marca **"Use existing Build Cache"** (opcional)
5. Click en **"Redeploy"**

**Opción B: Nuevo Deployment**
- Haz un nuevo push al repositorio
- O crea un nuevo deployment manualmente

## ✅ Verificación

Después del redeploy, verifica:

1. **El sitio carga correctamente**
2. **No hay errores en la consola del navegador**
3. **Las consultas a Supabase funcionan:**
   - Los eventos se cargan
   - Las noticias se cargan
   - El login funciona

## 🔒 Seguridad

- ✅ Estas son las credenciales **ANON** (públicas), seguras para el frontend
- ✅ **NO** compartas la `SERVICE_ROLE_KEY` en el frontend
- ✅ Las variables están encriptadas en Vercel
- ✅ Solo accesibles durante el build y runtime

## 📝 Notas

- Las variables con prefijo `VITE_` son expuestas al cliente
- Son necesarias para que el frontend se conecte a Supabase
- Estas credenciales son públicas por diseño (anon key)

---

**¿Problemas?** Si después de configurar las variables el sitio no funciona:
1. Verifica que los nombres sean exactos (case-sensitive)
2. Asegúrate de hacer un redeploy después de agregar variables
3. Revisa los logs de build en Vercel Dashboard
