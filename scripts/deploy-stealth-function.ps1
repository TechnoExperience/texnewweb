# Script para desplegar sync-ra-events-stealth sin usar .env
# Soluciona el problema de encoding del archivo .env

Write-Host "🚀 Desplegando sync-ra-events-stealth..." -ForegroundColor Cyan

# Cambiar al directorio de la función
$functionPath = "supabase\functions\sync-ra-events-stealth"
if (-not (Test-Path $functionPath)) {
    Write-Host "❌ Error: No se encuentra el directorio de la función" -ForegroundColor Red
    exit 1
}

# Intentar desplegar sin usar .env
# Usar variables de entorno directamente
$env:SUPABASE_PROJECT_REF = "ttuhkucedskdoblyxzub"

Write-Host "📦 Proyecto: $env:SUPABASE_PROJECT_REF" -ForegroundColor Yellow

# Desplegar la función
try {
    supabase functions deploy sync-ra-events-stealth --project-ref $env:SUPABASE_PROJECT_REF
    Write-Host "✅ Función desplegada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al desplegar: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternativa: Desplegar manualmente desde Supabase Dashboard" -ForegroundColor Yellow
    Write-Host "   1. Ve a: https://supabase.com/dashboard/project/ttuhkucedskdoblyxzub/functions" -ForegroundColor Yellow
    Write-Host "   2. Selecciona sync-ra-events-stealth" -ForegroundColor Yellow
    Write-Host "   3. Copia el contenido de supabase/functions/sync-ra-events-stealth/index.ts" -ForegroundColor Yellow
    Write-Host "   4. Pega y despliega" -ForegroundColor Yellow
    exit 1
}

