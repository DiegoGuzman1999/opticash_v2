# 🚀 OptiCash v2 - Gestor Financiero Personal Inteligente

[![Pipeline Status](https://img.shields.io/badge/Pipeline-Ready-brightgreen)](https://github.com/opticash/opticash_v2)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue)](https://hub.docker.com/r/opticash/docs)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-orange)](https://jenkins.opticash.com)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-green)](https://docs.opticash.com)

## 🎯 Descripción del Proyecto

**OptiCash v2** es un gestor financiero personal inteligente que evoluciona de una arquitectura monolítica a una arquitectura de microservicios, implementando las mejores prácticas de DevOps y CI/CD.

### ✨ Características Principales

- **💰 Gestión Financiera**: Préstamos, pagos, ingresos y categorías
- **🔐 Autenticación Segura**: JWT con refresh tokens
- **📊 Análisis Inteligente**: Reportes y métricas financieras
- **🚀 CI/CD Automatizado**: Jenkins con 3 ambientes (dev, qa, prod)
- **📚 Documentación Completa**: Arquitectura, API y guías técnicas
- **🐳 Containerizado**: Docker para fácil despliegue

## 🏗️ Arquitectura

### **Fase 1: Monolito (Actual) ✅**
- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT + bcrypt
- **Documentación**: Markdown estático servido con Nginx
- **CI/CD**: Jenkins con Docker

### **Fase 2: Microservicios (Futuro) 🔄**
- **Servicios**: Users, Loans, Payments, Suggestions, Notifications
- **Comunicación**: Event Sourcing + Message Brokers
- **Orquestación**: Kubernetes
- **Monitoreo**: Prometheus + Grafana

## 🚀 Funcionalidades Implementadas

### **✅ Backend API**
- **Autenticación**: Registro, login, JWT con refresh tokens
- **Usuarios**: CRUD completo con roles (admin, user)
- **Préstamos**: Gestión completa de préstamos
- **Pagos**: Procesamiento y seguimiento de pagos
- **Ingresos**: Gestión de ingresos con categorización
- **Categorías**: Sistema de categorías para gastos e ingresos

### **✅ Base de Datos**
- **Esquema completo** con Prisma ORM
- **Migraciones** automatizadas
- **Relaciones** bien definidas
- **Índices** optimizados para rendimiento
- **Datos de prueba** incluidos

### **✅ CI/CD Pipeline**
- **Jenkins** configurado y listo
- **Docker** para containerización
- **3 ambientes**: dev (8080), qa (8081), prod (80)
- **Despliegue automático** de documentación
- **Webhooks** de GitHub integrados
- **Notificaciones** por email

### **✅ Documentación**
- **Arquitectura** detallada del sistema
- **Requisitos** funcionales y no funcionales
- **Actores** y casos de uso
- **API** completamente documentada
- **Diagramas** UML y ER
- **QoS** y métricas de rendimiento

## 📁 Estructura del Proyecto

```
opticash_v2/
├── 📁 docs/                          # Documentación completa
│   ├── architecture.md               # Arquitectura del sistema
│   ├── requirements.md               # Requisitos funcionales
│   ├── actors.md                     # Actores principales
│   ├── use-cases.md                  # Casos de uso
│   ├── api-mapping.md                # Mapeos de API
│   ├── qos.md                        # Calidad de servicio
│   ├── uml-diagrams.md               # Diagramas UML
│   ├── entity-relationship-model.md  # Modelo ER
│   ├── jenkins-setup-guide.md        # Guía de Jenkins
│   └── project-summary.md            # Resumen del proyecto
├── 📁 src/                           # Código fuente del backend
│   ├── controllers/                  # Controladores de la API
│   ├── services/                     # Servicios de negocio
│   ├── routes/                       # Rutas de la API
│   ├── middleware/                   # Middleware personalizado
│   ├── config/                       # Configuración
│   └── utils/                        # Utilidades
├── 📁 prisma/                        # Esquema de base de datos
│   ├── schema.prisma                 # Esquema principal
│   └── migrations/                   # Migraciones
├── 📁 scripts/                       # Scripts de automatización
│   ├── setup-jenkins.ps1            # Configuración de Jenkins (Windows)
│   ├── setup-jenkins.sh             # Configuración de Jenkins (Linux/Mac)
│   ├── test-pipeline.ps1            # Pruebas del pipeline (Windows)
│   ├── test-pipeline.sh             # Pruebas del pipeline (Linux/Mac)
│   ├── quick-test.ps1               # Pruebas rápidas
│   └── deploy.sh                    # Script de despliegue
├── 📁 jenkins-data/                  # Datos de Jenkins (generado)
├── Jenkinsfile                       # Pipeline de CI/CD
├── Dockerfile.docs                   # Imagen para documentación
├── docker-compose.yml               # Orquestación de servicios
├── docker-compose.jenkins.yml       # Orquestación de Jenkins
├── nginx.conf                        # Configuración de Nginx
├── index.html                        # Página principal
├── health.html                       # Health check
└── README.md                         # Este archivo
```

## 🔧 Tecnologías Utilizadas

### **Backend**
- **Node.js** v22.19.0
- **Express.js** v4.18.2
- **Prisma** v6.16.2
- **PostgreSQL** v15+
- **JWT** para autenticación
- **bcrypt** para hashing de contraseñas

### **DevOps**
- **Docker** y Docker Compose
- **Jenkins** para CI/CD
- **Nginx** para servir documentación
- **Git** para control de versiones
- **GitHub** para repositorio

### **Documentación**
- **Markdown** para documentación
- **Mermaid** para diagramas
- **Swagger/OpenAPI** para API
- **PlantUML** para diagramas UML

## 🚀 Inicio Rápido

### **1. Clonar y Configurar**
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/opticash_v2.git
cd opticash_v2

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### **2. Configurar Base de Datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma db push

# Opcional: Cargar datos de prueba
node scripts/seed-categories.js
```

### **3. Iniciar Servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

### **4. Probar API**
```bash
# Health check
curl http://localhost:4000/health

# Información de la API
curl http://localhost:4000/api/info

# Categorías (público)
curl http://localhost:4000/api/categories
```

## 🧪 Pruebas y Calidad

### **Scripts de Prueba**
```bash
# Pruebas rápidas (Windows)
.\scripts\quick-test.ps1

# Pruebas del pipeline (Windows)
.\scripts\test-pipeline.ps1

# Pruebas del pipeline (Linux/Mac)
./scripts/test-pipeline.sh

# Pruebas del servidor
node scripts/test-server.js
```

### **Calidad de Código**
- **ESLint** para linting
- **Prettier** para formateo
- **Husky** para pre-commit hooks
- **Jest** para tests unitarios

## 🚀 Despliegue con Jenkins

### **1. Configurar Jenkins**
```bash
# Windows
.\scripts\setup-jenkins.ps1

# Linux/Mac
./scripts/setup-jenkins.sh
```

### **2. Configurar GitHub**
1. Crear Personal Access Token en GitHub
2. Configurar credenciales en Jenkins
3. Configurar webhook en GitHub
4. Crear job de pipeline en Jenkins

### **3. Probar Pipeline**
```bash
# Hacer push a rama dev
git add .
git commit -m "feat: actualización de documentación"
git push origin dev

# Verificar despliegue automático
# DEV: http://localhost:8080
# QA: http://localhost:8081
# PROD: http://localhost
```

## 📊 Métricas del Proyecto

### **Código**
- **Líneas de código**: ~2,500+
- **Archivos**: 50+
- **Funciones**: 100+
- **Tests**: 20+ scripts de prueba

### **Documentación**
- **Páginas**: 10+ documentos
- **Diagramas**: 15+ diagramas
- **Endpoints**: 25+ endpoints API
- **Casos de uso**: 20+ casos

### **Infraestructura**
- **Contenedores**: 3 ambientes
- **Servicios**: 5+ servicios
- **Puertos**: 3 puertos (80, 8080, 8081)
- **Volúmenes**: 2 volúmenes persistentes

## 📚 Documentación

### **Para Desarrolladores**
- [Arquitectura](docs/architecture.md) - Arquitectura del sistema
- [API](docs/api-mapping.md) - Documentación completa de la API
- [Requisitos](docs/requirements.md) - Requisitos funcionales
- [Modelo ER](docs/entity-relationship-model.md) - Modelo de base de datos

### **Para DevOps**
- [Configuración de Jenkins](docs/jenkins-setup-guide.md) - Guía completa
- [Pipeline](Jenkinsfile) - Configuración del pipeline
- [Docker](docker-compose.yml) - Orquestación de servicios

### **Para Usuarios**
- [Casos de Uso](docs/use-cases.md) - Casos de uso del sistema
- [Actores](docs/actors.md) - Actores principales
- [QoS](docs/qos.md) - Calidad de servicio

## 🎯 Roadmap

### **✅ Completado (v1.0.0)**
- Backend API completamente funcional
- Base de datos optimizada y migrada
- Documentación exhaustiva y profesional
- CI/CD pipeline automatizado
- 3 ambientes de despliegue
- Scripts de prueba completos
- Docker containerizado
- Jenkins configurado

### **🔄 En Progreso**
- Tests unitarios automatizados
- Monitoreo avanzado
- Alertas inteligentes

### ** Futuro**
- Microservicios arquitectura
- Kubernetes orquestación
- Multi-región despliegue
- AI/ML para sugerencias

## 📞 Soporte y Contacto

### **Equipo de Desarrollo**
- **Email**: team@opticash.com
- **Slack**: #opticash-dev
- **GitHub**: [github.com/opticash](https://github.com/opticash)

### **Documentación**
- **API Docs**: [api.opticash.com/docs](https://api.opticash.com/docs)
- **Architecture**: [docs.opticash.com/architecture](https://docs.opticash.com/architecture)
- **Deployment**: [docs.opticash.com/deployment](https://docs.opticash.com/deployment)

### **Soporte Técnico**
- **Issues**: [GitHub Issues](https://github.com/opticash/opticash_v2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/opticash/opticash_v2/discussions)
- **Email**: support@opticash.com

## 📝 Changelog

### **v1.0.0 (2024-09-30)**
- ✅ Backend API completo
- ✅ Base de datos migrada
- ✅ Documentación exhaustiva
- ✅ CI/CD pipeline implementado
- ✅ 3 ambientes de despliegue
- ✅ Scripts de automatización
- ✅ Docker containerizado
- ✅ Jenkins configurado

---

## 🎉 ¡OptiCash v2 está listo para producción! 🚀

*Este proyecto representa un ejemplo completo de desarrollo moderno con Node.js, implementando las mejores prácticas de DevOps, CI/CD y documentación técnica.*

**¿Listo para comenzar?** Ejecuta `.\scripts\quick-test.ps1` para verificar que todo esté funcionando correctamente.