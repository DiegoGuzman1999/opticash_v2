# Script simple para organizar FASE 1
Write-Host "Iniciando organizacion del repositorio para FASE 1..." -ForegroundColor Green

# Verificar estado actual
git checkout main
git pull origin main

# Agregar archivos pendientes
git add .
git commit -m "feat: agregar script de configuracion de Jenkins"

# Eliminar ramas feature existentes
Write-Host "Eliminando ramas feature existentes..." -ForegroundColor Yellow
git branch -D feature/HU-001-configuracion-proyecto 2>$null
git branch -D feature/HU-002-bd-postgresql 2>$null
git branch -D feature/HU-003-crud-usuarios 2>$null
git branch -D feature/HU-004-crud-prestamos 2>$null
git branch -D feature/HU-005-crud-pagos 2>$null
git branch -D feature/HU-006-autenticacion-jwt 2>$null
git branch -D feature/docs-v1.0.0 2>$null
git branch -D release/1.0 2>$null
git branch -D release/v1.0.0 2>$null

# Eliminar ramas remotas
git push origin --delete feature/HU-001-configuracion-proyecto 2>$null
git push origin --delete feature/HU-002-bd-postgresql 2>$null
git push origin --delete feature/HU-003-crud-usuarios 2>$null
git push origin --delete feature/HU-004-crud-prestamos 2>$null
git push origin --delete feature/HU-005-crud-pagos 2>$null
git push origin --delete feature/HU-006-autenticacion-jwt 2>$null
git push origin --delete feature/docs-v1.0.0 2>$null
git push origin --delete release/1.0 2>$null
git push origin --delete release/v1.0.0 2>$null

# Actualizar dev y qa
Write-Host "Actualizando ramas dev y qa..." -ForegroundColor Blue
git checkout dev
git pull origin dev
git merge main --no-ff -m "merge: integrar cambios de main a dev para Fase 1"
git push origin dev

git checkout qa
git pull origin qa
git merge main --no-ff -m "merge: integrar cambios de main a qa para Fase 1"
git push origin qa

# Crear ramas HU para dev
Write-Host "Creando ramas HU para desarrollo..." -ForegroundColor Green
git checkout dev

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

foreach ($HU in $HUs) {
    $branchName = "HU$($HU.Substring(2))-dev"
    Write-Host "Creando rama: $branchName" -ForegroundColor Cyan
    git checkout -b $branchName
    git commit --allow-empty -m "Commit inicial de desarrollo - Fase 1 - $HU"
    git push origin $branchName
    git checkout dev
}

# Crear ramas HU para qa
Write-Host "Creando ramas HU para QA..." -ForegroundColor Magenta
git checkout qa

foreach ($HU in $HUs) {
    $branchName = "HU$($HU.Substring(2))-qa"
    Write-Host "Creando rama: $branchName" -ForegroundColor Cyan
    git checkout -b $branchName
    git push origin $branchName
    git checkout qa
}

# Crear ramas HU para release 1.1
Write-Host "Creando ramas HU para Release 1.1..." -ForegroundColor Yellow
git checkout main

foreach ($HU in $HUs) {
    $branchName = "HU$($HU.Substring(2))-release1.1"
    Write-Host "Creando rama: $branchName" -ForegroundColor Cyan
    git checkout -b $branchName
    git commit --allow-empty -m "Release 1.1 - Fase 1 - $HU"
    git push origin $branchName
    git checkout main
}

# Verificacion final
Write-Host "Verificacion final..." -ForegroundColor Green
Write-Host "Ramas creadas:" -ForegroundColor White
git branch | findstr "HU.*-dev"
git branch | findstr "HU.*-qa"
git branch | findstr "HU.*-release1.1"

git checkout main
Write-Host "Organizacion completada!" -ForegroundColor Green
