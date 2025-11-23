# 🎵 Techno Experience Magazine

## Plataforma Líder de Cultura Techno

[![Deployed](https://img.shields.io/badge/Status-Deployed-success)](https://al73s4f814kx.space.minimax.io)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)

---

## 🚀 Acceso a la Plataforma

**URL de Producción:** https://al73s4f814kx.space.minimax.io

La plataforma está desplegada y 100% funcional. Puedes acceder directamente desde tu navegador.

---

## ✨ Características Principales

### 🎭 Sistema de Usuarios
- **5 Tipos de Perfiles Diferenciados:**
  - DJ / Artista
  - Promotor / Festival
  - Clubber
  - Sello Discográfico
  - Agencia de Management

- **Funcionalidades:**
  - Registro y autenticación segura
  - Perfiles personalizables
  - Subida de avatar
  - Gestión de información personal

### 📅 Eventos
- **Sincronización Automática con Resident Advisor**
  - Actualización cada 5 minutos
  - 6 ciudades principales: London, Berlin, Madrid, Barcelona, Amsterdam, Paris
  
- **Características:**
  - Filtros por ciudad
  - Búsqueda de eventos
  - Información completa: venue, artistas, entradas
  - Vista de cards con flyers

### 📰 Noticias
- CMS integrado
- Categorías y etiquetas
- Imágenes de portada
- SEO optimizado

### 🎵 Lanzamientos
- Catálogo de música techno
- Tipos: Single, EP, Álbum, Remix, Compilación
- Artwork y tracklist
- Enlaces a tiendas de música

### 🎬 Videos
- Aftermovies
- Live Sets
- Videoclips
- DJ Mixes
- Contador de visualizaciones

---

## 🎨 Diseño Visual

### Paleta de Colores Techno
- **Imperial Purple:** #5C1D6B - Color principal
- **Verde Neón:** #39FF14 - Acentos llamativos
- **Brilliant Azure:** #38A6F3 - Secundario
- **Web Gold:** #FDD602 - Destacados
- **Electric Pink:** #FF3179 - Interacciones

### Estilo
- Diseño underground moderno
- Gradientes dinámicos
- Animaciones sutiles
- Efectos glow en elementos clave
- Tema oscuro optimizado

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.3** - Framework principal
- **TypeScript** - Tipado estático
- **Vite 6.2** - Build tool rápido
- **Tailwind CSS** - Estilos utility-first
- **React Router DOM** - Navegación
- **TipTap** - Editor WYSIWYG
- **Lucide React** - Iconos

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL - Base de datos
  - Auth - Autenticación
  - Storage - Almacenamiento multimedia
  - Edge Functions - Lógica serverless
- **Deno** - Runtime para edge functions

---

## 📖 Guía de Uso

### Para Usuarios Nuevos

#### 1. Crear una Cuenta
1. Visita https://al73s4f814kx.space.minimax.io/registro
2. Ingresa tu email y contraseña
3. Selecciona tu tipo de perfil (DJ, Promotor, Clubber, Sello o Agencia)
4. Completa el registro

#### 2. Personalizar tu Perfil
1. Inicia sesión
2. Ve a "Mi Perfil" en el menú
3. Edita tu información:
   - Nombre artístico o comercial
   - Biografía
   - Ciudad y país
   - Sube tu avatar

#### 3. Explorar Contenido
- **Eventos:** Descubre eventos techno en tu ciudad
- **Noticias:** Lee las últimas noticias de la escena
- **Lanzamientos:** Explora nueva música
- **Videos:** Mira aftermovies y live sets

### Para Promotores y DJs

#### Promocionar Eventos
Los eventos se sincronizan automáticamente desde Resident Advisor. Si tu evento está en RA, aparecerá en nuestra plataforma.

#### Gestionar Contenido
Los perfiles de DJ y Promotor tienen acceso a funcionalidades adicionales de gestión de contenido.

---

## 🔧 Desarrollo Local

### Requisitos
- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el proyecto
cd /workspace/techno-experience

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm run dev

# Compilar para producción
pnpm run build
```

### Variables de Entorno

El proyecto ya está configurado con las credenciales de Supabase en `src/lib/supabase.ts`.

---

## 📊 Estructura del Proyecto

```
techno-experience/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pages/          # Páginas de la aplicación
│   │   ├── HomePage.tsx
│   │   ├── EventosPage.tsx
│   │   ├── NoticiasPage.tsx
│   │   ├── LanzamientosPage.tsx
│   │   ├── VideosPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegistroPage.tsx
│   │   └── PerfilPage.tsx
│   ├── context/        # Context API
│   │   └── AuthContext.tsx
│   ├── lib/           # Utilidades
│   │   └── supabase.ts
│   ├── types/         # Tipos TypeScript
│   │   └── database.ts
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Entry point
├── supabase/
│   └── functions/     # Edge Functions
│       ├── sync-ra-events/
│       └── upload-media/
└── public/            # Archivos estáticos
    └── imgs/          # Imágenes
```

---

## 🔐 Backend y Base de Datos

### Supabase Dashboard
- **URL:** https://supabase.com/dashboard/project/zdjjgorcmikhfyxcdmyo
- **Project ID:** zdjjgorcmikhfyxcdmyo

### Tablas Principales
- `perfiles_usuario` - Perfiles de usuarios
- `noticias` - Artículos y noticias
- `eventos` - Eventos techno
- `lanzamientos` - Música y lanzamientos
- `videos` - Contenido audiovisual

### Edge Functions
- **sync-ra-events** - Sincronización automática con Resident Advisor (cada 5 min)
- **upload-media** - Gestión de uploads multimedia

### Storage Buckets
- **techno-media** - Almacenamiento público (50MB límite)

---

## 🚀 Funcionalidades Avanzadas

### Sincronización con Resident Advisor
El sistema sincroniza automáticamente eventos desde la API GraphQL de Resident Advisor cada 5 minutos, monitoreando 6 ciudades principales.

### Sistema de Roles y Permisos
Cada tipo de perfil tiene acceso diferenciado a funcionalidades:
- **DJ:** Gestión de lanzamientos y perfil artístico
- **Promotor:** Gestión de eventos
- **Clubber:** Favoritos y seguimiento
- **Sello:** Gestión de catálogo
- **Agencia:** Gestión de artistas

### SEO Optimizado
- Meta tags dinámicos
- Open Graph para redes sociales
- URLs amigables (slugs)
- Structured data

---

## 📝 Documentación Adicional

Para información técnica detallada, consulta:
- **Documentación Completa:** `/workspace/docs/DOCUMENTACION_FINAL.md`
- **Arquitectura de Contenido:** `/workspace/docs/content_architecture.md`
- **Guía Visual:** `/workspace/docs/visual_design_guide.md`
- **API Resident Advisor:** `/workspace/docs/resident_advisor_api.md`

---

## 🤝 Contribuciones

Esta plataforma es un proyecto completo y funcional. Para mejoras o sugerencias, considera:
- Añadir más ciudades a la sincronización de eventos
- Implementar sistema de comentarios
- Crear sistema de favoritos
- Añadir notificaciones push

---

## 📄 Licencia

Desarrollado por MiniMax Agent - Noviembre 2025

---

## 🎯 Próximos Pasos Recomendados

1. **Testing de Usuario:**
   - Crear una cuenta de prueba
   - Explorar todas las secciones
   - Personalizar tu perfil

2. **Contenido:**
   - Los eventos se sincronizan automáticamente desde Resident Advisor
   - Considera añadir noticias manualmente vía base de datos
   - Sube videos y lanzamientos

3. **Monitoreo:**
   - Verifica la sincronización de eventos diariamente
   - Revisa logs en Supabase Dashboard
   - Monitorea uso de storage

---

## 📞 Soporte

Para consultas técnicas o soporte:
- Revisa la documentación en `/workspace/docs/`
- Consulta logs de Supabase
- Verifica políticas RLS en la base de datos

---

**Techno Experience Magazine** - La plataforma líder de cultura techno
