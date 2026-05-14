<?php

namespace App\Providers;

use App\Models\AlertRule;
use App\Observers\AlertRuleObserver;
use App\Repositories\Contracts\AlertRepositoryInterface;
use App\Repositories\Contracts\AlertRuleRepositoryInterface;
use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\UserDashboardLayoutRepositoryInterface;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Repositories\Eloquent\AlertRepository;
use App\Repositories\Eloquent\AlertRuleRepository;
use App\Repositories\Eloquent\ApplicationRepository;
use App\Repositories\Eloquent\NotificationRepository;
use App\Repositories\Eloquent\UserDashboardLayoutRepository;
use App\Repositories\Eloquent\UserFavoriteApplicationRepository;
use App\Services\Alerts\AlertRuleService;
use App\Services\Alerts\AlertService;
use App\Services\Contracts\AlertRuleServiceInterface;
use App\Services\Contracts\AlertServiceInterface;
use App\Services\Contracts\ApplicationServiceInterface;
use App\Services\Contracts\NotificationServiceInterface;
use App\Services\Contracts\UserDashboardLayoutServiceInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use App\Services\Dashboard\ApplicationService;
use App\Services\Dashboard\UserDashboardLayoutService;
use App\Services\Dashboard\UserFavoriteApplicationService;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\ServiceProvider;

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

        // Alerts.
        $this->app->singleton(AlertRepositoryInterface::class, AlertRepository::class);
        $this->app->singleton(AlertRuleRepositoryInterface::class, AlertRuleRepository::class);
        $this->app->singleton(AlertServiceInterface::class, AlertService::class);
        $this->app->singleton(AlertRuleServiceInterface::class, AlertRuleService::class);
    }

    public function boot(): void
    {
        AlertRule::observe(AlertRuleObserver::class);
    }
}
