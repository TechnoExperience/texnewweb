# 📋 INSTRUCCIONES PARA EJECUTAR MIGRACIONES SQL

## Migraciones a Ejecutar

Se han creado **3 nuevas migraciones** que deben ejecutarse en Supabase en el siguiente orden:

### 1. ✅ `00029_comments_system.sql`
**Sistema de Comentarios**
- Crea la tabla `comments`
- Políticas RLS para comentarios
- Funciones y triggers para gestión de comentarios

### 2. ✅ `00030_favorites_system.sql`
**Sistema de Favoritos/Wishlist**
- Crea la tabla `favorites`
- Políticas RLS para favoritos
- Función para verificar favoritos

### 3. ✅ `00031_complete_editor_rls.sql`
**Completar Sistema de Roles RLS**
- Actualiza políticas SELECT para editores
- Actualiza políticas DELETE para editores
- **IMPORTANTE:** Requiere que la migración `00027_editor_role_and_verification.sql` ya esté ejecutada

---

## 🚀 Método 1: Ejecutar desde Supabase Dashboard (Recomendado)

### Paso 1: Acceder al SQL Editor
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"**

### Paso 2: Ejecutar cada migración

#### Migración 1: Sistema de Comentarios
1. Abre el archivo `supabase/migrations/00029_comments_system.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verifica que no haya errores

#### Migración 2: Sistema de Favoritos
1. Abre el archivo `supabase/migrations/00030_favorites_system.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **"Run"**
5. Verifica que no haya errores

#### Migración 3: Completar Sistema de Roles
1. **IMPORTANTE:** Verifica que la migración `00027_editor_role_and_verification.sql` ya esté ejecutada
2. Abre el archivo `supabase/migrations/00031_complete_editor_rls.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **"Run"**
6. Verifica que no haya errores

---

## 🚀 Método 2: Ejecutar con Supabase CLI (Si tienes CLI instalado)

Si tienes Supabase CLI configurado, puedes ejecutar:

```bash
# Navegar al directorio del proyecto
cd "C:\Users\Edu\OneDrive\Desktop\web tex"

# Aplicar migraciones pendientes
supabase db push
```

O ejecutar migraciones específicas:

```bash
# Ejecutar migración específica
supabase migration up 00029_comments_system
supabase migration up 00030_favorites_system
supabase migration up 00031_complete_editor_rls
```

---

## ⚠️ VERIFICACIÓN POST-MIGRACIÓN

Después de ejecutar las migraciones, verifica que todo esté correcto:

### 1. Verificar Tablas Creadas

Ejecuta en el SQL Editor:

```sql
-- Verificar tabla de comentarios
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'comments';

-- Verificar tabla de favoritos
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'favorites';
```

Ambas consultas deben devolver 1 fila cada una.

### 2. Verificar Políticas RLS

```sql
-- Verificar políticas de comentarios
SELECT * FROM pg_policies WHERE tablename = 'comments';

-- Verificar políticas de favoritos
SELECT * FROM pg_policies WHERE tablename = 'favorites';
```

### 3. Verificar Funciones

```sql
-- Verificar funciones creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_comments_updated_at', 'get_comment_count', 'is_favorite');
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### Error: "relation already exists"
Si ves este error, significa que la tabla ya existe. Puedes:
- **Opción 1:** Eliminar la tabla y volver a ejecutar (⚠️ CUIDADO: perderás datos)
- **Opción 2:** Modificar la migración para usar `CREATE TABLE IF NOT EXISTS` (ya está incluido)

### Error: "policy already exists"
Si ves este error al ejecutar `00031_complete_editor_rls.sql`, es normal porque usa `DROP POLICY IF EXISTS` antes de crear. El error puede aparecer si la política no existía, pero no es crítico.

### Error: "column does not exist"
Si ves errores relacionados con `created_by` o `status` en `00031_complete_editor_rls.sql`, verifica que la migración `00027_editor_role_and_verification.sql` esté ejecutada.

---

## 📝 ORDEN DE EJECUCIÓN RECOMENDADO

1. ✅ **Primero:** `00027_editor_role_and_verification.sql` (si no está ejecutada)
2. ✅ **Segundo:** `00029_comments_system.sql`
3. ✅ **Tercero:** `00030_favorites_system.sql`
4. ✅ **Cuarto:** `00031_complete_editor_rls.sql`

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de ejecutar todas las migraciones, verifica:

- [ ] Tabla `comments` creada
- [ ] Tabla `favorites` creada
- [ ] Políticas RLS activas en ambas tablas
- [ ] Funciones creadas correctamente
- [ ] Triggers funcionando
- [ ] Políticas RLS actualizadas en `news`, `events`, `dj_releases`, `videos`, `reviews`

---

## 🆘 SI ALGO SALE MAL

Si encuentras errores:

1. **Lee el mensaje de error completo** en Supabase
2. **Verifica las dependencias:** Asegúrate de que las migraciones anteriores estén ejecutadas
3. **Revisa los logs:** En Supabase Dashboard → Logs → Postgres Logs
4. **Contacta:** Si el error persiste, comparte el mensaje de error completo

---

**Última actualización:** Enero 2025

