# Usuarios de Prueba

## Credenciales de Usuarios Creados

### 👤 Administrador
- **Email:** admin@technoexperience.com
- **Username:** admin_te
- **Password:** Admin123!
- **Rol:** admin
- **Permisos:** Acceso completo al CMS, puede ver estadísticas, gestionar usuarios, crear/editar/eliminar todo el contenido

### ✍️ Redactor (Editor)
- **Email:** editor@technoexperience.com
- **Username:** editor_te
- **Password:** Editor123!
- **Rol:** editor
- **Permisos:** 
  - Puede crear eventos, reviews, noticias, lanzamientos y videos
  - Solo puede editar contenido que él ha creado
  - No puede ver estadísticas
  - No necesita verificación para publicar

### 👥 Usuario Normal
- **Email:** user@technoexperience.com
- **Username:** usuario_te
- **Password:** User123!
- **Rol:** user
- **Tipo de Perfil:** clubber
- **Permisos:** 
  - Puede crear contenido pero requiere verificación del admin
  - Todo lo que cree estará en estado "PENDING" hasta que un admin lo apruebe

## Cómo Crear los Usuarios

Ejecuta el script de creación:

```bash
npx tsx scripts/create_test_users.ts
```

O si prefieres usar Node directamente:

```bash
node --loader ts-node/esm scripts/create_test_users.ts
```

**Nota:** Necesitas tener configuradas las variables de entorno:
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Sistema de Login

El sistema ahora permite iniciar sesión con:
- **Email:** admin@technoexperience.com
- **Username:** admin_te

Ambos métodos funcionan para todos los usuarios.

