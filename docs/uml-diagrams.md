# OptiCash - Diagramas UML

## 📋 Resumen

Este documento contiene los diagramas UML del sistema OptiCash, incluyendo diagramas de clases, secuencia, casos de uso y componentes que representan la arquitectura y diseño del sistema.

## 🏗️ Diagrama de Clases Principal

### Clases del Dominio Principal

```mermaid
classDiagram
    class Usuario {
        +String id
        +String nombre
        +String email
        +String password_hash
        +String rol
        +String estado
        +DateTime creado_en
        +DateTime actualizado_en
        +DateTime ultimo_acceso
        
        +registrar()
        +autenticar()
        +actualizarPerfil()
        +cambiarPassword()
        +obtenerDashboard()
    }

    class Ingreso {
        +String id
        +String usuario_id
        +Decimal monto
        +String descripcion
        +String categoria
        +Date fecha_ingreso
        +DateTime creado_en
        +DateTime actualizado_en
        
        +crear()
        +actualizar()
        +eliminar()
        +obtenerPorPeriodo()
    }

    class Gasto {
        +String id
        +String usuario_id
        +Decimal monto
        +String descripcion
        +String categoria
        +Date fecha_gasto
        +DateTime creado_en
        +DateTime actualizado_en
        
        +crear()
        +actualizar()
        +eliminar()
        +obtenerPorPeriodo()
    }

    class Prestamo {
        +String id
        +String usuario_id
        +Decimal monto
        +Integer plazo_meses
        +String tipo_prestamo
        +Decimal tasa_interes
        +String estado
        +Decimal saldo_pendiente
        +Date fecha_inicio
        +DateTime creado_en
        +DateTime actualizado_en
        
        +crear()
        +actualizar()
        +eliminar()
        +calcularCuotas()
        +obtenerEstado()
        +generarCalendarioPagos()
    }

    class Cuota {
        +String id
        +String prestamo_id
        +Integer numero
        +Decimal monto
        +Decimal saldo_pendiente
        +Date fecha_vencimiento
        +String estado
        +Date fecha_pago
        +DateTime creado_en
        +DateTime actualizado_en
        
        +calcularMonto()
        +marcarComoPagada()
        +aplicarPago()
        +obtenerEstado()
    }

    class Pago {
        +String id
        +String usuario_id
        +Decimal monto_total
        +String referencia
        +String estado
        +Date fecha_pago
        +String metodo_pago
        +DateTime creado_en
        +DateTime actualizado_en
        
        +procesar()
        +confirmar()
        +cancelar()
        +obtenerDetalles()
    }

    class DetallePago {
        +String id
        +String pago_id
        +String cuota_id
        +Decimal monto_aplicado
        +DateTime creado_en
        
        +crear()
        +obtenerDetalles()
    }

    class Sugerencia {
        +String id
        +String usuario_id
        +String prestamo_id
        +Decimal monto_sugerido
        +Decimal ahorro_intereses
        +Integer tiempo_ahorro
        +String prioridad
        +String razon
        +String estado
        +DateTime creado_en
        +DateTime actualizado_en
        
        +generar()
        +aplicar()
        +evaluar()
        +obtenerProyeccion()
    }

    class Categoria {
        +String id
        +String nombre
        +String tipo
        +String descripcion
        +Boolean activa
        +DateTime creado_en
        
        +crear()
        +actualizar()
        +eliminar()
        +obtenerPorTipo()
    }

    class Reporte {
        +String id
        +String usuario_id
        +String tipo
        +String formato
        +String parametros
        +String archivo_url
        +String estado
        +DateTime creado_en
        
        +generar()
        +descargar()
        +obtenerEstado()
    }

    %% Relaciones
    Usuario ||--o{ Ingreso : "tiene"
    Usuario ||--o{ Gasto : "tiene"
    Usuario ||--o{ Prestamo : "tiene"
    Usuario ||--o{ Pago : "realiza"
    Usuario ||--o{ Sugerencia : "recibe"
    Usuario ||--o{ Reporte : "genera"
    
    Prestamo ||--o{ Cuota : "contiene"
    Pago ||--o{ DetallePago : "tiene"
    DetallePago }o--|| Cuota : "aplica_a"
    
    Ingreso }o--|| Categoria : "pertenece_a"
    Gasto }o--|| Categoria : "pertenece_a"
    
    Sugerencia }o--|| Prestamo : "sugiere_para"
```

## 🔄 Diagrama de Secuencia - Flujo de Pago

### Procesamiento de Pago de Cuota

```mermaid
sequenceDiagram
    participant U as Usuario
    participant API as API Controller
    participant PS as PaymentService
    participant LS as LoanService
    participant DB as Database
    participant EXT as Sistema Externo

    U->>API: POST /payments (cuota_ids, monto)
    API->>API: Validar token JWT
    API->>PS: procesarPago(cuota_ids, monto)
    
    PS->>LS: obtenerCuotas(cuota_ids)
    LS->>DB: SELECT cuotas WHERE id IN (...)
    DB-->>LS: cuotas[]
    LS-->>PS: cuotas[]
    
    PS->>PS: validarMonto(cuotas, monto)
    PS->>PS: crearPago(cuotas, monto)
    PS->>DB: INSERT pago
    DB-->>PS: pago_id
    
    PS->>EXT: procesarPagoExterno(pago_id, monto)
    EXT-->>PS: resultado_pago
    
    alt Pago Exitoso
        PS->>DB: UPDATE cuotas SET estado='pagado'
        PS->>DB: INSERT detalles_pago
        PS->>LS: actualizarSaldoPrestamo(prestamo_id)
        PS-->>API: pago_exitoso
        API-->>U: 201 Created
    else Pago Fallido
        PS->>DB: UPDATE pago SET estado='fallido'
        PS-->>API: pago_fallido
        API-->>U: 400 Bad Request
    end
```

## 🔄 Diagrama de Secuencia - Generación de Sugerencias

### Proceso de Sugerencias Inteligentes

```mermaid
sequenceDiagram
    participant U as Usuario
    participant API as API Controller
    participant SS as SuggestionService
    participant IS as IncomeService
    participant ES as ExpenseService
    participant LS as LoanService
    participant DB as Database

    U->>API: GET /suggestions
    API->>API: Validar token JWT
    API->>SS: generarSugerencias(usuario_id)
    
    SS->>IS: obtenerIngresosMensuales(usuario_id)
    IS->>DB: SELECT SUM(monto) FROM ingresos WHERE usuario_id = ? AND fecha >= ?
    DB-->>IS: total_ingresos
    IS-->>SS: ingresos_mensuales
    
    SS->>ES: obtenerGastosMensuales(usuario_id)
    ES->>DB: SELECT SUM(monto) FROM gastos WHERE usuario_id = ? AND fecha >= ?
    DB-->>ES: total_gastos
    ES-->>SS: gastos_mensuales
    
    SS->>LS: obtenerPrestamosActivos(usuario_id)
    LS->>DB: SELECT * FROM prestamos WHERE usuario_id = ? AND estado = 'activo'
    DB-->>LS: prestamos[]
    LS-->>SS: prestamos_activos
    
    SS->>SS: calcularLiquidezDisponible(ingresos, gastos)
    SS->>SS: analizarPrestamos(prestamos, liquidez)
    SS->>SS: generarSugerencias(prestamos, liquidez)
    
    SS->>DB: INSERT sugerencias
    DB-->>SS: sugerencias[]
    SS-->>API: sugerencias[]
    API-->>U: 200 OK
```

## 🏗️ Diagrama de Componentes

### Arquitectura de Componentes

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web Application]
        MOBILE[Mobile App]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway]
        AUTH[Authentication Service]
        RATE[Rate Limiting]
    end
    
    subgraph "Business Logic Layer"
        USER[User Service]
        INCOME[Income Service]
        EXPENSE[Expense Service]
        LOAN[Loan Service]
        PAYMENT[Payment Service]
        SUGGESTION[Suggestion Service]
        REPORT[Report Service]
    end
    
    subgraph "Data Access Layer"
        USER_REPO[User Repository]
        INCOME_REPO[Income Repository]
        EXPENSE_REPO[Expense Repository]
        LOAN_REPO[Loan Repository]
        PAYMENT_REPO[Payment Repository]
        SUGGESTION_REPO[Suggestion Repository]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        CACHE[(Redis Cache)]
    end
    
    subgraph "External Services"
        PAYMENT_EXT[Payment Gateway]
        NOTIFICATION[Notification Service]
        ANALYTICS[Analytics Service]
    end
    
    %% Connections
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> RATE
    GATEWAY --> USER
    GATEWAY --> INCOME
    GATEWAY --> EXPENSE
    GATEWAY --> LOAN
    GATEWAY --> PAYMENT
    GATEWAY --> SUGGESTION
    GATEWAY --> REPORT
    
    USER --> USER_REPO
    INCOME --> INCOME_REPO
    EXPENSE --> EXPENSE_REPO
    LOAN --> LOAN_REPO
    PAYMENT --> PAYMENT_REPO
    SUGGESTION --> SUGGESTION_REPO
    
    USER_REPO --> DB
    INCOME_REPO --> DB
    EXPENSE_REPO --> DB
    LOAN_REPO --> DB
    PAYMENT_REPO --> DB
    SUGGESTION_REPO --> DB
    
    USER --> CACHE
    LOAN --> CACHE
    SUGGESTION --> CACHE
    
    PAYMENT --> PAYMENT_EXT
    USER --> NOTIFICATION
    REPORT --> ANALYTICS
```

## 🎯 Diagrama de Casos de Uso Detallado

### Casos de Uso del Usuario Final

```mermaid
graph TD
    subgraph "Usuario Final"
        UC1[Registrarse]
        UC2[Iniciar Sesión]
        UC3[Gestionar Perfil]
        UC4[Registrar Ingresos]
        UC5[Registrar Gastos]
        UC6[Gestionar Préstamos]
        UC7[Realizar Pagos]
        UC8[Consultar Sugerencias]
        UC9[Ver Dashboard]
        UC10[Generar Reportes]
    end
    
    subgraph "Sistema"
        S1[Sistema de Autenticación]
        S2[Sistema de Gestión Financiera]
        S3[Sistema de Pagos]
        S4[Sistema de Sugerencias]
        S5[Sistema de Reportes]
    end
    
    UC1 --> S1
    UC2 --> S1
    UC3 --> S1
    UC4 --> S2
    UC5 --> S2
    UC6 --> S2
    UC7 --> S3
    UC8 --> S4
    UC9 --> S2
    UC10 --> S5
```

## 🔧 Diagrama de Clases - Servicios

### Capa de Servicios

```mermaid
classDiagram
    class BaseService {
        <<abstract>>
        +validateInput()
        +handleError()
        +logActivity()
    }

    class UserService {
        +registerUser()
        +authenticateUser()
        +updateProfile()
        +changePassword()
        +getUserById()
        +getUserByEmail()
    }

    class IncomeService {
        +createIncome()
        +updateIncome()
        +deleteIncome()
        +getIncomesByUser()
        +getIncomesByPeriod()
        +getTotalIncome()
    }

    class ExpenseService {
        +createExpense()
        +updateExpense()
        +deleteExpense()
        +getExpensesByUser()
        +getExpensesByPeriod()
        +getTotalExpenses()
    }

    class LoanService {
        +createLoan()
        +updateLoan()
        +deleteLoan()
        +getLoansByUser()
        +calculateInstallments()
        +updateLoanBalance()
        +getLoanStatus()
    }

    class PaymentService {
        +processPayment()
        +confirmPayment()
        +cancelPayment()
        +getPaymentHistory()
        +applyPaymentToInstallments()
        +generatePaymentReference()
    }

    class SuggestionService {
        +generateSuggestions()
        +applySuggestion()
        +evaluateSuggestion()
        +getSuggestionHistory()
        +calculateSavings()
    }

    class ReportService {
        +generateFinancialReport()
        +generateLoanReport()
        +generatePaymentReport()
        +exportReport()
        +scheduleReport()
    }

    BaseService <|-- UserService
    BaseService <|-- IncomeService
    BaseService <|-- ExpenseService
    BaseService <|-- LoanService
    BaseService <|-- PaymentService
    BaseService <|-- SuggestionService
    BaseService <|-- ReportService
```

## 🗄️ Diagrama de Clases - Repositorios

### Patrón Repository

```mermaid
classDiagram
    class BaseRepository {
        <<abstract>>
        +create()
        +findById()
        +findAll()
        +update()
        +delete()
        +count()
    }

    class UserRepository {
        +findByEmail()
        +findByRole()
        +findActiveUsers()
        +updateLastAccess()
    }

    class IncomeRepository {
        +findByUserAndPeriod()
        +findByCategory()
        +getTotalByPeriod()
        +findByDateRange()
    }

    class ExpenseRepository {
        +findByUserAndPeriod()
        +findByCategory()
        +getTotalByPeriod()
        +findByDateRange()
    }

    class LoanRepository {
        +findByUser()
        +findActiveLoans()
        +findByStatus()
        +updateBalance()
    }

    class PaymentRepository {
        +findByUser()
        +findByLoan()
        +findByPeriod()
        +getTotalPayments()
    }

    class SuggestionRepository {
        +findByUser()
        +findByLoan()
        +findPending()
        +markAsApplied()
    }

    BaseRepository <|-- UserRepository
    BaseRepository <|-- IncomeRepository
    BaseRepository <|-- ExpenseRepository
    BaseRepository <|-- LoanRepository
    BaseRepository <|-- PaymentRepository
    BaseRepository <|-- SuggestionRepository
```

## 🔐 Diagrama de Clases - Seguridad

### Sistema de Autenticación y Autorización

```mermaid
classDiagram
    class AuthService {
        +login()
        +logout()
        +refreshToken()
        +validateToken()
        +hashPassword()
        +comparePassword()
    }

    class JWTService {
        +generateToken()
        +verifyToken()
        +decodeToken()
        +refreshToken()
        +blacklistToken()
    }

    class RoleService {
        +getUserRoles()
        +checkPermission()
        +assignRole()
        +removeRole()
    }

    class PermissionService {
        +getPermissions()
        +checkAccess()
        +grantPermission()
        +revokePermission()
    }

    class SecurityMiddleware {
        +authenticate()
        +authorize()
        +rateLimit()
        +validateInput()
    }

    AuthService --> JWTService
    AuthService --> RoleService
    RoleService --> PermissionService
    SecurityMiddleware --> AuthService
    SecurityMiddleware --> RoleService
```

## 📊 Diagrama de Estados - Préstamo

### Estados del Préstamo

```mermaid
stateDiagram-v2
    [*] --> Creado
    Creado --> Activo : Aprobado
    Creado --> Rechazado : Rechazado
    Activo --> Pagado : Pago Completo
    Activo --> Vencido : Sin Pago
    Vencido --> Activo : Pago Recibido
    Vencido --> Cancelado : Tiempo Excedido
    Pagado --> [*]
    Rechazado --> [*]
    Cancelado --> [*]
```

## 📊 Diagrama de Estados - Pago

### Estados del Pago

```mermaid
stateDiagram-v2
    [*] --> Pendiente
    Pendiente --> Procesando : Iniciado
    Procesando --> Completado : Exitoso
    Procesando --> Fallido : Error
    Fallido --> Pendiente : Reintento
    Completado --> [*]
```

## 🔄 Diagrama de Actividad - Flujo de Sugerencias

### Proceso de Generación de Sugerencias

```mermaid
flowchart TD
    A[Inicio] --> B[Obtener Datos del Usuario]
    B --> C[Calcular Ingresos Mensuales]
    C --> D[Calcular Gastos Mensuales]
    D --> E[Calcular Liquidez Disponible]
    E --> F[Obtener Préstamos Activos]
    F --> G[Analizar Cada Préstamo]
    G --> H{¿Liquidez > 0?}
    H -->|Sí| I[Calcular Abono Sugerido]
    H -->|No| J[No Generar Sugerencias]
    I --> K[Calcular Ahorro en Intereses]
    K --> L[Calcular Tiempo de Ahorro]
    L --> M[Asignar Prioridad]
    M --> N[Guardar Sugerencia]
    N --> O{¿Más Préstamos?}
    O -->|Sí| G
    O -->|No| P[Generar Proyección]
    P --> Q[Retornar Sugerencias]
    J --> Q
    Q --> R[Fin]
```

## 🏗️ Diagrama de Paquetes

### Organización del Código

```mermaid
graph TB
    subgraph "com.opticash"
        subgraph "controllers"
            UC[UserController]
            IC[IncomeController]
            EC[ExpenseController]
            LC[LoanController]
            PC[PaymentController]
            SC[SuggestionController]
            RC[ReportController]
        end
        
        subgraph "services"
            US[UserService]
            IS[IncomeService]
            ES[ExpenseService]
            LS[LoanService]
            PS[PaymentService]
            SS[SuggestionService]
            RS[ReportService]
        end
        
        subgraph "repositories"
            UR[UserRepository]
            IR[IncomeRepository]
            ER[ExpenseRepository]
            LR[LoanRepository]
            PR[PaymentRepository]
            SR[SuggestionRepository]
        end
        
        subgraph "models"
            UM[User]
            IM[Income]
            EM[Expense]
            LM[Loan]
            PM[Payment]
            SM[Suggestion]
        end
        
        subgraph "middleware"
            AM[AuthMiddleware]
            VM[ValidationMiddleware]
            EM2[ErrorMiddleware]
            LM2[LoggingMiddleware]
        end
        
        subgraph "utils"
            JH[JwtHelper]
            VH[ValidationHelper]
            CH[CalculationHelper]
            EH[EmailHelper]
        end
    end
```

## ✅ Criterios de Aceptación

### Diagramas de Clases
- ✅ Representación clara de todas las entidades del dominio
- ✅ Relaciones bien definidas entre clases
- ✅ Atributos y métodos especificados
- ✅ Patrones de diseño identificados

### Diagramas de Secuencia
- ✅ Flujos de interacción detallados
- ✅ Participantes claramente identificados
- ✅ Mensajes bien definidos
- ✅ Alternativas y excepciones consideradas

### Diagramas de Componentes
- ✅ Arquitectura de capas representada
- ✅ Responsabilidades bien definidas
- ✅ Acoplamiento y cohesión apropiados
- ✅ Escalabilidad considerada

### Diagramas de Estados
- ✅ Estados del sistema identificados
- ✅ Transiciones claramente definidas
- ✅ Eventos que disparan cambios
- ✅ Estados finales especificados

---

**Diagramas UML OptiCash** - Versión 1.0
