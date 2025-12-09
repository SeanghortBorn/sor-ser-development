<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface AnalyticsRepositoryInterface
{
    /**
     * Get student analytics data (optimized for N+1 prevention).
     */
    public function getStudentAnalytics(): Collection;

    /**
     * Get analytics for a specific user.
     */
    public function getUserAnalytics(int $userId): array;

    /**
     * Get homophone accuracy statistics.
     */
    public function getHomophoneAccuracyStats(int $userId): array;

    /**
     * Get quiz performance statistics.
     */
    public function getQuizPerformanceStats(int $userId): array;

    /**
     * Get typing activity statistics.
     */
    public function getTypingActivityStats(int $userId): array;

    /**
     * Get comparison activity statistics.
     */
    public function getComparisonActivityStats(int $userId): array;

    /**
     * Get article completion statistics.
     */
    public function getArticleCompletionStats(int $userId): array;

    /**
     * Get overall platform statistics.
     */
    public function getPlatformStats(): array;

    /**
     * Get user progress over time.
     */
    public function getUserProgressOverTime(int $userId, int $days = 30): array;
}
