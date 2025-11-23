# 🔄 Guía de Flujo de Trabajo con Git

## ✅ Estado Actual del Repositorio

### Repositorio Remoto
- **URL:** https://github.com/TechnoExperience/v0-techno-experience-platform
- **Rama Principal:** `main`
- **Estado:** ✅ Sincronizado y actualizado

### Ramas Disponibles
```
* main      ← Rama de producción (actual)
  develop   ← Rama de desarrollo
  feature   ← Rama para nuevas funcionalidades
```

### Últimos Commits
1. `8540f0b` - Merge remote main branch (conflicto resuelto)
2. `1036cc8` - Add .gitignore for root directory
3. `c40fc93` - Initial commit: Techno Experience Magazine

---

## 🚀 Despliegue Automático en Vercel

### Configuración
- ✅ `vercel.json` configurado en `techno-experience/`
- ✅ Build command: `pnpm run build`
- ✅ Output directory: `dist`
- ✅ Framework: Vite

### Cómo Funciona
1. **Push a `main`** → Vercel detecta el cambio automáticamente
2. **Build automático** → Vercel ejecuta `pnpm install` y `pnpm run build`
3. **Despliegue** → La aplicación se despliega en producción

### Verificar Despliegue
- **Dashboard Vercel:** https://vercel.com/technoexperiences-projects/v0-techno-experience-platform
- **URL de Producción:** Se genera automáticamente después del despliegue

---

## 🌿 Trabajar con Ramas

### Crear una Nueva Rama de Desarrollo

```bash
# Desde main o develop
git checkout develop
git pull origin develop

# Crear nueva rama para feature
git checkout -b feature/nombre-funcionalidad

# O desde main directamente
git checkout -b feature/nueva-funcionalidad
```

### Flujo de Trabajo Recomendado

#### 1. Desarrollo de Nueva Funcionalidad
```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/agregar-comentarios

# Hacer cambios...
git add .
git commit -m "feat: agregar sistema de comentarios"

# Push de la rama
git push -u origin feature/agregar-comentarios
```

#### 2. Merge a Develop
```bash
# Desde GitHub: Crear Pull Request
# O localmente:
git checkout develop
git merge feature/agregar-comentarios
git push origin develop
```

#### 3. Merge a Main (Producción)
```bash
# Solo después de testing en develop
git checkout main
git pull origin main
git merge develop
git push origin main  # Esto activa el despliegue automático en Vercel
```

---

## 📋 Comandos Útiles

### Ver Estado
```bash
git status                    # Estado del repositorio
git branch -a                # Todas las ramas (local y remoto)
git log --oneline -10        # Últimos 10 commits
```

### Sincronizar con Remoto
```bash
git fetch origin             # Descargar cambios sin mergear
git pull origin main         # Descargar y mergear cambios
git push origin main         # Subir cambios locales
```

### Trabajar con Ramas
```bash
git checkout nombre-rama     # Cambiar de rama
git checkout -b nueva-rama   # Crear y cambiar a nueva rama
git branch -d nombre-rama     # Eliminar rama local
git push origin --delete nombre-rama  # Eliminar rama remota
```

### Resolver Conflictos
```bash
# Si hay conflictos después de pull
git status                   # Ver archivos en conflicto
# Editar archivos manualmente
git add archivo-resuelto
git commit -m "Resolve merge conflict"
```

---

## 🔧 Configuración del Proyecto

### Estructura de Directorios
```
web tex/
├── techno-experience/       # Aplicación React principal
│   ├── src/                # Código fuente
│   ├── public/             # Archivos estáticos
│   ├── vercel.json         # Configuración Vercel
│   └── package.json        # Dependencias
├── supabase/               # Backend y funciones
├── docs/                   # Documentación
└── .gitignore              # Archivos ignorados por Git
```

### Archivos de Configuración Importantes
- `techno-experience/vercel.json` - Configuración de despliegue
- `.gitignore` - Archivos a ignorar
- `techno-experience/.gitignore` - Gitignore específico del proyecto

---

## 🎯 Buenas Prácticas

### Commits
- ✅ Usar mensajes descriptivos: `feat: agregar login`, `fix: corregir bug en eventos`
- ✅ Hacer commits pequeños y frecuentes
- ✅ No hacer commit de archivos temporales o sensibles

### Ramas
- ✅ `main` - Solo código estable y probado
- ✅ `develop` - Integración de features
- ✅ `feature/*` - Desarrollo de nuevas funcionalidades
- ✅ `fix/*` - Corrección de bugs

### Pull Requests
- ✅ Crear PR desde `feature/*` a `develop`
- ✅ Revisar código antes de mergear
- ✅ Usar descripciones claras en PRs

---

## 🚨 Solución de Problemas

### Error: "Your branch is behind"
```bash
git pull origin main
# Resolver conflictos si los hay
git push origin main
```

### Error: "Failed to push"
```bash
# Verificar que tienes permisos
# O hacer pull primero
git pull --rebase origin main
git push origin main
```

### Deshacer Cambios Locales
```bash
git checkout -- archivo.txt        # Descartar cambios en archivo
git reset --hard HEAD              # Descartar todos los cambios
git reset --hard origin/main       # Resetear a estado remoto
```

---

## 📞 Recursos

- **Repositorio GitHub:** https://github.com/TechnoExperience/v0-techno-experience-platform
- **Dashboard Vercel:** https://vercel.com/technoexperiences-projects/v0-techno-experience-platform
- **Documentación Git:** https://git-scm.com/doc
- **Guía de Despliegue:** `techno-experience/DEPLOY.md`

---

**Última actualización:** Noviembre 2025

