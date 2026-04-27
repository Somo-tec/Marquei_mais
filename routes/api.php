<?php

use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\OrgController;
use App\Http\Controllers\Api\AppointmentsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientsController;
use App\Http\Controllers\Api\FinancialController;
use App\Http\Controllers\Api\NotificationsController;
use App\Http\Controllers\Api\ProfessionalsController;
use App\Http\Controllers\Api\ReviewsController;
use App\Http\Controllers\Api\ServicesController;
use App\Http\Controllers\Api\StaffController;
use Illuminate\Support\Facades\Route;

// ─── Públicas ─────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// ─── Autenticadas (qualquer staff) ────────────────────────────────────────
Route::middleware('staff.token')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Org settings
    Route::get('/org', [OrgController::class, 'show']);
    Route::patch('/org/settings', [OrgController::class, 'update']);

    // Appointments
    Route::get('/appointments', [AppointmentsController::class, 'index']);
    Route::post('/appointments', [AppointmentsController::class, 'store']);
    Route::get('/appointments/slots', [AppointmentsController::class, 'availableSlots']);
    Route::get('/appointments/{id}', [AppointmentsController::class, 'show']);
    Route::patch('/appointments/{id}', [AppointmentsController::class, 'update']);
    Route::delete('/appointments/{id}', [AppointmentsController::class, 'destroy']);

    // Clients
    Route::apiResource('clients', ClientsController::class);

    // Services
    Route::apiResource('services', ServicesController::class);

    // Professionals
    Route::apiResource('professionals', ProfessionalsController::class);

    // Reviews
    Route::get('/reviews', [ReviewsController::class, 'index']);
    Route::post('/reviews', [ReviewsController::class, 'store']);
    Route::get('/reviews/stats', [ReviewsController::class, 'stats']);

    // Financial
    Route::get('/financial/cashier/current', [FinancialController::class, 'currentCashier']);
    Route::post('/financial/cashier/open', [FinancialController::class, 'openCashier']);
    Route::patch('/financial/cashier/{id}/close', [FinancialController::class, 'closeCashier']);
    Route::post('/financial/entries', [FinancialController::class, 'storeEntry']);
    Route::get('/financial/report', [FinancialController::class, 'report']);
    Route::get('/financial/commissions', [FinancialController::class, 'commissions']);

    // Notifications
    Route::get('/notifications', [NotificationsController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationsController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationsController::class, 'markAllRead']);

    // AI
    Route::post('/ai/slot-suggestions', [AiController::class, 'slotSuggestions']);
    Route::post('/ai/upsell', [AiController::class, 'upsellSuggestion']);
    Route::get('/ai/retention', [AiController::class, 'retentionInsight']);
});

// ─── Admin only ────────────────────────────────────────────────────────────
Route::middleware(['staff.token:admin'])->group(function () {
    Route::apiResource('staff', StaffController::class);
});
