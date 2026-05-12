<?php

namespace App\Providers;

use App\Repositories\Contracts\ApplicationRepositoryInterface;
use App\Repositories\Contracts\UserDashboardLayoutRepositoryInterface;
use App\Repositories\Contracts\UserFavoriteApplicationRepositoryInterface;
use App\Repositories\Eloquent\ApplicationRepository;
use App\Repositories\Eloquent\UserDashboardLayoutRepository;
use App\Repositories\Eloquent\UserFavoriteApplicationRepository;
use App\Services\Contracts\ApplicationServiceInterface;
use App\Services\Contracts\UserDashboardLayoutServiceInterface;
use App\Services\Contracts\UserFavoriteApplicationServiceInterface;
use App\Services\Dashboard\ApplicationService;
use App\Services\Dashboard\UserDashboardLayoutService;
use App\Services\Dashboard\UserFavoriteApplicationService;
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
    }

    public function boot(): void
    {
        //
    }
}
