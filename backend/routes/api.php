<?php

use App\Http\Controllers\Api\V1\Dashboard\UserDashboardLayoutController;
use App\Http\Controllers\Api\V1\Dashboard\UserFavoriteApplicationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth.keycloak')
    ->prefix('v1/dashboard/user/{user}')
    ->group(function () {
        Route::get('favorites', [UserFavoriteApplicationController::class, 'index']);
        Route::post('favorites', [UserFavoriteApplicationController::class, 'store']);
        Route::delete('favorites/{applicationId}', [UserFavoriteApplicationController::class, 'destroy']);

        Route::get('dashboard-layout', [UserDashboardLayoutController::class, 'show']);
        Route::put('dashboard-layout', [UserDashboardLayoutController::class, 'update']);
    });
