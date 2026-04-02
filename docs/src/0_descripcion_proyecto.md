# Documento Maestro de Entrada (Contexto Fuente)

Este archivo es la entrada principal del workflow.

Objetivo:

- Recibir informacion bruta del cliente (entrevistas, conversaciones, notas, correos, actas, tickets, enlaces).
- Permitir que la IA extraiga requisitos y genere automaticamente las fases posteriores.

Regla clave:

- No escribir aqui requisitos ya procesados (no epics, no features, no backlog).
- Aqui solo se guarda contexto fuente y datos operativos minimos.

---

## Reglas de Uso

- Mantener encabezados 0 a 10 sin renombrar.
- Pegar informacion lo mas literal posible cuando venga del cliente.
- Si algo no existe, escribir: No disponible.
- Si un dato no aplica, escribir: No aplica (motivo).
- Actualizar fecha y version en cada cambio.

---

## 0. Datos Operativos del Proyecto (Obligatorio)

| Campo | Valor |
| --- | --- |
| Nombre del proyecto | Maya Dashboard |
| Codigo interno (si existe) | No disponible |
| Fecha ultima actualizacion (YYYY-MM-DD) | 2026-03-31 |
| Responsable funcional | No disponible |
| Responsable tecnico | No disponible |
| Estado del discovery (`Borrador`, `En captura`, `Listo para extraccion IA`) | Listo para extraccion IA |

---

## 1. Contexto GitHub (Obligatorio para Fase 6)

| Campo | Valor | Ejemplo |
| --- | --- | --- |
| URL del repositorio | <https://github.com/Maya-AQSS/maya-dashboard.git> | <https://github.com/mi-org/mi-repo> |
| Repositorio (`OWNER/REPO`) | Maya-AQSS/maya-dashboard | mi-org/mi-repo |
| Organizacion GitHub | Maya-AQSS | mi-org |
| GitHub Project Number (numero) | 16 | 14 |
| Publicar milestones por epica (`Si` o `No`) | Si | Si |
| Vincular dependencias nativas (`Si` o `No`) | Si | Si |

Prerequisitos tecnicos (check rapido):

- gh CLI autenticado.
- jq instalado.
- GitHub Project con campo Priority (`Must`, `Should`, `Could`).

---

## 2. Inventario de Fuentes de Contexto (Obligatorio)

| ID | Tipo de fuente | Fecha | Autor/Origen | Estado (`Pendiente`, `Procesada`) | Ubicacion o referencia |
| --- | --- | --- | --- | --- | --- |
| SRC-01 | Documento cliente | 2026-03-31 | Cliente CEEDCV | Procesada | `docs/src/requisitos-cliente.md` |
| SRC-02 | Análisis técnico | 2026-03-31 | IA (análisis rama develop) | Procesada | `docs/src/REPORT.md` |
| SRC-03 | Sesión aclaración de requisitos | 2026-03-31 | Cliente CEEDCV | Procesada | `docs/src/preguntas-aclaracion-requisitos.md` |
| SRC-04 | Repositorio IaC (Keycloak + RabbitMQ) | No disponible | Equipo infra Maya | Pendiente | <https://github.com/Maya-AQSS/IaC.git> |
| SRC-05 | Codebase React existente | 2026-03-31 | Equipo frontend Maya | Procesada | <https://github.com/Maya-AQSS/maya-dashboard.git> rama `develop` |

---

## 3. Contexto Bruto del Cliente (Obligatorio)

### 3.1 Transcripciones / Conversaciones

**Requisitos literales del cliente (SRC-01):**

> El dashboard debe cambiar la vista de dashboard principal a una vista donde se mostraran diferentes widgets con informacion relevante para el usuario, como por ejemplo: un widget con las notificaciones, otro con los ultimos fichages realizados, otro con las tareas pendientes, etc.
> En el sidebar izquierdo se mostraran las apolicaciones favoritas. Ademas tendra un boton mas en la parte inferior que lo llevara a la vista donde se ven todas las herramientas y puede gestionar las favoritas.
> El dashboard contara con un sistema de notificaciones que se alimentara de una api externa.
> El dashboard se adaptara a diferentes tamaños de pantalla, mostrando una vista mas compacta en pantallas pequeñas y una vista mas detallada en pantallas grandes.
> Debo poder configurar que widgets quiero mostrar en el dashboard y en que orden, ademas de poder configurar la apariencia de cada widget (tamaño en formatro grid).

### 3.2 Notas de entrevistas

**Sesión de aclaración de requisitos (SRC-03) — decisiones clave extraídas:**

**Dashboard y Widgets:**

- Página de inicio tras login. Layout: alerta de fichaje en la parte superior (visible en todas las páginas), sidebar izquierdo, área central de widgets.
- MVP: 3 widgets fijos (Notificaciones, Fichajes, Calendario Outlook). Layout fijo, sin personalización en MVP.
- Grid de 12 columnas, tamaños discretos: pequeño (3 col), mediano (6 col), grande (9 col). Altura fija por tipo de widget.
- Config v2: Drag & drop, reordenamiento y personalización quedan para v2. Backend guarda config en tabla `user_widget_configurations`.

**Notificaciones:**

- Sistema interno del dashboard. RabbitMQ actúa como cliente HTTP y llama al endpoint REST del dashboard para insertar notificaciones.
- El dashboard expone un endpoint REST autenticado por API key única global.
- Prioridades: `normal`, `aviso`, `urgente`. Las urgentes muestran toast en todas las páginas via WebSocket (Laravel Reverb).
- Retención ajustable al crear. No leídas: conservadas indefinidamente. Estado leído/no leído persistido en backend.
- Acciones redirigen a rutas internas o URLs externas.
- Endpoint idempotente mediante campo `external_id` para evitar duplicados en reintentos.
- Payload propuesto: `title`, `body`, `type`, `priority`, `user_id`, `action_url`, `expires_at`, `external_id`.

**Fichajes:**

- Entrada/salida laboral (ampliable). API Odoo disponible junio 2026. Mock hasta entonces.
- Alerta en top solo aparece cuando el usuario aún no ha fichado entrada en el día.
- Confirmación: alerta de éxito que desaparece automáticamente (3-5 segundos).
- Odoo caído: modal de cierre manual informando que debe fichar en la entrada al centro.
- Solo fichajes personales. Sin vistas de equipo. Histórico siempre desde Odoo, sin copia local.

**Calendario Outlook:**

- Sistema de providers genérico (`CalendarProvider` interface). Identity Brokering via Keycloak, Token Exchange RFC 8693 para Microsoft Graph.
- Rango diario por defecto, cambiable. Solo lectura. Sin cuenta: muestra estado "conecta tu cuenta".
- Widget omitido completamente hasta que la integración esté disponible (antes de junio 2026).

**Sidebar y Tools:**

- Sidebar colapsable. Escritorio colapsado: modo rail (solo iconos). Móvil: drawer/overlay.
- Cualquier Tool puede ser favorita. Máx recomendado 10. Drag & drop para reordenar.
- Tools se gestionan desde su propio CRUD de administración.
- Sin categorías de Tools. Sin límite máximo. Todos los usuarios pueden crear/editar/eliminar Tools mientras no existan roles y permisos.

**Autenticación:**

- Keycloak OIDC + JWT. Flow: Authorization Code + PKCE. Política de contraseñas gestionada en Keycloak.
- Cliente frontend React: tipo `public`, Authorization Code + PKCE, sin client secret.
- Backend Laravel: resource server puro, valida JWT via JWKS endpoint (`firebase/php-jwt`). Sin cliente confidencial propio.
- `email` claim del JWT = `identidad_digital` del usuario.
- Roles existen en Keycloak pero no se implementarán en esta fase. Sin 2FA en esta versión.
- Claim mappers del realm (`email`, `given_name`, `family_name`, roles) deben ser configurados/verificados en el realm.
- Solo entornos local y producción (sin staging).

**Base de Datos y FDW:**

- PostgreSQL confirmado. BD de Laravel y BD de Keycloak en el mismo servidor PostgreSQL.
- FDW activo solo en producción. En local: tablas propias sin FDW.
- Copia inicial al primer login desde Keycloak. `registros_ceed` independiente desde entonces.
- Keycloak provee: nombre, email. Laravel gestiona: IBAN, matrículas, puesto, repite_en_ceed, teléfono, dirección.
- Contenedor PostgreSQL compartido con Keycloak en el Docker Compose local.

**Perfil de usuario:**

- Datos editables por el propio usuario (autoservicio): nombre, apellidos, teléfono, dirección postal, IBAN (editable directo, sin flujo de aprobación, validación IBAN europeo), matrícula(s) (sin validación de formato), puesto, repite_en_ceed (booleano).
- Schema: tabla `registros_ceed` + tabla separada para matrículas.

**Audit Logs:**

- Acciones de usuario → BD local Laravel via `spatie/laravel-activitylog`. Retención: 1 año.
- Errores de sistema → RabbitMQ externo (URL pendiente, simular config).
- Acceso MVP: cada usuario ve su propio historial. En fases futuras: solo administradores ven todos.
- Campos sensibles auditados en PROFILE: IBAN, teléfono, dirección, matrícula (datos financieros e identificativos).
- Acciones auditadas: AUTH (login OK/fallido/logout), PROFILE (campo sensible editado), FICHAJE (entrada/salida/error), NOTIFICACIONES (leída/todas leídas), TOOLS (acceso/marcar favorita), CALENDAR (conectar cuenta Microsoft).

**Stack y arquitectura:**

- Backend: Laravel 13 desde cero. API pura JSON. Monolito único. Patrón: ApiController → Services → Repositories, Requests/DTOs, ApiResources, Policies.
- Frontend: SPA React + TypeScript (Vite). Monorepo con backend en carpetas separadas.
- WebSockets: Laravel Reverb. Sin colas internas de Laravel.
- RabbitMQ: `php-amqplib`. Logs de sistema al broker externo.
- Estilos: Tailwind 4 + tokens Odoo 19 ya aplicados en el dashboard React actual.
- Dark mode ya implementado con Tailwind, se mantiene.
- Repositorio: <https://github.com/Maya-AQSS/maya-dashboard.git>

**Entorno y despliegue:**

- Docker Compose local: React + Laravel Sail + PostgreSQL. Keycloak y RabbitMQ son servicios externos.
- Producción: Kubernetes. CI/CD responsabilidad del equipo de infra.
- Rama `develop` validada antes de merge a producción.

**No funcionales:**

- Responsividad: <768px móvil (1 col), 768-1024px tablet, >1024px escritorio.
- Vista compacta activable en escritorio.
- i18n: ES, EN, valenciano + futuros idiomas.
- 200 usuarios concurrentes. Dashboard carga < 2s.
- TypeScript requerido en frontend.

### 3.3 Correos / mensajes relevantes

No disponible.

### 3.4 Documentos externos y enlaces

- **Codebase React existente** — <https://github.com/Maya-AQSS/maya-dashboard.git> rama `develop` — SPA React 19 + Vite 7 + Tailwind 4. Feature-driven architecture. Auth en memoria (mock), APIs mockeadas, sin TypeScript, sin backend real. 42 issues detectados (9 CRITICAL, 14 HIGH). Ver análisis completo en `docs/src/REPORT.md`.
- **Repositorio IaC** — <https://github.com/Maya-AQSS/IaC.git> — Configuración de Keycloak realm y RabbitMQ. Realm ya configurado. Pendiente verificar claim mappers.
- **Docker Compose Keycloak de referencia** — <https://github.com/aoltra/odoodock> — Referencia para levantar Keycloak localmente.

---

## 4. Hechos Confirmados (sin derivar requisitos) (Obligatorio)

- Hecho 1: El proyecto se llama Maya Dashboard y su repositorio es <https://github.com/Maya-AQSS/maya-dashboard.git> (monorepo).
- Hecho 2: Existe un codebase React en rama `develop` con 42 issues técnicos. El nuevo sistema se construye desde cero (Laravel 13 backend).
- Hecho 3: El backend será un monolito Laravel 13, API pura JSON. No hay otros consumidores actualmente.
- Hecho 4: La autenticación es 100% delegada a Keycloak. El realm ya existe en el repo IaC.
- Hecho 5: La API de Odoo para fichajes estará disponible en junio 2026. Hasta entonces se usa mock.
- Hecho 6: El widget de Calendario Outlook se omite completamente en la UI hasta que la integración esté disponible.
- Hecho 7: PostgreSQL es el único motor de BD permitido (requerido por FDW con Keycloak).
- Hecho 8: RabbitMQ llama al dashboard (HTTP POST) para insertar notificaciones. El dashboard NO consume de RabbitMQ para notificaciones.
- Hecho 9: Los logs de errores de sistema sí van a RabbitMQ. URL aún no disponible.
- Hecho 10: Los tokens de color Odoo 19 ya están aplicados en el dashboard React actual de la rama `develop`.
- Hecho 11: La fecha objetivo MVP es junio-julio 2026.
- Hecho 12: Solo existen dos entornos: local y producción (sin staging).
- Hecho 13: Keycloak y RabbitMQ son servicios externos. No se levantan en el Docker Compose principal del proyecto.
- Hecho 14: La configuración de personalización de widgets (drag & drop, reordenamiento) queda para v2.
- Hecho 15: El IBAN es editable directamente por el usuario sin flujo de aprobación.

---

## 5. Restricciones y Condicionantes Conocidos (Obligatorio)

- Restricción 1: **Odoo no disponible hasta junio 2026.** Los fichajes deben usar mock hasta esa fecha. El diseño debe desacoplarse de la API real.
- Restricción 2: **Microsoft Graph (Calendario Outlook) no disponible hasta junio 2026.** El widget de calendario se omite en UI hasta que la integración esté operativa.
- Restricción 3: **URL de RabbitMQ para logs de sistema no disponible.** Se debe simular la configuración y cambiar la URL cuando llegue, sin modificar el código.
- Restricción 4: **FDW solo en producción.** El entorno local usa tablas propias de Laravel sin FDW. El código debe funcionar en ambos modos.
- Restricción 5: **CI/CD es responsabilidad del equipo de infra.** El proyecto no define pipelines de despliegue.
- Restricción 6: **Deploy en Kubernetes.** La app debe ser stateless y compatible con contenedores.
- Restricción 7: **200 usuarios concurrentes** como carga de diseño. El SLA de rendimiento exige que el dashboard cargue en menos de 2 segundos.
- Restricción 8: **Keycloak realm ya existe.** No se puede modificar la estructura del realm sin coordinar con el equipo de infra.
- Restricción 9: **Roles y permisos no se implementan en esta fase.** La lógica de autorización avanzada queda para v2.
- Restricción 10: **GitHub Project Number pendiente de crear.** Bloquea la Fase 6 de subida de Issues.

---

## 6. Supuestos y Huecos de Informacion (Obligatorio)

| Tema | Tipo (`Supuesto` o `Dato faltante`) | Impacto (`Alto`, `Medio`, `Bajo`) | Accion para resolver |
| --- | --- | --- | --- |
| Redirect URIs de Keycloak (local y producción) | Dato faltante | Alto | Confirmar dominio de producción con equipo de infra. Local: `http://localhost:5173` asumido como estándar |
| Claim mappers del realm Keycloak (`email`, `given_name`, `family_name`, `roles`) | Dato faltante | Alto | Revisar `github.com/Maya-AQSS/IaC.git` y configurar los mappers faltantes |
| GitHub Project Number para subida de Issues | Dato faltante | Alto | Crear GitHub Project en la organización Maya-AQSS y anotar el número |
| Dominio de producción de la aplicación | Dato faltante | Alto | Confirmar con equipo de infra (necesario para CORS, redirect URIs, CSP) |
| Listado completo de Tools iniciales del catálogo | Supuesto | Medio | Se asume catálogo vacío al inicio. Se carga via CRUD de administración |
| Política de contraseñas en Keycloak | Supuesto | Medio | Se asume que el realm ya la tiene configurada. Verificar en IaC |
| Esquema exacto de logs de sistema enviados a RabbitMQ | Supuesto | Medio | Definido libremente en este proyecto (sin contrato externo). Propuesta: `app`, `level`, `message`, `context`, `timestamp` |
| Idioma por defecto de la interfaz | Supuesto | Bajo | Se asume español (ES) como idioma por defecto |
| Imagen de perfil de usuario | Dato faltante | Bajo | No confirmado si es campo editable. Se asume que NO en MVP |
| Analytics — herramienta a usar | Dato faltante | Bajo | Sin herramienta definida. Abierto a sugerencias. No bloquea MVP |

---

## 7. Criterios de Extraccion para la IA (Obligatorio)

| Parametro | Valor |
| --- | --- |
| Idioma de salida | Español |
| Nivel de detalle esperado (`Alto`, `Medio`, `Bajo`) | Alto |
| Priorizar rapidez o exhaustividad (`Rapidez`, `Equilibrado`, `Exhaustivo`) | Exhaustivo |
| Tolerancia a inferencia (`Minima`, `Moderada`, `Alta`) | Moderada |
| Enfoque principal (`Negocio`, `Tecnico`, `Mixto`) | Mixto |

Notas opcionales para el agente:

- El codebase React existente (rama `develop`) es referencia de UX y tokens de diseño, NO código a mantener. El sistema se reconstruye desde cero con TypeScript.
- La fuente de verdad para decisiones de requisitos es `docs/src/preguntas-aclaracion-requisitos.md` sección "Decisiones Confirmadas".
- Para los ítems donde el cliente dijo "los que consideres" (payload de notificaciones, campos sensibles de auditoría), el agente tiene autorización para definir el esquema más apropiado siguiendo buenas prácticas.
- Los bugs documentados en `REPORT.md` (SEC-*, CODE-*) deben traducirse en criterios de aceptación de los backlogs correspondientes para evitar reintroducirlos.
- MVP objetivo: junio-julio 2026. Priorizar funcionalidades Must.

---

## 8. Glosario y Terminologia del Cliente (Recomendado)

| Termino | Definicion del cliente | Sinónimos/alias |
| --- | --- | --- |
| Fichaje | Registro de entrada o salida laboral del usuario en el sistema Odoo | Check-in, registro horario |
| Tool | Aplicación interna o externa accesible desde el dashboard mediante enlace | Herramienta, aplicación, app |
| Widget | Componente visual del dashboard que muestra información de un dominio específico (notificaciones, fichajes, calendario) | Tarjeta, panel, módulo |
| identidad_digital | Identificador único del usuario en el sistema. Corresponde al claim `email` del JWT de Keycloak | user_id lógico |
| registros_ceed | Tabla principal de datos de usuario en la BD de Laravel. Recibe copia inicial de Keycloak vía FDW | Tabla de usuarios |
| FDW | Foreign Data Wrapper de PostgreSQL. Permite consultar la BD de Keycloak desde Laravel en producción | — |
| RabbitMQ | Message broker externo. Actúa como productor de notificaciones (llamando al endpoint REST del dashboard) y receptor de logs de sistema | Broker, cola de mensajes |
| Reverb | Laravel Reverb — servidor WebSocket nativo de Laravel 11+. Usado para notificaciones urgentes en tiempo real | WebSocket server |
| repite_en_ceed | Campo booleano del perfil. Indica si el usuario repite participación en el CEED | — |
| rail | Modo colapsado del sidebar en escritorio: muestra solo iconos sin texto | Modo icono, sidebar colapsado |
| Vista compacta | Modo de visualización del dashboard con menos ítems por widget y widgets más pequeños. Activable manualmente en escritorio | Compact mode |
| Alerta de fichaje | Banner persistente en la parte superior de todas las páginas que aparece cuando el usuario no ha fichado entrada en el día | Top banner, fichaje pendiente |

---

## 9. Semaforo por Fase (Control Operativo)

| Fase | Minimo requerido | Estado (`Pendiente` o `Listo`) |
| --- | --- | --- |
| Fase 1 - Epics y Features | Bloques 0, 2, 3, 4, 6, 7 | Listo |
| Fase 2 - Arquitectura y Riesgos | Bloques 0, 3, 5, 6, 7 | Listo |
| Fase 3 - Backlog por feature | Bloques 0, 2, 3, 4, 5, 7 | Listo |
| Fase 4 - Diagramas C4 | Bloques 0, 3, 5, 7 | Listo |
| Fase 5 - Publicacion VitePress | Bloques 0, 9 y artefactos previos aprobados | Pendiente (esperando artefactos de fases 1-4) |
| Fase 6 - Subida a GitHub | Bloques 1 y backlog aprobado | Pendiente (falta GitHub Project Number) |

---

## 10. Registro de Cambios y Aprobaciones

| Fecha | Cambio realizado | Responsable | Aprobado por |
| --- | --- | --- | --- |
| 2026-03-31 | Creación completa del documento maestro a partir de SRC-01, SRC-02 y SRC-03 | IA (extracción automática) | [Completar] |
