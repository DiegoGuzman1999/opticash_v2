# OptiCash - Mapeos de APIs

## 📋 Resumen

Este documento describe todos los endpoints de la API de OptiCash, incluyendo contratos de API, ejemplos de request/response, códigos de error y documentación completa para desarrolladores.

## 🏗️ Arquitectura de la API

### Base URL
```
Desarrollo: http://localhost:4000/api
Producción: https://api.opticash.com/api
```

### Autenticación
- **Tipo:** JWT Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Expiración:** 24 horas
- **Refresh Token:** 7 días

### Formato de Respuesta Estándar
```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Códigos de Estado HTTP
- **200:** OK - Operación exitosa
- **201:** Created - Recurso creado
- **400:** Bad Request - Datos inválidos
- **401:** Unauthorized - No autenticado
- **403:** Forbidden - Sin permisos
- **404:** Not Found - Recurso no encontrado
- **500:** Internal Server Error - Error del servidor

## 🔐 Autenticación

### POST /auth/register
**Descripción:** Registro de nuevo usuario en el sistema.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "uuid-123",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario",
      "estado": "activo"
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  },
  "message": "Usuario registrado exitosamente"
}
```

**Errores:**
- **400:** Email ya registrado
- **400:** Datos inválidos
- **500:** Error del servidor

---

### POST /auth/login
**Descripción:** Inicio de sesión de usuario.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "uuid-123",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario"
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  },
  "message": "Inicio de sesión exitoso"
}
```

**Errores:**
- **401:** Credenciales inválidas
- **403:** Usuario inactivo
- **500:** Error del servidor

---

### POST /auth/refresh
**Descripción:** Renovar token de acceso.

**Request:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token-here"
  },
  "message": "Token renovado exitosamente"
}
```

## 👤 Gestión de Usuarios

### GET /users/profile
**Descripción:** Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "estado": "activo",
    "rol": "usuario",
    "creado_en": "2024-01-15T10:30:00Z",
    "actualizado_en": "2024-01-15T10:30:00Z"
  },
  "message": "Perfil obtenido exitosamente"
}
```

---

### PUT /users/profile
**Descripción:** Actualizar perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juan.carlos@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "nombre": "Juan Carlos Pérez",
    "email": "juan.carlos@example.com",
    "estado": "activo",
    "rol": "usuario",
    "actualizado_en": "2024-01-15T11:00:00Z"
  },
  "message": "Perfil actualizado exitosamente"
}
```

## 💰 Gestión de Ingresos

### GET /income
**Descripción:** Obtener lista de ingresos del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Término de búsqueda
- `category` (opcional): Filtrar por categoría
- `start_date` (opcional): Fecha de inicio
- `end_date` (opcional): Fecha de fin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ingresos": [
      {
        "id": "uuid-456",
        "monto": 5000.00,
        "descripcion": "Salario mensual",
        "categoria": "salario",
        "fecha_ingreso": "2024-01-15",
        "creado_en": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Ingresos obtenidos exitosamente"
}
```

---

### POST /income
**Descripción:** Crear nuevo ingreso.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "monto": 5000.00,
  "descripcion": "Salario mensual",
  "categoria": "salario",
  "fecha_ingreso": "2024-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-456",
    "monto": 5000.00,
    "descripcion": "Salario mensual",
    "categoria": "salario",
    "fecha_ingreso": "2024-01-15",
    "creado_en": "2024-01-15T10:30:00Z"
  },
  "message": "Ingreso creado exitosamente"
}
```

---

### PUT /income/:id
**Descripción:** Actualizar ingreso existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID del ingreso

**Request:**
```json
{
  "monto": 5500.00,
  "descripcion": "Salario mensual + bonificación",
  "categoria": "salario"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-456",
    "monto": 5500.00,
    "descripcion": "Salario mensual + bonificación",
    "categoria": "salario",
    "fecha_ingreso": "2024-01-15",
    "actualizado_en": "2024-01-15T11:00:00Z"
  },
  "message": "Ingreso actualizado exitosamente"
}
```

---

### DELETE /income/:id
**Descripción:** Eliminar ingreso.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID del ingreso

**Response (200):**
```json
{
  "success": true,
  "message": "Ingreso eliminado exitosamente"
}
```

## 💸 Gestión de Gastos

### GET /expenses
**Descripción:** Obtener lista de gastos del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Término de búsqueda
- `category` (opcional): Filtrar por categoría
- `start_date` (opcional): Fecha de inicio
- `end_date` (opcional): Fecha de fin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "gastos": [
      {
        "id": "uuid-789",
        "monto": 150.00,
        "descripcion": "Supermercado",
        "categoria": "alimentacion",
        "fecha_gasto": "2024-01-15",
        "creado_en": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Gastos obtenidos exitosamente"
}
```

---

### POST /expenses
**Descripción:** Crear nuevo gasto.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "monto": 150.00,
  "descripcion": "Supermercado",
  "categoria": "alimentacion",
  "fecha_gasto": "2024-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-789",
    "monto": 150.00,
    "descripcion": "Supermercado",
    "categoria": "alimentacion",
    "fecha_gasto": "2024-01-15",
    "creado_en": "2024-01-15T10:30:00Z"
  },
  "message": "Gasto creado exitosamente"
}
```

## 🏦 Gestión de Préstamos

### GET /loans
**Descripción:** Obtener lista de préstamos del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `status` (opcional): Filtrar por estado (activo, pagado, vencido)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "prestamos": [
      {
        "id": "uuid-101",
        "monto": 10000.00,
        "plazo_meses": 12,
        "tipo_prestamo": "personal",
        "estado": "activo",
        "saldo_pendiente": 8500.00,
        "cuotas_pagadas": 3,
        "cuotas_totales": 12,
        "creado_en": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Préstamos obtenidos exitosamente"
}
```

---

### POST /loans
**Descripción:** Crear nuevo préstamo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "monto": 10000.00,
  "plazo_meses": 12,
  "tipo_prestamo": "personal",
  "tasa_interes": 12.5,
  "fecha_inicio": "2024-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-101",
    "monto": 10000.00,
    "plazo_meses": 12,
    "tipo_prestamo": "personal",
    "tasa_interes": 12.5,
    "estado": "activo",
    "fecha_inicio": "2024-01-15",
    "cuotas": [
      {
        "numero": 1,
        "monto": 888.49,
        "fecha_vencimiento": "2024-02-15",
        "estado": "pendiente"
      }
    ],
    "creado_en": "2024-01-15T10:30:00Z"
  },
  "message": "Préstamo creado exitosamente"
}
```

---

### GET /loans/:id
**Descripción:** Obtener detalles de un préstamo específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID del préstamo

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-101",
    "monto": 10000.00,
    "plazo_meses": 12,
    "tipo_prestamo": "personal",
    "tasa_interes": 12.5,
    "estado": "activo",
    "saldo_pendiente": 8500.00,
    "cuotas_pagadas": 3,
    "cuotas_totales": 12,
    "fecha_inicio": "2024-01-15",
    "cuotas": [
      {
        "id": "uuid-cuota-1",
        "numero": 1,
        "monto": 888.49,
        "saldo_pendiente": 0,
        "fecha_vencimiento": "2024-02-15",
        "estado": "pagado",
        "fecha_pago": "2024-02-14"
      }
    ],
    "creado_en": "2024-01-15T10:30:00Z"
  },
  "message": "Préstamo obtenido exitosamente"
}
```

## 💳 Gestión de Pagos

### GET /payments
**Descripción:** Obtener historial de pagos del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `loan_id` (opcional): Filtrar por préstamo

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pagos": [
      {
        "id": "uuid-pago-1",
        "monto_total": 888.49,
        "referencia": "PAY-2024-001",
        "estado": "completado",
        "fecha_pago": "2024-02-14",
        "metodo_pago": "transferencia",
        "detalles": [
          {
            "cuota_id": "uuid-cuota-1",
            "monto_aplicado": 888.49,
            "fecha_vencimiento": "2024-02-15"
          }
        ],
        "creado_en": "2024-02-14T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Pagos obtenidos exitosamente"
}
```

---

### POST /payments
**Descripción:** Procesar nuevo pago.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "cuota_ids": ["uuid-cuota-1", "uuid-cuota-2"],
  "monto_total": 1776.98,
  "metodo_pago": "transferencia",
  "referencia": "PAY-2024-002"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-pago-2",
    "monto_total": 1776.98,
    "referencia": "PAY-2024-002",
    "estado": "completado",
    "fecha_pago": "2024-01-15",
    "metodo_pago": "transferencia",
    "detalles": [
      {
        "cuota_id": "uuid-cuota-1",
        "monto_aplicado": 888.49,
        "fecha_vencimiento": "2024-02-15"
      },
      {
        "cuota_id": "uuid-cuota-2",
        "monto_aplicado": 888.49,
        "fecha_vencimiento": "2024-03-15"
      }
    ],
    "creado_en": "2024-01-15T10:30:00Z"
  },
  "message": "Pago procesado exitosamente"
}
```

## 🧠 Sugerencias Inteligentes

### GET /suggestions
**Descripción:** Obtener sugerencias inteligentes para abonos a capital.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `loan_id` (opcional): Filtrar por préstamo específico
- `horizon` (opcional): Horizonte de tiempo (1, 3, 6, 12 meses)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "liquidez_disponible": 2500.00,
    "ingresos_mensuales": 5000.00,
    "gastos_mensuales": 2500.00,
    "sugerencias": [
      {
        "prestamo_id": "uuid-101",
        "monto_sugerido": 1000.00,
        "ahorro_intereses": 150.00,
        "tiempo_ahorro": "2 meses",
        "prioridad": "alta",
        "razon": "Tienes liquidez suficiente para hacer un abono adicional"
      }
    ],
    "proyeccion": {
      "tiempo_total_ahorro": "2 meses",
      "intereses_ahorrados": 300.00,
      "fecha_pago_completo": "2024-10-15"
    }
  },
  "message": "Sugerencias generadas exitosamente"
}
```

---

### POST /suggestions/apply
**Descripción:** Aplicar una sugerencia de abono a capital.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "suggestion_id": "uuid-suggestion-1",
  "monto": 1000.00,
  "metodo_pago": "transferencia"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "pago_id": "uuid-pago-3",
    "monto_aplicado": 1000.00,
    "ahorro_intereses": 150.00,
    "nuevo_saldo": 7500.00,
    "fecha_pago": "2024-01-15"
  },
  "message": "Sugerencia aplicada exitosamente"
}
```

## 📊 Dashboard y Reportes

### GET /dashboard
**Descripción:** Obtener resumen del dashboard financiero.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resumen_financiero": {
      "ingresos_mes_actual": 5000.00,
      "gastos_mes_actual": 2500.00,
      "liquidez_disponible": 2500.00,
      "total_prestamos_activos": 2,
      "saldo_total_pendiente": 15000.00
    },
    "prestamos_activos": [
      {
        "id": "uuid-101",
        "monto": 10000.00,
        "saldo_pendiente": 8500.00,
        "proximo_vencimiento": "2024-02-15",
        "monto_cuota": 888.49
      }
    ],
    "gastos_recientes": [
      {
        "id": "uuid-789",
        "monto": 150.00,
        "descripcion": "Supermercado",
        "categoria": "alimentacion",
        "fecha": "2024-01-15"
      }
    ],
    "sugerencias_pendientes": 2
  },
  "message": "Dashboard obtenido exitosamente"
}
```

---

### GET /reports/financial
**Descripción:** Generar reporte financiero personalizado.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date`: Fecha de inicio (YYYY-MM-DD)
- `end_date`: Fecha de fin (YYYY-MM-DD)
- `type`: Tipo de reporte (ingresos, gastos, prestamos, completo)
- `format`: Formato de salida (json, pdf, excel)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reporte": {
      "periodo": {
        "inicio": "2024-01-01",
        "fin": "2024-01-31"
      },
      "ingresos": {
        "total": 5000.00,
        "por_categoria": {
          "salario": 4500.00,
          "bonificaciones": 500.00
        }
      },
      "gastos": {
        "total": 2500.00,
        "por_categoria": {
          "alimentacion": 800.00,
          "transporte": 300.00,
          "entretenimiento": 200.00
        }
      },
      "prestamos": {
        "total_pagado": 1776.98,
        "saldo_pendiente": 15000.00,
        "intereses_pagados": 276.98
      }
    },
    "archivo_url": "https://api.opticash.com/reports/uuid-report-123.pdf"
  },
  "message": "Reporte generado exitosamente"
}
```

## 🔧 Administración (Solo Administradores)

### GET /admin/users
**Descripción:** Obtener lista de usuarios del sistema.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Término de búsqueda
- `role` (opcional): Filtrar por rol
- `status` (opcional): Filtrar por estado

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": "uuid-123",
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "rol": "usuario",
        "estado": "activo",
        "ultimo_acceso": "2024-01-15T10:30:00Z",
        "creado_en": "2024-01-01T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Usuarios obtenidos exitosamente"
}
```

---

### GET /admin/statistics
**Descripción:** Obtener estadísticas generales del sistema.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usuarios": {
      "total": 150,
      "activos": 120,
      "nuevos_mes": 25
    },
    "prestamos": {
      "total_activos": 300,
      "monto_total": 2500000.00,
      "promedio_monto": 8333.33
    },
    "pagos": {
      "total_mes": 50000.00,
      "promedio_diario": 1612.90
    },
    "sugerencias": {
      "generadas_mes": 1200,
      "aplicadas": 800,
      "tasa_aplicacion": 66.67
    }
  },
  "message": "Estadísticas obtenidas exitosamente"
}
```

## 📋 Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "field": "email",
      "message": "El formato del email es inválido"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token de acceso requerido",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Acceso denegado: Se requiere rol de administrador",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Recurso no encontrado",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔄 Rate Limiting

### Límites por Endpoint
- **Autenticación:** 5 requests/minuto por IP
- **APIs Generales:** 100 requests/minuto por usuario
- **Reportes:** 10 requests/minuto por usuario
- **Sugerencias:** 20 requests/minuto por usuario

### Headers de Rate Limiting
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## 📚 Ejemplos de Uso

### Flujo Completo: Registro y Primera Transacción
```bash
# 1. Registro
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan@example.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"password123"}'

# 3. Registrar ingreso
curl -X POST http://localhost:4000/api/income \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"monto":5000,"descripcion":"Salario","categoria":"salario","fecha_ingreso":"2024-01-15"}'

# 4. Crear préstamo
curl -X POST http://localhost:4000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"monto":10000,"plazo_meses":12,"tipo_prestamo":"personal","tasa_interes":12.5}'

# 5. Obtener sugerencias
curl -X GET http://localhost:4000/api/suggestions \
  -H "Authorization: Bearer <token>"
```

## 🚀 Próximos Pasos

### Versionado de API
- **v1:** Versión actual (estable)
- **v2:** Próxima versión con mejoras
- **Deprecation:** 6 meses de aviso para cambios breaking

### Documentación Interactiva
- Swagger UI disponible en `/api/docs`
- Postman Collection disponible
- SDKs para JavaScript, Python, PHP

---

**Mapeos de APIs OptiCash** - Versión 1.0
