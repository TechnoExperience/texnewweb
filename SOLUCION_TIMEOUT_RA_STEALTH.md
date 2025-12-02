# ⚡ Solución para Timeout (504) en RA Stealth Sync

## 🔍 Problema Detectado

Error **504 Gateway Timeout** - La función tarda demasiado en ejecutarse.

## ✅ Soluciones Aplicadas

### 1. **Reducir Ciudades** (2 en lugar de 5)
- Solo Madrid y Barcelona inicialmente
- Puedes aumentar después de verificar que funciona

### 2. **Reducir Delays**
- Entre ciudades: **2-4 segundos** (antes 5-10s)
- Entre eventos: **200-800ms** (antes 500-1500ms)

### 3. **Limitar Eventos**
- Máximo **10 eventos por ciudad** (antes 20)
- Total: ~20 eventos máximo por sync

## 🚀 Pasos para Actualizar

### 1. Actualizar la Función en Supabase

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions/sync-ra-events-stealth
2. Abre el archivo actualizado: `supabase/functions/sync-ra-events-stealth/index.ts`
3. Copia el contenido actualizado
4. Pega en el editor de Supabase
5. Haz clic en **Deploy**

### 2. Probar Nuevamente

```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDk2NjEsImV4cCI6MjA3OTQ4NTY2MX0.CsM_dqls-fyk8qB7C17f2Mn3cnIrXRFTaY2BsDIJKOg"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "https://cfgfshoobuvycrbhnvkd.supabase.co/functions/v1/sync-ra-events-stealth" -Method POST -Headers $headers -TimeoutSec 120
    Write-Host "✅ Éxito:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
```

### 3. Aumentar Timeout (Si es necesario)

Si aún hay timeout, puedes aumentar el timeout de Supabase:

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/settings/functions
2. Busca "Function Timeout"
3. Aumenta a **300 segundos** (5 minutos) si es posible

## 📊 Configuración Actual (Optimizada)

```typescript
// Ciudades: 2 (Madrid, Barcelona)
// Eventos por ciudad: 10 máximo
// Delay entre ciudades: 2-4 segundos
// Delay entre eventos: 200-800ms
// Tiempo estimado: ~30-60 segundos
```

## 🔄 Aumentar Ciudades Después

Una vez que funcione, puedes aumentar gradualmente:

```typescript
// Paso 1: Añadir Valencia
const TARGET_CITIES = [
  { city: 'Madrid', area: 'madrid' },
  { city: 'Barcelona', area: 'barcelona' },
  { city: 'Valencia', area: 'valencia' },
]

// Paso 2: Añadir más ciudades
// ... etc
```

## ⚠️ Si Sigue Habiendo Timeout

### Opción A: Ejecutar en Background (Async)

Modifica la función para que retorne inmediatamente y procese en background:

```typescript
// Al inicio de la función, retornar inmediatamente
return new Response(
  JSON.stringify({ status: 'started', message: 'Sync iniciado en background' }),
  { headers: corsHeaders, status: 202 }
)

// Procesar en background (requiere configuración adicional)
```

### Opción B: Dividir en Múltiples Llamadas

- Llamar la función una vez por ciudad
- Programar múltiples cron jobs (uno por ciudad)

### Opción C: Usar Supabase Database Webhooks

- Configurar webhook que se ejecute después de cada sync
- Procesar ciudades de forma secuencial

---

**La función actualizada debería ejecutarse en ~30-60 segundos** ⚡

