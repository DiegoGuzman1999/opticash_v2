#!/bin/bash

# Script de despliegue para OptiCash Documentation
# Uso: ./scripts/deploy.sh [dev|qa|prod] [image-tag]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Verificar parámetros
ENVIRONMENT=${1:-dev}
IMAGE_TAG=${2:-latest}

# Validar ambiente
if [[ ! "$ENVIRONMENT" =~ ^(dev|qa|prod)$ ]]; then
    error "Ambiente inválido. Use: dev, qa, o prod"
fi

log "🚀 Iniciando despliegue de documentación OptiCash"
log "📋 Ambiente: $ENVIRONMENT"
log "🏷️ Tag de imagen: $IMAGE_TAG"

# Verificar que Docker está disponible
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado o no está en el PATH"
fi

# Verificar que la carpeta docs existe
if [ ! -d "docs" ]; then
    error "La carpeta 'docs' no existe"
fi

# Verificar archivos críticos de documentación
CRITICAL_FILES=(
    "docs/architecture.md"
    "docs/requirements.md"
    "docs/api-mapping.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        warning "Archivo crítico no encontrado: $file"
    fi
done

# Construir imagen Docker
log "🐳 Construyendo imagen Docker..."
IMAGE_NAME="opticash-docs"
FULL_TAG="$IMAGE_NAME:$IMAGE_TAG"

docker build -f Dockerfile.docs -t "$FULL_TAG" . || error "Error al construir imagen Docker"

# Etiquetar como latest si no es el tag por defecto
if [ "$IMAGE_TAG" != "latest" ]; then
    docker tag "$FULL_TAG" "$IMAGE_NAME:latest"
fi

success "Imagen Docker construida: $FULL_TAG"

# Desplegar según ambiente
case $ENVIRONMENT in
    dev)
        log "🔧 Desplegando en ambiente DEV..."
        
        # Detener contenedor existente si existe
        if docker ps -q -f name=opticash-docs-dev | grep -q .; then
            log "Deteniendo contenedor existente..."
            docker stop opticash-docs-dev || true
            docker rm opticash-docs-dev || true
        fi
        
        # Ejecutar nuevo contenedor
        docker run -d \
            --name opticash-docs-dev \
            -p 8080:80 \
            -e ENVIRONMENT=development \
            --restart unless-stopped \
            "$FULL_TAG" || error "Error al ejecutar contenedor DEV"
        
        success "Documentación desplegada en DEV: http://localhost:8080"
        ;;
        
    qa)
        log "🧪 Desplegando en ambiente QA..."
        
        # Detener contenedor existente si existe
        if docker ps -q -f name=opticash-docs-qa | grep -q .; then
            log "Deteniendo contenedor existente..."
            docker stop opticash-docs-qa || true
            docker rm opticash-docs-qa || true
        fi
        
        # Ejecutar nuevo contenedor
        docker run -d \
            --name opticash-docs-qa \
            -p 8081:80 \
            -e ENVIRONMENT=qa \
            --restart unless-stopped \
            "$FULL_TAG" || error "Error al ejecutar contenedor QA"
        
        success "Documentación desplegada en QA: http://localhost:8081"
        ;;
        
    prod)
        log "🏭 Desplegando en ambiente PRODUCCIÓN..."
        
        # Verificar que no hay contenedores en ejecución
        if docker ps -q -f name=opticash-docs-prod | grep -q .; then
            warning "Contenedor de producción ya está ejecutándose"
            read -p "¿Desea continuar? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log "Despliegue cancelado"
                exit 0
            fi
        fi
        
        # Detener contenedor existente si existe
        if docker ps -q -f name=opticash-docs-prod | grep -q .; then
            log "Deteniendo contenedor existente..."
            docker stop opticash-docs-prod || true
            docker rm opticash-docs-prod || true
        fi
        
        # Ejecutar nuevo contenedor
        docker run -d \
            --name opticash-docs-prod \
            -p 80:80 \
            -e ENVIRONMENT=production \
            --restart unless-stopped \
            "$FULL_TAG" || error "Error al ejecutar contenedor PROD"
        
        success "Documentación desplegada en PRODUCCIÓN: http://localhost"
        ;;
esac

# Verificar despliegue
log "🔍 Verificando despliegue..."

# Esperar a que el contenedor esté listo
sleep 5

# Obtener URL según ambiente
case $ENVIRONMENT in
    dev) URL="http://localhost:8080" ;;
    qa) URL="http://localhost:8081" ;;
    prod) URL="http://localhost" ;;
esac

# Verificar que el servicio responde
for i in {1..10}; do
    if curl -f -s "$URL" > /dev/null; then
        success "✅ Servicio disponible en $URL"
        break
    else
        if [ $i -eq 10 ]; then
            error "❌ Servicio no disponible después de 10 intentos"
        fi
        log "⏳ Esperando servicio... (intento $i/10)"
        sleep 3
    fi
done

# Verificar archivos de documentación
log "📚 Verificando archivos de documentación..."

DOCS_ENDPOINTS=(
    "/docs/architecture.md"
    "/docs/requirements.md"
    "/docs/api-mapping.md"
)

for endpoint in "${DOCS_ENDPOINTS[@]}"; do
    if curl -f -s "$URL$endpoint" > /dev/null; then
        success "✅ $endpoint disponible"
    else
        warning "⚠️ $endpoint no disponible"
    fi
done

# Mostrar información del contenedor
log "📊 Información del contenedor:"
docker ps -f name=opticash-docs-$ENVIRONMENT --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Limpiar imágenes antiguas (opcional)
log "🧹 Limpiando imágenes Docker antiguas..."
docker image prune -f || true

success "🎉 Despliegue completado exitosamente!"
log "🌐 URL: $URL"
log "📚 Documentación: $URL/docs/"
log "📋 Estado: $(docker ps -f name=opticash-docs-$ENVIRONMENT --format '{{.Status}}')"
