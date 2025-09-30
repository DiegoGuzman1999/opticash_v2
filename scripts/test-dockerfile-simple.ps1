# Script simple para probar el Dockerfile.docs
# Uso: .\scripts\test-dockerfile-simple.ps1

Write-Host "Probando Dockerfile.docs..." -ForegroundColor Cyan

# Verificar que Docker está disponible
try {
    $dockerVersion = docker --version
    Write-Host "Docker disponible: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker no está disponible. Por favor, inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar archivos necesarios
Write-Host "Verificando archivos necesarios..." -ForegroundColor Blue

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
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "FALTA: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "Faltan archivos necesarios. No se puede construir la imagen." -ForegroundColor Red
    exit 1
}

# Construir imagen Docker
Write-Host "Construyendo imagen Docker..." -ForegroundColor Blue

try {
    $buildOutput = docker build -f Dockerfile.docs -t opticash-docs:test . 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Imagen construida exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Error al construir imagen:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error al construir imagen: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Ejecutar contenedor de prueba
Write-Host "Ejecutando contenedor de prueba..." -ForegroundColor Blue

try {
    # Detener contenedor existente si existe
    docker stop opticash-docs-test 2>$null
    docker rm opticash-docs-test 2>$null
    
    # Ejecutar nuevo contenedor
    $runOutput = docker run -d --name opticash-docs-test -p 8080:80 opticash-docs:test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Contenedor iniciado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Error al iniciar contenedor:" -ForegroundColor Red
        Write-Host $runOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error al iniciar contenedor: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Esperar a que el contenedor esté listo
Write-Host "Esperando a que el contenedor esté listo..." -ForegroundColor Blue
Start-Sleep -Seconds 5

# Probar endpoints
Write-Host "Probando endpoints..." -ForegroundColor Blue

$endpoints = @(
    @{ Url = "http://localhost:8080/health.html"; Name = "Health Check" },
    @{ Url = "http://localhost:8080/"; Name = "Pagina Principal" },
    @{ Url = "http://localhost:8080/docs/architecture.md"; Name = "Documentacion" }
)

$allTestsPassed = $true
foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "OK: $($endpoint.Name) - Status: $($response.StatusCode)" -ForegroundColor Green
        } else {
            Write-Host "WARNING: $($endpoint.Name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "ERROR: $($endpoint.Name) - Error: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }
}

# Limpiar contenedor de prueba
Write-Host "Limpiando contenedor de prueba..." -ForegroundColor Blue

try {
    docker stop opticash-docs-test 2>$null
    docker rm opticash-docs-test 2>$null
    Write-Host "Contenedor limpiado" -ForegroundColor Green
} catch {
    Write-Host "Error al limpiar contenedor: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Resumen
Write-Host "RESUMEN" -ForegroundColor Cyan

if ($allTestsPassed) {
    Write-Host "Dockerfile.docs funciona correctamente" -ForegroundColor Green
    Write-Host "La imagen se construye y ejecuta sin errores" -ForegroundColor Green
} else {
    Write-Host "Dockerfile.docs tiene problemas" -ForegroundColor Red
    Write-Host "Revisa los errores anteriores" -ForegroundColor Red
}

Write-Host "Proximos pasos:" -ForegroundColor Blue
Write-Host "1. Si todo está bien, puedes usar: docker build -f Dockerfile.docs -t opticash-docs ." -ForegroundColor Yellow
Write-Host "2. Ejecutar: docker run -d --name opticash-docs -p 8080:80 opticash-docs" -ForegroundColor Yellow
Write-Host "3. Acceder a: http://localhost:8080" -ForegroundColor Yellow
