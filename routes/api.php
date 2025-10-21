<?php

use App\Http\Controllers\KhmerCompareController;
use App\Http\Controllers\KhmerSegmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\UserActivityController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group([ 'middleware' => 'api', 'prefix' => 'auth' ], function ($router) {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
    });
});

Route::post('/khmer-segment', [KhmerSegmentController::class, 'segment']);
Route::post('/compare', [KhmerCompareController::class, 'compare']);

// User activity tracking routes (without auth for testing)
Route::post('/track/comparison-action', [UserActivityController::class, 'trackComparisonAction']);
Route::post('/track/audio-activity', [UserActivityController::class, 'trackAudioActivity']);
Route::get('/track/stats', [UserActivityController::class, 'getStats']);

// Or with auth
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/track/comparison-action', [UserActivityController::class, 'trackComparisonAction']);
    Route::post('/track/audio-activity', [UserActivityController::class, 'trackAudioActivity']);
    Route::get('/track/stats', [UserActivityController::class, 'getStats']);
});