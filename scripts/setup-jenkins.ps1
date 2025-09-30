# Script de PowerShell para configurar Jenkins para OptiCash
# Uso: .\scripts\setup-jenkins.ps1

param(
    [switch]$SkipDockerCheck
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

# Verificar prerrequisitos
Write-Log "🔍 Verificando prerrequisitos..." $Blue

if (-not $SkipDockerCheck) {
    # Verificar Docker
    try {
        $dockerVersion = docker --version
        Write-Success-Log "Docker disponible: $dockerVersion"
    } catch {
        Write-Error-Log "Docker no está instalado o no está en el PATH"
        Write-Log "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" $Yellow
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

# Crear directorio para Jenkins
Write-Log "📁 Creando directorio para Jenkins..." $Blue
if (-not (Test-Path "jenkins-data")) {
    New-Item -ItemType Directory -Path "jenkins-data" -Force | Out-Null
}

# Crear archivo de configuración inicial de Jenkins
Write-Log "⚙️ Creando configuración inicial de Jenkins..." $Blue
$initGroovy = @'
import jenkins.model.*
import hudson.security.*
import hudson.security.csrf.DefaultCrumbIssuer
import jenkins.security.s2m.AdminWhitelistRule

// Configurar seguridad
def instance = Jenkins.getInstance()

// Crear usuario administrador
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "admin123")
instance.setSecurityRealm(hudsonRealm)

// Configurar autorización
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
instance.setAuthorizationStrategy(strategy)

// Configurar CSRF
instance.setCrumbIssuer(new DefaultCrumbIssuer(true))

// Deshabilitar whitelist de administradores
instance.getInjector().getInstance(AdminWhitelistRule.class).setMasterKillSwitch(false)

// Guardar configuración
instance.save()
'@

$initGroovy | Out-File -FilePath "jenkins-data\init.groovy" -Encoding UTF8

# Crear archivo de plugins de Jenkins
Write-Log "🔌 Configurando plugins de Jenkins..." $Blue
$pluginsTxt = @'
# Plugins esenciales para OptiCash
workflow-aggregator:2.6
github:1.35.0
docker-workflow:1.28
email-ext:2.89
build-timeout:1.24
credentials:2.6.1
ssh-credentials:1.19
plain-credentials:1.8
git:4.11.3
matrix-auth:3.1.5
pam-auth:1.6
ldap:2.7
email-ext:2.89
mailer:1.34
ant:1.13
gradle:1.36
pipeline-stage-view:2.19
build-trigger-badge:1.11
build-timeout:1.24
credentials-binding:1.27
timestamper:1.13
ws-cleanup:0.40
ant:1.13
gradle:1.36
workflow-aggregator:2.6
pipeline-github-lib:1.0
pipeline-stage-view:2.19
build-trigger-badge:1.11
build-timeout:1.24
credentials-binding:1.27
timestamper:1.13
ws-cleanup:0.40
'@

$pluginsTxt | Out-File -FilePath "jenkins-data\plugins.txt" -Encoding UTF8

# Crear archivo de configuración de Jenkins
Write-Log "📝 Creando configuración de Jenkins..." $Blue
$configXml = @'
<?xml version='1.1' encoding='UTF-8'?>
<hudson>
  <disabledAdministrativeMonitors>
    <string>hudson.diagnosis.ReverseProxySetupMonitor</string>
  </disabledAdministrativeMonitors>
  <version>2.401.3</version>
  <numExecutors>2</numExecutors>
  <mode>NORMAL</mode>
  <useSecurity>true</useSecurity>
  <authorizationStrategy class="hudson.security.FullControlOnceLoggedInAuthorizationStrategy">
    <denyAnonymousReadAccess>true</denyAnonymousReadAccess>
  </authorizationStrategy>
  <securityRealm class="hudson.security.HudsonPrivateSecurityRealm">
    <disableSignup>true</disableSignup>
    <enableCaptcha>false</enableCaptcha>
  </securityRealm>
  <disableRememberMe>false</disableRememberMe>
  <projectNamingStrategy class="jenkins.model.ProjectNamingStrategy$DefaultProjectNamingStrategy"/>
  <workspaceDir>${JENKINS_HOME}/workspaces/${ITEM_FULL_NAME}</workspaceDir>
  <buildsDir>${ITEM_ROOTDIR}/builds</buildsDir>
  <markupFormatter class="hudson.markup.EscapedMarkupFormatter"/>
  <jdks/>
  <viewsTabBar class="hudson.views.DefaultViewsTabBar"/>
  <myViewsTabBar class="hudson.views.DefaultMyViewsTabBar"/>
  <clouds/>
  <scmCheckoutRetryCount>0</scmCheckoutRetryCount>
  <views>
    <hudson.model.AllView>
      <owner class="hudson" reference="../../.."/>
      <name>all</name>
      <filterExecutors>false</filterExecutors>
      <filterQueue>false</filterQueue>
      <properties class="hudson.model.View$PropertyList"/>
    </hudson.model.AllView>
  </views>
  <primaryView>all</primaryView>
  <slaveAgentPort>50000</slaveAgentPort>
  <disabledAgentProtocols>
    <string>JNLP-connect</string>
    <string>JNLP2-connect</string>
  </disabledAgentProtocols>
  <crumbIssuer class="hudson.security.csrf.DefaultCrumbIssuer">
    <excludeClientIPFromCrumb>false</excludeClientIPFromCrumb>
  </crumbIssuer>
  <nodeProperties/>
  <globalNodeProperties/>
</hudson>
'@

$configXml | Out-File -FilePath "jenkins-data\config.xml" -Encoding UTF8

# Iniciar Jenkins
Write-Log "🐳 Iniciando Jenkins con Docker Compose..." $Blue
try {
    docker-compose -f docker-compose.jenkins.yml up -d
    Write-Success-Log "Jenkins iniciado con Docker Compose"
} catch {
    Write-Error-Log "Error al iniciar Jenkins: $($_.Exception.Message)"
    exit 1
}

# Esperar a que Jenkins esté listo
Write-Log "⏳ Esperando a que Jenkins esté listo..." $Blue
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success-Log "✅ Jenkins está listo!"
            break
        }
    } catch {
        if ($attempt -eq $maxAttempts) {
            Write-Error-Log "❌ Jenkins no se inició después de 5 minutos"
            Write-Log "Verifica los logs con: docker logs opticash-jenkins" $Yellow
            exit 1
        }
        Write-Log "⏳ Esperando Jenkins... (intento $attempt/$maxAttempts)" $Blue
        Start-Sleep -Seconds 10
    }
} while ($attempt -lt $maxAttempts)

# Mostrar información de acceso
Write-Log "📋 Información de acceso a Jenkins:" $Blue
Write-Host "🌐 URL: http://localhost:8080" -ForegroundColor $Green
Write-Host "👤 Usuario: admin" -ForegroundColor $Green
Write-Host "🔑 Contraseña: admin123" -ForegroundColor $Green
Write-Host ""
Write-Host "📚 Próximos pasos:" -ForegroundColor $Blue
Write-Host "1. Acceder a http://localhost:8080" -ForegroundColor $Yellow
Write-Host "2. Iniciar sesión con admin/admin123" -ForegroundColor $Yellow
Write-Host "3. Instalar plugins sugeridos" -ForegroundColor $Yellow
Write-Host "4. Configurar credenciales de GitHub" -ForegroundColor $Yellow
Write-Host "5. Crear job de pipeline para OptiCash" -ForegroundColor $Yellow

Write-Success-Log "🎉 Jenkins configurado exitosamente!"
Write-Log "📖 Para más información, consulta README-Jenkins.md" $Blue
