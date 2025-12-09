<?php

namespace App\Jobs;

use App\Services\AnalyticsService;
use App\Services\CacheService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CalculateUserAnalytics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $userId;

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
    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(AnalyticsService $analyticsService, CacheService $cacheService): void
    {
        // Calculate analytics
        $analytics = $analyticsService->getUserAnalytics($this->userId);

        // Cache the results
        $cacheService->getUserProgress($this->userId, function () use ($analytics) {
            return $analytics;
        });

        \Log::info('User analytics calculated', [
            'user_id' => $this->userId,
            'total_articles' => $analytics['total_articles'] ?? 0,
            'homophone_avg' => $analytics['homophone_avg'] ?? 0,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Log::error('CalculateUserAnalytics job failed', [
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
        ]);
    }
}
