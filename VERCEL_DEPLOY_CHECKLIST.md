# ✅ Checklist Pre-Despliegue Vercel

## Antes de Desplegar

### 📦 Repositorio Git
- [ ] Todos los cambios están commiteados
- [ ] El código está pusheado a GitHub/GitLab/Bitbucket
- [ ] No hay archivos sensibles en el repositorio (.env, etc.)

### 🔧 Configuración Local
- [ ] El build funciona localmente (`npm run build`)
- [ ] No hay errores de TypeScript críticos
- [ ] Las dependencias están actualizadas

### 🗄️ Base de Datos
- [ ] Las migraciones SQL están ejecutadas en Supabase
- [ ] Los eventos de prueba están creados (opcional)
- [ ] Las políticas RLS están configuradas

### 🔐 Variables de Entorno
- [ ] Tienes `VITE_SUPABASE_URL` de Supabase
- [ ] Tienes `VITE_SUPABASE_ANON_KEY` de Supabase
- [ ] Estas variables están listas para agregar en Vercel

### 📝 Archivos de Configuración
- [ ] `vercel.json` está configurado correctamente
- [ ] `.gitignore` incluye `.env` y archivos sensibles
- [ ] `package.json` tiene el script `build`

## Durante el Despliegue

### 🌐 Vercel
- [ ] Repositorio conectado correctamente
- [ ] Framework detectado como "Vite"
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Variables de entorno agregadas:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Variables marcadas para Production, Preview y Development

## Después del Despliegue

### ✅ Verificación
- [ ] El sitio carga sin errores
- [ ] Las rutas funcionan correctamente (SPA)
- [ ] Las imágenes se cargan
- [ ] El login/registro funciona
- [ ] Las consultas a Supabase funcionan
- [ ] Los eventos se muestran
- [ ] Las noticias se cargan
- [ ] El footer con suscripción aparece

### 🔒 Seguridad
- [ ] CORS configurado en Supabase con el dominio de Vercel
- [ ] Headers de seguridad funcionando (verificado en vercel.json)
- [ ] No hay información sensible expuesta

### 📊 Monitoreo
- [ ] Analytics activado (opcional)
- [ ] Logs revisados en Vercel Dashboard
- [ ] Performance verificado

---

**Estado:** ⏳ Listo para desplegar

