<?php

use App\Http\Controllers\AccuracyController;
use App\Http\Controllers\KhmerCompareController;
use App\Http\Controllers\KhmerSegmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\UserActivityController;
use App\Http\Controllers\UserAudioActivityController;
use App\Models\QuizAttempt;

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

Route::get('/user-activity-stats', [UserActivityController::class, 'getStats']);
Route::get('/user-activities/stats', [UserActivityController::class, 'getStats']);
Route::post('/accuracy', [AccuracyController::class, 'store'])->name('accuracy.store');

Route::get('/user-homophone-accuracies', [AccuracyController::class, 'index']);
Route::get('/user-comparison-activities', [UserActivityController::class, 'listComparisonActivities']);

Route::get('/quiz-attempts', function () {
    return QuizAttempt::all();
});


// Or with auth
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/track/comparison-action', [UserActivityController::class, 'trackComparisonAction']);
    Route::post('/track/audio-activity', [UserActivityController::class, 'trackAudioActivity']);
    Route::get('/track/stats', [UserActivityController::class, 'getStats']);
    
    // User audio activities endpoint
    Route::get('/user-audio-activities', [UserAudioActivityController::class, 'index']);
});