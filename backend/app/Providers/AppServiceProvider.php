<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\Contracts\AlertAudienceRepositoryInterface;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Repositories\Contracts\NotificationDefinitionRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\NotificationRuleRepositoryInterface;
use App\Repositories\Contracts\PanelAlertRepositoryInterface;
use App\Repositories\Contracts\UserDashboardLayoutRepositoryInterface;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\AlertAudienceRepository;
use App\Repositories\Eloquent\ApplicationRepository;
use App\Repositories\Eloquent\AttendanceRepository;
use App\Repositories\Eloquent\BookingRepository;
use App\Repositories\Eloquent\NotificationDefinitionRepository;
use App\Repositories\Eloquent\NotificationRepository;
use App\Repositories\Eloquent\NotificationRuleRepository;
use App\Repositories\Eloquent\PanelAlertRepository;
use App\Repositories\Eloquent\UserDashboardLayoutRepository;
use App\Repositories\Eloquent\UserFavoriteApplicationRepository;
use App\Repositories\Eloquent\UserRepository;
use Maya\Profile\Migrations as ProfileMigrations;
use App\Repositories\Resolvers\DashboardProfileResolver;
use App\Services\Alerts\AlertAudienceService;
use App\Services\Alerts\AlertAudienceValidator;
use App\Services\Attendance\AttendanceService;
use App\Services\Booking\BookingService;
use App\Services\Contracts\AlertAudienceServiceInterface;
use App\Services\Contracts\AlertAudienceValidatorInterface;
use App\Services\Contracts\ApplicationServiceInterface;
use App\Services\Contracts\AttendanceReminderServiceInterface;
use App\Services\Contracts\AttendanceServiceInterface;
use App\Services\Contracts\BookingServiceInterface;
use App\Services\Contracts\NotificationDefinitionServiceInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;
use App\Services\Contracts\NotificationRuleServiceInterface;
use App\Services\Contracts\NotificationSampleServiceInterface;
use App\Services\Contracts\NotificationServiceInterface;
use App\Services\Contracts\PanelAlertNotificationServiceInterface;
use App\Services\Contracts\PanelAlertServiceInterface;
use App\Services\Contracts\UserDashboardLayoutServiceInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use App\Services\Dashboard\ApplicationService;
use App\Services\Dashboard\UserDashboardLayoutService;
use App\Services\Dashboard\UserFavoriteApplicationService;
use App\Services\Notifications\AttendanceReminderService;
use App\Services\Notifications\NotificationDefinitionService;
use App\Services\Notifications\NotificationRuleService;
use App\Services\Notifications\NotificationSampleService;
use App\Services\PanelAlerts\PanelAlertNotificationService;
use App\Services\PanelAlerts\PanelAlertService;
use App\Models\PanelAlert;
use App\Models\User;
use App\Services\Notifications\NotificationIngestionService;
use App\Services\Notifications\NotificationService;
use App\Support\FdwTeardown;
use Illuminate\Console\Events\CommandStarting;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Maya\Messaging\Publishers\LogPublisher;
use Maya\Messaging\Publishers\ResilientLogPublisher;
use Maya\Profile\Repositories\Contracts\UserProfileResolverInterface;
use Maya\Translations\Migrations as TranslationMigrations;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ResilientLogPublisher::class, function ($app) {
            return new ResilientLogPublisher($app->make(LogPublisher::class));
        });

        // Dashboard area — applications, favorites, layout.
        $this->app->singleton(ApplicationRepositoryInterface::class, ApplicationRepository::class);
        $this->app->singleton(UserFavoriteApplicationRepositoryInterface::class, UserFavoriteApplicationRepository::class);
        $this->app->singleton(UserDashboardLayoutRepositoryInterface::class, UserDashboardLayoutRepository::class);
        $this->app->singleton(UserRepositoryInterface::class, UserRepository::class);

        $this->app->singleton(ApplicationServiceInterface::class, ApplicationService::class);
        $this->app->singleton(UserFavoriteApplicationServiceInterface::class, UserFavoriteApplicationService::class);
        $this->app->singleton(UserDashboardLayoutServiceInterface::class, UserDashboardLayoutService::class);

        // Notifications.
        $this->app->singleton(NotificationRepositoryInterface::class, NotificationRepository::class);
        $this->app->singleton(NotificationDefinitionRepositoryInterface::class, NotificationDefinitionRepository::class);
        $this->app->singleton(NotificationRuleRepositoryInterface::class, NotificationRuleRepository::class);
        $this->app->singleton(NotificationServiceInterface::class, NotificationService::class);
        $this->app->singleton(NotificationIngestionServiceInterface::class, NotificationIngestionService::class);
        $this->app->singleton(NotificationDefinitionServiceInterface::class, NotificationDefinitionService::class);
        $this->app->singleton(NotificationRuleServiceInterface::class, NotificationRuleService::class);
        $this->app->singleton(AttendanceReminderServiceInterface::class, AttendanceReminderService::class);
        $this->app->singleton(NotificationSampleServiceInterface::class, NotificationSampleService::class);

        // Audience targeting (shared by panel alerts and notification definitions).
        $this->app->singleton(AlertAudienceRepositoryInterface::class, AlertAudienceRepository::class);
        $this->app->singleton(AlertAudienceValidatorInterface::class, AlertAudienceValidator::class);
        $this->app->singleton(AlertAudienceServiceInterface::class, AlertAudienceService::class);

        // Panel Alerts (manual alerts for the dashboard widget + bell).
        $this->app->singleton(PanelAlertRepositoryInterface::class, PanelAlertRepository::class);
        $this->app->singleton(PanelAlertNotificationServiceInterface::class, PanelAlertNotificationService::class);
        $this->app->singleton(PanelAlertServiceInterface::class, PanelAlertService::class);

        // Odoo-sourced widgets (read-only via postgres_fdw).
        $this->app->singleton(AttendanceRepositoryInterface::class, AttendanceRepository::class);
        $this->app->singleton(AttendanceServiceInterface::class, AttendanceService::class);
        $this->app->singleton(BookingRepositoryInterface::class, BookingRepository::class);
        $this->app->singleton(BookingServiceInterface::class, BookingService::class);

        // Resolver de perfil enriquecido cross-app: el shared MeController consume
        // este binding para devolver /me con permissions/study_type_ids/study_ids/
        // module_ids/team_ids/teams enriquecidos desde las FDW locales (mismas
        // vistas que el resto de apps Maya proyectan localmente — sin
        // dependencias cruzadas en runtime).
        $this->app->singleton(UserProfileResolverInterface::class, DashboardProfileResolver::class);
    }

    public function boot(): void
    {
        // Migraciones FDW compartidas del paquete `maya/shared-profile-laravel`:
        //   - academicAssignments: user_study_types, user_studies, user_course_modules
        //   - teams: teams, team_members
        //   - userPermissions: user_resolved_permissions (la vista remota se
        //     configura por app en `database.fdw.user_permissions.remote_view`).
        // dms carga solo los dos primeros grupos (tiene su propio modelo de
        // permisos basado en `permission_code`).
        $this->loadMigrationsFrom(ProfileMigrations::users());
        $this->loadMigrationsFrom(ProfileMigrations::academicAssignments());
        $this->loadMigrationsFrom(ProfileMigrations::academicCatalogs());
        $this->loadMigrationsFrom(ProfileMigrations::teams());
        $this->loadMigrationsFrom(ProfileMigrations::userPermissions());
        // Catálogo de idiomas activos (Odoo res.lang) para GET /api/v1/languages.
        $this->loadMigrationsFrom(ProfileMigrations::languages());
        // Tabla polimórfica de traducciones (alertas multiidioma y futuros mensajes).
        $this->loadMigrationsFrom(TranslationMigrations::translations());

        // Morph alias estable para la tabla `translations` (evita guardar el FQCN).
        Relation::enforceMorphMap([
            'panel_alert' => PanelAlert::class,
        ]);

        // db:wipe no elimina vistas ni foreign tables FDW (las crea el paquete
        // shared-profile). Las limpiamos antes de migrate:fresh/db:wipe para que
        // la reconstrucción sea reproducible (si no, el rewrite de la vista
        // `teams` falla con «cannot drop columns from view»).
        Event::listen(CommandStarting::class, static function (CommandStarting $event): void {
            if (in_array($event->command, ['migrate:fresh', 'db:wipe'], true)) {
                FdwTeardown::dropAllInPublicSchema();
            }
        });

        // Broadcasting auth endpoint protegido por JWT y bajo prefijo /api/v1 para
        // consistencia con el resto de la API. Anula el `/broadcasting/auth` que
        // Laravel registra por defecto con middleware `web` (basado en sesión).
        Broadcast::routes([
            'prefix' => 'api/v1',
            'middleware' => ['api', 'auth.keycloak'],
        ]);

        // Guard JWT stateless: resuelve el usuario desde el atributo 'jwt_user'
        // que JwtMiddleware deposita en el request tras validar el token.
        Auth::viaRequest('jwt-token', function ($request) {
            $profile = $request->attributes->get('jwt_user');
            if (! is_array($profile) || empty($profile['id'])) {
                return null;
            }

            return User::query()->find($profile['id']);
        });
    }
}
