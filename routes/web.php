<?php
use App\Http\Controllers\HomophoneCheckController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\ArticleSettingsController;
use App\Http\Controllers\ArticleProgressionController;
use App\Http\Controllers\UserArticleDetailController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\TwoFactorLoginController;
use App\Http\Controllers\HomophoneController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserAnalyticsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GrammarCheckerController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\DashboardController;
use App\Models\Homophone;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\RecoveryCodeController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController;
use Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController;
use App\Http\Controllers\PermissionManagementController;

Route::redirect('/', '/home');

// Route::get('/homophone-check', [App\Http\Controllers\HomophoneCheckController::class, 'index'])
//     ->name('homophone.check')
//     ->middleware('auth');

// Homophone Check routes
Route::middleware(['auth'])->group(function () {
    Route::get('/homophone-check', [HomophoneCheckController::class, 'index'])
        ->name('homophone-check.index');

    // Save completion when user finishes article
    Route::post('/homophone-check/{article}/save-completion', [HomophoneCheckController::class, 'saveCompletion'])
        ->name('homophone-check.save-completion');

    // Get live progress while user is typing
    Route::post('/homophone-check/{article}/live-progress', [HomophoneCheckController::class, 'getLiveProgress'])
        ->name('homophone-check.live-progress');
});

Route::inertia('/home', 'Homes/index')->name('home');
Route::inertia('/subscribe', 'Subscribes/index')->name('subscribe');
Route::inertia('/contacts', 'Contacts/index')->name('contacts');

// Quiz landing page for students/guests (published quizzes)
Route::get('/quiz-practice', [QuizController::class, 'landingPage'])->name('quiz.practice');

// Dashboard route (single definition)
Route::middleware(['auth', 'check.user.role'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // System Settings (Admin only)
    Route::get('/settings', [App\Http\Controllers\SystemSettingsController::class, 'index'])
        ->name('settings.index')
        ->middleware(['check:settings-edit']);
    
    Route::post('/settings', [App\Http\Controllers\SystemSettingsController::class, 'update'])
        ->name('settings.update')
        ->middleware(['check:settings-edit']);
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

    Route::get('/user-analytics', [UserAnalyticsController::class, 'index'])
        ->name('user.analytics')
        ->middleware(['check:user-list']);

    Route::get('/api/articles', [ArticleController::class, 'apiList']);
    Route::get('/api/audios/{id}', [ArticleController::class, 'getAudio']);

    Route::inertia('/library', 'Libraries/index')->name('library')->middleware(['check:student']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index')->middleware(['check:category-list']);
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create')->middleware(['check:category-create']);
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::get('/categories/{id}', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Quiz routes with custom middleware
    Route::get('/quizzes/create', [QuizController::class, 'create'])->name('quizzes.create')->middleware(['check:quiz-create']);
    Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index')->middleware(['check:quiz-list']);
    Route::resource('quizzes', QuizController::class)->except(['index', 'create']);

    Route::middleware(['auth'])->group(function () {
        Route::post('/quizzes/submit', [QuizController::class, 'submitAttempt'])->name('quizzes.submit');
        Route::get('/quizzes/result/{attempt}', [QuizController::class, 'showResult'])->name('quizzes.result');
    });
    
    Route::get('/analytics', [QuizController::class, 'analyse'])->name('analytics');

    // ═══════════════════════════════════════════════════════════════════════
    // ROLES ROUTES - SINGLE CLEAN DEFINITION
    // ═══════════════════════════════════════════════════════════════════════
    Route::prefix('roles')->middleware(['auth'])->group(function () {
        Route::get('/', [RolesController::class, 'index'])
            ->name('roles.index')
            ->middleware(['check:role-list']);
        
        Route::get('/create', [RolesController::class, 'create'])
            ->name('roles.create')
            ->middleware(['check:role-create']);
        
        Route::post('/', [RolesController::class, 'store'])
            ->name('roles.store');
        
        Route::get('/{role}/edit', [RolesController::class, 'edit'])
            ->name('roles.edit')
            ->middleware(['check:role-edit']);
        
        Route::put('/{role}', [RolesController::class, 'update'])
            ->name('roles.update');
        
        Route::patch('/{role}', [RolesController::class, 'update']);
        
        Route::delete('/{role}', [RolesController::class, 'destroy'])
            ->name('roles.destroy')
            ->middleware(['check:role-delete']);
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware(['check:user-list']);
        Route::get('/create', [UserController::class, 'create'])->name('users.create')->middleware(['check:user-create']);
        Route::get('/{id}', [UserController::class, 'edit'])->name('users.edit')->middleware(['check:user-edit']);
        Route::post("/", [UserController::class, 'store'])->name('users.store');
        Route::patch("/{id}", [UserController::class, 'update'])->name('users.update');
        Route::delete("/{id}", [UserController::class, 'destroy'])->name('users.destroy')->middleware(['check:user-delete']);
        Route::post('/{id}/block', [UserController::class, 'block'])->name('users.block')->middleware(['check:user-block']);
        Route::patch('/{id}/permissions', [UserController::class, 'updatePermissions'])->name('users.update-permissions');
        Route::post('/{id}/restore', [UserController::class, 'restore'])->name('users.restore')->middleware(['check:user-create']);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // FIX16: USER ARTICLE DETAIL ANALYTICS
    // ═══════════════════════════════════════════════════════════════════════
    Route::prefix('users/{userId}/articles/{articleId}')->group(function () {
        Route::get('/details', [UserArticleDetailController::class, 'show'])
            ->name('users.articles.details')
            ->middleware(['check:user-list']);
        
        Route::get('/export/{format}', [UserArticleDetailController::class, 'exportData'])
            ->name('users.articles.export')
            ->middleware(['check:user-list'])
            ->where('format', 'csv|json|xml');
    });

    Route::resource('grammar-checkers', GrammarCheckerController::class)->except(['create', 'edit']);
    Route::post('/grammar-checkers/{grammarChecker}/tags', [GrammarCheckerController::class, 'updateTags']);

    Route::prefix('articles')->group(function () {
        Route::get('/', [ArticleController::class, 'index'])->name('articles.index')->middleware(['check:article-list']);
        Route::get('/create', [ArticleController::class, 'create'])->name('articles.create')->middleware(['check:article-create']);
        Route::get('/{id}/completion-stats', [ArticleController::class, 'completionStats'])->name('articles.completion-stats')->middleware(['check:article-list']);
        Route::get('/{id}', [ArticleController::class, 'edit'])->name('articles.edit')->middleware(['check:article-edit']);
        Route::post("/", [ArticleController::class, 'store'])->name('articles.store');
        Route::patch("/{id}", [ArticleController::class, 'update'])->name('articles.update');
        Route::delete("/{id}", [ArticleController::class, 'destroy'])->name('articles.destroy')->middleware(['check:article-delete']);
    });

    Route::prefix('homophones')->group(function () {
        Route::get('/', [HomophoneController::class, 'index'])->name('homophones.index')->middleware(['check:homophone-list']);
        Route::get('/create', [HomophoneController::class, 'create'])->name('homophones.create')->middleware(['check:homophone-create']);
        Route::get('/{id}', [HomophoneController::class, 'edit'])->name('homophones.edit')->middleware(['check:homophone-edit']);
        Route::post("/", [HomophoneController::class, 'store'])->name('homophones.store');
        Route::patch("/{id}", [HomophoneController::class, 'update'])->name('homophones.update');
        Route::delete("/{id}", [HomophoneController::class, 'destroy'])->name('homophones.destroy')->middleware(['check:homophone-delete']);
        Route::get('/json', function () {
            return response()->json(['homophones' => Homophone::all()]);
        })->name('homophones.json');
        Route::post('/import', [HomophoneController::class, 'import'])->name('homophones.import');
        Route::post('/clear', [HomophoneController::class, 'clear'])->name('homophones.clear')->middleware(['check:homophone-delete']);
    });
    Route::get('/homophones.json', function () {
        return response()->json(['homophones' => Homophone::all()]);
    })->name('homophones.public');

    Route::post('/feedback', [App\Http\Controllers\FeedbackController::class, 'store']);
    Route::get('/feedback', [App\Http\Controllers\FeedbackController::class, 'index'])->name('feedback.index');
    Route::get('/feedback/create', [App\Http\Controllers\FeedbackController::class, 'create'])->name('feedback.create');

    // ═══════════════════════════════════════════════════════════════════════
    // FIX16: ARTICLE PROGRESSION SYSTEM ROUTES
    // ═══════════════════════════════════════════════════════════════════════
    
    // ADMIN: Article Settings Management
    Route::prefix('article-settings')->group(function () {
        Route::get('/', [ArticleSettingsController::class, 'index'])
            ->name('article-settings.index')
            ->middleware(['check:article-list']);
        
        Route::put('/{id}', [ArticleSettingsController::class, 'update'])
            ->name('article-settings.update')
            ->middleware(['check:article-edit']);
        
        Route::post('/update-order', [ArticleSettingsController::class, 'updateOrder'])
            ->name('article-settings.update-order')
            ->middleware(['check:article-edit']);
        
        Route::post('/bulk-typing-mode', [ArticleSettingsController::class, 'bulkUpdateTypingMode'])
            ->name('article-settings.bulk-typing-mode')
            ->middleware(['check:article-edit']);
        
        Route::post('/setup-chain', [ArticleSettingsController::class, 'setupSequentialChain'])
            ->name('article-settings.setup-chain')
            ->middleware(['check:article-edit']);
        
        Route::post('/reset', [ArticleSettingsController::class, 'resetToDefault'])
            ->name('article-settings.reset')
            ->middleware(['check:article-edit']);
        
        Route::get('/preview-chain', [ArticleSettingsController::class, 'previewChain'])
            ->name('article-settings.preview-chain');
    });
    
    // USER: Article Progression (Learning)
    Route::prefix('learn')->group(function () {
        Route::get('/articles', [ArticleProgressionController::class, 'index'])
            ->name('learn.articles.index');
        
        Route::get('/articles/{id}', [ArticleProgressionController::class, 'show'])
            ->name('learn.articles.show');
        
        Route::get('/articles/{id}/check', [ArticleProgressionController::class, 'checkAvailability'])
            ->name('learn.articles.check');
        
        Route::post('/articles/{id}/complete', [ArticleProgressionController::class, 'recordCompletion'])
            ->name('learn.articles.complete');
        
        Route::get('/progress', [ArticleProgressionController::class, 'getProgress'])
            ->name('learn.progress');
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // FIX18: USER PROGRESS ROUTES
    // ═══════════════════════════════════════════════════════════════════════
    Route::prefix('user-progress')->name('user-progress.')->group(function () {
        Route::get('/', [UserProgressController::class, 'index'])
            ->name('index');
        
        Route::get('/{user}', [UserProgressController::class, 'show'])
            ->name('show');
    });

    // Permission Management (Admin only)
    Route::middleware(['check:permissions-manage'])->prefix('permissions')->name('permissions.')->group(function () {
        Route::get('/', [PermissionManagementController::class, 'index'])
            ->name('index');
        
        Route::post('/grant-role', [PermissionManagementController::class, 'grantToRole'])
            ->name('grant-role');
        
        Route::post('/grant-user', [PermissionManagementController::class, 'grantToUser'])
            ->name('grant-user');
        
        Route::delete('/revoke-role', [PermissionManagementController::class, 'revokeFromRole'])
            ->name('revoke-role');
        
        Route::delete('/revoke-user', [PermissionManagementController::class, 'revokeFromUser'])
            ->name('revoke-user');
    });
});

require __DIR__ . '/auth.php';