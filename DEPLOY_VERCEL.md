# 🚀 Despliegue Rápido en Vercel

## Pasos Rápidos

### 1. Preparar el Repositorio Git

```bash
# Asegúrate de tener todos los cambios guardados
git add .
git commit -m "Preparado para despliegue en Vercel"
git push origin main
```

### 2. Desplegar en Vercel

#### Opción A: Desde el Dashboard (Recomendado)

1. Ve a [https://vercel.com/new](https://vercel.com/new)
2. Conecta tu repositorio (GitHub/GitLab/Bitbucket)
3. Selecciona el proyecto
4. **Configuración del Proyecto:**
   - Framework Preset: **Vite** (se detecta automáticamente)
   - Root Directory: `./` (raíz)
   - Build Command: `npm run build` (ya configurado en vercel.json)
   - Output Directory: `dist` (ya configurado en vercel.json)
   - Install Command: `npm install`

5. **Variables de Entorno:**
   Agrega estas variables (Settings → Environment Variables):
   ```
   VITE_SUPABASE_URL = tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY = tu_clave_anonima_de_supabase
   ```
   
   **IMPORTANTE:** Marca estas variables para:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

6. Click en **"Deploy"**

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Seguir las instrucciones interactivas
# Cuando pregunte por variables de entorno, ingrésalas

# Para desplegar a producción
vercel --prod
```

### 3. Configurar CORS en Supabase

Después del despliegue:

1. Ve a Supabase Dashboard → Settings → API
2. En "CORS Origins", agrega:
   - `https://tu-proyecto.vercel.app`
   - `https://tu-dominio.com` (si tienes dominio personalizado)

### 4. Verificar el Despliegue

- [ ] El sitio carga correctamente
- [ ] Las imágenes se muestran
- [ ] El login funciona
- [ ] Las consultas a Supabase funcionan
- [ ] Los eventos se muestran
- [ ] Las noticias se cargan

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que las variables estén configuradas en Vercel
- Asegúrate de que los nombres sean exactos: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Error: "Build failed"
- Revisa los logs en Vercel Dashboard
- Verifica que `npm run build` funcione localmente

### Error: "CORS policy"
- Agrega tu dominio de Vercel a CORS Origins en Supabase

## URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Documentación Vercel:** https://vercel.com/docs

---

**¡Listo para desplegar! 🎉**

