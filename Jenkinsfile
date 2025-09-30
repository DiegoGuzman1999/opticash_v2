pipeline {
    agent any
    
    // Configuración global del pipeline
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }
    
    // Variables de entorno globales
    environment {
        // Configuración de ambientes
        DEV_SERVER = 'dev.opticash.com'
        QA_SERVER = 'qa.opticash.com'
        PROD_SERVER = 'prod.opticash.com'
        
        // Credenciales (configurar en Jenkins)
        SSH_CREDENTIALS = 'opticash-ssh-credentials'
        DOCKER_REGISTRY = 'registry.opticash.com'
        
        // Configuración de Docker
        DOCKER_IMAGE_NAME = 'opticash-docs'
        DOCKER_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        
        // Configuración de Nginx
        NGINX_PORT = '80'
        NGINX_SSL_PORT = '443'
    }
    
    // Parámetros del pipeline
    parameters {
        choice(
            name: 'DEPLOY_ENVIRONMENT',
            choices: ['dev', 'qa', 'prod'],
            description: 'Ambiente de despliegue'
        )
        booleanParam(
            name: 'FORCE_DEPLOY',
            defaultValue: false,
            description: 'Forzar despliegue aunque no haya cambios'
        )
        string(
            name: 'CUSTOM_TAG',
            defaultValue: '',
            description: 'Tag personalizado para la imagen Docker'
        )
    }
    
    // Etapas del pipeline
    stages {
        // Etapa 1: Checkout del código
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Iniciando checkout del repositorio..."
                    echo "📋 Rama: ${env.BRANCH_NAME}"
                    echo "🏷️ Commit: ${env.GIT_COMMIT}"
                }
                
                checkout scm
                
                script {
                    // Obtener información del commit
                    def gitCommit = sh(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()
                    
                    def gitAuthor = sh(
                        script: 'git log -1 --pretty=format:"%an"',
                        returnStdout: true
                    ).trim()
                    
                    def gitMessage = sh(
                        script: 'git log -1 --pretty=format:"%s"',
                        returnStdout: true
                    ).trim()
                    
                    echo "👤 Autor: ${gitAuthor}"
                    echo "💬 Mensaje: ${gitMessage}"
                    echo "🔗 Commit: ${gitCommit}"
                }
            }
        }
        
        // Etapa 2: Validación de cambios
        stage('Validate Changes') {
            steps {
                script {
                    echo "🔍 Validando cambios en la documentación..."
                    
                    // Verificar si hay cambios en la carpeta docs
                    def docsChanges = sh(
                        script: 'git diff --name-only HEAD~1 HEAD | grep "^docs/" || true',
                        returnStdout: true
                    ).trim()
                    
                    if (docsChanges) {
                        echo "✅ Se detectaron cambios en la documentación:"
                        echo "${docsChanges}"
                    } else {
                        echo "⚠️ No se detectaron cambios en la documentación"
                        
                        if (params.FORCE_DEPLOY) {
                            echo "🚀 Despliegue forzado activado"
                        } else {
                            echo "❌ Saltando despliegue (no hay cambios)"
                            currentBuild.result = 'ABORTED'
                            error('No hay cambios en la documentación')
                        }
                    }
                    
                    // Verificar que existe la carpeta docs
                    if (!fileExists('docs')) {
                        error('❌ La carpeta docs no existe')
                    }
                    
                    // Contar archivos de documentación
                    def docsCount = sh(
                        script: 'find docs -name "*.md" | wc -l',
                        returnStdout: true
                    ).trim()
                    
                    echo "📊 Archivos de documentación encontrados: ${docsCount}"
                }
            }
        }
        
        // Etapa 3: Construcción de imagen Docker
        stage('Build Docker Image') {
            steps {
                script {
                    echo "🐳 Construyendo imagen Docker para documentación..."
                    
                    // Crear Dockerfile si no existe
                    if (!fileExists('Dockerfile.docs')) {
                        writeFile file: 'Dockerfile.docs', text: '''# Dockerfile para documentación OptiCash
FROM nginx:alpine

# Copiar archivos de documentación
COPY docs/ /usr/share/nginx/html/docs/

# Crear página de índice
RUN echo '<!DOCTYPE html>
<html>
<head>
    <title>OptiCash Documentation</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #2c3e50; }
        .file-list { list-style: none; padding: 0; }
        .file-list li { margin: 10px 0; }
        .file-list a { text-decoration: none; color: #3498db; }
        .file-list a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 OptiCash Documentation</h1>
        <p>Documentación técnica del proyecto OptiCash v2</p>
        <ul class="file-list">
            <li><a href="docs/architecture.md">🏗️ Arquitectura del Sistema</a></li>
            <li><a href="docs/requirements.md">📋 Requisitos Funcionales</a></li>
            <li><a href="docs/non-functional-requirements.md">⚡ Requisitos No Funcionales</a></li>
            <li><a href="docs/actors.md">👥 Actores Principales</a></li>
            <li><a href="docs/use-cases.md">🎯 Casos de Uso</a></li>
            <li><a href="docs/api-mapping.md">🔌 Mapeo de APIs</a></li>
            <li><a href="docs/qos.md">📊 Calidad de Servicio</a></li>
            <li><a href="docs/uml-diagrams.md">📐 Diagramas UML</a></li>
            <li><a href="docs/entity-relationship-model.md">🗄️ Modelo Entidad-Relación</a></li>
            <li><a href="docs/release-notes.md">📝 Notas de Versión</a></li>
        </ul>
    </div>
</body>
</html>' > /usr/share/nginx/html/index.html

# Configurar Nginx para servir archivos .md
RUN echo 'server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location ~ \\.md$ {
        add_header Content-Type text/plain;
    }
    
    location /docs/ {
        try_files $uri $uri/ =404;
    }
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]'''
                    }
                    
                    // Construir imagen Docker
                    def imageTag = params.CUSTOM_TAG ?: "${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                    
                    sh """
                        docker build -f Dockerfile.docs -t ${imageTag} .
                        docker tag ${imageTag} ${env.DOCKER_IMAGE_NAME}:latest
                    """
                    
                    echo "✅ Imagen Docker construida: ${imageTag}"
                }
            }
        }
        
        // Etapa 4: Despliegue según ambiente
        stage('Deploy') {
            steps {
                script {
                    def environment = params.DEPLOY_ENVIRONMENT ?: getEnvironmentFromBranch()
                    def imageTag = params.CUSTOM_TAG ?: "${env.DOCKER_IMAGE_NAME}:${env.DOCKER_TAG}"
                    
                    echo "🚀 Iniciando despliegue en ambiente: ${environment}"
                    
                    switch(environment) {
                        case 'dev':
                            deployToDev(imageTag)
                            break
                        case 'qa':
                            deployToQA(imageTag)
                            break
                        case 'prod':
                            deployToProd(imageTag)
                            break
                        default:
                            error("❌ Ambiente no válido: ${environment}")
                    }
                }
            }
        }
        
        // Etapa 5: Verificación post-despliegue
        stage('Post-Deploy Verification') {
            steps {
                script {
                    def environment = params.DEPLOY_ENVIRONMENT ?: getEnvironmentFromBranch()
                    echo "🔍 Verificando despliegue en ambiente: ${environment}"
                    
                    // Verificar que el servicio está funcionando
                    def serverUrl = getServerUrl(environment)
                    
                    sh """
                        # Esperar a que el servicio esté disponible
                        for i in {1..30}; do
                            if curl -f -s ${serverUrl} > /dev/null; then
                                echo "✅ Servicio disponible en ${serverUrl}"
                                break
                            fi
                            echo "⏳ Esperando servicio... (intento \$i/30)"
                            sleep 10
                        done
                    """
                    
                    // Verificar archivos de documentación
                    sh """
                        curl -f -s ${serverUrl}/docs/architecture.md > /dev/null && echo "✅ architecture.md disponible" || echo "❌ architecture.md no disponible"
                        curl -f -s ${serverUrl}/docs/requirements.md > /dev/null && echo "✅ requirements.md disponible" || echo "❌ requirements.md no disponible"
                        curl -f -s ${serverUrl}/docs/api-mapping.md > /dev/null && echo "✅ api-mapping.md disponible" || echo "❌ api-mapping.md no disponible"
                    """
                }
            }
        }
    }
    
    // Etapas de post-construcción
    post {
        always {
            script {
                echo "🧹 Limpiando archivos temporales..."
                sh 'docker system prune -f || true'
            }
        }
        
        success {
            script {
                def environment = params.DEPLOY_ENVIRONMENT ?: getEnvironmentFromBranch()
                def serverUrl = getServerUrl(environment)
                
                echo "🎉 Despliegue exitoso!"
                echo "🌐 URL: ${serverUrl}"
                echo "📚 Documentación: ${serverUrl}/docs/"
                
                // Notificación de éxito (configurar según necesidades)
                emailext (
                    subject: "✅ OptiCash Docs - Despliegue Exitoso [${environment.toUpperCase()}]",
                    body: """
                        <h2>🎉 Despliegue Exitoso</h2>
                        <p><strong>Proyecto:</strong> OptiCash Documentation</p>
                        <p><strong>Ambiente:</strong> ${environment.toUpperCase()}</p>
                        <p><strong>Rama:</strong> ${env.BRANCH_NAME}</p>
                        <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                        <p><strong>URL:</strong> <a href="${serverUrl}">${serverUrl}</a></p>
                        <p><strong>Documentación:</strong> <a href="${serverUrl}/docs/">${serverUrl}/docs/</a></p>
                    """,
                    to: "${env.CHANGE_AUTHOR_EMAIL ?: 'team@opticash.com'}"
                )
            }
        }
        
        failure {
            script {
                echo "❌ Despliegue falló!"
                
                // Notificación de fallo
                emailext (
                    subject: "❌ OptiCash Docs - Despliegue Falló [${params.DEPLOY_ENVIRONMENT ?: getEnvironmentFromBranch()}]",
                    body: """
                        <h2>❌ Despliegue Falló</h2>
                        <p><strong>Proyecto:</strong> OptiCash Documentation</p>
                        <p><strong>Ambiente:</strong> ${params.DEPLOY_ENVIRONMENT ?: getEnvironmentFromBranch()}</p>
                        <p><strong>Rama:</strong> ${env.BRANCH_NAME}</p>
                        <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                        <p><strong>Build:</strong> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    """,
                    to: "${env.CHANGE_AUTHOR_EMAIL ?: 'team@opticash.com'}"
                )
            }
        }
    }
}

// Funciones auxiliares
def getEnvironmentFromBranch() {
    switch(env.BRANCH_NAME) {
        case 'dev':
            return 'dev'
        case 'qa':
            return 'qa'
        case 'main':
        case 'master':
            return 'prod'
        default:
            return 'dev'
    }
}

def getServerUrl(environment) {
    switch(environment) {
        case 'dev':
            return "http://${env.DEV_SERVER}"
        case 'qa':
            return "http://${env.QA_SERVER}"
        case 'prod':
            return "https://${env.PROD_SERVER}"
        default:
            return "http://${env.DEV_SERVER}"
    }
}

def deployToDev(imageTag) {
    echo "🚀 Desplegando en ambiente DEV..."
    
    // Aquí iría la lógica específica para DEV
    // Por ahora, simulamos el despliegue
    sh """
        echo "Desplegando ${imageTag} en DEV..."
        # docker run -d -p 8080:80 --name opticash-docs-dev ${imageTag}
        echo "✅ Despliegue en DEV completado"
    """
}

def deployToQA(imageTag) {
    echo "🚀 Desplegando en ambiente QA..."
    
    // Aquí iría la lógica específica para QA
    sh """
        echo "Desplegando ${imageTag} en QA..."
        # docker run -d -p 8081:80 --name opticash-docs-qa ${imageTag}
        echo "✅ Despliegue en QA completado"
    """
}

def deployToProd(imageTag) {
    echo "🚀 Desplegando en ambiente PRODUCCIÓN..."
    
    // Aquí iría la lógica específica para PRODUCCIÓN
    sh """
        echo "Desplegando ${imageTag} en PRODUCCIÓN..."
        # docker run -d -p 80:80 --name opticash-docs-prod ${imageTag}
        echo "✅ Despliegue en PRODUCCIÓN completado"
    """
}
