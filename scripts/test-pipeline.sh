#!/bin/bash

# Script de Bash para probar el pipeline completo de OptiCash
# Uso: ./scripts/test-pipeline.sh [environment]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-"dev"}
VERBOSE=${VERBOSE:-false}

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Banner de inicio
echo -e "${CYAN}🚀 OPTICASH PIPELINE TEST SUITE 🚀${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

# Verificar prerrequisitos
info "🔍 Verificando prerrequisitos..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado o no está en el PATH"
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado o no está en el PATH"
fi

# Verificar Git
if ! command -v git &> /dev/null; then
    error "Git no está instalado o no está en el PATH"
fi

success "Prerrequisitos verificados"

# Verificar archivos necesarios
info "📁 Verificando archivos del proyecto..."

required_files=(
    "Jenkinsfile"
    "Dockerfile.docs"
    "docker-compose.yml"
    "nginx.conf"
    "index.html"
    "health.html"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        success "✅ $file encontrado"
    else
        error "❌ $file no encontrado"
    fi
done

# Verificar estructura de docs
info "📚 Verificando estructura de documentación..."

docs_files=(
    "docs/architecture.md"
    "docs/requirements.md"
    "docs/actors.md"
    "docs/use-cases.md"
    "docs/api-mapping.md"
    "docs/qos.md"
    "docs/uml-diagrams.md"
    "docs/entity-relationship-model.md"
)

for file in "${docs_files[@]}"; do
    if [ -f "$file" ]; then
        success "✅ $file encontrado"
    else
        warning "⚠️ $file no encontrado"
    fi
done

# Función para probar endpoint
test_endpoint() {
    local url="$1"
    local method="${2:-GET}"
    local expected_content="$3"
    local timeout_sec="${4:-10}"
    
    if curl -f -s --max-time "$timeout_sec" -X "$method" "$url" > /dev/null 2>&1; then
        if [ -n "$expected_content" ]; then
            if curl -s --max-time "$timeout_sec" "$url" | grep -q "$expected_content"; then
                success "✅ $url - Contenido verificado"
                return 0
            else
                warning "⚠️ $url - Contenido inesperado"
                return 1
            fi
        else
            success "✅ $url - Status: 200"
            return 0
        fi
    else
        error "❌ $url - Error de conexión"
    fi
}

# Función para probar Docker
test_docker_container() {
    local container_name="$1"
    local port="$2"
    local path="${3:-/}"
    
    local url="http://localhost:$port$path"
    info "🐳 Probando contenedor $container_name en puerto $port..."
    
    # Verificar que el contenedor esté corriendo
    if docker ps --format "{{.Names}}" | grep -q "^$container_name$"; then
        success "✅ Contenedor $container_name está corriendo"
    else
        error "❌ Contenedor $container_name no está corriendo"
    fi
    
    # Probar endpoint
    test_endpoint "$url" "GET" "OptiCash"
}

# Función para construir imagen Docker
build_docker_image() {
    local image_name="$1"
    local dockerfile="${2:-Dockerfile.docs}"
    
    info "🔨 Construyendo imagen Docker: $image_name"
    
    if docker build -f "$dockerfile" -t "$image_name" . > /dev/null 2>&1; then
        success "✅ Imagen $image_name construida exitosamente"
        return 0
    else
        error "❌ Error al construir imagen $image_name"
    fi
}

# Función para ejecutar contenedor
start_docker_container() {
    local container_name="$1"
    local image_name="$2"
    local port="$3"
    
    info "🚀 Iniciando contenedor $container_name"
    
    # Detener contenedor existente si existe
    docker stop "$container_name" 2>/dev/null || true
    docker rm "$container_name" 2>/dev/null || true
    
    # Ejecutar nuevo contenedor
    if docker run -d --name "$container_name" -p "$port:80" "$image_name" > /dev/null 2>&1; then
        success "✅ Contenedor $container_name iniciado exitosamente"
        return 0
    else
        error "❌ Error al iniciar contenedor $container_name"
    fi
}

# Función para limpiar contenedores
cleanup_containers() {
    info "🧹 Limpiando contenedores de prueba..."
    
    local containers=("opticash-docs-dev" "opticash-docs-qa" "opticash-docs-prod")
    
    for container in "${containers[@]}"; do
        docker stop "$container" 2>/dev/null || true
        docker rm "$container" 2>/dev/null || true
        success "✅ Contenedor $container limpiado"
    done
}

# Función para probar pipeline completo
test_complete_pipeline() {
    local environment="$1"
    
    info "🧪 Iniciando prueba completa del pipeline para ambiente: $environment"
    
    # Configurar variables según el ambiente
    local image_name="opticash-docs:$environment-$(date +'%Y%m%d-%H%M%S')"
    local container_name="opticash-docs-$environment"
    local port
    
    case "$environment" in
        "dev") port="8080" ;;
        "qa") port="8081" ;;
        "prod") port="80" ;;
        *) port="8080" ;;
    esac
    
    # Paso 1: Construir imagen
    info "📦 Paso 1: Construyendo imagen Docker..."
    build_docker_image "$image_name"
    
    # Paso 2: Ejecutar contenedor
    info "🚀 Paso 2: Ejecutando contenedor..."
    start_docker_container "$container_name" "$image_name" "$port"
    
    # Paso 3: Esperar a que el contenedor esté listo
    info "⏳ Paso 3: Esperando a que el contenedor esté listo..."
    sleep 5
    
    # Paso 4: Probar endpoints
    info "🔍 Paso 4: Probando endpoints..."
    
    local endpoints=(
        "http://localhost:$port/health:Healthy"
        "http://localhost:$port/:OptiCash"
        "http://localhost:$port/docs/architecture.md:Arquitectura"
    )
    
    local all_tests_passed=true
    for endpoint in "${endpoints[@]}"; do
        local url="${endpoint%:*}"
        local expected="${endpoint#*:}"
        
        if ! test_endpoint "$url" "GET" "$expected"; then
            all_tests_passed=false
        fi
    done
    
    # Paso 5: Verificar logs del contenedor
    info "📋 Paso 5: Verificando logs del contenedor..."
    local logs
    logs=$(docker logs "$container_name" 2>&1)
    
    if echo "$logs" | grep -qi "error"; then
        warning "⚠️ Se encontraron errores en los logs del contenedor"
        echo "$logs" | grep -i "error"
    else
        success "✅ Logs del contenedor sin errores"
    fi
    
    return $([ "$all_tests_passed" = true ] && echo 0 || echo 1)
}

# Función para generar reporte
generate_report() {
    local environment="$1"
    local success="$2"
    local test_results="$3"
    
    local timestamp
    timestamp=$(date +'%Y-%m-%d_%H-%M-%S')
    local report_file="pipeline-test-report-$environment-$timestamp.txt"
    
    cat > "$report_file" << EOF
OPTICASH PIPELINE TEST REPORT
============================
Environment: $environment
Test Date: $(date)
Status: $([ "$success" = "true" ] && echo "PASSED" || echo "FAILED")

Test Results:
$test_results

Docker Containers:
$(docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

Docker Images:
$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}")

System Info:
- OS: $(uname -s)
- Architecture: $(uname -m)
- Docker: $(docker --version)
- Docker Compose: $(docker-compose --version)
EOF
    
    success "📊 Reporte generado: $report_file"
}

# Función principal
main() {
    info "🎯 Iniciando pruebas del pipeline de OptiCash..."
    
    # Limpiar contenedores existentes
    cleanup_containers
    
    # Probar pipeline completo
    local test_results=()
    local overall_success=true
    
    # Probar cada ambiente
    local environments=("dev" "qa" "prod")
    
    for env in "${environments[@]}"; do
        info "🧪 Probando ambiente: $env"
        
        if test_complete_pipeline "$env"; then
            test_results+=("Environment $env: PASSED")
        else
            test_results+=("Environment $env: FAILED")
            overall_success=false
        fi
        
        # Limpiar después de cada prueba
        cleanup_containers
    done
    
    # Generar reporte
    generate_report "$ENVIRONMENT" "$overall_success" "$(printf '%s\n' "${test_results[@]}")"
    
    # Mostrar resumen
    echo ""
    echo -e "${CYAN}📊 RESUMEN DE PRUEBAS${NC}"
    echo -e "${CYAN}===================${NC}"
    
    for result in "${test_results[@]}"; do
        if echo "$result" | grep -q "PASSED"; then
            echo -e "${GREEN}✅ $result${NC}"
        else
            echo -e "${RED}❌ $result${NC}"
        fi
    done
    
    echo ""
    if [ "$overall_success" = true ]; then
        success "🎉 ¡Todas las pruebas del pipeline pasaron exitosamente!"
        echo -e "${GREEN}🚀 El pipeline de OptiCash está listo para producción!${NC}"
    else
        error "❌ Algunas pruebas del pipeline fallaron"
        echo -e "${RED}🔧 Revisa los logs y corrige los errores antes de continuar${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📚 Próximos pasos:${NC}"
    echo -e "${YELLOW}1. Revisar el reporte generado${NC}"
    echo -e "${YELLOW}2. Configurar Jenkins con la guía en docs/jenkins-setup-guide.md${NC}"
    echo -e "${YELLOW}3. Configurar webhooks de GitHub${NC}"
    echo -e "${YELLOW}4. Probar el pipeline completo con Jenkins${NC}"
}

# Ejecutar función principal
main
