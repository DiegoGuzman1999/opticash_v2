# Script para probar el Dockerfile.docs
# Uso: .\scripts\test-dockerfile.ps1

Write-Host "🐳 Probando Dockerfile.docs..." -ForegroundColor Cyan

# Verificar que Docker está disponible
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker disponible: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está disponible. Por favor, inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar archivos necesarios
Write-Host "`n📁 Verificando archivos necesarios..." -ForegroundColor Blue

$requiredFiles = @(
    "Dockerfile.docs",
    "index.html",
    "health.html",
    "nginx.conf",
    "docs/architecture.md"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Faltan archivos necesarios. No se puede construir la imagen." -ForegroundColor Red
    exit 1
}

# Construir imagen Docker
Write-Host "`n🔨 Construyendo imagen Docker..." -ForegroundColor Blue

try {
    $buildOutput = docker build -f Dockerfile.docs -t opticash-docs:test . 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Imagen construida exitosamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al construir imagen:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al construir imagen: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Ejecutar contenedor de prueba
Write-Host "`n🚀 Ejecutando contenedor de prueba..." -ForegroundColor Blue

try {
    # Detener contenedor existente si existe
    docker stop opticash-docs-test 2>$null
    docker rm opticash-docs-test 2>$null
    
    # Ejecutar nuevo contenedor
    $runOutput = docker run -d --name opticash-docs-test -p 8080:80 opticash-docs:test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contenedor iniciado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al iniciar contenedor:" -ForegroundColor Red
        Write-Host $runOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al iniciar contenedor: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Esperar a que el contenedor esté listo
Write-Host "`n⏳ Esperando a que el contenedor esté listo..." -ForegroundColor Blue
Start-Sleep -Seconds 5

# Probar endpoints
Write-Host "`n🔍 Probando endpoints..." -ForegroundColor Blue

$endpoints = @(
    @{ Url = "http://localhost:8080/health.html"; Name = "Health Check" },
    @{ Url = "http://localhost:8080/"; Name = "Página Principal" },
    @{ Url = "http://localhost:8080/docs/architecture.md"; Name = "Documentación" }
)

$allTestsPassed = $true
foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($endpoint.Name) - Status: $($response.StatusCode)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($endpoint.Name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($endpoint.Name) - Error: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }
}

# Verificar logs del contenedor
Write-Host "`n📋 Verificando logs del contenedor..." -ForegroundColor Blue

try {
    $logs = docker logs opticash-docs-test 2>&1
    if ($logs -match "error" -or $logs -match "Error") {
        Write-Host "⚠️ Se encontraron errores en los logs:" -ForegroundColor Yellow
        Write-Host $logs -ForegroundColor Yellow
    } else {
        Write-Host "✅ Logs del contenedor sin errores" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ No se pudieron obtener los logs del contenedor" -ForegroundColor Yellow
}

# Limpiar contenedor de prueba
Write-Host "`n🧹 Limpiando contenedor de prueba..." -ForegroundColor Blue

try {
    docker stop opticash-docs-test 2>$null
    docker rm opticash-docs-test 2>$null
    Write-Host "✅ Contenedor limpiado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error al limpiar contenedor: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Resumen
Write-Host "`n📊 RESUMEN" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan

if ($allTestsPassed) {
    Write-Host "✅ Dockerfile.docs funciona correctamente" -ForegroundColor Green
    Write-Host "🎉 La imagen se construye y ejecuta sin errores" -ForegroundColor Green
} else {
    Write-Host "❌ Dockerfile.docs tiene problemas" -ForegroundColor Red
    Write-Host "🔧 Revisa los errores anteriores" -ForegroundColor Red
}

Write-Host "`n📚 Próximos pasos:" -ForegroundColor Blue
Write-Host "1. Si todo está bien, puedes usar: docker build -f Dockerfile.docs -t opticash-docs ." -ForegroundColor Yellow
Write-Host "2. Ejecutar: docker run -d --name opticash-docs -p 8080:80 opticash-docs" -ForegroundColor Yellow
Write-Host "3. Acceder a: http://localhost:8080" -ForegroundColor Yellow
