<?php

namespace App\Listeners;

use App\Events\ArticleCompleted;
use App\Services\ArticleProgressionService;
use App\Services\UserProgressService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UnlockNextArticle implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(
        protected ArticleProgressionService $articleProgressionService,
        protected UserProgressService $userProgressService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(ArticleCompleted $event): void
    {
        // Get next article
        $nextArticle = $this->userProgressService->getNextArticle($event->userId);

        if ($nextArticle) {
            // Check if user can access the next article
            [$canAccess, $message] = $this->articleProgressionService->canUserAccessArticle(
                $event->userId,
                $nextArticle['id']
            );

            if ($canAccess) {
                \Log::info('Next article unlocked', [
                    'user_id' => $event->userId,
                    'article_id' => $nextArticle['id'],
                    'article_title' => $nextArticle['title'],
                ]);
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(ArticleCompleted $event, \Throwable $exception): void
    {
        \Log::error('UnlockNextArticle listener failed', [
            'user_id' => $event->userId,
            'article_id' => $event->articleId,
            'error' => $exception->getMessage(),
        ]);
    }
}
