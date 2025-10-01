#!/bin/bash

# Script para configurar Jenkins para OptiCash
# Uso: ./scripts/setup-jenkins.sh

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

log "🚀 Configurando Jenkins para OptiCash..."

# Verificar que Docker está disponible
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado o no está en el PATH"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado o no está en el PATH"
fi

# Crear directorio para Jenkins
log "📁 Creando directorio para Jenkins..."
mkdir -p jenkins-data
chmod 777 jenkins-data

# Crear archivo de configuración inicial de Jenkins
log "⚙️ Creando configuración inicial de Jenkins..."
cat > jenkins-data/init.groovy << 'EOF'
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
EOF

# Crear archivo de plugins de Jenkins
log "🔌 Configurando plugins de Jenkins..."
cat > jenkins-data/plugins.txt << 'EOF'
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
EOF

# Crear archivo de configuración de Jenkins
log "📝 Creando configuración de Jenkins..."
cat > jenkins-data/config.xml << 'EOF'
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
EOF

# Iniciar Jenkins
log "🐳 Iniciando Jenkins con Docker Compose..."
docker-compose -f docker-compose.jenkins.yml up -d

# Esperar a que Jenkins esté listo
log "⏳ Esperando a que Jenkins esté listo..."
for i in {1..30}; do
    if curl -f -s http://localhost:8080 > /dev/null; then
        success "✅ Jenkins está listo!"
        break
    else
        if [ $i -eq 30 ]; then
            error "❌ Jenkins no se inició después de 5 minutos"
        fi
        log "⏳ Esperando Jenkins... (intento $i/30)"
        sleep 10
    fi
done

# Mostrar información de acceso
log "📋 Información de acceso a Jenkins:"
echo "🌐 URL: http://localhost:8080"
echo "👤 Usuario: admin"
echo "🔑 Contraseña: admin123"
echo ""
echo "📚 Próximos pasos:"
echo "1. Acceder a http://localhost:8080"
echo "2. Iniciar sesión con admin/admin123"
echo "3. Instalar plugins sugeridos"
echo "4. Configurar credenciales de GitHub"
echo "5. Crear job de pipeline para OptiCash"

success "🎉 Jenkins configurado exitosamente!"
log "📖 Para más información, consulta README-Jenkins.md"
