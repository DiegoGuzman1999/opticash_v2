# Script para organizar el repositorio para FASE 1 - ANÁLISIS Y DISEÑO
# Autor: OptiCash Team
# Fecha: $(Get-Date -Format "yyyy-MM-dd")

Write-Host "🚀 ORGANIZANDO REPOSITORIO PARA FASE 1 - ANÁLISIS Y DISEÑO" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Verificar que estamos en la rama main
Write-Host "`n📋 Verificando estado actual..." -ForegroundColor Yellow
git checkout main
git pull origin main

# Agregar archivos pendientes
Write-Host "`n📁 Agregando archivos pendientes..." -ForegroundColor Yellow
git add .
git commit -m "feat: agregar script de configuración de Jenkins"

# Definir las HUs de la Fase 1
$HUs = @(
    "HU1-Elaborar-casos-de-uso-principales",
    "HU2-Documentar-APIS", 
    "HU3-Diseniar-Arquitectura",
    "HU4-Mapeos-APIS",
    "HU5-Documento-QoS",
    "HU6-Requerimientos-Funcionales",
    "HU7-Requerimientos-No-Funcionales",
    "HU8-Definir-Actores",
    "HU9-Exploracion-Negocio",
    "HU10-Documentacion-Inicial",
    "HU11-Diagrama-Clases",
    "HU12-Modelo-Entidad-Relacion"
)

# PASO 1: Eliminar ramas feature/ y docs- existentes
Write-Host "`n🗑️  PASO 1: Eliminando ramas feature/ y docs- existentes..." -ForegroundColor Red

$branchesToDelete = @(
    "feature/HU-001-configuracion-proyecto",
    "feature/HU-002-bd-postgresql", 
    "feature/HU-003-crud-usuarios",
    "feature/HU-004-crud-prestamos",
    "feature/HU-005-crud-pagos",
    "feature/HU-006-autenticacion-jwt",
    "feature/docs-v1.0.0",
    "release/1.0",
    "release/v1.0.0"
)

foreach ($branch in $branchesToDelete) {
    Write-Host "Eliminando rama local: $branch" -ForegroundColor Yellow
    git branch -D $branch 2>$null
    
    Write-Host "Eliminando rama remota: $branch" -ForegroundColor Yellow
    git push origin --delete $branch 2>$null
}

# PASO 2: Asegurar que dev y qa estén actualizadas
Write-Host "`n🔄 PASO 2: Actualizando ramas dev y qa..." -ForegroundColor Blue

git checkout dev
git pull origin dev
git merge main --no-ff -m "merge: integrar cambios de main a dev para Fase 1"
git push origin dev

git checkout qa  
git pull origin qa
git merge main --no-ff -m "merge: integrar cambios de main a qa para Fase 1"
git push origin qa

# PASO 3: Crear ramas HU para desarrollo (dev)
Write-Host "`n🌱 PASO 3: Creando ramas HU para desarrollo (dev)..." -ForegroundColor Green

git checkout dev

foreach ($HU in $HUs) {
    $branchName = "HU$($HU.Substring(2))-dev"
    Write-Host "Creando rama: $branchName" -ForegroundColor Cyan
    
    git checkout -b $branchName
    git commit --allow-empty -m "Commit inicial de desarrollo - Fase 1 - $HU"
    git push origin $branchName
    
    git checkout dev
}

# PASO 4: Crear ramas HU para QA (qa)
Write-Host "`n🧪 PASO 4: Creando ramas HU para QA (qa)..." -ForegroundColor Magenta

git checkout qa

foreach ($HU in $HUs) {
    $branchName = "HU$($HU.Substring(2))-qa"
    Write-Host "Creando rama: $branchName" -ForegroundColor Cyan
    
    git checkout -b $branchName
    # NO crear commit inicial en QA (solo para validación)
    git push origin $branchName
    
    git checkout qa
}

# PASO 5: Crear ramas HU para Release 1.1 (main)
Write-Host "`n🚀 PASO 5: Creando ramas HU para Release 1.1 (main)..." -ForegroundColor Yellow

git checkout main

foreach ($HU in $HUs) {
    $branchName = "HU$($HU.Substring(2))-release1.1"
    Write-Host "Creando rama: $branchName" -ForegroundColor Cyan
    
    git checkout -b $branchName
    git commit --allow-empty -m "Release 1.1 - Fase 1 - $HU"
    git push origin $branchName
    
    git checkout main
}

# PASO 6: Verificación final
Write-Host "`n✅ PASO 6: Verificación final..." -ForegroundColor Green

Write-Host "`n📊 Resumen de ramas creadas:" -ForegroundColor White
Write-Host "=========================" -ForegroundColor White

Write-Host "`n🌱 RAMAS DEV (12):" -ForegroundColor Green
git branch | findstr "HU.*-dev"

Write-Host "`n🧪 RAMAS QA (12):" -ForegroundColor Magenta  
git branch | findstr "HU.*-qa"

Write-Host "`n🚀 RAMAS RELEASE 1.1 (12):" -ForegroundColor Yellow
git branch | findstr "HU.*-release1.1"

Write-Host "`n📈 RAMAS PRINCIPALES:" -ForegroundColor Blue
git branch | findstr -E "^(main|dev|qa)$"

# Volver a main
git checkout main

Write-Host "`n🎉 ¡ORGANIZACION COMPLETADA!" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "✅ Total de ramas HU creadas: 36 (12 dev + 12 qa + 12 release)" -ForegroundColor White
Write-Host "✅ Ramas principales mantenidas: main, dev, qa" -ForegroundColor White
Write-Host "✅ Ramas feature/ eliminadas" -ForegroundColor White
Write-Host "✅ Todas las ramas sincronizadas con origin" -ForegroundColor White

Write-Host "`n📋 PROXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "1. Trabajar en las ramas HU*-dev para desarrollo" -ForegroundColor White
Write-Host "2. Hacer merge de dev a qa para validacion" -ForegroundColor White  
Write-Host "3. Hacer merge de qa a main para release" -ForegroundColor White
Write-Host "4. Seguir el flujo: dev -> qa -> main" -ForegroundColor White
