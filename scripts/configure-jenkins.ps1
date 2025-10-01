# Script para configurar Jenkins automáticamente
Write-Host "Configurando Jenkins para OptiCash..." -ForegroundColor Green

# Esperar a que Jenkins esté listo
Write-Host "Esperando a que Jenkins esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar que Jenkins esté funcionando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Jenkins está funcionando correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: Jenkins no está disponible" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 INSTRUCCIONES PARA CONFIGURAR JENKINS:" -ForegroundColor Cyan
Write-Host "1. Ve a: http://localhost:8080" -ForegroundColor White
Write-Host "2. Crea un nuevo job: 'OptiCash-Docs'" -ForegroundColor White
Write-Host "3. Tipo: Pipeline" -ForegroundColor White
Write-Host "4. En 'Configurar el origen del código fuente':" -ForegroundColor White
Write-Host "   - Selecciona 'Git'" -ForegroundColor Yellow
Write-Host "   - Repository URL: Tu repositorio GitHub" -ForegroundColor Yellow
Write-Host "   - Branch: */dev" -ForegroundColor Yellow
Write-Host "5. En 'Triggers':" -ForegroundColor White
Write-Host "   - ✅ Marca 'Consultar repositorio (SCM)'" -ForegroundColor Yellow
Write-Host "   - Schedule: H/5 * * * *" -ForegroundColor Yellow
Write-Host "6. En 'Build Steps':" -ForegroundColor White
Write-Host "   - Add build step → Execute shell" -ForegroundColor Yellow
Write-Host "   - Comando:" -ForegroundColor Yellow
Write-Host "     docker build -f Dockerfile.docs -t opticash-docs:`${GIT_BRANCH} ." -ForegroundColor Gray
Write-Host "     docker run -d --name opticash-docs-`${GIT_BRANCH} -p 8080:80 opticash-docs:`${GIT_BRANCH}" -ForegroundColor Gray
Write-Host "7. Save → Apply" -ForegroundColor White

Write-Host "`n🎯 DESPUÉS DE CONFIGURAR:" -ForegroundColor Cyan
Write-Host "Haz push a cualquier rama para probar el despliegue automático" -ForegroundColor White

Write-Host "`n✅ Jenkins reiniciado y listo para configurar!" -ForegroundColor Green
