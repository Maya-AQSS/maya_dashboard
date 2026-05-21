<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\UserDashboardLayoutRepositoryInterface;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Repositories\Eloquent\AlertRepository;
use App\Repositories\Eloquent\AlertRuleRepository;
use App\Repositories\Eloquent\ApplicationRepository;
use App\Repositories\Eloquent\AttendanceRepository;
use App\Repositories\Eloquent\BookingRepository;
use App\Repositories\Eloquent\NotificationRepository;
use App\Repositories\Eloquent\UserDashboardLayoutRepository;
use App\Repositories\Eloquent\UserFavoriteApplicationRepository;
use Maya\Profile\Migrations as ProfileMigrations;
use Maya\Profile\Repositories\Resolvers\FdwAcademicResolver;
use App\Services\Alerts\AlertIngestionService;
use App\Services\Alerts\AlertRuleService;
use App\Services\Alerts\AlertService;
use App\Services\Attendance\AttendanceService;
use App\Services\Booking\BookingService;
use App\Services\Contracts\AlertIngestionServiceInterface;
use App\Services\Contracts\AlertRuleServiceInterface;
use App\Services\Contracts\AlertServiceInterface;
use App\Services\Contracts\ApplicationServiceInterface;
use App\Services\Contracts\AttendanceServiceInterface;
use App\Services\Contracts\BookingServiceInterface;
use App\Services\Contracts\NotificationIngestionServiceInterface;
use App\Services\Contracts\NotificationServiceInterface;
use App\Services\Contracts\UserDashboardLayoutServiceInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use App\Services\Dashboard\ApplicationService;
use App\Services\Dashboard\UserDashboardLayoutService;
use App\Services\Dashboard\UserFavoriteApplicationService;
use App\Models\User;
use App\Services\Notifications\NotificationIngestionService;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Maya\Profile\Repositories\Contracts\UserProfileResolverInterface;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Dashboard area — applications, favorites, layout.
        $this->app->singleton(ApplicationRepositoryInterface::class, ApplicationRepository::class);
        $this->app->singleton(UserFavoriteApplicationRepositoryInterface::class, UserFavoriteApplicationRepository::class);
        $this->app->singleton(UserDashboardLayoutRepositoryInterface::class, UserDashboardLayoutRepository::class);

        $this->app->singleton(ApplicationServiceInterface::class, ApplicationService::class);
        $this->app->singleton(UserFavoriteApplicationServiceInterface::class, UserFavoriteApplicationService::class);
        $this->app->singleton(UserDashboardLayoutServiceInterface::class, UserDashboardLayoutService::class);

        // Notifications.
        $this->app->singleton(NotificationRepositoryInterface::class, NotificationRepository::class);
        $this->app->singleton(NotificationServiceInterface::class, NotificationService::class);
        $this->app->singleton(NotificationIngestionServiceInterface::class, NotificationIngestionService::class);

        // Alerts.
        $this->app->singleton(AlertRepositoryInterface::class, AlertRepository::class);
        $this->app->singleton(AlertRuleRepositoryInterface::class, AlertRuleRepository::class);
        $this->app->singleton(AlertServiceInterface::class, AlertService::class);
        $this->app->singleton(AlertRuleServiceInterface::class, AlertRuleService::class);
        $this->app->singleton(AlertIngestionServiceInterface::class, AlertIngestionService::class);

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
        $this->app->singleton(UserProfileResolverInterface::class, FdwAcademicResolver::class);
    }

    public function boot(): void
    {
        // AlertRule usa el attribute #[ObservedBy(AlertRuleObserver::class)] —
        // registrado automáticamente por Laravel sin llamada explícita aquí.

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
