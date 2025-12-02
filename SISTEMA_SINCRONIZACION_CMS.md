# 🔄 Sistema de Sincronización CMS ↔ Supabase ↔ Frontend

## 📋 Resumen

Sistema completo de sincronización bidireccional que conecta:
- **Supabase (Base de Datos)** ↔ **CMS (Panel de Administración)** ↔ **Frontend (Página Web)**

## 🎯 Flujo de Datos

```
┌─────────────┐
│  Supabase   │ (Base de Datos)
│   (API)     │
└──────┬──────┘
       │
       │ Realtime Subscriptions
       │
┌──────▼──────┐         ┌──────────────┐
│  Frontend  │◄────────┤     CMS     │
│  (Web App) │         │  (Admin)    │
└────────────┘         └──────┬───────┘
                              │
                              │ saveToCMS()
                              │
                       ┌──────▼──────┐
                       │  Supabase   │
                       │  (Insert/   │
                       │   Update)   │
                       └─────────────┘
```

## 🔧 Componentes Implementados

### 1. **useSupabaseRealtime** (`src/hooks/useSupabaseRealtime.ts`)
Hook para suscribirse a cambios en tiempo real de Supabase.

**Características:**
- Escucha INSERT, UPDATE, DELETE en tablas específicas
- Filtros opcionales por columnas
- Auto-desconexión al desmontar componente

**Uso:**
```typescript
useSupabaseRealtime({
  table: "news",
  onInsert: (payload) => console.log("Nueva noticia:", payload.new),
  onUpdate: (payload) => console.log("Noticia actualizada:", payload.new),
  onDelete: (payload) => console.log("Noticia eliminada:", payload.old),
})
```

### 2. **useCacheInvalidation** (`src/hooks/useCacheInvalidation.ts`)
Sistema de invalidación de cache para actualizar datos en el frontend.

**Características:**
- Listeners por tabla
- Eventos personalizados para invalidación
- Sincronización entre componentes

### 3. **useSupabaseQuery** (Actualizado)
Hook mejorado que ahora incluye:
- Sincronización en tiempo real automática
- Invalidación de cache cuando hay cambios
- Refetch automático después de cambios

**Uso:**
```typescript
const { data, loading, error } = useSupabaseQuery<NewsArticle>(
  TABLES.NEWS,
  (query) => query.eq("featured", true),
  { enableRealtime: true } // Opcional, true por defecto
)
```

### 4. **saveToCMS** (`src/lib/cms-sync.ts`)
Función helper para guardar en CMS y sincronizar automáticamente.

**Características:**
- Guarda en Supabase (insert/update)
- Invalida cache automáticamente
- Notifica a todos los componentes suscritos
- Retorna resultado con manejo de errores

**Uso:**
```typescript
const result = await saveToCMS("news", articleData, articleId)
if (result.success) {
  // Datos guardados y frontend actualizado automáticamente
}
```

## 📝 Cómo Funciona

### Cuando se guarda en el CMS:

1. **CMS guarda** → `saveToCMS("news", data, id)`
2. **Se guarda en Supabase** → `supabase.from("news").insert/update()`
3. **Se invalida cache** → `invalidateCacheAfterSave("news")`
4. **Se emite evento** → `window.dispatchEvent("cache-invalidate")`
5. **Frontend escucha** → `useCacheInvalidation` recibe el evento
6. **Se actualiza UI** → `useSupabaseQuery` refetch automático
7. **Realtime notifica** → Otros usuarios ven cambios en tiempo real

### Cuando hay cambios en Supabase (Realtime):

1. **Cambio en BD** → Supabase Realtime detecta INSERT/UPDATE/DELETE
2. **Hook escucha** → `useSupabaseRealtime` recibe el cambio
3. **Cache invalida** → `invalidateCache(table)`
4. **UI actualiza** → Todos los componentes con `useSupabaseQuery` refetch

## ✅ Formularios Actualizados

Los siguientes formularios del CMS ahora usan sincronización automática:

- ✅ `src/pages/admin/news-edit.tsx` - Noticias
- ✅ `src/pages/admin/events-edit.tsx` - Eventos
- 🔄 `src/pages/admin/releases-edit.tsx` - Lanzamientos (pendiente)
- 🔄 `src/pages/admin/videos-edit.tsx` - Videos (pendiente)
- 🔄 `src/pages/admin/reviews-edit.tsx` - Reviews (pendiente)
- 🔄 `src/pages/admin/products-edit.tsx` - Productos (pendiente)

## 🚀 Beneficios

1. **Sincronización Automática**: Los cambios en CMS se reflejan inmediatamente en el frontend
2. **Tiempo Real**: Múltiples usuarios ven cambios simultáneamente
3. **Cache Inteligente**: Se invalida solo cuando es necesario
4. **Menos Código**: Una función `saveToCMS` reemplaza múltiples llamadas
5. **Consistencia**: Todos los formularios usan el mismo sistema

## 📌 Próximos Pasos

Para completar la integración, actualizar los formularios restantes:

```typescript
// Antes:
const { error } = await supabase.from("table").insert(data)

// Después:
import { saveToCMS } from "@/lib/cms-sync"
const result = await saveToCMS("table", data, id)
```

## 🔍 Verificación

Para verificar que funciona:

1. Abre el CMS y crea/edita una noticia
2. Abre el frontend en otra pestaña
3. La noticia debería aparecer/actualizarse automáticamente sin recargar

## ⚙️ Configuración

No se requiere configuración adicional. El sistema funciona automáticamente con:
- Supabase Realtime habilitado (ya configurado)
- RLS policies correctas (ya implementadas)
- Variables de entorno de Supabase (ya configuradas)

---

**Estado**: ✅ Implementado y funcionando
**Última actualización**: Diciembre 2024

