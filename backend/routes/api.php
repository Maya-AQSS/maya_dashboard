<?php

use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\V1\Alerts\AlertController;
use App\Http\Controllers\Api\V1\Alerts\AlertRuleController;
use App\Http\Controllers\Api\V1\Attendance\AttendanceController;
use App\Http\Controllers\Api\V1\Booking\BookingController;
use App\Http\Controllers\Api\V1\Dashboard\ApplicationController;
use App\Http\Controllers\Api\V1\Dashboard\UserDashboardLayoutController;
use App\Http\Controllers\Api\V1\Dashboard\UserFavoriteApplicationController;
use App\Http\Controllers\Api\V1\Notifications\NotificationController;
use Illuminate\Support\Facades\Route;
use Maya\Profile\Controllers\MeController;
use Maya\Profile\Routing\AcademicContextRoutes;

Route::middleware(['auth.keycloak', 'user.owns.resource'])
    ->prefix('v1/dashboard/user/{user}')
    ->group(function () {
        Route::get('favorites', [UserFavoriteApplicationController::class, 'index']);
        Route::post('favorites', [UserFavoriteApplicationController::class, 'store']);
        Route::delete('favorites/{applicationId}', [UserFavoriteApplicationController::class, 'destroy']);

        Route::get('applications', [ApplicationController::class, 'index']);

        Route::get('dashboard-layout', [UserDashboardLayoutController::class, 'show']);
        Route::put('dashboard-layout', [UserDashboardLayoutController::class, 'update'])
            ->middleware('permission:dashboard.dashboard.update');

        // Widgets alimentados desde Odoo vía FDW (read-only).
        Route::get('attendances', [AttendanceController::class, 'index']);
        Route::get('bookings', [BookingController::class, 'index']);
    });

// Perfil del usuario autenticado — maya/shared-profile-laravel.
// GET /me sin profile.show: lo usa el portal para login, permisos y layout.
Route::middleware('auth.keycloak')->prefix('v1')->group(function () {
    Route::get('/me', [MeController::class, 'show']);
    Route::put('/me/locale', [MeController::class, 'updateLocale'])
        ->middleware('permission:profile.update');

    // Contexto académico del propio usuario (perfil).
    AcademicContextRoutes::registerMe();
});

// Notifications (per authenticated user)
Route::middleware('auth.keycloak')->prefix('v1/notifications')->group(function () {
    Route::get('/',                [NotificationController::class, 'index']);
    Route::get('/unread-count',    [NotificationController::class, 'unreadCount']);
    Route::post('/mark-all-read',  [NotificationController::class, 'markAllRead']);
    Route::post('/{id}/read',      [NotificationController::class, 'markRead']);
});

// Alerts (system-wide, visible to ops roles)
Route::middleware('auth.keycloak')->prefix('v1/alerts')->group(function () {
    Route::get('/',                      [AlertController::class, 'index']);
    Route::post('/{id}/acknowledge',     [AlertController::class, 'acknowledge']);
    Route::post('/{id}/resolve',         [AlertController::class, 'resolve']);
});

Route::middleware('auth.keycloak')->prefix('v1/alert-rules')->group(function () {
    Route::get('/', [AlertRuleController::class, 'index']);
});

Route::middleware(['auth.keycloak', 'permission:alerts.manage'])->prefix('v1/alert-rules')->group(function () {
    Route::post('/',        [AlertRuleController::class, 'store']);
    Route::put('/{id}',     [AlertRuleController::class, 'update']);
    Route::delete('/{id}',  [AlertRuleController::class, 'destroy']);
});

Route::prefix('v1/health')->controller(HealthCheckController::class)->group(function () {
    Route::get('/',      'index');
    Route::get('/live',  'live');
    Route::get('/ready', 'ready');
});
