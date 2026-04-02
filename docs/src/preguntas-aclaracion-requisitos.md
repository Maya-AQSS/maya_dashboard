# Preguntas de Aclaración de Requisitos — Maya Dashboard

> Actualizado: 2026-03-31 | Basado en: `requisitos-cliente.md` + `REPORT.md` + respuestas del cliente

---

## ✅ Decisiones Confirmadas (resueltas)

| Área | Decisión |
| --- | --- |
| Dashboard | Página de inicio tras login. Layout: alerta de fichaje en top, sidebar izquierdo, área central de widgets |
| Widgets MVP | 3 widgets fijos: Notificaciones, Fichajes, Calendario Outlook. Layout fijo, sin personalización en MVP |
| Grid | 12 columnas, tamaños discretos: pequeño (3 col), mediano (6 col), grande (9 col). Altura fija por tipo |
| Configuración widgets MVP | Todos los usuarios tienen el mismo dashboard con 3 widgets en posición y tamaño fijos |
| Config v2 | Drag & drop, reordenamiento y personalización de widgets quedan para v2 |
| Config guardada (v2) | Backend Laravel — tabla `user_widget_configurations`. Sync entre dispositivos |
| Notificaciones | Sistema **interno** del dashboard. RabbitMQ llama al endpoint REST del dashboard para insertar notificaciones |
| Notificaciones — inserción | El dashboard expone un endpoint REST autenticado por **API key**. RabbitMQ actúa como cliente HTTP |
| Notificaciones — tipos | Múltiples tipos. Prioridades: `normal`, `aviso`, `urgente` |
| Notificaciones — retención | Ajustable al crear la notificación. Sin expiración por defecto. No leídas: conservadas indefinidamente |
| Notificaciones — acciones | Redirigen a rutas internas o URLs externas según la notificación |
| Notificaciones — toast | Notificaciones urgentes muestran toast en **todas las páginas** via WebSocket |
| Notificaciones leídas | Estado leído/no leído persistido en backend |
| Notificaciones — filtrado | Todos los usuarios pueden acceder a filtros. Con roles (v2) se restringirá |
| Logs de sistema | Se envían a RabbitMQ. URL aún no disponible. Simular config; solo cambiar URL cuando llegue |
| Logs sistema — esquema | Definido libremente en este proyecto (no hay contrato externo) |
| Fichajes | Entrada/salida laboral (ampliable). API externa Odoo disponible junio 2026. Mock hasta entonces |
| Fichaje — alerta top | Solo aparece cuando el usuario **aún no ha fichado entrada en el día**. Visible en **todas las páginas** |
| Fichaje — confirmación | Alerta de éxito que desaparece automáticamente tras **3-5 segundos** (tiempo estándar UX) |
| Fichaje — Odoo caído | Modal de cierre **manual** informando que el usuario debe fichar en la entrada al centro |
| Fichaje — tipos acción | Entrada y salida. Ampliable en futuras versiones |
| Fichajes — scope | Solo personales. Sin vistas de equipo para managers en esta fase |
| Fichajes — histórico | Siempre consultado desde Odoo, sin copia local |
| Calendario Outlook | Sistema de providers genérico y desacoplado (`CalendarProvider` interface + implementaciones concretas) |
| Calendario — rango | Diario por defecto, cambiable por el usuario |
| Calendario — auth | Identity Brokering via Keycloak (Opción A). Token Exchange RFC 8693 para Microsoft Graph |
| Calendario — sin cuenta | Muestra estado "conecta tu cuenta" |
| Calendario — solo lectura | Sí. No permite crear/modificar eventos |
| Calendario — antes junio 2026 | Widget omitido completamente hasta que la integración esté disponible |
| Sidebar | Colapsable. En escritorio colapsado: modo rail (solo iconos). En móvil: drawer/overlay |
| Favoritos | Cualquier Tool puede ser favorita. Máx recomendado 10. Iconos con tooltip. Drag & drop para reordenar |
| Favoritos — navegación | Interna o externa según configuración de cada tool |
| Favoritos — gestión | Navega a página Tools (no modal). Incluye drag & drop para reordenar |
| Auth | Keycloak (OIDC + JWT). Flow: Authorization Code + PKCE. Política de contraseñas en Keycloak |
| Auth — Laravel | Laravel valida JWT de Keycloak via **JWKS endpoint** (`firebase/php-jwt`). Resource server puro |
| Auth — claim identidad | `email` claim del JWT de Keycloak = `identidad_digital` del usuario |
| Roles | Existen en Keycloak pero no se implementarán en esta fase |
| 2FA | No para esta versión |
| Keycloak — realm | Ya existe un realm configurado. Config en repo: `github.com/Maya-AQSS/IaC.git` |
| Keycloak — despliegue | Servidor separado. Docker Compose de referencia: `github.com/aoltra/odoodock` |
| Keycloak — clientes | Frontend (React) y backend (Laravel) usan **clientes distintos** en Keycloak |
| Keycloak — cliente frontend | Tipo `public`, Authorization Code + PKCE. Sin client secret |
| Keycloak — cliente backend | Resource server puro — valida tokens emitidos al cliente frontend vía JWKS. No requiere cliente confidencial propio |
| FDW — topología | BD de Laravel y BD de Keycloak en el **mismo servidor PostgreSQL** |
| FDW — sincronización | Copia inicial al **primer login** desde Keycloak. `registros_ceed` es independiente desde entonces |
| FDW — campos | Keycloak proporciona datos básicos (nombre, email…). Resto (IBAN, matrículas, puesto…) son propios |
| FDW — local | Solo en producción. En local se usan tablas propias sin FDW |
| Perfil de usuario | Datos editables por el propio usuario (autoservicio) |
| Perfil — schema | Tabla `registros_ceed` + tabla separada para matrículas |
| Perfil — IBAN | **Sí editable** por el usuario directamente. Sin flujo de aprobación |
| Perfil — repite_en_ceed | Gestionado por el propio usuario |
| Audit logs — scope | Acciones de usuario → BD local de esta app. Errores de sistema → RabbitMQ externo |
| Audit logs — librería | `spatie/laravel-activitylog` |
| Audit logs — acceso MVP | Todos los usuarios pueden consultar su propio historial. En fases futuras: solo administradores |
| Audit logs — acciones | Listado validado: AUTH (login OK/fallido/logout), PROFILE (campo sensible), FICHAJE (entrada/salida/error), NOTIFICACIONES (leída/todas leídas), TOOLS (acceso/favorita), CALENDAR (conectar cuenta) |
| BD — motor | **PostgreSQL** confirmado para Laravel. Requerido por FDW con Keycloak |
| BD — contenedor local | PostgreSQL compartido con Keycloak en el **mismo contenedor** del Docker Compose local |
| RabbitMQ — librería | `php-amqplib` (librería más conveniente para RabbitMQ en PHP) |
| Backend | Laravel 13 desde cero. API pura (JSON). Patrón: ApiController → Services → Repositories, Requests/DTOs, ApiResources, Policies |
| Backend — WebSockets | Laravel Reverb (nativo Laravel 11+) |
| Backend — colas internas | Sin colas internas de Laravel |
| Frontend | SPA independiente (React + TypeScript). Monorepo con backend en carpetas separadas |
| Estilos | Tailwind mantenido. Tokens de color y tipografía = **Odoo 19 design system** ya aplicados en el dashboard React actual. Si se necesitan tokens adicionales, extraer del código existente |
| Modo oscuro | Sistema de dark mode de Tailwind ya implementado, se mantiene |
| Entorno local | Docker Compose único para React + Laravel Sail + PostgreSQL. Keycloak y RabbitMQ son servicios externos |
| Keycloak local | Se puede preparar instancia de prueba con usuarios de test |
| CORS / Proxy | Misma configuración Docker en local y producción |
| Repositorio | `https://github.com/Maya-AQSS/maya-dashboard.git` (monorepo) |
| CI/CD | Responsabilidad del equipo de infra |
| Deploy | Kubernetes. Rama `develop` validada antes de merge a producción |
| Responsividad | Breakpoints: <768px móvil (1 col), 768-1024px tablet, >1024px escritorio |
| Vista compacta | Menos ítems por widget + widgets más pequeños. Activable en escritorio |
| TypeScript | Sí, requerido |
| i18n | ES, EN, valenciano + futuros idiomas |
| Usuarios concurrentes | 200 |
| SLA rendimiento | Dashboard carga en < 2s |
| MVP fecha | Junio-Julio 2026 |
| Analytics | Sin herramienta definida. Abierto a sugerencias |
| Arquitectura backend | **Monolito Laravel único** para notificaciones, auditoría y resto de datos. Solo el dashboard los usa actualmente |

---

## ❓ Preguntas Pendientes

### 1. Audit Logs — Retención y Campos Sensibles

- ¿Cuánto tiempo se conservarán los audit logs en BD? ¿Hay política de limpieza o rotación automática (ej. eliminar registros > 1 año)? 1 año
- ¿Qué campos del perfil se consideran **sensibles** a efectos de auditoría? ¿Solo IBAN, o también nombre, email, puesto, matrícula…? los que consideres
- ¿El usuario verá únicamente **su propio** historial de acciones, o habrá una vista global de todos los usuarios (para cuando se restrinja a admins)? todos los  usuarios para admin

---

### 2. Keycloak — Redirect URIs y Claim Mappers

- ¿Cuáles son los dominios/URLs para los entornos **local**, **staging** y **producción**? (Necesario para configurar los `Valid Redirect URIs` y `Web Origins` del cliente React en Keycloak) local y produccion
- Revisando `github.com/Maya-AQSS/IaC.git`: ¿los **mappers de claims** del realm ya incluyen `email`, `given_name`, `family_name` y `roles`? ¿O hay que añadirlos? habra que mapear

---

### 3. Tools — Catálogo y Gestión

- ¿Existe ya un catálogo de Tools definido (listado de aplicaciones con nombre, icono, URL y tipo interno/externo)? ¿O se gestionará desde el panel de administración? se gestionan desde su crud
- ¿Quién puede crear/editar/eliminar Tools del catálogo — solo administradores o cualquier usuario? mientras no existan roles y permisos TODOS
- ¿Las Tools tienen categorías o agrupaciones (ej. "Formación", "RRHH", "Gestión")? no
- ¿Hay un límite máximo de Tools en el catálogo? no

---

### 4. Perfil de Usuario — Campos y Validaciones

- ¿Cuál es el listado completo de campos editables en el perfil? (Ej. teléfono, dirección, imagen de perfil, idioma preferido…) el enviado anteriormente
- ¿La matrícula del vehículo tiene alguna validación de formato (española, europea, motos…)? no
- ¿El campo `repite_en_ceed` es un booleano simple o tiene más estados/valores? booleano
- ¿Hay validación de formato para el IBAN (solo español o cualquier IBAN europeo)? europeo

---

### 5. Notificaciones — Esquema del Endpoint REST

- ¿Cuál es el esquema exacto del payload que RabbitMQ enviará al endpoint del dashboard? (Ej. campos obligatorios: `title`, `body`, `type`, `priority`, `user_id`, `action_url`, `expires_at`…) los que consideres
- ¿La API key para autenticar el endpoint de inserción de notificaciones es única global o por sistema origen? unica
- ¿Se requiere idempotencia en el endpoint (ej. campo `external_id` para evitar duplicados si RabbitMQ reintenta)? si
