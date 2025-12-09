# 🚀 Desplegar Migración 00036 - Unificar Valores de Status

## 📋 Resumen

Esta migración unifica y optimiza todos los valores de `status` en las tablas:
- **Events**: `'draft'`, `'pub'`, `'can'` (en lugar de `'draft'`, `'published'`, `'cancelled'`)
- **News**: `'draft'`, `'pend'`, `'pub'`, `'rej'`
- **Releases**: `'draft'`, `'pub'`
- **Videos**: `'pend'`, `'pub'`, `'rej'`
- **Reviews**: `'draft'`, `'pend'`, `'pub'`, `'rej'`

**Beneficios:**
- ✅ Ahorro de espacio (valores de 3-4 caracteres vs 8-12)
- ✅ Consistencia en todas las tablas
- ✅ Actualización automática de valores existentes
- ✅ Políticas RLS actualizadas

## 🎯 Método Recomendado: Supabase Dashboard SQL Editor

### Paso 1: Acceder al SQL Editor

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
2. O navega: **Supabase Dashboard** → **SQL Editor** → **New Query**

### Paso 2: Copiar la Migración

1. Abre el archivo: `supabase/migrations/00036_unify_status_values.sql`
2. Copia **TODO** el contenido del archivo (Ctrl+A, Ctrl+C)

### Paso 3: Ejecutar la Migración

1. Pega el SQL en el editor de Supabase
2. Haz clic en **"Run"** (o presiona `F5`)
3. Espera a que termine la ejecución (puede tardar unos segundos)

### Paso 4: Verificar la Ejecución

Deberías ver un mensaje de éxito. Si hay errores, revisa:
- Que todas las tablas existan
- Que no haya conflictos con restricciones existentes

## 🔍 Verificación Post-Migración

### Verificar Valores Actualizados

Ejecuta estas consultas en el SQL Editor para verificar:

```sql
-- Verificar valores de status en events
SELECT DISTINCT status, COUNT(*) 
FROM events 
GROUP BY status;

-- Verificar valores de status en news
SELECT DISTINCT status, COUNT(*) 
FROM news 
GROUP BY status;

-- Verificar valores de status en dj_releases
SELECT DISTINCT status, COUNT(*) 
FROM dj_releases 
GROUP BY status;

-- Verificar valores de status en videos
SELECT DISTINCT status, COUNT(*) 
FROM videos 
GROUP BY status;

-- Verificar valores de status en reviews
SELECT DISTINCT status, COUNT(*) 
FROM reviews 
GROUP BY status;
```

**Resultados esperados:**
- `events`: `draft`, `pub`, `can` (o NULL)
- `news`: `draft`, `pend`, `pub`, `rej` (o NULL)
- `dj_releases`: `draft`, `pub` (o NULL)
- `videos`: `pend`, `pub`, `rej` (o NULL)
- `reviews`: `draft`, `pend`, `pub`, `rej` (o NULL)

### Verificar Restricciones

```sql
-- Verificar restricciones de status
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK' 
    AND tc.table_name IN ('events', 'news', 'dj_releases', 'videos', 'reviews')
    AND cc.check_clause LIKE '%status%'
ORDER BY tc.table_name;
```

## ⚠️ Importante

### Antes de Ejecutar

1. **Backup recomendado**: Aunque la migración es segura, siempre es bueno tener un backup
2. **Horario**: Ejecuta en horario de bajo tráfico si es posible
3. **Verificación**: Después de ejecutar, verifica que la aplicación funciona correctamente

### Si Hay Errores

Si encuentras errores al ejecutar:

1. **Error de restricción existente**: La migración usa `DROP CONSTRAINT IF EXISTS`, así que debería funcionar
2. **Error de tabla no existe**: Verifica que todas las tablas estén creadas
3. **Error de sintaxis**: Verifica que copiaste todo el contenido correctamente

## 📝 Notas Técnicas

- La migración actualiza automáticamente todos los valores existentes
- Las políticas RLS se actualizan para usar los nuevos valores
- Los valores antiguos se convierten automáticamente:
  - `'published'`, `'PUBLISHED'` → `'pub'`
  - `'PENDING_REVIEW'`, `'PENDING'` → `'pend'`
  - `'REJECTED'` → `'rej'`
  - `'cancelled'`, `'CANCELLED'` → `'can'`

## ✅ Checklist Post-Migración

- [ ] Migración ejecutada sin errores
- [ ] Valores de status verificados en todas las tablas
- [ ] Restricciones verificadas
- [ ] Aplicación funciona correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Los eventos se pueden crear/editar correctamente
- [ ] Los filtros de status funcionan en el admin

## 🎉 ¡Listo!

Una vez completada la migración, todos los valores de status estarán unificados y optimizados. El código del frontend ya está actualizado para usar estos nuevos valores.

---

**¿Problemas?** Revisa los logs de Supabase o contacta al equipo de desarrollo.

