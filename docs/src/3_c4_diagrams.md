# Diagramas C4 y Flujos — Maya Dashboard

> Generado: 2026-03-31 | Fase 4 — Documentación Visual
> Skill: System Architect (C4 Model, Mermaid)
> Fuente: `docs/src/2_architecture_risks.md` · `docs/src/1_epics_and_features.md`

---

## 1. C4 — Nivel 1: System Context

> Visión de alto nivel. Muestra el sistema en relación con los usuarios y sistemas externos que lo rodean.

```mermaid
C4Context
  title Maya Dashboard — System Context

  Person(user, "Usuario CEEDCV", "Empleado del centro que accede al dashboard para\nfichajes, notificaciones y herramientas")

  System(dashboard, "Maya Dashboard", "SPA React + API Laravel.\nDashboard centralizado con notificaciones, fichajes,\ncalendario y gestión de herramientas")

  System_Ext(keycloak, "Keycloak", "Identity Provider (OIDC).\nGestiona autenticación, tokens JWT\ny brokering con Microsoft")
  System_Ext(odoo, "Odoo ERP", "Sistema de RRHH.\nProporciona API de fichajes\n(disponible junio 2026)")
  System_Ext(microsoft, "Microsoft Graph", "API de calendario Office 365 / Outlook.\nAcceso vía Token Exchange RFC 8693")
  System_Ext(rabbitmq, "RabbitMQ", "Message broker externo.\nInserta notificaciones vía HTTP.\nRecibe logs de errores de sistema")

  Rel(user, dashboard, "Accede vía navegador", "HTTPS")
  Rel(user, keycloak, "Se autentica", "OIDC / browser redirect")
  Rel(dashboard, keycloak, "Valida JWT (JWKS)", "HTTPS")
  Rel(dashboard, odoo, "Consulta y registra fichajes", "HTTPS / REST")
  Rel(dashboard, microsoft, "Lee eventos de calendario", "HTTPS / Microsoft Graph API")
  Rel(rabbitmq, dashboard, "Inserta notificaciones", "HTTPS / REST + API key")
  Rel(dashboard, rabbitmq, "Publica logs de errores de sistema", "AMQP / php-amqplib")
```

---

## 2. C4 — Nivel 2: Container Diagram

> Descomposición en contenedores (aplicaciones, bases de datos, servidores). Muestra responsabilidades y protocolos de comunicación.

```mermaid
C4Container
  title Maya Dashboard — Container Diagram

  Person(user, "Usuario CEEDCV", "Empleado")

  System_Boundary(maya, "Maya Dashboard (monorepo)") {
    Container(spa, "React SPA", "React 19 + TypeScript + Vite 7\nTailwind 4 + Odoo 19 tokens", "Interfaz de usuario. SPA que corre en el\nnavegador. Gestiona sesión OIDC (PKCE),\nrutas, widgets y WebSocket")
    Container(api, "Laravel API", "Laravel 13 / PHP 8.3\nApiController → Services → Repositories", "API REST pura JSON. Valida JWT via JWKS.\nGestiona notificaciones, fichajes, perfil,\ntools, audit log y errores de sistema")
    Container(reverb, "Laravel Reverb", "WebSocket server\n(nativo Laravel 11+)", "Entrega notificaciones urgentes en\ntiempo real. Canales privados por usuario")
    ContainerDb(db, "PostgreSQL 16", "Base de datos principal", "Tablas: registros_ceed, notifications,\ntools, user_tools_favorites,\nmatrículas, activity_log")
  }

  System_Ext(keycloak, "Keycloak", "Identity Provider (OIDC)")
  System_Ext(keycloak_db, "Keycloak PostgreSQL", "Schema keycloak en mismo servidor\nPostgreSQL (solo producción). Acceso vía FDW")
  System_Ext(odoo, "Odoo ERP", "API de fichajes\n(mock hasta junio 2026)")
  System_Ext(microsoft, "Microsoft Graph", "Calendario Outlook")
  System_Ext(rabbitmq, "RabbitMQ", "Message broker externo")

  Rel(user, spa, "Usa", "HTTPS / navegador")
  Rel(spa, keycloak, "Authorization Code + PKCE\nToken refresh", "HTTPS / redirect")
  Rel(spa, api, "Peticiones REST autenticadas", "HTTPS / JSON + Bearer JWT")
  Rel(spa, reverb, "Suscripción a notificaciones urgentes\n(canal privado por usuario)", "WSS / Laravel Echo")
  Rel(api, keycloak, "Valida JWT via JWKS endpoint", "HTTPS")
  Rel(api, db, "Lee y escribe datos", "TCP / Eloquent ORM")
  Rel(api, odoo, "Registra y consulta fichajes", "HTTPS / REST (OdooAdapter)")
  Rel(api, microsoft, "Lee eventos de calendario\n(token exchange via Keycloak)", "HTTPS / Graph API")
  Rel(api, reverb, "Publica eventos urgentes", "Internal / Laravel Events + Broadcast")
  Rel(rabbitmq, api, "POST notificaciones entrantes", "HTTPS / API key header")
  Rel(api, rabbitmq, "Publica logs de errores de sistema", "AMQP / php-amqplib")
  Rel(db, keycloak_db, "FDW: copia datos básicos de usuario\nen primer login", "PostgreSQL FDW (solo producción)")
```

---

## 3. C4 — Nivel 3: Component Diagram — Laravel API

> Descomposición interna del contenedor Laravel API. Muestra los componentes principales y sus relaciones internas.

```mermaid
C4Component
  title Laravel API — Component Diagram

  Container_Ext(spa, "React SPA", "Frontend")
  Container_Ext(reverb, "Laravel Reverb", "WebSocket server")
  ContainerDb_Ext(db, "PostgreSQL", "Base de datos")
  System_Ext(keycloak, "Keycloak JWKS", "Identity Provider")
  System_Ext(odoo, "Odoo ERP", "API Fichajes")
  System_Ext(microsoft, "Microsoft Graph", "Calendario")
  System_Ext(rabbitmq, "RabbitMQ", "Message broker")

  Container_Boundary(api, "Laravel API") {

    Component(middleware_jwt, "JwtAuthMiddleware", "Laravel Middleware\n(firebase/php-jwt)", "Valida Bearer JWT en cada request.\nExtrae user_id del claim 'email'.\nRechaza tokens expirados o con issuer incorrecto")

    Component(middleware_apikey, "ApiKeyMiddleware", "Laravel Middleware", "Valida API key para el endpoint\nde inserción de notificaciones.\nExcluye este endpoint del JwtAuthMiddleware")

    Component(auth_controller, "AuthController", "ApiController", "Gestiona sincronización de usuario\nen primer login via FDW o claims JWT")

    Component(notif_controller, "NotificationController", "ApiController", "CRUD de notificaciones.\nEndpoint de inserción con idempotencia (external_id).\nAcciones de leída/todas leídas")

    Component(fichaje_controller, "FichajeController", "ApiController", "Acciones de entrada/salida.\nDelegas al OdooFichajesAdapter")

    Component(profile_controller, "ProfileController", "ApiController", "Vista y edición de registros_ceed.\nGestión de matrículas.\nEdición IBAN con validación europea")

    Component(tools_controller, "ToolsController", "ApiController", "CRUD del catálogo de Tools.\nGestión de favoritos con orden")

    Component(audit_controller, "AuditController", "ApiController", "Historial de acciones del usuario autenticado.\nFiltrado por user_id via Policy")

    Component(odoo_adapter, "OdooFichajesAdapter", "Service / Interface + Impl", "Abstracción de la API de Odoo.\nMock activo hasta junio 2026.\nSwap sin modificar controladores")

    Component(calendar_provider, "CalendarProvider", "Service / Interface + Impl", "Abstracción para calendarios.\nImplementación MicrosoftGraphCalendarProvider.\nToken Exchange RFC 8693 via Keycloak")

    Component(notification_service, "NotificationService", "Service", "Lógica de creación y gestión de notificaciones.\nDispara broadcast a Reverb si priority=urgente")

    Component(audit_observer, "ActivityLogObserver", "Eloquent Observer\n(spatie/laravel-activitylog)", "Registra automáticamente cambios\nen campos sensibles. Append-only.\nLimpieza automática tras 1 año")

    Component(rabbitmq_publisher, "RabbitMqErrorPublisher", "Service\n(php-amqplib)", "Publica errores de sistema a RabbitMQ.\nURL configurable por variable de entorno.\nFallo silencioso si RabbitMQ no disponible")
  }

  Rel(spa, middleware_jwt, "Cada request REST", "Bearer JWT")
  Rel(rabbitmq, middleware_apikey, "POST /api/notifications", "X-Api-Key header")
  Rel(middleware_jwt, auth_controller, "")
  Rel(middleware_jwt, notif_controller, "")
  Rel(middleware_jwt, fichaje_controller, "")
  Rel(middleware_jwt, profile_controller, "")
  Rel(middleware_jwt, tools_controller, "")
  Rel(middleware_jwt, audit_controller, "")
  Rel(middleware_apikey, notif_controller, "")
  Rel(middleware_jwt, keycloak, "Valida JWT via JWKS", "HTTPS")
  Rel(auth_controller, db, "INSERT registros_ceed (primer login)", "Eloquent")
  Rel(notif_controller, notification_service, "")
  Rel(notification_service, db, "INSERT notifications", "Eloquent")
  Rel(notification_service, reverb, "Broadcast si urgente", "Laravel Events")
  Rel(fichaje_controller, odoo_adapter, "")
  Rel(odoo_adapter, odoo, "REST (o mock)", "HTTPS")
  Rel(profile_controller, db, "UPDATE registros_ceed / matrículas", "Eloquent")
  Rel(profile_controller, audit_observer, "Campos sensibles auditados automáticamente", "Observer")
  Rel(tools_controller, db, "CRUD tools / user_tools_favorites", "Eloquent")
  Rel(audit_controller, db, "SELECT activity_log (solo propio)", "Eloquent + Policy")
  Rel(calendar_provider, microsoft, "GET /calendar/events", "HTTPS / Graph API")
  Rel(audit_observer, db, "INSERT activity_log (append-only)", "Eloquent")
  Rel(rabbitmq_publisher, rabbitmq, "AMQP publish", "php-amqplib")
```

---

## 4. Flujos Secuenciales

### 4.1 Flujo de Autenticación — Login OIDC con PKCE

> Covers: F-01.1, F-01.2, F-01.3, F-01.4

```mermaid
sequenceDiagram
  actor U as Usuario
  participant SPA as React SPA
  participant KC as Keycloak
  participant API as Laravel API
  participant DB as PostgreSQL

  U->>SPA: Accede al dashboard (sin sesión)
  SPA->>SPA: Genera code_verifier + code_challenge (PKCE)
  SPA->>KC: Redirige a /authorize?response_type=code&code_challenge=...
  KC->>U: Muestra formulario de login
  U->>KC: Introduce credenciales corporativas
  KC->>SPA: Redirige a callback con authorization_code
  SPA->>KC: POST /token (code + code_verifier)
  KC->>SPA: access_token + refresh_token + id_token
  SPA->>SPA: Almacena tokens de forma segura

  SPA->>API: GET /api/me (Bearer: access_token)
  API->>KC: GET /.well-known/jwks.json
  KC->>API: Claves públicas JWKS
  API->>API: Valida firma JWT + expiry + issuer
  API->>DB: SELECT * FROM registros_ceed WHERE identidad_digital = email
  alt Primer login — usuario no existe
    DB->>API: No encontrado
    API->>DB: INSERT INTO registros_ceed (email, nombre, apellidos...)
    Note over API,DB: FDW en producción lee de Keycloak DB<br/>En local usa claims del JWT
  end
  DB->>API: Datos del usuario
  API->>SPA: 200 OK — perfil del usuario
  SPA->>U: Muestra dashboard

  Note over SPA,KC: Renovación silenciosa antes de expirar access_token
  SPA->>KC: POST /token (grant_type=refresh_token)
  KC->>SPA: Nuevo access_token
```

---

### 4.2 Flujo de Inserción y Entrega de Notificación Urgente

> Covers: F-03.1, F-03.2, F-03.3, F-03.4

```mermaid
sequenceDiagram
  participant RMQ as RabbitMQ
  participant API as Laravel API
  participant DB as PostgreSQL
  participant RV as Laravel Reverb
  participant SPA as React SPA
  actor U as Usuario

  RMQ->>API: POST /api/notifications\n{title, body, priority: urgente, user_id, external_id, ...}\nX-Api-Key: [api_key]
  API->>API: Valida API key (ApiKeyMiddleware)
  API->>API: Valida payload (NotificationRequest)
  API->>DB: SELECT * WHERE external_id = ? (idempotencia)
  alt Notificación ya existe (reintento de RabbitMQ)
    DB->>API: Encontrada
    API->>RMQ: 200 OK — ya procesada
  else Notificación nueva
    DB->>API: No encontrada
    API->>DB: INSERT INTO notifications (title, body, priority, user_id, external_id, ...)
    DB->>API: OK — notification_id
    alt priority = urgente
      API->>RV: Broadcast NotificationCreated event\nen canal private-notifications.{user_id}
      RV->>SPA: WebSocket event → notificación urgente
      SPA->>U: Muestra toast con title + body
      Note over SPA,U: Toast desaparece automáticamente<br/>(tiempo estándar UX)
    end
    API->>RMQ: 201 Created — {notification_id}
  end

  Note over U,SPA: El widget de notificaciones (F-03.4)<br/>se actualiza en tiempo real
  SPA->>API: GET /api/notifications (Bearer JWT)
  API->>DB: SELECT WHERE user_id = ? ORDER BY created_at DESC
  DB->>API: Lista de notificaciones
  API->>SPA: 200 OK — notificaciones actualizadas
```

---

### 4.3 Flujo de Fichaje — Entrada con Mock de Odoo

> Covers: F-04.1, F-04.2, F-04.3, F-02.2

```mermaid
sequenceDiagram
  actor U as Usuario
  participant SPA as React SPA
  participant API as Laravel API
  participant ADP as OdooFichajesAdapter
  participant ODOO as Odoo API (o Mock)
  participant DB as PostgreSQL
  participant AL as ActivityLog

  U->>SPA: Dashboard carga (sin fichaje del día)
  SPA->>API: GET /api/fichajes/status (Bearer JWT)
  API->>ADP: getFichajeStatusHoy(user_id)
  ADP->>ODOO: GET /hr.attendance?employee=? [mock devuelve no fichado]
  ODOO->>ADP: sin registro de entrada hoy
  ADP->>API: estado: no_fichado
  API->>SPA: {status: 'pendiente'}
  SPA->>U: Muestra banner de alerta de fichaje pendiente

  U->>SPA: Hace clic en "Fichar entrada"
  SPA->>API: POST /api/fichajes (Bearer JWT)\n{tipo: 'entrada'}
  API->>ADP: registrarFichaje(user_id, 'entrada', timestamp)
  ADP->>ODOO: POST /hr.attendance [mock registra entrada]

  alt Odoo disponible (OK)
    ODOO->>ADP: 200 OK — fichaje registrado
    ADP->>API: éxito
    API->>AL: INSERT activity_log FICHAJE:entrada (spatie)
    API->>SPA: 200 OK — {timestamp, tipo: 'entrada'}
    SPA->>U: Muestra confirmación de éxito (3-5 seg, auto-cierre)
    SPA->>SPA: Oculta banner de alerta de fichaje pendiente
  else Odoo no disponible (error)
    ODOO->>ADP: timeout / connection error
    ADP->>API: error de conexión
    API->>AL: INSERT activity_log FICHAJE:error (spatie)
    API->>SPA: 503 Service Unavailable
    SPA->>U: Muestra modal de cierre manual:\n"Ficha presencialmente en la entrada al centro"
  end
```

---

### 4.4 Flujo de Sincronización FDW — Primer Login

> Covers: F-01.3

```mermaid
sequenceDiagram
  participant API as Laravel API
  participant DB as PostgreSQL (Laravel)
  participant FDW as FDW → Keycloak DB
  participant JWT as Claims del JWT

  Note over API: Se ejecuta tras validar JWT en primer login
  API->>DB: SELECT COUNT(*) FROM registros_ceed\nWHERE identidad_digital = jwt.email

  alt Usuario ya existe (logins posteriores)
    DB->>API: count = 1
    API->>API: Continuar — sin sincronización
  else Primer login — usuario no existe
    DB->>API: count = 0

    alt Entorno producción (FDW activo)
      API->>FDW: SELECT first_name, last_name, email\nFROM keycloak.user_entity\nWHERE email = ?
      FDW->>API: Datos básicos del usuario desde Keycloak DB
    else Entorno local (sin FDW)
      API->>JWT: Extraer given_name, family_name, email del JWT
      JWT->>API: Claims del token
    end

    API->>DB: INSERT INTO registros_ceed\n(identidad_digital, nombre, apellidos,\nIBAN=null, puesto=null, ...)
    DB->>API: OK — registro creado
    Note over DB: registros_ceed es independiente<br/>desde este momento
  end
```

---

### 4.5 Flujo de Gestión de Tools y Favoritos

> Covers: F-06.2, F-06.3, F-06.4, F-06.1

```mermaid
sequenceDiagram
  actor U as Usuario
  participant SPA as React SPA
  participant API as Laravel API
  participant DB as PostgreSQL
  participant AL as ActivityLog

  U->>SPA: Navega a Página de Herramientas
  SPA->>API: GET /api/tools?include_favorites=true (Bearer JWT)
  API->>DB: SELECT tools + user_tools_favorites WHERE user_id = ?
  DB->>API: Lista de tools con flag is_favorite + orden
  API->>SPA: 200 OK — catálogo completo con favoritos marcados

  U->>SPA: Marca Tool "Nóminas" como favorita
  SPA->>API: POST /api/tools/{id}/favorite (Bearer JWT)
  API->>DB: INSERT INTO user_tools_favorites (user_id, tool_id, orden)
  DB->>API: OK
  API->>SPA: 200 OK
  SPA->>SPA: Actualiza sidebar con nueva favorita

  U->>SPA: Reordena favoritas con drag & drop
  SPA->>API: PATCH /api/tools/favorites/reorder (Bearer JWT)\n{order: [tool_id_1, tool_id_2, ...]}
  API->>DB: UPDATE user_tools_favorites SET orden = ?\nWHERE user_id = ?
  DB->>API: OK
  API->>SPA: 200 OK
  SPA->>SPA: Sidebar refleja nuevo orden inmediatamente

  U->>SPA: Hace clic en Tool del sidebar
  SPA->>AL: Registra evento TOOLS:acceso via API
  API->>AL: INSERT activity_log TOOLS:acceso
  alt Tool interna
    SPA->>SPA: React Router navega a ruta interna
  else Tool externa
    SPA->>SPA: Abre URL en nueva pestaña
  end
```

---

### 4.6 Flujo de Edición de Perfil con Auditoría

> Covers: F-07.1, F-07.2, F-07.3, F-08.1

```mermaid
sequenceDiagram
  actor U as Usuario
  participant SPA as React SPA
  participant API as Laravel API
  participant DB as PostgreSQL
  participant AO as ActivityLogObserver

  U->>SPA: Navega a Página de Perfil
  SPA->>API: GET /api/profile (Bearer JWT)
  API->>DB: SELECT * FROM registros_ceed WHERE identidad_digital = ?
  DB->>API: Datos del perfil (email y nombre de solo lectura,\nresto editables)
  API->>SPA: 200 OK — datos del perfil

  U->>SPA: Edita IBAN y guarda
  SPA->>API: PATCH /api/profile (Bearer JWT)\n{iban: 'ES9121000418450200051332'}
  API->>API: Valida formato IBAN europeo (backend)\n(código país + checksum)

  alt IBAN inválido
    API->>SPA: 422 Unprocessable Entity\n{errors: {iban: 'Formato IBAN inválido'}}
    SPA->>U: Muestra error de validación
  else IBAN válido
    API->>DB: UPDATE registros_ceed SET iban = ? WHERE id = ?
    DB->>AO: Evento Eloquent 'updated' en campo sensible
    AO->>DB: INSERT INTO activity_log\n(causer_id, event: 'PROFILE', description: 'iban editado')
    DB->>API: OK
    API->>SPA: 200 OK — perfil actualizado
    SPA->>U: Muestra confirmación de guardado
  end
```

---

## 5. Modelo de Datos — Tablas Principales

> Referencia rápida del esquema de BD. Las migraciones son responsabilidad del equipo de backend.

```mermaid
erDiagram
  registros_ceed {
    uuid id PK
    string identidad_digital UK "email del JWT de Keycloak"
    string nombre
    string apellidos
    string email
    string telefono
    string direccion
    string puesto
    string iban "nullable, validación IBAN europeo"
    boolean repite_en_ceed
    timestamps created_at
    timestamps updated_at
  }

  matriculas {
    uuid id PK
    uuid user_id FK
    string matricula "sin validación de formato"
    timestamps created_at
    timestamps updated_at
  }

  tools {
    uuid id PK
    string nombre
    string icono "URL o identificador"
    string url
    enum tipo "interno | externo"
    timestamps created_at
    timestamps updated_at
  }

  user_tools_favorites {
    uuid id PK
    uuid user_id FK
    uuid tool_id FK
    integer orden "posición en el sidebar"
    timestamps created_at
  }

  notifications {
    uuid id PK
    uuid user_id FK
    string external_id UK "idempotencia para reintentos"
    string title
    text body
    string type
    enum priority "normal | aviso | urgente"
    string action_url "nullable"
    timestamp expires_at "nullable"
    timestamp read_at "nullable"
    timestamps created_at
    timestamps updated_at
  }

  activity_log {
    bigint id PK
    string log_name
    string description
    uuid causer_id FK "user_id"
    string causer_type
    json properties
    timestamps created_at "no updated_at — append-only"
  }

  registros_ceed ||--o{ matriculas : "tiene"
  registros_ceed ||--o{ user_tools_favorites : "marca como favorita"
  tools ||--o{ user_tools_favorites : "es marcada por"
  registros_ceed ||--o{ notifications : "recibe"
  registros_ceed ||--o{ activity_log : "genera"
```

---

## 6. Infraestructura Local — Docker Compose

> Topología del entorno de desarrollo local. Sin Keycloak ni RabbitMQ de producción.

```mermaid
C4Deployment
  title Maya Dashboard — Entorno Local (Docker Compose)

  Deployment_Node(docker, "Docker Compose", "Entorno local de desarrollo") {

    Deployment_Node(frontend_node, "frontend/", "Node.js + Vite dev server") {
      Container(spa_local, "React SPA", "Vite 7 — puerto 5173", "Hot Module Replacement activo.\nProxy a Laravel API configurado")
    }

    Deployment_Node(backend_node, "backend/", "PHP 8.3 + Laravel Sail") {
      Container(api_local, "Laravel API", "Laravel Sail — puerto 80", "API REST. Keycloak validado\ncontra instancia local")
      Container(reverb_local, "Laravel Reverb", "puerto 8080", "WebSocket para notificaciones urgentes")
    }

    Deployment_Node(db_node, "PostgreSQL", "postgres:16 — puerto 5432") {
      ContainerDb(db_laravel, "BD Laravel", "database: maya_dashboard", "Tablas propias de la aplicación")
      ContainerDb(db_keycloak, "BD Keycloak local", "database: keycloak", "Compartida con instancia Keycloak local.\nSin FDW en local — se usan claims JWT")
    }

    Deployment_Node(kc_node, "Keycloak local", "Keycloak — puerto 8443") {
      Container(kc_local, "Keycloak", "Realm maya-local\nUsuarios de test precargados", "Instancia local para desarrollo.\nNo es el Keycloak de producción")
    }
  }

  Deployment_Node(ext, "Servicios Externos (no en Docker local)") {
    Container(rabbitmq_ext, "RabbitMQ", "Externo", "Solo disponible en producción")
    Container(odoo_ext, "Odoo ERP", "Mock local", "API real disponible junio 2026.\nMock activo en local")
    Container(microsoft_ext, "Microsoft Graph", "Externo", "Solo disponible cuando\nintegración esté operativa")
  }

  Rel(spa_local, api_local, "Proxy Vite → API", "HTTP localhost")
  Rel(spa_local, reverb_local, "WebSocket", "WS localhost:8080")
  Rel(api_local, db_laravel, "Eloquent ORM", "TCP")
  Rel(kc_local, db_keycloak, "Persistencia realm", "TCP")
  Rel(spa_local, kc_local, "OIDC login", "HTTP redirect")
  Rel(api_local, kc_local, "Valida JWT (JWKS local)", "HTTP")
```

---

## 7. Notas de Implementación

### 7.1 Entornos y configuración

| Variable de entorno | Uso | Quién la define |
| --- | --- | --- |
| `KEYCLOAK_JWKS_URI` | URL del JWKS endpoint de Keycloak para validar tokens JWT | Backend |
| `KEYCLOAK_ISSUER` | Issuer esperado en el JWT (URL del realm) | Backend |
| `NOTIFICATION_API_KEY` | API key para el endpoint de inserción de notificaciones | Backend |
| `RABBITMQ_LOGS_URL` | URL del broker RabbitMQ para publicar logs de sistema (pendiente de infra) | Backend |
| `ODOO_API_URL` | URL de la API Odoo (mock en local, real en producción) | Backend |
| `VITE_KEYCLOAK_URL` | URL base del servidor Keycloak | Frontend |
| `VITE_KEYCLOAK_REALM` | Nombre del realm Keycloak | Frontend |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID del cliente público frontend en Keycloak | Frontend |
| `VITE_API_URL` | URL base de la API Laravel | Frontend |

### 7.2 Secuencia de implementación recomendada por sprints

| Sprint | Features | Objetivo |
| --- | --- | --- |
| Sprint 1 | F-09.1, F-09.2, F-09.4, F-01.1, F-01.2, F-01.3, F-01.4 | Infraestructura base + autenticación completa |
| Sprint 2 | F-02.1, F-02.3, F-03.1, F-04.1, F-06.2, F-08.1, F-08.3 | Layout, CRUD base, integraciones y auditoría |
| Sprint 3 | F-02.2, F-03.2, F-03.3, F-03.4, F-04.2, F-04.3, F-06.1, F-06.3, F-06.4, F-07.1, F-07.2 | Módulos funcionales completos |
| Sprint 4 | F-02.4, F-05.1, F-07.3, F-08.2, F-09.3 | Mejoras UX, perfil completo, provider calendario |
| Sprint 5 | F-05.2, F-05.3 | Integración Microsoft Graph (Could) |

### 7.3 Dependencias críticas de disponibilidad externa

| Dependencia | Estado | Impacto si no disponible | Mitigación |
| --- | --- | --- | --- |
| Odoo API | No disponible hasta junio 2026 | Módulo de fichajes bloqueado | Mock desacoplado (F-04.1) |
| RabbitMQ URL (logs) | URL no confirmada | Logs de sistema no se publican | Config por entorno, fallo silencioso |
| Dominio de producción | Pendiente de infra | Redirect URIs Keycloak incorrectos | Parametrizar por variable de entorno |
| Token Exchange Microsoft | Depende de versión de Keycloak | Widget de calendario no disponible | Widget omitido de UI (F-05.3) hasta activación |
