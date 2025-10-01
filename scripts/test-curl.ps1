# Script de PowerShell para probar endpoints con curl

Write-Host "🧪 Probando endpoints de OptiCash con curl..." -ForegroundColor Green
Write-Host ""

# 1. Health Check
Write-Host "1. 🏥 Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. Endpoint Principal
Write-Host "2. 🏠 Endpoint Principal" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/" -Method GET
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Información de API
Write-Host "3. 📋 Información de API" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/info" -Method GET
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Categorías
Write-Host "4. 🏷️ Categorías" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/categories" -Method GET
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    if ($data.success) {
        Write-Host "   ✅ Total categorías: $($data.data.Count)" -ForegroundColor Green
        Write-Host "   📊 Gastos: $(($data.data | Where-Object { $_.tipo -eq 'gasto' }).Count)" -ForegroundColor Cyan
        Write-Host "   📊 Ingresos: $(($data.data | Where-Object { $_.tipo -eq 'ingreso' }).Count)" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Error: $($data.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. Probar endpoint inexistente
Write-Host "5. 🚫 Endpoint Inexistente" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/nonexistent" -Method GET
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Pruebas con curl completadas!" -ForegroundColor Green
