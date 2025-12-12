<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use App\Events\ArticleCompleted;
use App\Events\QuizAttemptFinished;
use App\Events\HomophoneCheckSaved;
use App\Events\UserProgressUpdated;
use App\Listeners\UpdateUserProgress;
use App\Listeners\UnlockNextArticle;
use App\Listeners\SendCompletionEmail;
use App\Listeners\RecalculateAnalytics;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register Vite Manifest Helper
        if (file_exists(app_path('Helpers/ViteManifestHelper.php'))) {
            require_once app_path('Helpers/ViteManifestHelper.php');
        }

        // Register event listeners
        Event::listen(ArticleCompleted::class, UpdateUserProgress::class . '@handleArticleCompleted');
        Event::listen(ArticleCompleted::class, UnlockNextArticle::class);
        Event::listen(ArticleCompleted::class, SendCompletionEmail::class);

        Event::listen(QuizAttemptFinished::class, UpdateUserProgress::class . '@handleQuizFinished');

        Event::listen(HomophoneCheckSaved::class, UpdateUserProgress::class . '@handleHomophoneCheck');

        Event::listen(UserProgressUpdated::class, RecalculateAnalytics::class);
    }
}
