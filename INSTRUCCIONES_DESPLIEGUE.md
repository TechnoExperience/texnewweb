# 🚀 Instrucciones de Despliegue - Techno Experience

## 📋 Pre-requisitos

1. **Cuenta en Vercel**: [https://vercel.com](https://vercel.com)
2. **Cuenta en Supabase**: [https://supabase.com](https://supabase.com)
3. **Repositorio Git**: GitHub, GitLab o Bitbucket

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

**Obtén estos valores desde:**
- Supabase Dashboard → Settings → API
- `URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 2. Ejecutar Migraciones SQL

Antes del despliegue, asegúrate de ejecutar todas las migraciones SQL en tu base de datos Supabase:

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el archivo `EJECUTAR_MIGRACIONES.sql` o cada migración individualmente desde `supabase/migrations/`

**Migraciones importantes:**
- `00027_editor_role_and_verification.sql` - Sistema de roles y verificación
- `00028_add_username_and_fix_queries.sql` - Sistema de usuarios
- `00029_comments_system.sql` - Sistema de comentarios
- `00030_favorites_system.sql` - Sistema de favoritos
- `00031_complete_editor_rls.sql` - Políticas RLS para editores

---

## 🌐 Despliegue en Vercel

### Opción 1: Despliegue desde Git (Recomendado)

1. **Conectar Repositorio:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click en "Add New Project"
   - Conecta tu repositorio Git (GitHub/GitLab/Bitbucket)
   - Selecciona el repositorio del proyecto

2. **Configurar Proyecto:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build` (ya configurado en `vercel.json`)
   - **Output Directory**: `dist` (ya configurado en `vercel.json`)
   - **Install Command**: `npm install` (o `pnpm install` si usas pnpm)

3. **Variables de Entorno:**
   - En la sección "Environment Variables", agrega:
     - `VITE_SUPABASE_URL` = tu URL de Supabase
     - `VITE_SUPABASE_ANON_KEY` = tu clave anónima de Supabase
   - **IMPORTANTE**: Marca estas variables como disponibles para:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Desplegar:**
   - Click en "Deploy"
   - Vercel construirá y desplegará automáticamente
   - Una vez completado, obtendrás una URL de producción

### Opción 2: Despliegue desde CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Desplegar:**
   ```bash
   vercel
   ```
   
   - Sigue las instrucciones interactivas
   - Cuando pregunte por las variables de entorno, ingrésalas

4. **Desplegar a Producción:**
   ```bash
   vercel --prod
   ```

---

## 🔐 Configuración de Seguridad

### Headers de Seguridad

El archivo `vercel.json` ya incluye headers de seguridad:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS en Supabase

Asegúrate de configurar los dominios permitidos en Supabase:

1. Ve a Supabase Dashboard → Settings → API
2. En "CORS Origins", agrega:
   - `https://tu-dominio.vercel.app`
   - `https://tu-dominio.com` (si tienes dominio personalizado)

---

## 📝 Post-Despliegue

### 1. Verificar Funcionalidades

- [ ] Login/Registro funciona
- [ ] Las páginas cargan correctamente
- [ ] Las imágenes se muestran
- [ ] Las consultas a Supabase funcionan
- [ ] El sistema de comentarios funciona
- [ ] Los favoritos funcionan

### 2. Configurar Dominio Personalizado (Opcional)

1. En Vercel Dashboard → Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de DNS

### 3. Configurar Analytics (Opcional)

El proyecto ya incluye `@vercel/analytics`. Para activarlo:

1. En Vercel Dashboard → Settings → Analytics
2. Activa "Web Analytics"

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas `git push` a la rama principal:
- Vercel detectará los cambios automáticamente
- Construirá una nueva versión
- Desplegará automáticamente (si está configurado)

Para preview deployments:
- Cada pull request generará un preview deployment
- Útil para testing antes de producción

---

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"

**Solución:**
- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de que los nombres sean exactos: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Error: "Build failed"

**Solución:**
- Revisa los logs de build en Vercel Dashboard
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el comando `npm run build` funcione localmente

### Error: "CORS policy"

**Solución:**
- Agrega tu dominio de Vercel a los CORS Origins en Supabase
- Verifica que las políticas RLS en Supabase estén correctamente configuradas

### Error: "404 Not Found" en rutas

**Solución:**
- El archivo `vercel.json` ya incluye rewrites para SPA
- Si persiste, verifica que el `outputDirectory` sea `dist`

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vite](https://vitejs.dev/)

---

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas en Vercel
- [ ] Migraciones SQL ejecutadas en Supabase
- [ ] CORS configurado en Supabase
- [ ] Build exitoso en Vercel
- [ ] Dominio personalizado configurado (opcional)
- [ ] Analytics activado (opcional)
- [ ] Funcionalidades verificadas en producción

---

**¡Listo para desplegar! 🚀**

