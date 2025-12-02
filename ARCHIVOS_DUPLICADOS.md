# Análisis de Archivos Duplicados

## 📋 Resumen

He identificado varios archivos duplicados o no utilizados en el proyecto:

---

## 🔴 ARCHIVOS DUPLICADOS/NO USADOS

### 1. **Home Pages** (3 archivos)

#### ✅ `src/pages/home.tsx` - **MANTENER**
- **Estado**: ✅ Activo y en uso
- **Ruta**: `/` (página principal)
- **Uso**: Página principal oficial con todas las secciones (Events, Releases, Reviews, Videos)
- **Acción**: **MANTENER**

#### ❌ `src/pages/home-animated.tsx` - **ELIMINAR**
- **Estado**: ❌ No se usa en ninguna parte
- **Ruta**: No tiene ruta asignada
- **Uso**: Versión experimental con cards animadas flotantes
- **Problema**: Código muerto, no referenciado en `App.tsx`
- **Acción**: **ELIMINAR** ⚠️

#### ⚠️ `src/pages/home-layout.tsx` - **EVALUAR**
- **Estado**: ⚠️ Tiene ruta pero probablemente no se usa
- **Ruta**: `/layout` (ruta alternativa)
- **Uso**: Layout experimental con sidebar "ENTERO"
- **Problema**: Ruta alternativa que probablemente no se necesita
- **Acción**: **ELIMINAR** (a menos que se use para pruebas) ⚠️

---

### 2. **Event Cards** (4 archivos)

#### ❌ `src/components/event-card.tsx` - **ELIMINAR**
- **Estado**: ❌ Versión antigua/duplicada
- **Líneas**: 28 líneas (muy básico)
- **Problema**: Versión antigua que no se usa, reemplazada por versiones en `cards/`
- **Acción**: **ELIMINAR** ⚠️

#### ✅ `src/components/cards/event-card.tsx` - **MANTENER**
- **Estado**: ✅ Versión moderna y completa
- **Líneas**: 78 líneas
- **Uso**: Card estándar de eventos con imagen, fecha, venue, lineup
- **Acción**: **MANTENER**

#### ✅ `src/components/cards/event-card-compact.tsx` - **MANTENER**
- **Estado**: ✅ Versión compacta útil
- **Líneas**: 48 líneas
- **Uso**: Card compacta para listas (thumbnail pequeño)
- **Acción**: **MANTENER**

#### ✅ `src/components/cards/event-card-large.tsx` - **MANTENER**
- **Estado**: ✅ Versión grande útil
- **Líneas**: 92 líneas
- **Uso**: Card grande con más detalles y descripción
- **Acción**: **MANTENER**

---

## 📊 Estadísticas

- **Archivos eliminados**: 2 ✅
  - ✅ `src/pages/home-animated.tsx` - ELIMINADO
  - ✅ `src/components/event-card.tsx` - ELIMINADO

- **Archivos a evaluar**: 1
  - ⚠️ `src/pages/home-layout.tsx` - Tiene ruta `/layout` pero probablemente no se usa

- **Imports limpiados**: 1 ✅
  - ✅ `PortfolioHeader` - Removido de `App.tsx` (no se usaba)

- **Archivos a mantener**: 4
  - `src/pages/home.tsx`
  - `src/components/cards/event-card.tsx`
  - `src/components/cards/event-card-compact.tsx`
  - `src/components/cards/event-card-large.tsx`

---

## 🔧 Acciones Recomendadas

### Paso 1: Verificar uso de `home-layout.tsx`
```bash
# Buscar referencias
grep -r "home-layout" src/
grep -r "/layout" src/
```

### ✅ Paso 2: Archivos eliminados (COMPLETADO)
1. ✅ Eliminado `src/pages/home-animated.tsx`
2. ✅ Eliminado `src/components/event-card.tsx`
3. ✅ Limpiado import de `PortfolioHeader` en `App.tsx`
4. ✅ Limpiado import y ruta de `HomeLayoutPage` en `App.tsx`

### ⚠️ Paso 3: Archivo pendiente de evaluación
- `src/pages/home-layout.tsx` - Si no se usa la ruta `/layout`, se puede eliminar también

---

## ⚠️ Advertencias

- **Backup**: Hacer backup antes de eliminar
- **Git**: Los archivos estarán en el historial de Git
- **Testing**: Probar la aplicación después de eliminar

---

## ✅ Beneficios

- ✅ Código más limpio
- ✅ Menos confusión
- ✅ Mejor mantenibilidad
- ✅ Build más rápido (menos archivos)

