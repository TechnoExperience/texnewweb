# ✅ Verificación para Producción - Checklist Completo

## 🔍 Verificación de Variables de Entorno en Vercel

### Paso 1: Verificar que las variables estén configuradas

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Verifica que existan estas variables:

   ✅ **VITE_SUPABASE_URL**
   - Debe tener el formato: `https://xxxxx.supabase.co`
   - NO debe terminar con `/`

   ✅ **VITE_SUPABASE_ANON_KEY**
   - Debe ser una cadena larga (clave pública)
   - Empieza con `eyJ...`

### Paso 2: Verificar que estén en todos los ambientes

Cada variable debe estar configurada para:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### Paso 3: Verificar los valores

**IMPORTANTE:** Asegúrate de que:
- La URL NO tenga espacios al inicio o final
- La clave NO tenga espacios al inicio o final
- Ambas estén correctamente copiadas desde Supabase

## 🔄 Redesplegar después de agregar variables

**CRÍTICO:** Después de agregar/modificar variables:

1. Ve a **Deployments**
2. Haz clic en los **tres puntos (⋯)** del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo commit y push

## 🧪 Verificar que funciona

Después del despliegue, verifica en la consola del navegador:

1. Abre tu sitio en Vercel
2. Abre las **DevTools** (F12)
3. Ve a la pestaña **Console**
4. NO debe aparecer el error de variables faltantes
5. La aplicación debe cargar correctamente

## 🔧 Si sigue sin funcionar

### Opción 1: Verificar desde Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ver variables configuradas
vercel env ls

# Si faltan, agregarlas
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Opción 2: Verificar en el build log

1. Ve a **Deployments** en Vercel
2. Haz clic en el último deployment
3. Revisa el **Build Log**
4. Busca si hay errores relacionados con variables de entorno

### Opción 3: Verificar formato de variables

Asegúrate de que:
- ✅ `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co` (sin comillas, sin espacios)
- ✅ `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (sin comillas, sin espacios)

## 📋 Checklist Final

- [ ] Variables agregadas en Vercel
- [ ] Variables configuradas para Production, Preview y Development
- [ ] Valores copiados correctamente (sin espacios)
- [ ] Redesplegado después de agregar variables
- [ ] Verificado en la consola del navegador (sin errores)
- [ ] La aplicación carga correctamente

## 🆘 Si nada funciona

1. **Elimina y vuelve a agregar las variables** en Vercel
2. **Redesplega** manualmente
3. **Limpia la caché** del navegador (Ctrl+Shift+R)
4. Verifica que las credenciales de Supabase sean correctas

---

## 📝 Notas Importantes

- Las variables que empiezan con `VITE_` se exponen en el cliente (esto es normal y seguro para estas variables)
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son públicas por diseño
- NO uses `SUPABASE_SERVICE_ROLE_KEY` en el cliente (solo en servidor)

