# Instrucciones para Crear Usuarios de Prueba

## Problema Actual
Los usuarios no existen en `auth.users`, por eso el login falla con error 400.

## Solución: Crear Usuarios Manualmente

### Opción 1: Desde el Dashboard de Supabase (Más Fácil)

1. Ve a https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd
2. Ve a **Authentication** > **Users**
3. Click en **"Add user"** o **"Invite user"**
4. Crea los siguientes usuarios:

#### Usuario Admin
- **Email:** `admin@technoexperience.com`
- **Password:** `Admin123!`
- **Auto Confirm:** ✅ (marca esta casilla)

#### Usuario Editor
- **Email:** `editor@technoexperience.com`
- **Password:** `Editor123!`
- **Auto Confirm:** ✅

#### Usuario Normal
- **Email:** `user@technoexperience.com`
- **Password:** `User123!`
- **Auto Confirm:** ✅

5. Después de crear cada usuario, ejecuta el script SQL `scripts/verify_and_create_users.sql` en el SQL Editor para crear/actualizar los perfiles.

### Opción 2: Usando el Script TypeScript

1. Asegúrate de tener las variables de entorno configuradas:
   ```bash
   VITE_SUPABASE_URL=tu_url
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

2. Ejecuta el script:
   ```bash
   npx tsx scripts/create_test_users.ts
   ```

### Opción 3: SQL Directo (Solo si tienes acceso a service_role)

Ejecuta en el SQL Editor de Supabase:

```sql
-- Esto creará los usuarios directamente
-- Nota: Requiere permisos de service_role

-- Crear usuario admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@technoexperience.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Repite para editor@technoexperience.com y user@technoexperience.com
-- (cambia el email y password)
```

## Verificar que Funciona

Después de crear los usuarios:

1. Ve a **Authentication** > **Users** en Supabase
2. Verifica que los 3 usuarios existan
3. Verifica que tengan el email confirmado
4. Ejecuta `scripts/verify_and_create_users.sql` para crear los perfiles
5. Intenta iniciar sesión con:
   - Email: `admin@technoexperience.com`
   - Password: `Admin123!`

## Credenciales Finales

### Admin
- Email: `admin@technoexperience.com`
- Username: `admin_te`
- Password: `Admin123!`

### Editor
- Email: `editor@technoexperience.com`
- Username: `editor_te`
- Password: `Editor123!`

### User
- Email: `user@technoexperience.com`
- Username: `usuario_te`
- Password: `User123!`

