# Script de Verificación Completa Post-Despliegue
# PowerShell Script para verificar todas las configuraciones

Write-Host "🔍 Verificación Completa Post-Despliegue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Vercel CLI
Write-Host "1️⃣ Verificando Vercel CLI..." -ForegroundColor Yellow
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "   ✅ Vercel CLI instalado" -ForegroundColor Green
    $vercelVersion = vercel --version
    Write-Host "   Versión: $vercelVersion" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Vercel CLI no encontrado" -ForegroundColor Yellow
    Write-Host "   Instala con: npm i -g vercel" -ForegroundColor Gray
}

Write-Host ""

# 2. Verificar Variables de Entorno Locales
Write-Host "2️⃣ Verificando Variables de Entorno Locales..." -ForegroundColor Yellow
$envFile = ".env"
$envLocalFile = ".env.local"

$requiredVars = @("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY")

if (Test-Path $envFile) {
    Write-Host "   ✅ Archivo .env encontrado" -ForegroundColor Green
    foreach ($var in $requiredVars) {
        if (Select-String -Path $envFile -Pattern "^$var=" -Quiet) {
            Write-Host "   ✅ $var configurada" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $var NO encontrada" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "   Crea .env basándote en .env.example" -ForegroundColor Gray
}

Write-Host ""

# 3. Verificar Variables en Vercel (si CLI está disponible)
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "3️⃣ Verificando Variables en Vercel..." -ForegroundColor Yellow
    Write-Host "   Ejecutando: vercel env ls" -ForegroundColor Gray
    try {
        $envList = vercel env ls 2>&1
        if ($envList -match "VITE_SUPABASE_URL") {
            Write-Host "   ✅ VITE_SUPABASE_URL encontrada en Vercel" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  VITE_SUPABASE_URL NO encontrada en Vercel" -ForegroundColor Yellow
        }
        if ($envList -match "VITE_SUPABASE_ANON_KEY") {
            Write-Host "   ✅ VITE_SUPABASE_ANON_KEY encontrada en Vercel" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  VITE_SUPABASE_ANON_KEY NO encontrada en Vercel" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   WARNING: No se pudo verificar (necesitas estar logueado en Vercel)" -ForegroundColor Yellow
        Write-Host "   Ejecuta: vercel login" -ForegroundColor Gray
    }
} else {
    Write-Host "3️⃣ No se puede verificar Vercel (CLI no instalado)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Verificar Build
Write-Host "4️⃣ Verificando configuración de build..." -ForegroundColor Yellow
if (Test-Path "vite.config.ts") {
    Write-Host "   ✅ vite.config.ts encontrado" -ForegroundColor Green
    $viteConfig = Get-Content "vite.config.ts" -Raw
    if ($viteConfig -match "manualChunks") {
        Write-Host "   ✅ Code splitting configurado" -ForegroundColor Green
    }
    if ($viteConfig -match "terser") {
        Write-Host "   ✅ Minificación configurada" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  vite.config.ts no encontrado" -ForegroundColor Yellow
}

Write-Host ""

# 5. Verificar Headers de Seguridad
Write-Host "5️⃣ Verificando Headers de Seguridad..." -ForegroundColor Yellow
if (Test-Path "vercel.json") {
    Write-Host "   ✅ vercel.json encontrado" -ForegroundColor Green
    $vercelConfig = Get-Content "vercel.json" -Raw
    if ($vercelConfig -match "X-Frame-Options") {
        Write-Host "   ✅ X-Frame-Options configurado" -ForegroundColor Green
    }
    if ($vercelConfig -match "X-XSS-Protection") {
        Write-Host "   ✅ X-XSS-Protection configurado" -ForegroundColor Green
    }
    if ($vercelConfig -match "X-Content-Type-Options") {
        Write-Host "   ✅ X-Content-Type-Options configurado" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  vercel.json no encontrado" -ForegroundColor Yellow
}

Write-Host ""

# 6. Verificar Edge Function
Write-Host "6️⃣ Verificando Edge Function RA..." -ForegroundColor Yellow
$edgeFunctionPath = "supabase/functions/sync-ra-events-stealth/index.ts"
if (Test-Path $edgeFunctionPath) {
    Write-Host "   ✅ Edge Function encontrada" -ForegroundColor Green
    $edgeFunction = Get-Content $edgeFunctionPath -Raw
    if ($edgeFunction -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "   ✅ Usa SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Green
    }
    if ($edgeFunction -notmatch "https://cfgfshoobuvycrbhnvkd") {
        Write-Host "   ✅ Sin URLs hardcodeadas" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Edge Function no encontrada" -ForegroundColor Yellow
}

Write-Host ""

# 7. Verificar Documentación
Write-Host "7️⃣ Verificando Documentación..." -ForegroundColor Yellow
$docs = @(
    "RESUMEN_DESPLIEGUE.md",
    "VERIFICAR_DESPLIEGUE.md",
    "MONITOREO_METRICAS.md",
    "OPTIMIZACIONES_SEGURIDAD.md"
)
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "   ✅ $doc encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $doc NO encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Verificación Completa" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos manuales:" -ForegroundColor Cyan
Write-Host "   1. Verifica variables en Vercel Dashboard" -ForegroundColor White
Write-Host "   2. Verifica Edge Function en Supabase Dashboard" -ForegroundColor White
Write-Host "   3. Prueba la aplicación en producción" -ForegroundColor White
Write-Host "   4. Ejecuta Lighthouse audit" -ForegroundColor White
Write-Host ""

