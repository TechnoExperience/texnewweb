# 🔍 Auditoría Completa - Preparación para Despliegue

**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Objetivo:** Identificar y corregir errores, código duplicado y archivos no usados sin romper la funcionalidad

---

## ❌ ERRORES CRÍTICOS (Impiden el Build)

### 1. `src/hooks/use-ra-sync.ts` - Dependencia faltante
- **Error:** `Cannot find module '@tanstack/react-query'`
- **Causa:** El hook usa `@tanstack/react-query` pero no está instalado
- **Solución:** El hook NO se usa en ningún lugar → **ELIMINAR o COMENTAR**
- **Impacto:** Ninguno (no se usa)

### 2. `src/lib/embeds.ts` - Tipo incorrecto
- **Error:** `Type '"custom"' is not assignable to type 'EmbedProvider'`
- **Causa:** El tipo `EmbedProvider` no incluye "custom"
- **Solución:** Agregar "custom" al tipo `EmbedProvider`
- **Impacto:** Bajo (solo afecta embeds personalizados)

### 3. `src/components/video-card.tsx` - Propiedad inexistente
- **Error:** `Property 'status' does not exist on type 'Video'`
- **Causa:** El tipo `Video` no tiene la propiedad `status`
- **Solución:** Agregar `status?` al tipo `Video` o eliminar la verificación
- **Impacto:** Bajo (solo afecta visualización de estado)

### 4. `src/hooks/useUserProfile.ts` - Imports no usados
- **Error:** `All imports in import declaration are unused`
- **Causa:** Todos los imports están comentados o no se usan
- **Solución:** Eliminar imports no usados
- **Impacto:** Ninguno

---

## ⚠️ ERRORES NO CRÍTICOS (Warnings - No impiden build)

### Variables/Imports no usados (TS6133)
Estos son warnings que no impiden el build pero generan ruido:

1. `src/components/ad-space.tsx` - `position` no usado
2. `src/components/admin-stats-charts.tsx` - `entry` no usado, `percent` posiblemente undefined
3. `src/components/advanced-filters.tsx` - `format` no usado
4. `src/components/brand-marquee.tsx` - `React` no usado
5. `src/components/dj-profile-card.tsx` - `useState`, `Button`, `profile_type` no usados
6. `src/components/event-card-home.tsx` - `Calendar` no usado
7. `src/components/logo.tsx` - `showText` no usado
8. `src/components/mini-player.tsx` - `setVolume` no usado
9. `src/components/product-recommendations.tsx` - `ShoppingBag`, `Product` no usados
10. `src/components/social-share.tsx` - `image` no usado
11. `src/components/table-of-contents.tsx` - `Button` no usado
12. `src/components/unified-card.tsx` - `Badge`, `Calendar` no usados
13. `src/components/vinyl-card.tsx` - `Music` no usado
14. `src/contexts/cart-context.tsx` - `supabase` no usado

**Acción:** Limpiar solo si no afecta funcionalidad

---

## 🔄 CÓDIGO DUPLICADO

### Archivos a verificar:
1. `src/components/event-card.tsx` vs `src/components/event-card-home.tsx`
2. `src/components/video-card.tsx` (múltiples versiones)
3. Scripts de migración duplicados

**Acción:** Revisar y consolidar si es necesario

---

## 📁 ARCHIVOS NO USADOS

### Archivos que pueden eliminarse:
1. `src/hooks/use-ra-sync.ts` - NO se usa en ningún lugar
2. `src/routes/api/events.ts` - Verificar si se usa
3. Scripts de prueba no usados en producción

**Acción:** Eliminar solo después de verificar que no se usan

---

## ✅ CORRECCIONES APLICADAS

### 1. Eliminar `use-ra-sync.ts` (no se usa)
### 2. Corregir tipo `EmbedProvider` en `embeds.ts`
### 3. Agregar `status?` al tipo `Video` o eliminar verificación
### 4. Limpiar imports no usados en `useUserProfile.ts`

---

## 📊 ESTADÍSTICAS

- **Errores críticos:** 4
- **Warnings:** ~15
- **Archivos a revisar:** 3
- **Archivos potencialmente no usados:** 2

---

## 🎯 PRIORIDADES

1. **ALTA:** Corregir errores críticos que impiden build
2. **MEDIA:** Limpiar imports no usados (solo si no rompe nada)
3. **BAJA:** Revisar código duplicado
4. **BAJA:** Eliminar archivos no usados (solo después de verificar)

---

**IMPORTANTE:** Todas las correcciones se harán SIN romper la funcionalidad existente.

