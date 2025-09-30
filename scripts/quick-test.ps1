# Script de prueba rápida para OptiCash
# Uso: .\scripts\quick-test.ps1

Write-Host "🚀 OPTICASH QUICK TEST 🚀" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos principales
Write-Host "📁 Verificando archivos principales..." -ForegroundColor Blue

$files = @(
    "Jenkinsfile",
    "Dockerfile.docs",
    "docker-compose.yml",
    "nginx.conf",
    "index.html",
    "health.html"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Verificar estructura de docs
Write-Host "`n📚 Verificando documentación..." -ForegroundColor Blue

$docsFiles = @(
    "docs/architecture.md",
    "docs/requirements.md",
    "docs/actors.md",
    "docs/use-cases.md",
    "docs/api-mapping.md",
    "docs/qos.md",
    "docs/uml-diagrams.md",
    "docs/entity-relationship-model.md",
    "docs/jenkins-setup-guide.md",
    "docs/project-summary.md"
)

$docsCount = 0
foreach ($file in $docsFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
        $docsCount++
    } else {
        Write-Host "⚠️ $file" -ForegroundColor Yellow
    }
}

# Verificar scripts
Write-Host "`n🔧 Verificando scripts..." -ForegroundColor Blue

$scripts = @(
    "scripts/setup-jenkins.ps1",
    "scripts/setup-jenkins.sh",
    "scripts/test-pipeline.ps1",
    "scripts/test-pipeline.sh",
    "scripts/deploy.sh"
)

$scriptsCount = 0
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "✅ $script" -ForegroundColor Green
        $scriptsCount++
    } else {
        Write-Host "⚠️ $script" -ForegroundColor Yellow
    }
}

# Verificar Docker
Write-Host "`n🐳 Verificando Docker..." -ForegroundColor Blue

try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no disponible" -ForegroundColor Red
}

try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no disponible" -ForegroundColor Red
}

# Verificar Git
Write-Host "`n📦 Verificando Git..." -ForegroundColor Blue

try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no disponible" -ForegroundColor Red
}

# Resumen
Write-Host "`n📊 RESUMEN" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "Archivos principales: $(if ($allFilesExist) { '✅ Completos' } else { '❌ Faltantes' })" -ForegroundColor $(if ($allFilesExist) { 'Green' } else { 'Red' })
Write-Host "Documentación: $docsCount/$($docsFiles.Count) archivos" -ForegroundColor $(if ($docsCount -eq $docsFiles.Count) { 'Green' } elseif ($docsCount -gt 5) { 'Yellow' } else { 'Red' })
Write-Host "Scripts: $scriptsCount/$($scripts.Count) archivos" -ForegroundColor $(if ($scriptsCount -eq $scripts.Count) { 'Green' } elseif ($scriptsCount -gt 3) { 'Yellow' } else { 'Red' })

# Próximos pasos
Write-Host "`n🚀 PRÓXIMOS PASOS" -ForegroundColor Blue
Write-Host "1. Ejecutar: .\scripts\setup-jenkins.ps1" -ForegroundColor Yellow
Write-Host "2. Configurar GitHub webhooks" -ForegroundColor Yellow
Write-Host "3. Probar pipeline: .\scripts\test-pipeline.ps1" -ForegroundColor Yellow
Write-Host "4. Revisar documentación en /docs" -ForegroundColor Yellow

Write-Host "`n🎉 ¡OptiCash v2 está listo! 🚀" -ForegroundColor Green
