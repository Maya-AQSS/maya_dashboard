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
use App\Http\Controllers\Api\V1\PanelAlerts\PanelAlertController;
use App\Http\Controllers\Api\V1\PanelAlerts\PanelAlertRuleController;
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

        // Widgets alimentados desde Odoo vía FDW.
        Route::get('attendances', [AttendanceController::class, 'index']);
        Route::post('attendances', [AttendanceController::class, 'store']);
        Route::post('attendances/check-out', [AttendanceController::class, 'checkOut']);
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
    Route::get('/',                [NotificationController::class, 'index'])->middleware('permission:dashboard.notifications.index');
    Route::get('/unread-count',    [NotificationController::class, 'unreadCount'])->middleware('permission:dashboard.notifications.index');
    Route::get('/{id}',            [NotificationController::class, 'show'])->whereNumber('id')->middleware('permission:dashboard.notifications.show');
    Route::post('/mark-all-read',  [NotificationController::class, 'markAllRead'])->middleware('permission:dashboard.notifications.update');
    Route::post('/{id}/read',      [NotificationController::class, 'markRead'])->whereNumber('id')->middleware('permission:dashboard.notifications.update');
    Route::post('/{id}/acknowledge', [NotificationController::class, 'acknowledge'])->whereNumber('id')->middleware('permission:dashboard.notifications.update');
    Route::post('/{id}/resolve',   [NotificationController::class, 'resolve'])->whereNumber('id')->middleware('permission:dashboard.notifications.update');
});

// Alerts (system-wide, visible to ops roles)
Route::middleware('auth.keycloak')->prefix('v1/alerts')->group(function () {
    Route::get('/',                      [AlertController::class, 'index']);
    Route::post('/{id}/acknowledge',     [AlertController::class, 'acknowledge']);
    Route::post('/{id}/resolve',         [AlertController::class, 'resolve']);
});

Route::middleware('auth.keycloak')->prefix('v1/alert-rules')->group(function () {
    Route::get('/', [AlertRuleController::class, 'index']);
    Route::get('/{id}', [AlertRuleController::class, 'show'])->whereNumber('id');
    Route::post('/',        [AlertRuleController::class, 'store']);
    Route::put('/{id}',     [AlertRuleController::class, 'update']);
    Route::delete('/{id}',  [AlertRuleController::class, 'destroy']);
});

// Panel Alerts (user-created alerts for dashboard widget)
Route::middleware('auth.keycloak')->prefix('v1/panel-alerts')->group(function () {
    Route::get('/active', [PanelAlertController::class, 'activeForWidget']); // widget, no permission needed
    Route::get('/',        [PanelAlertController::class, 'index'])->middleware('permission:dashboard.panel_alerts.index');
    Route::post('/',       [PanelAlertController::class, 'store'])->middleware('permission:dashboard.panel_alerts.create');
    Route::get('/{id}',    [PanelAlertController::class, 'show'])->whereNumber('id')->middleware('permission:dashboard.panel_alerts.show');
    Route::put('/{id}',    [PanelAlertController::class, 'update'])->whereNumber('id')->middleware('permission:dashboard.panel_alerts.update');
    Route::delete('/{id}', [PanelAlertController::class, 'destroy'])->whereNumber('id')->middleware('permission:dashboard.panel_alerts.delete');
});

Route::middleware('auth.keycloak')->prefix('v1/panel-alert-rules')->group(function () {
    Route::get('/',        [PanelAlertRuleController::class, 'index'])->middleware('permission:dashboard.panel_alert_rules.index');
    Route::post('/',       [PanelAlertRuleController::class, 'store'])->middleware('permission:dashboard.panel_alert_rules.create');
    Route::get('/{id}',    [PanelAlertRuleController::class, 'show'])->whereNumber('id')->middleware('permission:dashboard.panel_alert_rules.show');
    Route::put('/{id}',    [PanelAlertRuleController::class, 'update'])->whereNumber('id')->middleware('permission:dashboard.panel_alert_rules.update');
    Route::delete('/{id}', [PanelAlertRuleController::class, 'destroy'])->whereNumber('id')->middleware('permission:dashboard.panel_alert_rules.delete');
});

Route::prefix('v1/health')->controller(HealthCheckController::class)->group(function () {
    Route::get('/',      'index');
    Route::get('/live',  'live');
    Route::get('/ready', 'ready');
});
