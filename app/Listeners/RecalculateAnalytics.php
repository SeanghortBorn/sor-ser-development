<?php

namespace App\Listeners;

use App\Events\UserProgressUpdated;
use App\Jobs\CalculateUserAnalytics;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecalculateAnalytics implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(UserProgressUpdated $event): void
    {
        // Dispatch job to recalculate analytics asynchronously
        CalculateUserAnalytics::dispatch($event->userId);

        \Log::info('Analytics recalculation queued', [
            'user_id' => $event->userId,
            'progress_type' => $event->progressType,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(UserProgressUpdated $event, \Throwable $exception): void
    {
        \Log::error('RecalculateAnalytics listener failed', [
            'user_id' => $event->userId,
            'progress_type' => $event->progressType,
            'error' => $exception->getMessage(),
        ]);
    }
}
