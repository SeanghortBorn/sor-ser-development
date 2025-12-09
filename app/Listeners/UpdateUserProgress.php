<?php

namespace App\Listeners;

use App\Events\ArticleCompleted;
use App\Events\QuizAttemptFinished;
use App\Events\HomophoneCheckSaved;
use App\Services\UserProgressService;
use App\Services\CacheService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateUserProgress implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(
        protected UserProgressService $userProgressService,
        protected CacheService $cacheService
    ) {}

    /**
     * Handle ArticleCompleted event.
     */
    public function handleArticleCompleted(ArticleCompleted $event): void
    {
        // Save article completion
        $this->userProgressService->saveArticleCompletion(
            $event->userId,
            $event->articleId,
            [
                'accuracy' => $event->accuracy,
                'time_spent' => $event->completionData['time_spent'] ?? 0,
            ]
        );

        // Invalidate user cache
        $this->cacheService->invalidateUserCaches($event->userId);
    }

    /**
     * Handle QuizAttemptFinished event.
     */
    public function handleQuizFinished(QuizAttemptFinished $event): void
    {
        // Quiz attempt is already saved, just invalidate cache
        $this->cacheService->invalidateUserCaches($event->userId);
    }

    /**
     * Handle HomophoneCheckSaved event.
     */
    public function handleHomophoneCheck(HomophoneCheckSaved $event): void
    {
        // Save homophone accuracy
        $this->userProgressService->saveHomophoneAccuracy(
            $event->userId,
            $event->articleId,
            $event->accuracy,
            [
                'total_words' => $event->totalWords,
                'correct_words' => $event->correctWords,
                'incorrect_words' => $event->incorrectWords,
            ]
        );

        // Invalidate user cache
        $this->cacheService->invalidateUserCaches($event->userId);
    }

    /**
     * Handle a job failure.
     */
    public function failed($event, \Throwable $exception): void
    {
        \Log::error('UpdateUserProgress listener failed', [
            'event' => get_class($event),
            'error' => $exception->getMessage(),
        ]);
    }
}
