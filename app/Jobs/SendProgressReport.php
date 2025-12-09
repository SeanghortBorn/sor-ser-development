<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\UserProgressService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendProgressReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $userId;
    public string $reportType;

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
     *
     * @param int $userId
     * @param string $reportType (weekly, monthly)
     */
    public function __construct(int $userId, string $reportType = 'weekly')
    {
        $this->userId = $userId;
        $this->reportType = $reportType;
    }

    /**
     * Execute the job.
     */
    public function handle(UserProgressService $userProgressService): void
    {
        $user = User::find($this->userId);

        if (!$user) {
            \Log::warning('User not found for progress report', ['user_id' => $this->userId]);
            return;
        }

        // Get user progress
        $progress = $userProgressService->getUserProgress($this->userId);

        // Get completion history
        $days = $this->reportType === 'monthly' ? 30 : 7;
        $history = $userProgressService->getCompletionHistory($this->userId, $days);

        // Get achievements
        $achievements = $userProgressService->getUserAchievements($this->userId);

        // Get learning streak
        $streak = $userProgressService->getLearningStreak($this->userId);

        $reportData = [
            'progress' => $progress,
            'history' => $history,
            'achievements' => $achievements,
            'streak' => $streak,
            'report_type' => $this->reportType,
        ];

        // TODO: Create mail class and uncomment
        // Mail::to($user->email)->send(new ProgressReportMail($user, $reportData));

        \Log::info('Progress report sent', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'report_type' => $this->reportType,
            'completed_articles' => $progress['completed_articles'],
            'streak' => $streak,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Log::error('SendProgressReport job failed', [
            'user_id' => $this->userId,
            'report_type' => $this->reportType,
            'error' => $exception->getMessage(),
        ]);
    }
}
