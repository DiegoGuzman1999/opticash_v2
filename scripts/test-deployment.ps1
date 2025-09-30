# Script de PowerShell para probar el despliegue de documentación
# Uso: .\scripts\test-deployment.ps1 [dev|qa|prod]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "qa", "prod")]
    [string]$Environment = "dev"
)

# Configuración de colores
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

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

# Función para probar URL
function Test-Url {
    param([string]$Url, [string]$Description)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success-Log "✅ $Description disponible"
            return $true
        } else {
            Write-Warning-Log "⚠️ $Description - Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Error-Log "❌ $Description - Error: $($_.Exception.Message)"
        return $false
    }
}

# Función para verificar contenedor Docker
function Test-DockerContainer {
    param([string]$ContainerName)
    
    try {
        $container = docker ps -f "name=$ContainerName" --format "{{.Names}}" | Select-String $ContainerName
        if ($container) {
            Write-Success-Log "✅ Contenedor $ContainerName está ejecutándose"
            return $true
        } else {
            Write-Error-Log "❌ Contenedor $ContainerName no está ejecutándose"
            return $false
        }
    } catch {
        Write-Error-Log "❌ Error al verificar contenedor $ContainerName"
        return $false
    }
}

# Inicio del script
Write-Log "🚀 Iniciando pruebas de despliegue de documentación OptiCash" $Blue
Write-Log "📋 Ambiente: $Environment" $Blue

# Verificar que Docker está disponible
Write-Log "🔍 Verificando Docker..." $Blue
try {
    $dockerVersion = docker --version
    Write-Success-Log "Docker disponible: $dockerVersion"
} catch {
    Write-Error-Log "Docker no está disponible o no está en el PATH"
    exit 1
}

# Configurar URL según ambiente
$BaseUrl = switch ($Environment) {
    "dev" { "http://localhost:8080" }
    "qa" { "http://localhost:8081" }
    "prod" { "http://localhost" }
    default { "http://localhost:8080" }
}

$ContainerName = "opticash-docs-$Environment"

Write-Log "🌐 URL base: $BaseUrl" $Blue
Write-Log "🐳 Contenedor: $ContainerName" $Blue

# Verificar contenedor
Write-Log "🔍 Verificando contenedor Docker..." $Blue
$containerRunning = Test-DockerContainer $ContainerName

if (-not $containerRunning) {
    Write-Error-Log "El contenedor no está ejecutándose. Ejecute el script de despliegue primero."
    exit 1
}

# Esperar a que el servicio esté listo
Write-Log "⏳ Esperando a que el servicio esté listo..." $Blue
Start-Sleep -Seconds 5

# Probar página principal
Write-Log "🏠 Probando página principal..." $Blue
$mainPageOk = Test-Url $BaseUrl "Página principal"

# Probar archivos de documentación
Write-Log "📚 Probando archivos de documentación..." $Blue

$DocsEndpoints = @(
    @{Url="$BaseUrl/docs/architecture.md"; Name="Arquitectura del Sistema"}
    @{Url="$BaseUrl/docs/requirements.md"; Name="Requisitos Funcionales"}
    @{Url="$BaseUrl/docs/non-functional-requirements.md"; Name="Requisitos No Funcionales"}
    @{Url="$BaseUrl/docs/actors.md"; Name="Actores Principales"}
    @{Url="$BaseUrl/docs/use-cases.md"; Name="Casos de Uso"}
    @{Url="$BaseUrl/docs/api-mapping.md"; Name="Mapeo de APIs"}
    @{Url="$BaseUrl/docs/qos.md"; Name="Calidad de Servicio"}
    @{Url="$BaseUrl/docs/uml-diagrams.md"; Name="Diagramas UML"}
    @{Url="$BaseUrl/docs/entity-relationship-model.md"; Name="Modelo Entidad-Relación"}
    @{Url="$BaseUrl/docs/release-notes.md"; Name="Notas de Versión"}
)

$successCount = 0
$totalCount = $DocsEndpoints.Count

foreach ($endpoint in $DocsEndpoints) {
    if (Test-Url $endpoint.Url $endpoint.Name) {
        $successCount++
    }
}

# Mostrar resumen
Write-Log "📊 Resumen de pruebas:" $Blue
Write-Log "   Página principal: $(if($mainPageOk) {'✅'} else {'❌'})" $Blue
Write-Log "   Archivos de documentación: $successCount/$totalCount" $Blue

# Mostrar información del contenedor
Write-Log "🐳 Información del contenedor:" $Blue
try {
    docker ps -f "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} catch {
    Write-Warning-Log "No se pudo obtener información del contenedor"
}

# Resultado final
if ($mainPageOk -and $successCount -eq $totalCount) {
    Write-Success-Log "🎉 Todas las pruebas pasaron exitosamente!"
    Write-Success-Log "🌐 Documentación disponible en: $BaseUrl"
    Write-Success-Log "📚 Lista de documentos: $BaseUrl/docs/"
    exit 0
} else {
    Write-Error-Log "❌ Algunas pruebas fallaron"
    Write-Error-Log "   Página principal: $(if($mainPageOk) {'OK'} else {'FALLO'})"
    Write-Error-Log "   Documentación: $successCount/$totalCount archivos disponibles"
    exit 1
}
