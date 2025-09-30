# Script de PowerShell para probar el pipeline completo de OptiCash
# Uso: .\scripts\test-pipeline.ps1

param(
    [string]$Environment = "dev",
    [switch]$SkipDockerCheck,
    [switch]$SkipGitCheck,
    [switch]$Verbose
)

# Configuración de colores
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Función para logging
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Error-Log {
    param([string]$Message)
    Write-Log "ERROR: $Message" $Red
}

function Write-Success-Log {
    param([string]$Message)
    Write-Log "SUCCESS: $Message" $Green
}

function Write-Warning-Log {
    param([string]$Message)
    Write-Log "WARNING: $Message" $Yellow
}

function Write-Info-Log {
    param([string]$Message)
    Write-Log "INFO: $Message" $Blue
}

# Banner de inicio
Write-Host "🚀 OPTICASH PIPELINE TEST SUITE 🚀" -ForegroundColor $Cyan
Write-Host "=====================================" -ForegroundColor $Cyan
Write-Host ""

# Verificar prerrequisitos
Write-Info-Log "🔍 Verificando prerrequisitos..."

if (-not $SkipDockerCheck) {
    # Verificar Docker
    try {
        $dockerVersion = docker --version
        Write-Success-Log "Docker disponible: $dockerVersion"
    } catch {
        Write-Error-Log "Docker no está instalado o no está en el PATH"
        exit 1
    }

    # Verificar Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-Success-Log "Docker Compose disponible: $composeVersion"
    } catch {
        Write-Error-Log "Docker Compose no está instalado o no está en el PATH"
        exit 1
    }
}

if (-not $SkipGitCheck) {
    # Verificar Git
    try {
        $gitVersion = git --version
        Write-Success-Log "Git disponible: $gitVersion"
    } catch {
        Write-Error-Log "Git no está instalado o no está en el PATH"
        exit 1
    }
}

# Verificar archivos necesarios
Write-Info-Log "📁 Verificando archivos del proyecto..."

$requiredFiles = @(
    "Jenkinsfile",
    "Dockerfile.docs",
    "docker-compose.yml",
    "nginx.conf",
    "index.html",
    "health.html"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success-Log "✅ $file encontrado"
    } else {
        Write-Error-Log "❌ $file no encontrado"
        exit 1
    }
}

# Verificar estructura de docs
Write-Info-Log "📚 Verificando estructura de documentación..."

$docsFiles = @(
    "docs/architecture.md",
    "docs/requirements.md",
    "docs/actors.md",
    "docs/use-cases.md",
    "docs/api-mapping.md",
    "docs/qos.md",
    "docs/uml-diagrams.md",
    "docs/entity-relationship-model.md"
)

foreach ($file in $docsFiles) {
    if (Test-Path $file) {
        Write-Success-Log "✅ $file encontrado"
    } else {
        Write-Warning-Log "⚠️ $file no encontrado"
    }
}

# Función para probar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$ExpectedContent = "",
        [int]$TimeoutSec = 10
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -TimeoutSec $TimeoutSec -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            if ($ExpectedContent -and $response.Content -notmatch $ExpectedContent) {
                Write-Warning-Log "⚠️ Respuesta inesperada en $Url"
                return $false
            }
            Write-Success-Log "✅ $Url - Status: $($response.StatusCode)"
            return $true
        } else {
            Write-Warning-Log "⚠️ $Url - Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Error-Log "❌ $Url - Error: $($_.Exception.Message)"
        return $false
    }
}

# Función para probar Docker
function Test-DockerContainer {
    param(
        [string]$ContainerName,
        [string]$Port,
        [string]$Path = "/"
    )
    
    $url = "http://localhost:$Port$Path"
    Write-Info-Log "🐳 Probando contenedor $ContainerName en puerto $Port..."
    
    # Verificar que el contenedor esté corriendo
    try {
        $container = docker ps -f "name=$ContainerName" --format "{{.Names}}"
        if ($container -eq $ContainerName) {
            Write-Success-Log "✅ Contenedor $ContainerName está corriendo"
        } else {
            Write-Error-Log "❌ Contenedor $ContainerName no está corriendo"
            return $false
        }
    } catch {
        Write-Error-Log "❌ Error al verificar contenedor $ContainerName"
        return $false
    }
    
    # Probar endpoint
    return Test-Endpoint -Url $url -ExpectedContent "OptiCash"
}

# Función para construir imagen Docker
function Build-DockerImage {
    param(
        [string]$ImageName,
        [string]$Dockerfile = "Dockerfile.docs"
    )
    
    Write-Info-Log "🔨 Construyendo imagen Docker: $ImageName"
    
    try {
        $buildOutput = docker build -f $Dockerfile -t $ImageName . 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success-Log "✅ Imagen $ImageName construida exitosamente"
            return $true
        } else {
            Write-Error-Log "❌ Error al construir imagen $ImageName"
            Write-Host $buildOutput -ForegroundColor $Red
            return $false
        }
    } catch {
        Write-Error-Log "❌ Error al construir imagen $ImageName: $($_.Exception.Message)"
        return $false
    }
}

# Función para ejecutar contenedor
function Start-DockerContainer {
    param(
        [string]$ContainerName,
        [string]$ImageName,
        [string]$Port
    )
    
    Write-Info-Log "🚀 Iniciando contenedor $ContainerName"
    
    try {
        # Detener contenedor existente si existe
        docker stop $ContainerName 2>$null
        docker rm $ContainerName 2>$null
        
        # Ejecutar nuevo contenedor
        $runOutput = docker run -d --name $ContainerName -p "${Port}:80" $ImageName 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success-Log "✅ Contenedor $ContainerName iniciado exitosamente"
            return $true
        } else {
            Write-Error-Log "❌ Error al iniciar contenedor $ContainerName"
            Write-Host $runOutput -ForegroundColor $Red
            return $false
        }
    } catch {
        Write-Error-Log "❌ Error al iniciar contenedor $ContainerName: $($_.Exception.Message)"
        return $false
    }
}

# Función para limpiar contenedores
function Cleanup-Containers {
    Write-Info-Log "🧹 Limpiando contenedores de prueba..."
    
    $containers = @("opticash-docs-dev", "opticash-docs-qa", "opticash-docs-prod")
    
    foreach ($container in $containers) {
        try {
            docker stop $container 2>$null
            docker rm $container 2>$null
            Write-Success-Log "✅ Contenedor $container limpiado"
        } catch {
            Write-Warning-Log "⚠️ Error al limpiar contenedor $container"
        }
    }
}

# Función para probar pipeline completo
function Test-CompletePipeline {
    param(
        [string]$Environment
    )
    
    Write-Info-Log "🧪 Iniciando prueba completa del pipeline para ambiente: $Environment"
    
    # Configurar variables según el ambiente
    $imageName = "opticash-docs:$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $containerName = "opticash-docs-$Environment"
    $port = switch ($Environment) {
        "dev" { "8080" }
        "qa" { "8081" }
        "prod" { "80" }
        default { "8080" }
    }
    
    # Paso 1: Construir imagen
    Write-Info-Log "📦 Paso 1: Construyendo imagen Docker..."
    if (-not (Build-DockerImage -ImageName $imageName)) {
        return $false
    }
    
    # Paso 2: Ejecutar contenedor
    Write-Info-Log "🚀 Paso 2: Ejecutando contenedor..."
    if (-not (Start-DockerContainer -ContainerName $containerName -ImageName $imageName -Port $port)) {
        return $false
    }
    
    # Paso 3: Esperar a que el contenedor esté listo
    Write-Info-Log "⏳ Paso 3: Esperando a que el contenedor esté listo..."
    Start-Sleep -Seconds 5
    
    # Paso 4: Probar endpoints
    Write-Info-Log "🔍 Paso 4: Probando endpoints..."
    
    $endpoints = @(
        @{ Url = "http://localhost:$port/health"; ExpectedContent = "Healthy" },
        @{ Url = "http://localhost:$port/"; ExpectedContent = "OptiCash" },
        @{ Url = "http://localhost:$port/docs/architecture.md"; ExpectedContent = "Arquitectura" }
    )
    
    $allTestsPassed = $true
    foreach ($endpoint in $endpoints) {
        if (-not (Test-Endpoint -Url $endpoint.Url -ExpectedContent $endpoint.ExpectedContent)) {
            $allTestsPassed = $false
        }
    }
    
    # Paso 5: Verificar logs del contenedor
    Write-Info-Log "📋 Paso 5: Verificando logs del contenedor..."
    try {
        $logs = docker logs $containerName 2>&1
        if ($logs -match "error" -or $logs -match "Error") {
            Write-Warning-Log "⚠️ Se encontraron errores en los logs del contenedor"
            Write-Host $logs -ForegroundColor $Yellow
        } else {
            Write-Success-Log "✅ Logs del contenedor sin errores"
        }
    } catch {
        Write-Warning-Log "⚠️ No se pudieron obtener los logs del contenedor"
    }
    
    return $allTestsPassed
}

# Función para generar reporte
function Generate-Report {
    param(
        [string]$Environment,
        [bool]$Success,
        [string]$TestResults
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $reportFile = "pipeline-test-report-$Environment-$timestamp.txt"
    
    $report = @"
OPTICASH PIPELINE TEST REPORT
============================
Environment: $Environment
Test Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Status: $(if ($Success) { "PASSED" } else { "FAILED" })

Test Results:
$TestResults

Docker Containers:
$(docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

Docker Images:
$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}")

System Info:
- OS: $($env:OS)
- PowerShell: $($PSVersionTable.PSVersion)
- Docker: $(docker --version)
- Docker Compose: $(docker-compose --version)
"@
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Success-Log "📊 Reporte generado: $reportFile"
}

# Función principal
function Main {
    Write-Info-Log "🎯 Iniciando pruebas del pipeline de OptiCash..."
    
    # Limpiar contenedores existentes
    Cleanup-Containers
    
    # Probar pipeline completo
    $testResults = @()
    $overallSuccess = $true
    
    # Probar cada ambiente
    $environments = @("dev", "qa", "prod")
    
    foreach ($env in $environments) {
        Write-Info-Log "🧪 Probando ambiente: $env"
        
        $envSuccess = Test-CompletePipeline -Environment $env
        $testResults += "Environment $env`: $(if ($envSuccess) { 'PASSED' } else { 'FAILED' })"
        
        if (-not $envSuccess) {
            $overallSuccess = $false
        }
        
        # Limpiar después de cada prueba
        Cleanup-Containers
    }
    
    # Generar reporte
    Generate-Report -Environment $Environment -Success $overallSuccess -TestResults ($testResults -join "`n")
    
    # Mostrar resumen
    Write-Host ""
    Write-Host "📊 RESUMEN DE PRUEBAS" -ForegroundColor $Cyan
    Write-Host "===================" -ForegroundColor $Cyan
    
    foreach ($result in $testResults) {
        if ($result -match "PASSED") {
            Write-Host "✅ $result" -ForegroundColor $Green
        } else {
            Write-Host "❌ $result" -ForegroundColor $Red
        }
    }
    
    Write-Host ""
    if ($overallSuccess) {
        Write-Success-Log "🎉 ¡Todas las pruebas del pipeline pasaron exitosamente!"
        Write-Host "🚀 El pipeline de OptiCash está listo para producción!" -ForegroundColor $Green
    } else {
        Write-Error-Log "❌ Algunas pruebas del pipeline fallaron"
        Write-Host "🔧 Revisa los logs y corrige los errores antes de continuar" -ForegroundColor $Red
    }
    
    Write-Host ""
    Write-Host "📚 Próximos pasos:" -ForegroundColor $Blue
    Write-Host "1. Revisar el reporte generado" -ForegroundColor $Yellow
    Write-Host "2. Configurar Jenkins con la guía en docs/jenkins-setup-guide.md" -ForegroundColor $Yellow
    Write-Host "3. Configurar webhooks de GitHub" -ForegroundColor $Yellow
    Write-Host "4. Probar el pipeline completo con Jenkins" -ForegroundColor $Yellow
}

# Ejecutar función principal
Main
