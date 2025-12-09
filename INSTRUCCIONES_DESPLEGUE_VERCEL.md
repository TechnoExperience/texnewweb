# 🚀 Instrucciones para Desplegar en Vercel

## ✅ Cambios Subidos

Los cambios han sido subidos al repositorio en la rama `2025-12-09-v1jv-2971a`.

**Commit:** `c3bbf21` - "feat: Unificar y optimizar valores de status en todas las tablas"

## 📋 Opciones de Despliegue

### Opción 1: Auto-Deploy (Si está configurado)

Si Vercel está conectado al repositorio con auto-deploy activado:

1. **Vercel detectará automáticamente el push**
2. **Iniciará el build automáticamente**
3. **Desplegará cuando termine**

**Verifica el estado:**
- Ve a: https://vercel.com/dashboard
- Busca tu proyecto
- Revisa la pestaña "Deployments"
- Deberías ver un nuevo deployment en progreso

### Opción 2: Despliegue Manual desde Dashboard

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto

2. **Crea un nuevo deployment:**
   - Click en "Deployments" → "Create Deployment"
   - Selecciona la rama: `2025-12-09-v1jv-2971a`
   - Click en "Deploy"

### Opción 3: Despliegue desde CLI

```bash
# Si tienes Vercel CLI instalado
vercel --prod

# O para un preview
vercel
```

## 🔍 Verificar Variables de Entorno

Antes del despliegue, asegúrate de que estas variables estén configuradas en Vercel:

**Settings → Environment Variables:**

```
VITE_SUPABASE_URL = https://cfgfshoobuvycrbhnvkd.supabase.co
VITE_SUPABASE_ANON_KEY = tu_clave_anonima
```

**Importante:** Marca para:
- ✅ Production
- ✅ Preview
- ✅ Development

## 📦 Cambios Incluidos en este Despliegue

### 1. Migración de Base de Datos
- ✅ `00036_unify_status_values.sql` - Ya ejecutada en Supabase
- ✅ Valores de status unificados y optimizados

### 2. Código Frontend Actualizado
- ✅ Páginas admin actualizadas para usar nuevos valores de status
- ✅ Página de detalle de eventos mejorada (similar a xsmusic.es)
- ✅ Componentes actualizados
- ✅ Tipos TypeScript actualizados

### 3. Nuevas Funcionalidades
- ✅ Añadir evento a calendario (Google Calendar)
- ✅ Ver mapa del evento (Google Maps)
- ✅ Descripción expandible en eventos
- ✅ Mejor visualización de artistas y organizaciones

## ✅ Checklist Post-Despliegue

Después de que Vercel termine el despliegue:

- [ ] Verificar que el sitio carga correctamente
- [ ] Probar crear/editar eventos en admin
- [ ] Verificar que los filtros de status funcionan
- [ ] Probar la página de detalle de eventos
- [ ] Verificar que "Añadir a calendario" funciona
- [ ] Verificar que "Ver mapa" funciona
- [ ] Revisar consola del navegador (no debe haber errores)
- [ ] Verificar que los eventos importados de RA se muestran correctamente

## 🐛 Troubleshooting

### Error: "Build failed"
- Revisa los logs en Vercel Dashboard → Deployments → [tu deployment] → Build Logs
- Verifica que `pnpm run build` funcione localmente

### Error: "Missing environment variables"
- Ve a Settings → Environment Variables
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas
- Asegúrate de que estén marcadas para Production

### Error: "Status constraint violation"
- Esto no debería pasar porque la migración ya se ejecutó
- Si ocurre, verifica que la migración 00036 se ejecutó correctamente en Supabase

## 📊 URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd
- **SQL Editor:** https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new

## 🎉 ¡Listo!

Una vez que Vercel termine el despliegue, todos los cambios estarán en producción:
- ✅ Valores de status optimizados
- ✅ Página de eventos mejorada
- ✅ Nuevas funcionalidades activas

---

**¿Necesitas ayuda?** Revisa los logs de Vercel o contacta al equipo de desarrollo.

