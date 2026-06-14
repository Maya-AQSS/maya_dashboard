# Errores de arquitectura — maya_dashboard/backend

> Auditoría automática contra el flujo Controller -> Service (DTOs) -> Repository -> Model + Policies.

## Resumen

- Archivos revisados: **133**
- Violaciones: **8** — CRITICAL: 0 · HIGH: 0 · MEDIUM: 0 · LOW: 8

## Violaciones por severidad

| Severidad | Regla | Archivo | Línea | Problema | Corrección sugerida |
|---|---|---|---|---|---|
| LOW | R4 | `app/Console/Commands/FireNotificationSamples.php` | 31 | El comando accede a Eloquent directamente (User::query()->where('is_active', true)->value('id')) en lugar de delegar en un Repository. Es un Console command (capa Other) y solo es un harness de QA bloqueado en producción (isProduction()), por lo que el impacto es mínimo, pero salta la capa de repositorio que el resto del flujo respeta. | Mover la resolución del destinatario por defecto a un método de UserDirectory/UserRepository (p.ej. firstActiveUserId()) e inyectarlo, manteniendo el comando sin consultas Eloquent directas. |
| LOW | R7 | `app/Http/Requests/Api/Notifications/StoreNotificationRuleRequest.php` | 14 | authorize() devuelve true en un endpoint de escritura administrativo (notification-rules store, permission:dashboard.panel_alerts.create). La autorización SÍ está garantizada por el middleware permission: a nivel de ruta (routes/api.php:79), por lo que no es un hueco de seguridad; pero a diferencia de DashboardLayoutUpdateRequest no aplica el concern AuthorizesByPermission como defensa en profundidad. Inconsistencia de estilo, no violación de acceso. | Por consistencia con DashboardLayoutUpdateRequest, usar el trait AuthorizesByPermission y delegar authorize() a userHasPermission('dashboard.panel_alerts.create') como defensa en profundidad. Opcional. |
| LOW | R7 | `app/Http/Requests/Api/Notifications/UpdateNotificationDefinitionRequest.php` | 12 | authorize() devuelve true en endpoint admin (notification-definitions update). Acceso real protegido por middleware permission:dashboard.panel_alerts.update (routes/api.php:73). No es violación de seguridad; solo carece de la defensa en profundidad opcional del concern AuthorizesByPermission. | Opcionalmente delegar authorize() vía AuthorizesByPermission para consistencia con DashboardLayoutUpdateRequest. |
| LOW | R7 | `app/Http/Requests/Api/Notifications/UpdateNotificationRuleRequest.php` | 15 | authorize() devuelve true en endpoint de escritura administrativo (notification-rules update). Acceso garantizado por middleware permission:dashboard.panel_alerts.update en routes/api.php:81 (no es hueco de seguridad); falta la defensa en profundidad del concern AuthorizesByPermission presente en DashboardLayoutUpdateRequest. Inconsistencia menor. | Aplicar AuthorizesByPermission y delegar authorize() al permiso correspondiente para uniformar el patrón. Opcional. |
| LOW | R7 | `app/Http/Requests/Api/PanelAlerts/StorePanelAlertRequest.php` | 17 | authorize() devuelve true en endpoint de escritura admin (panel-alerts store). Acceso garantizado por middleware permission:dashboard.panel_alerts.create (routes/api.php:89). No es hueco de seguridad; inconsistente con el patrón de defensa en profundidad de DashboardLayoutUpdateRequest. | Opcional: aplicar AuthorizesByPermission y delegar authorize() al permiso de creación. |
| LOW | R7 | `app/Http/Requests/Api/PanelAlerts/UpdatePanelAlertRequest.php` | 17-20 | authorize() devuelve true incondicionalmente. La autorizacion real recae en el middleware permission:<slug> de la ruta y en el trait AuthorizesByPermission (defense-in-depth). El request no invoca userHasPermission() (a diferencia de otros FormRequests que usan el trait), pero el control de acceso primario esta cubierto por middleware, por lo que no es violacion de seguridad efectiva. | Opcional: delegar en $this->userHasPermission('panel_alert.update') dentro de authorize() para alinear con el patron del trait y reforzar el fail-closed, como hace el resto de requests del modulo. |
| LOW | R5 | `app/Models/Booking.php` | 19-29 | Modelo de vista FDW de solo lectura que incluye 'id' en $fillable. Al ser read-only (UPDATED_AT=null, repositorio solo hace SELECT) el mass-assignment de id es inocuo, pero exponer la PK como fillable es un olor menor. | Considerar quitar 'id' de $fillable o documentar explicitamente que el modelo nunca se crea/actualiza (solo proyeccion de lectura). |
| LOW | R4 | `app/Repositories/Eloquent/NotificationRepository.php` | 130-152 | Los metodos publicos acknowledge() y resolve() no estan declarados en NotificationRepositoryInterface; el resto de operaciones si lo estan. Rompe la simetria contrato/implementacion (los consumidores type-hinteados a la interface no pueden invocarlos sin castear). Son operaciones de persistencia validas dentro del repo (no es violacion de capa). | Anadir acknowledge(Notification,string):Notification y resolve(Notification,string):Notification a NotificationRepositoryInterface para que el contrato refleje la implementacion. |

## Archivos revisados (133)

| Archivo | Capa | Cumple |
|---|---|---|
| `app/Casts/AsAudience.php` | Other | ✅ |
| `app/Console/Commands/ConsumeNotifications.php` | Other | ✅ |
| `app/Console/Commands/FireNotificationSamples.php` | Other | ✅ |
| `app/Console/Commands/MaterializePanelAlerts.php` | Other | ✅ |
| `app/DTOs/AlertAudienceDto.php` | DTO | ✅ |
| `app/DTOs/ApplicationDto.php` | DTO | ✅ |
| `app/DTOs/AttendanceDto.php` | DTO | ✅ |
| `app/DTOs/BookingDto.php` | DTO | ✅ |
| `app/DTOs/IncomingNotificationPayload.php` | DTO | ✅ |
| `app/DTOs/NotificationDefinitionDto.php` | DTO | ✅ |
| `app/DTOs/NotificationDto.php` | DTO | ✅ |
| `app/DTOs/NotificationFilterDto.php` | DTO | ✅ |
| `app/DTOs/NotificationRuleDto.php` | DTO | ✅ |
| `app/DTOs/PanelAlertDto.php` | DTO | ✅ |
| `app/DTOs/UserDashboardLayoutDto.php` | DTO | ✅ |
| `app/DTOs/UserFavoriteApplicationDto.php` | DTO | ✅ |
| `app/Eloquent/Relations/StringKeyMorphMany.php` | Other | ✅ |
| `app/Events/NotificationCreated.php` | Other | ✅ |
| `app/Http/Controllers/Api/HealthCheckController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Attendance/AttendanceController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Booking/BookingController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Dashboard/ApplicationController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Dashboard/UserDashboardLayoutController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Dashboard/UserFavoriteApplicationController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Notifications/AttendanceReminderController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Notifications/NotificationController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Notifications/NotificationDefinitionController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Notifications/NotificationRuleController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/Notifications/NotificationSampleController.php` | Controller | ✅ |
| `app/Http/Controllers/Api/V1/PanelAlerts/PanelAlertController.php` | Controller | ✅ |
| `app/Http/Controllers/Controller.php` | Controller | ✅ |
| `app/Http/Middleware/EnsureRouteUserMatchesToken.php` | Other | ✅ |
| `app/Http/Requests/Api/Application/ListApplicationsRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Application/ListFavoriteApplicationsRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Attendance/CreateAttendanceRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Attendance/ListAttendanceRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Booking/ListBookingsRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/DashboardLayoutUpdateRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/FavoriteStoreRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Notifications/FireNotificationSampleRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Notifications/ListNotificationDefinitionsRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Notifications/ListNotificationRulesRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Notifications/ListNotificationsRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Notifications/StoreNotificationRuleRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Notifications/UpdateNotificationDefinitionRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/Notifications/UpdateNotificationRuleRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/PanelAlerts/ListPanelAlertsRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/PanelAlerts/StorePanelAlertRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Api/PanelAlerts/UpdatePanelAlertRequest.php` | FormRequest | ✅ |
| `app/Http/Requests/Concerns/AuthorizesByPermission.php` | Other | ✅ |
| `app/Http/Requests/Concerns/ValidatesAlertAudience.php` | Other | ✅ |
| `app/Http/Requests/Concerns/ValidatesPanelAlertTranslations.php` | Other | ✅ |
| `app/Http/Resources/ApplicationResource.php` | Resource | ✅ |
| `app/Http/Resources/AttendanceResource.php` | Resource | ✅ |
| `app/Http/Resources/BookingResource.php` | Resource | ✅ |
| `app/Http/Resources/NotificationDefinitionResource.php` | Resource | ✅ |
| `app/Http/Resources/NotificationResource.php` | Resource | ✅ |
| `app/Http/Resources/NotificationRuleResource.php` | Resource | ✅ |
| `app/Http/Resources/PanelAlertResource.php` | Resource | ✅ |
| `app/Http/Resources/UserDashboardLayoutResource.php` | Resource | ✅ |
| `app/Http/Resources/UserFavoriteApplicationResource.php` | Resource | ✅ |
| `app/Models/Application.php` | Model | ✅ |
| `app/Models/Booking.php` | Model | ✅ |
| `app/Models/Notification.php` | Model | ✅ |
| `app/Models/NotificationDefinition.php` | Model | ✅ |
| `app/Models/NotificationRule.php` | Model | ✅ |
| `app/Models/PanelAlert.php` | Model | ✅ |
| `app/Models/User.php` | Model | ✅ |
| `app/Models/UserDashboardLayout.php` | Model | ✅ |
| `app/Models/UserFavoriteApplication.php` | Model | ✅ |
| `app/Observers/BaseAuditObserver.php` | Other | ✅ |
| `app/Observers/NotificationObserver.php` | Other | ✅ |
| `app/Observers/PanelAlertObserver.php` | Other | ✅ |
| `app/Observers/UserDashboardLayoutObserver.php` | Other | ✅ |
| `app/Observers/UserFavoriteApplicationObserver.php` | Other | ✅ |
| `app/Providers/AppServiceProvider.php` | Other | ✅ |
| `app/Repositories/Contracts/AlertAudienceRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/ApplicationRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/AttendanceRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/BookingRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/NotificationDefinitionRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/NotificationRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/NotificationRuleRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/PanelAlertRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/UserDashboardLayoutRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/UserFavoriteApplicationRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Contracts/UserRepositoryInterface.php` | Repository | ✅ |
| `app/Repositories/Eloquent/AlertAudienceRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/ApplicationRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/AttendanceRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/BookingRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/NotificationDefinitionRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/NotificationRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/NotificationRuleRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/PanelAlertRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/UserDashboardLayoutRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/UserFavoriteApplicationRepository.php` | Repository | ✅ |
| `app/Repositories/Eloquent/UserRepository.php` | Repository | ✅ |
| `app/Repositories/Readers/EmployeeProfileReader.php` | Repository | ✅ |
| `app/Repositories/Resolvers/DashboardProfileResolver.php` | Repository | ✅ |
| `app/Services/Alerts/AlertAudienceService.php` | Service | ✅ |
| `app/Services/Alerts/AlertAudienceValidator.php` | Service | ✅ |
| `app/Services/Attendance/AttendanceService.php` | Service | ✅ |
| `app/Services/Booking/BookingService.php` | Service | ✅ |
| `app/Services/Contracts/AlertAudienceServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/AlertAudienceValidatorInterface.php` | Other | ✅ |
| `app/Services/Contracts/ApplicationServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/AttendanceReminderServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/AttendanceServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/BookingServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/NotificationDefinitionServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/NotificationIngestionServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/NotificationRuleServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/NotificationSampleServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/NotificationServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/PanelAlertNotificationServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/PanelAlertServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/UserDashboardLayoutServiceInterface.php` | Other | ✅ |
| `app/Services/Contracts/UserFavoriteApplicationServiceInterface.php` | Other | ✅ |
| `app/Services/Dashboard/ApplicationService.php` | Service | ✅ |
| `app/Services/Dashboard/UserDashboardLayoutService.php` | Service | ✅ |
| `app/Services/Dashboard/UserFavoriteApplicationService.php` | Service | ✅ |
| `app/Services/Notifications/AttendanceReminderService.php` | Service | ✅ |
| `app/Services/Notifications/NotificationDefinitionService.php` | Service | ✅ |
| `app/Services/Notifications/NotificationIngestionService.php` | Service | ✅ |
| `app/Services/Notifications/NotificationRuleService.php` | Service | ✅ |
| `app/Services/Notifications/NotificationSampleService.php` | Service | ✅ |
| `app/Services/Notifications/NotificationService.php` | Service | ✅ |
| `app/Services/PanelAlerts/PanelAlertMaterializer.php` | Service | ✅ |
| `app/Services/PanelAlerts/PanelAlertNotificationService.php` | Service | ✅ |
| `app/Services/PanelAlerts/PanelAlertService.php` | Service | ✅ |
| `app/Support/NotificationContent.php` | Other | ✅ |
| `app/Support/Search/AccentSearch.php` | Other | ✅ |

