# 🔍 Debugging sync-ra-events-stealth

**Fecha:** 2025-12-04  
**Problema:** La respuesta no incluye `totalFound` y `cityStats`  
**Estado:** 🔄 Investigando

---

## 📊 Situación Actual

### Respuesta Recibida

```json
{
  "success": true,
  "timestamp": "2025-12-04T12:09:54.109Z",
  "totalCreated": 0,
  "totalUpdated": 0,
  "totalSkipped": 0,
  "errors": [],
  "strategy": "stealth_mode",
  "citiesProcessed": 2
}
```

### ⚠️ Campos Faltantes

- ❌ `totalFound` - No aparece en la respuesta
- ❌ `cityStats` - No aparece en la respuesta

---

## 🔍 Análisis

### Código Local

El código local **SÍ incluye** estos campos:

```typescript
// Línea 195
let totalFound = 0 // Total eventos encontrados en RA
const cityStats: Array<{ city: string; found: number; created: number; skipped: number }> = []

// Línea 481-492
const result = {
  success: errors.length < TARGET_CITIES.length,
  timestamp: new Date().toISOString(),
  totalFound, // Total eventos encontrados en RA
  totalCreated,
  totalUpdated,
  totalSkipped,
  errors: errors.slice(0, 10),
  strategy: 'stealth_mode',
  citiesProcessed: TARGET_CITIES.length,
  cityStats, // Estadísticas por ciudad
}
```

### Posibles Causas

1. **Caché de Supabase** - La función puede estar usando una versión en caché
2. **Despliegue incompleto** - Aunque el despliegue dice "Deployed", puede no haberse propagado
3. **Problema de serialización** - JavaScript puede estar omitiendo campos `undefined`
4. **Versión anterior** - La función desplegada puede ser una versión anterior

---

## ✅ Verificaciones Realizadas

1. ✅ Código local tiene `totalFound` y `cityStats`
2. ✅ Función redesplegada múltiples veces
3. ✅ Hash del archivo verificado
4. ✅ Estructura del resultado verificada

---

## 🔧 Soluciones a Probar

### 1. Verificar Logs en Supabase Dashboard

1. Ve a: https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/logs/edge-functions
2. Busca: `sync-ra-events-stealth`
3. Revisa: El mensaje `✅ Sync completado:` debería mostrar el objeto completo con `totalFound` y `cityStats`

### 2. Esperar Propagación

A veces Supabase tarda unos minutos en propagar los cambios. Espera 2-3 minutos y prueba nuevamente.

### 3. Forzar Nuevo Despliegue

```bash
# Eliminar y redesplegar
supabase functions delete sync-ra-events-stealth --project-ref ttuhkucedskdoblyxzub
supabase functions deploy sync-ra-events-stealth --project-ref ttuhkucedskdoblyxzub
```

### 4. Verificar Versión Desplegada

En Supabase Dashboard:
1. Ve a Functions → sync-ra-events-stealth
2. Revisa el código desplegado
3. Verifica que incluya `totalFound` y `cityStats`

---

## 🧪 Prueba Manual

### Verificar que los Campos se Están Calculando

Agrega logging temporal para verificar:

```typescript
console.log('🔍 Debug - totalFound:', totalFound)
console.log('🔍 Debug - cityStats:', JSON.stringify(cityStats))
console.log('🔍 Debug - result:', JSON.stringify(result))
```

### Verificar en los Logs

Los logs deberían mostrar:
```
🔍 Debug - totalFound: 15
🔍 Debug - cityStats: [{"city":"Madrid","found":8,"created":0,"skipped":8},...]
```

---

## 📝 Próximos Pasos

1. ✅ **Logging temporal agregado** - Implementado según documentación
2. ✅ **Función redesplegada** - Con logging completo
3. 🔄 **Revisar logs en Supabase Dashboard** - Ver qué está pasando realmente
4. 🔄 **Esperar propagación** - Dar tiempo para que los cambios se propaguen
5. 🔄 **Verificar versión desplegada** - Comparar código desplegado vs local

## ✅ Logging Implementado

Se ha agregado logging detallado en los siguientes puntos:

1. **Antes de crear el resultado:**
   - `🔍 Debug - totalFound: X`
   - `🔍 Debug - cityStats: [...]`
   - `🔍 Debug - totalCreated: X`
   - `🔍 Debug - totalSkipped: X`
   - `🔍 Debug - errors.length: X`

2. **Después de encontrar eventos:**
   - `🔍 Debug - raEvents es array: true/false`
   - `🔍 Debug - raEvents.length: X`
   - `🔍 Debug - totalFound después de {city}: X`

3. **Después de procesar cada ciudad:**
   - `🔍 Debug - cityStat para {city}: {...}`
   - `🔍 Debug - cityStats después de {city}: [...]`

4. **Antes de retornar:**
   - `✅ Sync completado: {...}` (objeto completo serializado)
   - `🔍 Debug - result.totalFound: X`
   - `🔍 Debug - result.cityStats: [...]`

---

## 💡 Nota Importante

Si los valores están todos en 0 (`totalCreated: 0`, `totalSkipped: 0`), puede ser que:

1. **No se encontraron eventos** - `totalFound` debería ser 0
2. **Los eventos ya existen** - `totalSkipped` debería incrementarse (pero no lo hace)
3. **Hay un problema en el loop** - Los eventos no se están procesando

**El campo `totalFound` es crucial para entender qué está pasando.**

---

## ✅ Estado

- ✅ Código local correcto
- ✅ Función redesplegada
- 🔄 Esperando verificación de logs
- 🔄 Investigando por qué no aparecen los campos

**Recomendación:** Revisar los logs en Supabase Dashboard para ver el objeto `result` completo que se está logueando.

