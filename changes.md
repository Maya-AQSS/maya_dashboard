# changes.md — refactor/unify-cross-app

Registro de cambios funcionales (no puramente estructurales) introducidos al
adoptar los paquetes compartidos 0.16.0 de maya_platform. Formato según §7 de
`maya_platform/PLAN-UNIFY-CROSS-APP.md`. Los refactors que preservan
comportamiento (JwtSubject, RegistersFdwBootstrap, CommonMiddleware con
`trustProxies => false`, borrado de duplicados FdwTeardown/GenerateSeedersFromDatabase)
NO se registran aquí salvo nota explícita.

---

## [FASE 2.4] Render JSON uniforme de excepciones en rutas api/*

- **Fecha**: 2026-06-12
- **Severidad**: HIGH
- **Qué cambió**: antes → render por defecto de Laravel (HTML o JSON según
  `Accept`, formato variable por tipo de excepción, mensajes 500 crudos con
  `debug=true`). Después → `Maya\Http\Exceptions\JsonExceptionRenderer`
  (shared-http-laravel): toda excepción en `api/*` o request `expectsJson()`
  devuelve `{"message": "..."}` (+ `{"errors": {...}}` en 422 de validación),
  con mapa de status uniforme (401/403/404/405/422/429/5xx) y mensajes 500
  genéricos en producción (no-debug).
- **Por qué**: unificación cross-app del contrato de errores (audit/dashboard/dms
  carecían de render uniforme; authz/logs ya lo tenían a mano).
- **Endpoint(s) afectado(s)**: todos los `api/v1/*` cuando lanzan excepción.
- **Impacto en cliente**: observable sí — cuerpos de error antes heterogéneos
  ahora siempre `{"message"}`; los 500 en producción dejan de filtrar el mensaje
  interno de la excepción.
- **Decidido por**: plan unify-cross-app (cambio previsto nº 2 de §7), agente dashboard.

## [FASE 2.5] Consumidor `notifications:consume` adopta la política robusta de errores

- **Fecha**: 2026-06-12
- **Severidad**: MEDIUM
- **Qué cambió**: antes → catch-all `\Throwable` con `report()` + ACK (todo
  mensaje se descartaba tras el primer fallo, incluidos fallos de BD).
  Después → `Maya\Messaging\Console\ConsumeQueueCommand` (shared-messaging-laravel,
  política derivada de maya_logs):
  - `UnrecoverableIngestionException` → warning + ACK/drop (payload inválido).
  - `QueryException` → log error + **NACK/retry** (fallo de infraestructura:
    el broker reintenta tras el delay configurado — antes se perdía el mensaje).
  - Otro `\Throwable` → log error + `report()` + ACK/drop (igual que antes).
- **Por qué**: unificación de los consumidores AMQP de las 3 apps worker en la
  política más robusta (cambio previsto nº 5 de §7, aplicado aquí a dashboard).
- **Endpoint(s) afectado(s)**: worker `notifications:consume` (cola
  `notifications.ingest`) — sin endpoint HTTP.
- **Impacto en cliente**: indirecto — notificaciones que antes se perdían ante
  caídas transitorias de Postgres ahora se reintentan y acaban entregándose.
  Riesgo: un `QueryException` permanente (p. ej. migración pendiente) provoca
  redelivery continuo en lugar de descarte silencioso.
- **Decidido por**: plan unify-cross-app, agente dashboard.

## [FASE 2.6] Búsqueda accent-insensitive (+escape de comodines) en listados con filtro `search`

- **Fecha**: 2026-06-12
- **Severidad**: MEDIUM
- **Qué cambió**: antes → `ilike '%term%'` literal: «María» NO encontraba
  «Maria» (y viceversa) y los caracteres `%`/`_` del término actuaban como
  comodines SQL. Después → `Maya\Search\AccentFold` (shared-http-laravel) vía
  helper local `App\Support\Search\AccentSearch`: folding de acentos/ligaduras
  en ambos lados (término y columna, `translate(lower(...))` en pgsql) y
  `%`/`_`/`\` escapados como literales.
- **Por qué**: unificación del comportamiento de búsqueda con maya_dms (origen
  del folding) — cambio previsto nº 1 de §7.
- **Endpoint(s) afectado(s)**:
  - `GET /api/v1/users/{user}/applications` (search en name/description)
  - `GET /api/v1/panel-alerts` (search en text)
  - `GET /api/v1/notifications` (search en title/body/title_key/body_key/params)
  - `GET /api/v1/notification-definitions` (search en label/key/source_app)
  - `GET /api/v1/notification-rules` (search en name/evaluator_key/source_app)
- **Impacto en cliente**: observable sí — los listados devuelven más resultados
  para términos con/sin acentos; búsquedas que abusaban de `%`/`_` como comodín
  dejan de funcionar como tal.
- **Decidido por**: plan unify-cross-app, agente dashboard.

## [FASE 2.3] Nota: HTTPS forzado en production/staging (RegistersFdwBootstrap)

- **Fecha**: 2026-06-12
- **Severidad**: LOW
- **Qué cambió**: antes → dashboard no llamaba a `URL::forceScheme('https')`.
  Después → `RegistersFdwBootstrap::register()` lo activa automáticamente
  cuando `APP_ENV` es `production` o `staging` (comportamiento integrado del
  helper, no desactivable por opción).
- **Por qué**: efecto colateral de adoptar el bootstrap compartido; detrás de
  Traefik con TLS terminado es el comportamiento deseado.
- **Endpoint(s) afectado(s)**: generación de URLs absolutas (links de
  paginación, redirects) en production/staging.
- **Impacto en cliente**: no observable en local/testing; en producción las
  URLs generadas pasan a `https://` (ya lo eran vía proxy).
- **Decidido por**: agente dashboard (anotado por transparencia).

## [F3.2] Navegación a "Mi perfil" — regresión RESUELTA con `onProfileNavigate`
- **Fecha**: 2026-06-12
- **Severidad**: MEDIUM (resuelta)
- **Qué cambió**: la migración al shell pasó "Mi perfil" de `navigate('/profile', { state: buildBackState(location) })` (SPA, con back-state) a `window.location.assign(dashboardUrl + '/profile')` (recarga completa). Ahora `MayaAppShell` expone la prop opcional `onProfileNavigate` (espejo de `onNotificationNavigate`); el dashboard la cablea con `navigate('/profile', { state: buildBackState(location) })`, restaurando la navegación SPA y el botón Volver. El fallback a recarga completa se mantiene para apps que no pasen la prop (retrocompatible).
- **Por qué**: cerrar la regresión UX introducida en F3.2 sin acoplar el shell a react-router.
- **Endpoint(s)/pantalla(s) afectados**: enlace "Mi perfil" del menú de usuario.
- **Impacto en cliente**: restaura la UX previa a la migración.
- **Dependencia**: requiere publicar maya_platform ≥0.16 con la nueva prop (mismo gating que el resto de la adopción 0.16).
- **Decidido por**: usuario (decisión post-informe F6).

## [V2.dashboard] BaseAuditObserver abstracto — dedup de 3 observers de auditoría

- **Fecha**: 2026-06-13
- **Severidad**: LOW (refactor interno, sin cambio de comportamiento)
- **Qué cambió**: Se extrajo la lógica común (~95% idéntica) de `NotificationObserver`, `UserFavoriteApplicationObserver` y `UserDashboardLayoutObserver` a una clase abstracta `app/Observers/BaseAuditObserver.php` (ctor con `AuditPublisher`, `created/updated/deleted` con `DB::afterCommit`, `publish()` privado con `Auth::id() ?? 'system'` y `APPLICATION_SLUG = 'maya-dashboard'`). Las 3 subclases ahora solo declaran `entityType()`. `PanelAlertObserver` NO se incluye (diverge: JwtSubject, ip/userAgent, re-notificación).
- **Por qué**: eliminar duplicación verbatim manteniendo idéntico el evento de auditoría emitido.
- **Endpoint(s)/pantalla(s) afectados**: ninguno directo — los observers se disparan en CRUD de Notification/UserFavoriteApplication/UserDashboardLayout; el payload de auditoría publicado al bus es byte-idéntico.
- **Impacto en cliente**: ninguno (sin pérdida de funcionalidad).

## [V2.dashboard] ApplicationRepository::withFavoriteFlag — dedup del JOIN de favoritos

- **Fecha**: 2026-06-13
- **Severidad**: LOW (refactor interno, sin cambio de SQL emitido)
- **Qué cambió**: El bloque `leftJoin('user_favorite_applications', …) + select('applications.*') + selectRaw('… IS NOT NULL as is_favorite')`, duplicado verbatim en `paginateActiveWithFilters` y `activeWithFavoriteFlagQuery`, se extrajo a un privado `withFavoriteFlag(Builder $q, string $userId): Builder`. Se preserva LITERAL el `selectRaw('user_favorite_applications.application_id IS NOT NULL as is_favorite')` (columna cruda consumida como `(bool)($m->is_favorite ?? false)` en `ApplicationDto.php`).
- **Por qué**: una sola fuente de verdad para la proyección de la flag de favorito.
- **Endpoint(s)/pantalla(s) afectados**: `GET /api/v1/applications` (listado con flag de favorito). SQL resultante idéntico.
- **Impacto en cliente**: ninguno.

## [V2.dashboard] MessagingConfig::appSlug() — elimina helper privado duplicado

- **Fecha**: 2026-06-13
- **Severidad**: LOW (refactor interno)
- **Qué cambió**: El privado idéntico `messagingAppSlug() => (string) config('messaging.app')` en `PanelAlertNotificationService` y `NotificationIngestionService` se reemplazó por la llamada estática del vendor `\Maya\Messaging\Support\MessagingConfig::appSlug()` (shared-messaging-laravel) y se eliminaron ambos privados.
- **Por qué**: reutilizar el accessor compartido del paquete en vez de re-declararlo por servicio.
- **Endpoint(s)/pantalla(s) afectados**: ingestión AMQP de notificaciones y notificación de panel-alerts (worker). Valor devuelto idéntico (mismo `config('messaging.app')`).
- **Impacto en cliente**: ninguno.
