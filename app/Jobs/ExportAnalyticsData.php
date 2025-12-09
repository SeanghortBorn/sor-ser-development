<?php

namespace App\Jobs;

use App\Services\AnalyticsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ExportAnalyticsData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $exportType;
    public array $filters;
    public ?int $userId;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 300;

    /**
     * Create a new job instance.
     *
     * @param string $exportType (students, platform, user)
     * @param array $filters
     * @param int|null $userId
     */
    public function __construct(string $exportType, array $filters = [], ?int $userId = null)
    {
        $this->exportType = $exportType;
        $this->filters = $filters;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(AnalyticsService $analyticsService): void
    {
        $data = match ($this->exportType) {
            'students' => $this->exportStudentAnalytics($analyticsService),
            'platform' => $this->exportPlatformStats($analyticsService),
            'user' => $this->exportUserAnalytics($analyticsService),
            default => [],
        };

        if (empty($data)) {
            \Log::warning('No data to export', ['type' => $this->exportType]);
            return;
        }

        // Generate filename
        $filename = sprintf(
            'analytics_%s_%s.json',
            $this->exportType,
            now()->format('Y-m-d_H-i-s')
        );

        // Save to storage
        $path = "exports/{$filename}";
        Storage::put($path, json_encode($data, JSON_PRETTY_PRINT));

        \Log::info('Analytics data exported', [
            'type' => $this->exportType,
            'filename' => $filename,
            'path' => $path,
            'records' => is_array($data) ? count($data) : 1,
        ]);
    }

    /**
     * Export student analytics.
     */
    protected function exportStudentAnalytics(AnalyticsService $analyticsService): array
    {
        return $analyticsService->getStudentAnalytics()->toArray();
    }

    /**
     * Export platform statistics.
     */
    protected function exportPlatformStats(AnalyticsService $analyticsService): array
    {
        return $analyticsService->getPlatformStats();
    }

    /**
     * Export user-specific analytics.
     */
    protected function exportUserAnalytics(AnalyticsService $analyticsService): array
    {
        if (!$this->userId) {
            return [];
        }

        return $analyticsService->getUserReport($this->userId);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Log::error('ExportAnalyticsData job failed', [
            'type' => $this->exportType,
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
        ]);
    }
}
