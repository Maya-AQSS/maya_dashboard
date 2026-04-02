# Epics y Features — Maya Dashboard

> Generado: 2026-03-31 | Fase 1 — Descubrimiento y Desglose
> Fuente: `docs/src/0_descripcion_proyecto.md` (SRC-01, SRC-02, SRC-03)

---

## Resumen

| Epic | Nombre | Features | Must | Should | Could |
| --- | --- | --- | --- | --- | --- |
| E-00 | Instalación y Configuración Base | 4 | 3 | 1 | 0 |
| E-01 | Autenticación y Gestión de Sesión | 4 | 4 | 0 | 0 |
| E-02 | Dashboard Principal | 4 | 3 | 1 | 0 |
| E-03 | Sistema de Notificaciones | 4 | 4 | 0 | 0 |
| E-04 | Módulo de Fichajes | 3 | 3 | 0 | 0 |
| E-05 | Widget de Calendario Outlook | 3 | 0 | 1 | 2 |
| E-06 | Sidebar y Gestión de Tools | 4 | 4 | 0 | 0 |
| E-07 | Perfil de Usuario | 3 | 2 | 1 | 0 |
| E-08 | Auditoría y Observabilidad | 3 | 2 | 1 | 0 |
| **Total** | | **32** | **25** | **5** | **2** |

---

## E-00 — Instalación y Configuración Base

**Descripción:** Setup del monorepo, entorno de desarrollo local con Docker Compose, configuración de Keycloak local para pruebas, internacionalización del frontend, y configuración base de TypeScript y Tailwind con tokens de diseño Odoo 19. Esta épica es la base estructural del proyecto y DEBE completarse antes de iniciar el desarrollo del resto de características.

**Restricciones aplicables:**

- Docker Compose provee todo el ecosistema de forma autocontenida para desarrollo local (React + Laravel + PostgreSQL + Keycloak + RabbitMQ). Keycloak y RabbitMQ de producción son servicios externos.
- Deploy final en Kubernetes apuntando a los recursos externos. CI/CD responsabilidad del equipo de infra.
- TypeScript obligatorio en el frontend.
- Tokens Odoo 19 ya aplicados en el codebase React actual (rama `develop`).

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-00.1 | Setup del monorepo y Docker Compose (React + Laravel Sail + PostgreSQL) | Must | Infrastructure |
| F-00.2 | Configuración de Keycloak local para desarrollo (usuarios de test, claim mappers) | Must | Infrastructure |
| F-00.3 | Internacionalización del frontend (i18n ES / EN / valenciano + extensible) | Should | DX / Tooling |
| F-00.4 | Configuración de TypeScript, Tailwind y tokens de diseño Odoo 19 (dark mode incluido) | Must | DX / Tooling |

---

## E-01 — Autenticación y Gestión de Sesión

**Descripción:** Integración completa con Keycloak OIDC para autenticación de usuarios. Incluye el flujo en frontend (Authorization Code + PKCE), validación de tokens en backend, y la sincronización inicial de datos de usuario desde Keycloak a la BD local de Laravel mediante FDW.

**Restricciones aplicables:**

- El realm Keycloak ya existe. No se puede modificar su estructura sin coordinar con infra.
- FDW activo solo en producción. En local se usan tablas propias.
- Roles existen en Keycloak pero no se implementan en esta fase.

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-01.1 | Flujo OIDC en frontend (Authorization Code + PKCE) | Must | Security |
| F-01.2 | Validación JWT en backend Laravel (JWKS endpoint) | Must | Security |
| F-01.3 | Sincronización inicial de usuario vía FDW al primer login | Must | Data |
| F-01.4 | Persistencia y renovación de sesión en frontend | Must | Security |

---

## E-02 — Dashboard Principal

**Descripción:** Layout general del dashboard como página de inicio tras login. Incluye la estructura visual (alerta de fichaje en top, sidebar izquierdo, área central de widgets), el sistema de grid de 12 columnas con los 3 widgets fijos del MVP, y la adaptación a diferentes tamaños de pantalla.

**Restricciones aplicables:**

- MVP: 3 widgets fijos sin personalización. Drag & drop queda para v2.
- Alerta de fichaje visible en todas las páginas (no solo el dashboard).
- Breakpoints: <768px móvil (1 col), 768-1024px tablet, >1024px escritorio.

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-02.1 | Layout base del dashboard (estructura, sidebar, área de widgets) | Must | UI / Presentation |
| F-02.2 | Alerta de fichaje pendiente (banner top persistente en todas las páginas) | Must | UI / Presentation |
| F-02.3 | Grid de widgets MVP (12 columnas, 3 widgets fijos, tamaños discretos) | Must | UI / Presentation |
| F-02.4 | Responsividad completa y modo vista compacta | Should | UI / Presentation |

---

## E-03 — Sistema de Notificaciones

**Descripción:** Sistema de notificaciones interno del dashboard. RabbitMQ actúa como productor HTTP y llama al endpoint REST del dashboard para insertar notificaciones. Incluye el endpoint de inserción (con idempotencia y autenticación por API key), la gestión del estado de cada notificación (leída/no leída), y la entrega en tiempo real de notificaciones urgentes vía WebSocket.

**Restricciones aplicables:**

- RabbitMQ llama al dashboard. El dashboard NO consume de RabbitMQ para notificaciones.
- API key única global para autenticar el endpoint de inserción.
- Idempotencia requerida: campo `external_id` para evitar duplicados en reintentos.
- Notificaciones urgentes deben mostrarse en todas las páginas vía WebSocket (Laravel Reverb).

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-03.1 | Endpoint REST de inserción de notificaciones (API key, idempotencia por `external_id`) | Must | Integration |
| F-03.2 | Gestión de notificaciones: listado, leída/no leída, filtros y acciones de redirección | Must | Logic / Business |
| F-03.3 | Notificaciones urgentes en tiempo real (WebSocket Reverb, toast en todas las páginas) | Must | Integration |
| F-03.4 | Widget de notificaciones en el dashboard | Must | UI / Presentation |

---

## E-04 — Módulo de Fichajes

**Descripción:** Registro de entrada y salida laboral del usuario. La API de Odoo no estará disponible hasta junio 2026, por lo que se construye con un mock desacoplado que se sustituirá sin modificar la lógica de negocio. Incluye las acciones de fichaje, la UX de confirmación y el widget de fichajes recientes en el dashboard.

**Restricciones aplicables:**

- API Odoo disponible en junio 2026. Hasta entonces, mock obligatorio.
- El diseño debe desacoplarse de la API real (capa de abstracción).
- Solo fichajes personales. Sin vistas de equipo. Histórico siempre desde Odoo, sin copia local.

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-04.1 | Capa de integración con API Odoo (mock hasta junio 2026, reemplazable) | Must | Integration |
| F-04.2 | Acciones de fichaje: entrada/salida, confirmación UX y manejo de error (Odoo caído) | Must | Logic / Business |
| F-04.3 | Widget de fichajes en el dashboard (histórico reciente desde Odoo) | Must | UI / Presentation |

---

## E-05 — Widget de Calendario Outlook

**Descripción:** Integración con Microsoft Graph para mostrar el calendario del usuario. Requiere Identity Brokering vía Keycloak y Token Exchange RFC 8693. El widget se omite completamente en la UI hasta que la integración esté disponible; sin embargo, la arquitectura del provider genérico debe estar preparada para activarlo sin refactoring.

**Restricciones aplicables:**

- Widget omitido en UI hasta que la integración Microsoft Graph esté operativa.
- La arquitectura CalendarProvider debe ser genérica y desacoplada desde el inicio.
- Solo lectura: no permite crear ni modificar eventos.
- Sin cuenta Microsoft vinculada: mostrar estado "conecta tu cuenta".

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-05.1 | Arquitectura CalendarProvider genérica (interface + implementación Microsoft) | Should | Integration |
| F-05.2 | Autenticación Microsoft vía Keycloak Identity Brokering (Token Exchange RFC 8693) | Could | Security |
| F-05.3 | Widget de calendario Outlook (vista diaria, solo lectura, estado desconectado) | Could | UI / Presentation |

---

## E-06 — Sidebar y Gestión de Tools

**Descripción:** Sidebar colapsable que muestra las Tools favoritas del usuario. Incluye el CRUD completo de Tools (catálogo de aplicaciones internas y externas), la gestión de favoritos con drag & drop, y la página de herramientas desde la que el usuario gestiona el catálogo y sus favoritas.

**Restricciones aplicables:**

- Sidebar rail en escritorio colapsado (solo iconos). Drawer/overlay en móvil.
- Máximo recomendado de 10 Tools favoritas en el sidebar.
- Sin categorías de Tools en esta fase. Sin límite máximo de Tools en el catálogo.
- Todos los usuarios pueden crear/editar/eliminar Tools mientras no existan roles y permisos.

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-06.1 | Sidebar colapsable (modo rail en escritorio, drawer en móvil, favoritos) | Must | UI / Presentation |
| F-06.2 | CRUD de Tools (catálogo: nombre, icono, URL, tipo interno/externo) | Must | Logic / Business |
| F-06.3 | Gestión de favoritos (marcar/desmarcar, reordenar drag & drop, máx 10 en sidebar) | Must | Logic / Business |
| F-06.4 | Página de herramientas (listado completo, búsqueda y acceso al CRUD de gestión) | Must | UI / Presentation |

---

## E-07 — Perfil de Usuario

**Descripción:** Gestión de los datos personales del usuario en autoservicio. La tabla `registros_ceed` almacena los datos propios de la aplicación (IBAN, puesto, datos de contacto, matrícula). Los datos básicos se sincronizan inicialmente desde Keycloak. Las ediciones de campos sensibles quedan registradas en el audit log.

**Restricciones aplicables:**

- El IBAN es editable directamente, sin flujo de aprobación. Validación IBAN europeo.
- Las matrículas se almacenan en tabla separada (múltiples por usuario, sin validación de formato).
- `repite_en_ceed` es un booleano editable por el propio usuario.
- Los campos sensibles editados (IBAN, teléfono, dirección, matrícula) se auditan.

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-07.1 | Vista y edición de datos del perfil (nombre, teléfono, dirección, puesto, repite_en_ceed) | Must | UI / Presentation |
| F-07.2 | Gestión de matrículas (tabla separada, múltiples por usuario, CRUD) | Must | Data |
| F-07.3 | Edición de IBAN con validación de formato IBAN europeo | Should | Logic / Business |

---

## E-08 — Auditoría y Observabilidad

**Descripción:** Registro de acciones críticas del usuario en la BD local de Laravel mediante `spatie/laravel-activitylog`, con retención de 1 año y limpieza automática. Los errores de sistema se publican a RabbitMQ externo. Los usuarios pueden consultar su propio historial de acciones.

**Restricciones aplicables:**

- URL de RabbitMQ para logs de sistema no disponible. Simular configuración; cambiar URL cuando llegue.
- Retención de audit logs: 1 año (limpieza automática requerida).
- Acceso MVP: cada usuario ve solo su propio historial.
- Acciones auditadas: AUTH (login OK/fallido/logout), PROFILE (campo sensible), FICHAJE (entrada/salida/error), NOTIFICACIONES (leída/todas leídas), TOOLS (acceso/favorita), CALENDAR (conectar cuenta).

| ID | Feature | Prioridad | Categoría |
| --- | --- | --- | --- |
| F-08.1 | Audit log de acciones de usuario (spatie/laravel-activitylog, retención 1 año, limpieza automática) | Must | Observability |
| F-08.2 | Vista de historial de acciones del propio usuario (tabla paginada) | Should | UI / Presentation |
| F-08.3 | Envío de logs de errores de sistema a RabbitMQ (php-amqplib, URL configurable via entorno) | Must | Observability |

---

## Notas de Extracción

### Supuestos aplicados (de `0_descripcion_proyecto.md` bloque 6)

- **Redirect URIs Keycloak:** local asumido como `http://localhost:5173`. Se parametrizará por entorno. Verificar dominio de producción con infra antes de implementar F-01.1.
- **Claim mappers del realm:** asumido que deben configurarse (email, given_name, family_name). Confirmar en `IaC.git` antes de F-01.2.
- **Catálogo inicial de Tools:** se asume vacío al inicio. F-06.2 incluye la carga vía CRUD.
- **Imagen de perfil:** no confirmada. No incluida en F-07.1 para MVP.
- **Idioma por defecto:** español (ES).

### Features excluidas (Won't — fuera de alcance esta fase)

| Feature | Motivo |
| --- | --- |
| Personalización drag & drop de widgets | Explícitamente v2 según cliente |
| Vistas de fichajes de equipo (managers) | Fuera de scope en esta fase |
| Roles y permisos de autorización avanzada | Keycloak los tiene; implementación queda para v2 |
| 2FA / segundo factor de autenticación | No para esta versión |
| Integración de analytics (Matomo, etc.) | Sin herramienta definida; no bloquea MVP |
| Vista global de audit logs para administradores | MVP solo historial propio; acceso global queda para v2 |
