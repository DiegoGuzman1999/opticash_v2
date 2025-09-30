# 🚀 Guía Completa de Configuración de Jenkins para OptiCash

Esta guía te llevará paso a paso para configurar Jenkins y conectarlo con GitHub para el despliegue automático de la documentación de OptiCash.

## 📋 Tabla de Contenidos

- [Instalación de Jenkins](#instalación-de-jenkins)
- [Configuración Inicial](#configuración-inicial)
- [Conexión con GitHub](#conexión-con-github)
- [Configuración del Pipeline](#configuración-del-pipeline)
- [Pruebas del Pipeline](#pruebas-del-pipeline)
- [Troubleshooting](#troubleshooting)

## 🐳 Instalación de Jenkins

### Opción 1: Jenkins con Docker (Recomendado)

#### Windows (PowerShell)
```powershell
# Ejecutar script de configuración
.\scripts\setup-jenkins.ps1

# O manualmente:
docker-compose -f docker-compose.jenkins.yml up -d
```

#### Linux/Mac (Bash)
```bash
# Ejecutar script de configuración
./scripts/setup-jenkins.sh

# O manualmente:
docker-compose -f docker-compose.jenkins.yml up -d
```

### Opción 2: Jenkins Nativo

#### Windows
1. Descargar Jenkins desde [jenkins.io](https://www.jenkins.io/download/)
2. Ejecutar el instalador `.msi`
3. Seguir el asistente de instalación

#### Ubuntu/Debian
```bash
# Agregar clave GPG
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -

# Agregar repositorio
echo deb https://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list

# Instalar Jenkins
sudo apt update
sudo apt install jenkins

# Iniciar servicio
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

## ⚙️ Configuración Inicial

### 1. Acceder a Jenkins

1. **Abrir navegador** en `http://localhost:8080`
2. **Obtener contraseña inicial**:
   ```bash
   # Docker
   docker exec opticash-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   
   # Nativo (Linux)
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

### 2. Configuración Inicial

1. **Instalar plugins sugeridos**:
   - Pipeline Plugin
   - GitHub Plugin
   - Docker Pipeline Plugin
   - Email Extension Plugin
   - Build Timeout Plugin

2. **Crear usuario administrador**:
   - Usuario: `admin`
   - Contraseña: `admin123` (o la que prefieras)
   - Email: `admin@opticash.com`

3. **Configurar URL de Jenkins**:
   - URL: `http://localhost:8080`

## 🔗 Conexión con GitHub

### 1. Configurar Credenciales

1. **Jenkins** → **Manage Jenkins** → **Manage Credentials**
2. **Add Credentials** → **Username with password**
3. **Configurar**:
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: Tu usuario de GitHub
   - **Password**: Tu token de GitHub (no contraseña)
   - **ID**: `github-credentials`
   - **Description**: `GitHub Credentials for OptiCash`

### 2. Crear Token de GitHub

1. **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. **Seleccionar scopes**:
   - `repo` (acceso completo a repositorios)
   - `admin:repo_hook` (administrar webhooks)
4. **Copiar token** y usarlo como contraseña en Jenkins

### 3. Configurar Webhook

1. **GitHub** → **Tu repositorio** → **Settings** → **Webhooks** → **Add webhook**
2. **Configurar**:
   - **Payload URL**: `http://tu-ip:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: `Push events` y `Pull request events`
   - **Active**: ✅

## 🔧 Configuración del Pipeline

### 1. Crear Job de Pipeline

1. **Jenkins** → **New Item** → **Pipeline**
2. **Nombre**: `opticash-docs-pipeline`
3. **Configuración**:
   - **Pipeline script from SCM**
   - **SCM**: Git
   - **Repository URL**: `https://github.com/tu-usuario/opticash_v2.git`
   - **Credentials**: Seleccionar `github-credentials`
   - **Branch**: `*/dev` (para desarrollo)
   - **Script Path**: `Jenkinsfile`

### 2. Configurar Variables de Entorno

1. **Job** → **Configure** → **Build Environment**
2. **Add** → **Environment variables**:
   ```bash
   DEV_SERVER=dev.opticash.com
   QA_SERVER=qa.opticash.com
   PROD_SERVER=prod.opticash.com
   DOCKER_REGISTRY=registry.opticash.com
   SSH_CREDENTIALS=opticash-ssh-credentials
   ```

### 3. Configurar Triggers

1. **Job** → **Configure** → **Build Triggers**
2. **GitHub hook trigger for GITScm polling**: ✅
3. **Poll SCM**: `H/5 * * * *` (cada 5 minutos)

## 🧪 Pruebas del Pipeline

### 1. Prueba Manual

1. **Jenkins** → **opticash-docs-pipeline** → **Build with Parameters**
2. **Seleccionar**:
   - **DEPLOY_ENVIRONMENT**: `dev`
   - **FORCE_DEPLOY**: `true`
3. **Build Now**

### 2. Prueba Automática

1. **Hacer push** a la rama `dev`:
   ```bash
   git add .
   git commit -m "test: probar pipeline de Jenkins"
   git push origin dev
   ```

2. **Verificar** que Jenkins detecta el cambio y ejecuta el pipeline

### 3. Verificar Despliegue

```bash
# Verificar contenedor
docker ps -f name=opticash-docs

# Probar URL
curl http://localhost:8080  # DEV
curl http://localhost:8081  # QA
curl http://localhost       # PROD
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Jenkins no inicia
```bash
# Ver logs
docker logs opticash-jenkins

# Reiniciar
docker-compose -f docker-compose.jenkins.yml restart
```

#### 2. Pipeline no se ejecuta
- ✅ Verificar webhook de GitHub
- ✅ Verificar credenciales
- ✅ Verificar permisos del repositorio

#### 3. Error de Docker
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar permisos
sudo usermod -aG docker $USER
```

#### 4. Error de conexión a GitHub
- ✅ Verificar token de GitHub
- ✅ Verificar URL del webhook
- ✅ Verificar firewall

### Logs Importantes

```bash
# Logs de Jenkins
docker logs opticash-jenkins

# Logs del pipeline
# Jenkins → Job → Build → Console Output

# Logs de Docker
docker logs opticash-docs-dev
docker logs opticash-docs-qa
docker logs opticash-docs-prod
```

## 📊 Monitoreo

### 1. Dashboard de Jenkins

- **URL**: `http://localhost:8080`
- **Estado**: Verde = OK, Rojo = Error
- **Historial**: Ver builds anteriores

### 2. Notificaciones

- **Email**: Configurar en Jenkins → Configure System
- **Slack**: Agregar plugin de Slack
- **Teams**: Agregar plugin de Microsoft Teams

## 🚀 Próximos Pasos

### 1. Escalabilidad

- **Agregar más ambientes** (staging, preprod)
- **Implementar blue-green deployment**
- **Agregar tests automatizados**

### 2. Seguridad

- **Configurar HTTPS**
- **Implementar autenticación LDAP**
- **Configurar backup automático**

### 3. Monitoreo Avanzado

- **Integrar con Prometheus**
- **Configurar alertas**
- **Implementar métricas de negocio**

## 📞 Soporte

Para soporte técnico:

- **Email**: team@opticash.com
- **Slack**: #opticash-dev
- **Documentación**: [docs.opticash.com](http://docs.opticash.com)

## 📝 Changelog

### v1.0.0 (2024-09-30)
- ✅ Guía completa de configuración
- ✅ Scripts de automatización
- ✅ Configuración para 3 ambientes
- ✅ Integración con GitHub
- ✅ Troubleshooting detallado

---

**¡Jenkins está listo para usar! 🎉**
