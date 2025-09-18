<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\TwoFactorLoginController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GrammarCheckerController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\RecoveryCodeController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController;
use Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController;

Route::redirect('/', '/home');

Route::inertia('/grammar-check', 'GrammarChecks/GrammarCheck');
Route::inertia('/home', 'HomePages/Home');
Route::inertia('/quiz', 'Quizzes/Quiz');
Route::inertia('/subscribe', 'Subscribes/SubscribePage');
Route::inertia('/about', 'Abouts/index')->name('about');

Route::middleware(['auth', 'check.user.role'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboards/Dashboard');
    })->name('dashboard');
});

// Google Authentication Routes
Route::controller(GoogleController::class)->group(function () {
    Route::get('auth/google', 'redirectToGoogle')->name('auth.google');
    Route::get('auth/google/callback', 'handleGoogleCallback');
});

Route::get('/two-factor-challenge', [AuthenticatedSessionController::class, 'create'])
    ->middleware(['guest:' . config('fortify.guard')])
    ->name('two-factor.login');

Route::middleware('auth')->group(function () {
    Route::prefix('user')->group(function () {
        Route::post('/two-factor-authentication', [TwoFactorAuthenticationController::class, 'store'])
        ->name('two-factor.enable');

    Route::post('/confirmed-two-factor-authentication', [ConfirmedTwoFactorAuthenticationController::class, 'store'])
        ->name('two-factor.confirm');

    Route::delete('/two-factor-authentication', [TwoFactorAuthenticationController::class, 'destroy'])
        ->name('two-factor.disable');

    Route::get('/two-factor-qr-code', [TwoFactorQrCodeController::class, 'show'])
        ->name('two-factor.qr-code')
        ->middleware('password.confirm');

    Route::get('/two-factor-secret-key', [TwoFactorSecretKeyController::class, 'show'])
        ->name('two-factor.secret-key')
        ->middleware('password.confirm');

    Route::get('/two-factor-recovery-codes', [RecoveryCodeController::class, 'index'])
        ->name('two-factor.recovery-codes')
        ->middleware('password.confirm');

    Route::post('/two-factor-recovery-codes', [RecoveryCodeController::class, 'store'])
        ->name('two-factor.regenerate-recovery-codes')
        ->middleware('password.confirm');
    });

    Route::inertia('/library', 'Libraries/index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index')->middleware(['check:category-list']);
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create')->middleware(['check:category-create']);
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::get('/categories/{id}', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index')->middleware(['check:quiz-list']);
    Route::get('/quizzes/create', [QuizController::class, 'create'])->name('quizzes.create')->middleware(['check:quiz-create']);
    Route::post('/quizzes', [QuizController::class, 'store'])->name('quizzes.store');
    Route::patch('/quizzes/{id}', [QuizController::class, 'update'])->name('quizzes.update');
    Route::get('/quizzes/{id}', [QuizController::class, 'edit'])->name('quizzes.edit');
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy'])->name('quizzes.destroy');


    Route::prefix('roles')->group(function () {
        Route::get('/', [RolesController::class, 'index'])->name('roles.index')->middleware(['check:role-list']);
        Route::get('/create', [RolesController::class, 'create'])->name('roles.create')->middleware(['check:role-create']);
        Route::get('/{id}', [RolesController::class, 'edit'])->name('roles.edit')->middleware(['check:role-edit']);
        Route::post("/", [RolesController::class, 'store'])->name('roles.store');
        Route::patch("/{id}", [RolesController::class, 'update'])->name('roles.update');
        Route::delete("/{id}", [RolesController::class, 'destroy'])->name('roles.destroy')->middleware(['check:role-delete']);
    });
    
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware(['check:user-list']);
        Route::get('/create', [UserController::class, 'create'])->name('users.create')->middleware(['check:user-create']);
        Route::get('/{id}', [UserController::class, 'edit'])->name('users.edit')->middleware(['check:user-edit']);
        Route::post("/", [UserController::class, 'store'])->name('users.store');
        Route::patch("/{id}", [UserController::class, 'update'])->name('users.update');
        Route::delete("/{id}", [UserController::class, 'destroy'])->name('users.destroy')->middleware(['check:user-delete']);
    });

    Route::resource('grammar-checkers', GrammarCheckerController::class)->except(['create', 'edit']);
});

require __DIR__ . '/auth.php';
