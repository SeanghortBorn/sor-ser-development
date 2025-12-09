<?php

namespace App\Jobs;

use App\Events\ArticleCompleted;
use App\Events\UserProgressUpdated;
use App\Services\UserProgressService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessArticleCompletion implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $userId;
    public int $articleId;
    public array $completionData;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(int $userId, int $articleId, array $completionData)
    {
        $this->userId = $userId;
        $this->articleId = $articleId;
        $this->completionData = $completionData;
    }

    /**
     * Execute the job.
     */
    public function handle(UserProgressService $userProgressService): void
    {
        // Save article completion
        $completion = $userProgressService->saveArticleCompletion(
            $this->userId,
            $this->articleId,
            [
                'accuracy' => $this->completionData['accuracy'] ?? 0,
                'time_spent' => $this->completionData['time_spent'] ?? 0,
            ]
        );

        // Dispatch ArticleCompleted event
        event(new ArticleCompleted(
            $this->userId,
            $this->articleId,
            $completion->accuracy,
            $this->completionData
        ));

        // Dispatch UserProgressUpdated event
        event(new UserProgressUpdated(
            $this->userId,
            'article',
            [
                'article_id' => $this->articleId,
                'accuracy' => $completion->accuracy,
            ]
        ));

        \Log::info('Article completion processed', [
            'user_id' => $this->userId,
            'article_id' => $this->articleId,
            'accuracy' => $completion->accuracy,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Log::error('ProcessArticleCompletion job failed', [
            'user_id' => $this->userId,
            'article_id' => $this->articleId,
            'error' => $exception->getMessage(),
        ]);
    }
}
