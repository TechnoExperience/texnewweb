# 🚀 Desplegar sync-ra-events-stealth

## ✅ Despliegue Exitoso

La función `sync-ra-events-stealth` ha sido desplegada exitosamente con las mejoras de debugging.

**Fecha:** 2025-12-04  
**Proyecto:** ttuhkucedskdoblyxzub  
**Estado:** ✅ Desplegada

---

## 📊 Mejoras Incluidas

La nueva versión incluye:

1. **`totalFound`** - Total de eventos encontrados en RA
2. **`cityStats`** - Estadísticas detalladas por ciudad:
   - `found`: eventos encontrados en RA
   - `created`: eventos creados
   - `skipped`: eventos saltados (ya existían)

### Ejemplo de Respuesta Mejorada

```json
{
  "success": true,
  "timestamp": "2025-12-04T02:39:45.229Z",
  "totalFound": 15,        // ← NUEVO
  "totalCreated": 0,
  "totalUpdated": 0,
  "totalSkipped": 15,
  "errors": [],
  "strategy": "stealth_mode",
  "citiesProcessed": 2,
  "cityStats": [            // ← NUEVO
    {
      "city": "Madrid",
      "found": 8,
      "created": 0,
      "skipped": 8
    },
    {
      "city": "Barcelona",
      "found": 7,
      "created": 0,
      "skipped": 7
    }
  ]
}
```

---

## 🔄 Desplegar en el Futuro

### Método 1: CLI (Recomendado)

Si el archivo `.env` tiene problemas de encoding:

```powershell
# Renombrar temporalmente .env
Rename-Item .env .env.backup -Force

# Desplegar
supabase functions deploy sync-ra-events-stealth --project-ref ttuhkucedskdoblyxzub

# Restaurar .env
Rename-Item .env.backup .env -Force
```

### Método 2: Dashboard de Supabase

1. Ve a: https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/functions
2. Selecciona `sync-ra-events-stealth`
3. Copia el contenido de `supabase/functions/sync-ra-events-stealth/index.ts`
4. Pega en el editor del dashboard
5. Haz clic en "Deploy"

### Método 3: Script PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File scripts\deploy-stealth-function.ps1
```

---

## ⚠️ Problema con .env

El archivo `.env` tiene un problema de encoding (BOM o caracteres especiales). 

**Solución temporal:** Renombrar el archivo antes de desplegar.

**Solución permanente:** 
1. Abrir `.env` en un editor de texto
2. Guardar como UTF-8 sin BOM
3. O recrear el archivo desde cero

---

## 🧪 Probar la Función

### Manualmente

```bash
curl -X POST https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Desde el Dashboard

1. Ve a: https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/functions
2. Selecciona `sync-ra-events-stealth`
3. Haz clic en "Invoke"
4. Revisa los logs y la respuesta

---

## 📝 Verificar Resultados

Con las nuevas mejoras, podrás ver:

- ✅ Cuántos eventos se encontraron en RA (`totalFound`)
- ✅ Cuántos se crearon (`totalCreated`)
- ✅ Cuántos ya existían (`totalSkipped`)
- ✅ Estadísticas detalladas por ciudad (`cityStats`)

Esto te ayudará a entender si:
- No se encontraron eventos en RA (`totalFound: 0`)
- Se encontraron pero ya existían (`totalFound > 0`, `totalSkipped > 0`)
- Hubo un problema en el parsing

---

## 🔗 Enlaces Útiles

- **Dashboard de Funciones:** https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/functions
- **Logs:** https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/logs/edge-functions
- **Documentación:** `docs/RA_STEALTH_SYNC.md`

