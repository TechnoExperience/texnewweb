# 👥 Usuarios de Prueba - TECHNO EXPERIENCE

## 🔐 Credenciales de Acceso

### 👨‍💼 Usuario Administrador

**Email:** `edu.coco@technoexperience.net`  
**Contraseña:** `technoexperience`  
**Rol:** `admin`  
**Tipo de Perfil:** `promoter`

> **Nota:** Este usuario se crea mediante el script `scripts/create_admin_user.ts`

---

### 👥 Usuarios de Prueba (Seed Data)

Todos estos usuarios tienen la misma contraseña: **`123456`**

#### 1. Clubber (Usuario Regular)
- **Email:** `clubber@test.com`
- **Contraseña:** `123456`
- **Tipo de Perfil:** `clubber`
- **Rol:** `user`

#### 2. DJ
- **Email:** `dj@test.com`
- **Contraseña:** `123456`
- **Tipo de Perfil:** `dj`
- **Rol:** `user`

#### 3. Promoter
- **Email:** `promoter@test.com`
- **Contraseña:** `123456`
- **Tipo de Perfil:** `promoter`
- **Rol:** `user`

#### 4. Label (Sello Discográfico)
- **Email:** `label@test.com`
- **Contraseña:** `123456`
- **Tipo de Perfil:** `label`
- **Rol:** `user`

#### 5. Club
- **Email:** `club@test.com`
- **Contraseña:** `123456`
- **Tipo de Perfil:** `club`
- **Rol:** `user`

---

## 📝 Cómo Crear los Usuarios

### Opción 1: Usuario Admin (Script TypeScript)
```bash
npx tsx scripts/create_admin_user.ts
```

### Opción 2: Usuarios de Prueba (SQL)
Ejecutar en Supabase SQL Editor:
```sql
-- Ver archivo: supabase/seed_users.sql
```

---

## 🔑 Acceso al CMS

Para acceder al panel de administración (`/admin`), necesitas:
- Un usuario con `role = 'admin'` o `role = 'editor'`
- Actualmente solo el usuario `edu.coco@technoexperience.net` tiene rol admin

---

## ⚠️ Seguridad

**IMPORTANTE:** Estos usuarios son solo para desarrollo y pruebas. En producción:
- Cambiar todas las contraseñas
- Eliminar usuarios de prueba
- Usar contraseñas seguras
- Implementar autenticación de dos factores (2FA)

---

## 📍 Rutas de Acceso

- **Login:** `/auth/login`
- **Admin Dashboard:** `/admin` (requiere rol admin/editor)
- **Perfiles:**
  - `/profiles/clubber` - Para usuarios clubber
  - `/profiles/dj` - Para DJs
  - `/profiles/promoter` - Para promotores
  - `/profiles/label` - Para sellos discográficos
  - `/profiles/club` - Para clubs

---

## 🛠️ Promover Usuario a Admin

Si necesitas promover un usuario existente a admin, ejecuta en Supabase SQL Editor:

```sql
-- Ver archivo: supabase/promote_admin.sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

