# 🔐 Sistema de Administración - Crear Usuario Admin

## 📋 Requisitos Previos

1. Tener las variables de entorno configuradas en `.env`:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # Opcional pero recomendado
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

## 🚀 Crear Usuario Administrador

### Método 1: Con argumentos (Recomendado)

```bash
npm run create-admin email@ejemplo.com miPassword123
```

### Método 2: Interactivo

```bash
npm run create-admin
```

El script te pedirá:
- 📧 Email del administrador
- 🔒 Contraseña (mínimo 6 caracteres)

## 🔑 Usar Service Role Key (Recomendado)

Para crear usuarios admin sin restricciones, agrega `SUPABASE_SERVICE_ROLE_KEY` a tu archivo `.env`:

1. Ve a tu proyecto en Supabase Dashboard
2. Settings → API
3. Copia el **Service Role Key** (⚠️ Mantén esto secreto)
4. Agrega a `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```

Con el Service Role Key:
- ✅ Crea usuarios sin confirmación de email
- ✅ Bypassa políticas RLS
- ✅ Funciona incluso si el usuario ya existe

## 📝 Ejemplo de Uso

```bash
# Crear admin con email y password
npm run create-admin admin@technoexperience.com AdminPass123

# O ejecutar interactivamente
npm run create-admin
```

## ✅ Verificación

Después de crear el usuario:

1. Inicia sesión en la web con el email y password
2. Accede a `/admin` - deberías ver el dashboard de administración
3. Verifica que puedes acceder a:
   - `/admin/news` - Gestión de noticias
   - `/admin/events` - Gestión de eventos
   - `/admin/products` - Gestión de productos
   - `/admin/categories` - Gestión de categorías
   - `/admin/orders` - Gestión de pedidos
   - `/admin/users` - Gestión de usuarios

## 🔧 Solución de Problemas

### Error: "Missing Supabase credentials"
- Verifica que tu archivo `.env` tenga `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Error: "User already exists"
- El script intentará actualizar el usuario existente a admin
- Si falla, agrega `SUPABASE_SERVICE_ROLE_KEY` a `.env`

### Error: "policy" o "RLS"
- Agrega `SUPABASE_SERVICE_ROLE_KEY` a tu `.env`
- O ejecuta manualmente en Supabase SQL Editor:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'tu_email@ejemplo.com';
  ```

### Usuario creado pero no puede acceder a /admin
- Verifica que el perfil tenga `role = 'admin'` en la tabla `profiles`
- Ejecuta en Supabase SQL Editor:
  ```sql
  SELECT id, email, role FROM profiles WHERE email = 'tu_email@ejemplo.com';
  ```

## 🛡️ Seguridad

- ⚠️ **NUNCA** commitees el archivo `.env` con el Service Role Key
- ⚠️ El Service Role Key tiene permisos completos - úsalo solo en desarrollo
- ✅ En producción, usa el método interactivo o crea usuarios manualmente desde Supabase Dashboard

## 📚 Comandos Disponibles

```bash
npm run create-admin              # Modo interactivo
npm run create-admin email pass   # Con argumentos
```

