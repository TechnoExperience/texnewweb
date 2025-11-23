# 🚀 Guía de Despliegue - Techno Experience

Esta guía te ayudará a desplegar tu aplicación React en diferentes plataformas.

## 📋 Requisitos Previos

- Cuenta en la plataforma de despliegue elegida
- Proyecto configurado con Git
- Variables de entorno configuradas (si es necesario)

---

## 🌐 Opción 1: Vercel (Recomendado)

Vercel es ideal para aplicaciones React y ofrece despliegues automáticos desde Git.

### Pasos para Desplegar en Vercel:

1. **Instalar Vercel CLI (opcional pero recomendado):**
```bash
npm i -g vercel
```

2. **Desplegar desde la línea de comandos:**
```bash
cd techno-experience
vercel
```

3. **O desplegar desde el Dashboard:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub/GitLab/Bitbucket
   - Selecciona el proyecto `techno-experience`
   - Vercel detectará automáticamente la configuración de Vite
   - Haz clic en "Deploy"

### Configuración Automática:
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`
- **Framework Preset:** Vite

### Variables de Entorno (si las necesitas):
En el dashboard de Vercel, ve a Settings > Environment Variables y añade:
- `VITE_SUPABASE_URL` (si usas variables de entorno)
- `VITE_SUPABASE_ANON_KEY` (si usas variables de entorno)

---

## 🎯 Opción 2: Netlify

Netlify también es excelente para aplicaciones React con despliegues continuos.

### Pasos para Desplegar en Netlify:

1. **Instalar Netlify CLI (opcional):**
```bash
npm i -g netlify-cli
```

2. **Desplegar desde la línea de comandos:**
```bash
cd techno-experience
netlify deploy --prod
```

3. **O desplegar desde el Dashboard:**
   - Ve a [netlify.com](https://netlify.com)
   - Conecta tu repositorio
   - Configuración automática:
     - **Build command:** `pnpm run build`
     - **Publish directory:** `dist`
   - Haz clic en "Deploy site"

### El archivo `netlify.toml` ya está configurado con:
- Comando de build
- Directorio de publicación
- Redirects para SPA (Single Page Application)

---

## 📦 Opción 3: GitHub Pages

Para desplegar en GitHub Pages de forma gratuita.

### Pasos:

1. **Instalar gh-pages:**
```bash
cd techno-experience
pnpm add -D gh-pages
```

2. **Añadir script al package.json:**
```json
"scripts": {
  "deploy": "pnpm run build && gh-pages -d dist"
}
```

3. **Configurar base en vite.config.ts:**
```typescript
export default defineConfig({
  base: '/nombre-repositorio/', // Cambia por el nombre de tu repo
  // ... resto de configuración
})
```

4. **Desplegar:**
```bash
pnpm run deploy
```

---

## 🔧 Opción 4: Build Manual y Subida a Servidor

Si prefieres desplegar manualmente en tu propio servidor:

### Pasos:

1. **Construir la aplicación:**
```bash
cd techno-experience
pnpm run build
```

2. **El resultado estará en la carpeta `dist/`**

3. **Subir los archivos:**
   - Sube todo el contenido de `dist/` a tu servidor
   - Configura tu servidor web (Nginx, Apache, etc.) para servir los archivos estáticos
   - Asegúrate de configurar redirects para SPA:
     - **Nginx:** Añade `try_files $uri $uri/ /index.html;`
     - **Apache:** Usa `.htaccess` con rewrite rules

### Ejemplo de configuración Nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /ruta/a/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ⚙️ Configuración de Variables de Entorno

Si necesitas usar variables de entorno en producción:

### Para Vercel/Netlify:
1. Ve a la configuración del proyecto
2. Añade variables de entorno en el dashboard
3. Las variables deben comenzar con `VITE_` para que Vite las incluya en el build

### Ejemplo:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

Luego en tu código:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

---

## 🚀 Despliegue Rápido (Vercel CLI)

El método más rápido para desplegar:

```bash
cd techno-experience
pnpm install
pnpm run build
vercel --prod
```

---

## 📝 Notas Importantes

1. **Rutas del Router:** Asegúrate de que tu plataforma de hosting soporte redirects para SPA (Single Page Applications). Los archivos de configuración ya incluyen esto.

2. **Base Path:** Si desplegas en un subdirectorio (como GitHub Pages), necesitarás configurar el `base` en `vite.config.ts`.

3. **Build de Producción:** Usa `pnpm run build:prod` si tienes configuraciones específicas para producción.

4. **Supabase:** Las credenciales ya están configuradas en `src/lib/supabase.ts`. Si necesitas cambiarlas, actualiza el archivo o usa variables de entorno.

---

## 🔍 Verificar el Despliegue

Después de desplegar:

1. Visita la URL proporcionada por la plataforma
2. Verifica que todas las rutas funcionen
3. Prueba la autenticación con Supabase
4. Revisa la consola del navegador para errores

---

## 🆘 Solución de Problemas

### Error: "Cannot find module"
- Asegúrate de que `pnpm install` se ejecute antes del build
- Verifica que todas las dependencias estén en `package.json`

### Error: "404 en rutas"
- Verifica que los redirects estén configurados correctamente
- Para Vercel, el `vercel.json` ya incluye los redirects
- Para Netlify, el `netlify.toml` ya incluye los redirects

### Error: "Supabase connection failed"
- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de que las políticas RLS permitan acceso público si es necesario

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Netlify](https://docs.netlify.com)
- [Documentación de Vite](https://vitejs.dev/guide/static-deploy.html)
- [Documentación de GitHub Pages](https://pages.github.com)

---

**¡Tu aplicación está lista para desplegar! 🎉**


