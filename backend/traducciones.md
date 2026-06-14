# Auditoría lang/i18n — maya_dashboard (backend)

## Estado de infraestructura
- Directorio lang/: **EXISTE con es/en/va** (`lang/es`, `lang/en`, `lang/va`), cada uno con un único archivo `notifications.php`.
- Helper de traducción en uso: **sí, pero muy limitado**. No hay ninguna llamada `__()`/`trans()`/`@lang` en `app/`. La única integración real es `app/Support/NotificationContent.php`, que resuelve títulos/cuerpos de notificaciones del sistema vía `Lang::has()` + `Lang::get()` contra `lang/<locale>/notifications.php` (claves tipo `notifications.<type>.title|body`, con fallback a texto libre y luego a la clave cruda). Toda la mensajería de validación/errores HTTP del backend está hardcodeada al margen de este mecanismo.

## Resumen
- Archivos revisados: 133 (todos los `.php` de `app/`) + 4 de `routes/`
- Archivos con strings sin traducir: 4
- Total de hallazgos: 11 (strings de cara al usuario hardcodeados)
- Paridad de locales (es/en/va): **OK** — los tres `notifications.php` tienen las mismas 26 claves de primer nivel; no hay desfase de claves entre idiomas.
- Severidad global: **medium**

## Hallazgos por archivo

### app/Services/Alerts/AlertAudienceValidator.php
Mensajes de validación de audiencia de alertas, lanzados como `ValidationException::withMessages()` y devueltos al cliente en el body 422. Todos en español literal.

| Línea | String hardcodeado | Contexto | Clave lang sugerida |
|------|--------------------|----------|---------------------|
| 43 | "El contexto de equipos no está disponible." | `withMessages(['audience_team_id' => ...])` | validation.alert_audience.team_context_unavailable |
| 54 | "El equipo seleccionado no pertenece a tu contexto." | `withMessages(['audience_team_id' => ...])` | validation.alert_audience.team_not_owned |
| 77 | "El estudio no pertenece al tipo de estudio seleccionado." | `withMessages(['audience_study_id' => ...])` | validation.alert_audience.study_not_in_type |
| 90 | "El módulo no pertenece al estudio seleccionado." | `withMessages(['audience_module_id' => ...])` | validation.alert_audience.module_not_in_study |
| 99 | "El contexto académico no está disponible." | `withMessages(['audience_study_type_id' => ...])` | validation.alert_audience.academic_context_unavailable |
| 110 | "El tipo de estudio no pertenece a tu contexto." | `withMessages(['audience_study_type_id' => ...])` | validation.alert_audience.study_type_not_owned |
| 118 | "El contexto de estudios no está disponible." | `withMessages(['audience_study_id' => ...])` | validation.alert_audience.study_context_unavailable |
| 135 | "El contexto de módulos no está disponible." | `withMessages(['audience_module_id' => ...])` | validation.alert_audience.module_context_unavailable |

### app/Services/Notifications/NotificationRuleService.php
| Línea | String hardcodeado | Contexto | Clave lang sugerida |
|------|--------------------|----------|---------------------|
| 99 | "evaluator_key must reference an existing scheduled notification definition." | `ValidationException::withMessages(['evaluator_key' => ...])` (en inglés, inconsistente con el resto en español) | validation.notification_rule.evaluator_key_invalid |

### app/Http/Controllers/Api/V1/Attendance/AttendanceController.php
| Línea | String hardcodeado | Contexto | Clave lang sugerida |
|------|--------------------|----------|---------------------|
| 58 | "No hay fichaje abierto que cerrar." | `response()->json(['message' => ...], 409)` en `checkOut()` | attendance.no_open_check_in |

### app/Http/Middleware/EnsureRouteUserMatchesToken.php
| Línea | String hardcodeado | Contexto | Clave lang sugerida |
|------|--------------------|----------|---------------------|
| 41 | "Forbidden: authenticated user does not match the requested resource." | `abort(403, ...)` (en inglés; mensaje expuesto al cliente en 403) | auth.user_mismatch |

## Archivos revisados sin incidencias
Se revisaron los 133 `.php` de `app/`. No se encontraron strings de usuario hardcodeados en el resto. Lista compacta de los grupos cubiertos sin incidencias:

- **Http/Requests/** (todos los FormRequest): `Application/ListApplicationsRequest`, `Application/ListFavoriteApplicationsRequest`, `Attendance/CreateAttendanceRequest`, `Attendance/ListAttendanceRequest`, `Booking/ListBookingsRequest`, `DashboardLayoutUpdateRequest`, `FavoriteStoreRequest`, `Notifications/FireNotificationSampleRequest`, `Notifications/ListNotificationDefinitionsRequest`, `Notifications/ListNotificationRulesRequest`, `Notifications/ListNotificationsRequest`, `Notifications/StoreNotificationRuleRequest`, `Notifications/UpdateNotificationDefinitionRequest`, `Notifications/UpdateNotificationRuleRequest`, `PanelAlerts/ListPanelAlertsRequest`, `PanelAlerts/StorePanelAlertRequest`, `PanelAlerts/UpdatePanelAlertRequest`, y los `Concerns/` (`AuthorizesByPermission`, `ValidatesAlertAudience`, `ValidatesPanelAlertTranslations`). Ninguno define `messages()` ni `attributes()` con texto literal — usan las claves de validación por defecto de Laravel.
- **Http/Controllers/** (resto): `Api/HealthCheckController`, `Api/V1/Booking/BookingController`, `Api/V1/Dashboard/*` (ApplicationController, UserDashboardLayoutController, UserFavoriteApplicationController), `Api/V1/Notifications/*` (AttendanceReminderController, NotificationController, NotificationDefinitionController, NotificationRuleController, NotificationSampleController), `Api/V1/PanelAlerts/PanelAlertController`, `Controller`.
- **Http/Resources/** (9): todos son formateadores de salida, sin texto de usuario.
- **Services/** (resto): Alerts/AlertAudienceService, Alerts/AlertAudienceValidator (cubierto arriba), Attendance/AttendanceService, Booking/BookingService, Dashboard/*, Notifications/* (salvo NotificationRuleService), PanelAlerts/* y todos los `Contracts/`.
- **Support/**: `NotificationContent` (es el único que usa i18n correctamente), `Search/AccentSearch`.
- **DTOs/**, **Models/**, **Observers/**, **Repositories/**, **Events/**, **Casts/**, **Console/Commands/**, **Eloquent/**, **Providers/**: sin strings de cara al usuario.
- **routes/**: `api.php`, `channels.php`, `console.php`, `web.php` — sin strings de usuario.

### Excluidos deliberadamente (no son hallazgos — mensajes técnicos / de desarrollador, no expuestos al usuario final)
- `app/DTOs/AttendanceDto.php:51` — `InvalidArgumentException('AttendanceDto: invalid datetime value ...')`: guard de forma de datos, prefijado con el nombre de clase, no es texto de UI.
- `app/DTOs/BookingDto.php:65` — `InvalidArgumentException('BookingDto: invalid datetime value ...')`: ídem.
- `app/DTOs/IncomingNotificationPayload.php:48,51` — `InvalidArgumentException('app es obligatorio' / 'type es obligatorio')`: validación de payload AMQP entrante en el consumer interno, no respuesta HTTP de usuario.
- `app/Services/Dashboard/UserFavoriteApplicationService.php:41` — `NotFoundHttpException('Favorite application not found.')`: produce un 404 estándar; el body por defecto de Laravel para 404 no expone este mensaje salvo en debug. Caso límite — candidato de baja prioridad si se quiere unificar a clave lang, pero no se contabiliza como hallazgo de UI.

## Recomendaciones
Priorizadas:

1. **(media)** Extraer los 8 mensajes de `AlertAudienceValidator.php` a un `lang/<locale>/validation.php` bajo un namespace `alert_audience.*` y resolverlos con `__('validation.alert_audience.team_not_owned')`. Es el bloque de mayor volumen y el más visible (errores 422 en el formulario de alertas de panel). Requiere crear `validation.php` en los tres idiomas (hoy no existe).
2. **(media)** Unificar idioma: `NotificationRuleService.php:99` está en inglés y `AttendanceController.php:58` en español — la mensajería del backend es inconsistente. Al migrar a claves lang se resuelve de paso.
3. **(baja)** Mover `AttendanceController.php:58` ("No hay fichaje abierto que cerrar.") a `lang/<locale>/attendance.php` con clave `attendance.no_open_check_in`.
4. **(baja)** Mover `EnsureRouteUserMatchesToken.php:41` a una clave `auth.user_mismatch`. Es un 403 deliberado con mensaje propio; traducirlo aporta consistencia aunque la fuga de info sea mínima.
5. **(infra)** Hoy solo existe `notifications.php` por idioma. Si se adopta la recomendación 1-4, crear `validation.php`, `attendance.php` y `auth.php` (o un `messages.php` único) **en los tres idiomas a la vez** para no romper la paridad es/en/va que actualmente está intacta.
6. **(opcional)** Considerar resolver `UserFavoriteApplicationService.php:41` con clave lang si en algún flujo se devuelve ese mensaje al cliente con `APP_DEBUG=false`.
