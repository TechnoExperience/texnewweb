# Script para probar la aplicación en producción
# Verifica que la aplicación esté funcionando correctamente

param(
    [string]$Url = "https://techno-experience-fbaaisrec-technoexperiences-projects.vercel.app"
)

Write-Host "🧪 Probando Aplicación en Producción" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: $Url" -ForegroundColor Gray
Write-Host ""

# 1. Verificar que la URL responde
Write-Host "1️⃣ Verificando que la URL responde..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ La aplicación responde (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Respuesta inesperada: HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error al conectar: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Verificar headers de seguridad
Write-Host "2️⃣ Verificando Headers de Seguridad..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing
    
    $securityHeaders = @{
        "X-Frame-Options" = "DENY"
        "X-XSS-Protection" = "1; mode=block"
        "X-Content-Type-Options" = "nosniff"
    }
    
    foreach ($header in $securityHeaders.Keys) {
        if ($response.Headers[$header]) {
            if ($response.Headers[$header] -eq $securityHeaders[$header]) {
                Write-Host "   ✅ $header configurado correctamente" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  $header tiene valor incorrecto: $($response.Headers[$header])" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ⚠️  $header NO encontrado" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ⚠️  No se pudieron verificar headers: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar que el HTML carga
Write-Host "3️⃣ Verificando contenido HTML..." -ForegroundColor Yellow
try {
    $htmlContent = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing
    if ($htmlContent.Content -match "root") {
        Write-Host "   ✅ HTML contiene elemento root" -ForegroundColor Green
    }
    if ($htmlContent.Content -match "script") {
        Write-Host "   ✅ HTML contiene scripts" -ForegroundColor Green
    }
    if ($htmlContent.Content -match "preconnect") {
        Write-Host "   ✅ HTML contiene preconnect (optimización)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Error al obtener HTML: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Instrucciones para pruebas manuales
Write-Host "4️⃣ Pruebas Manuales Requeridas:" -ForegroundColor Yellow
Write-Host "   Abre la URL en el navegador y verifica:" -ForegroundColor White
Write-Host "   - [ ] La página carga correctamente" -ForegroundColor White
Write-Host "   - [ ] No hay errores en la consola (F12)" -ForegroundColor White
Write-Host "   - [ ] Las imágenes cargan con lazy loading" -ForegroundColor White
Write-Host "   - [ ] El login funciona" -ForegroundColor White
Write-Host "   - [ ] El panel admin es accesible" -ForegroundColor White
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Pruebas básicas completadas" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para más pruebas, ejecuta Lighthouse audit en Chrome DevTools" -ForegroundColor Cyan
Write-Host ""

