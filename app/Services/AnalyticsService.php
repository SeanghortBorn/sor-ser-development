<?php

namespace App\Services;

use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Collection;

class AnalyticsService
{
    public function __construct(
        protected AnalyticsRepositoryInterface $analyticsRepository,
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get all student analytics data (optimized for performance).
     */
    public function getStudentAnalytics(): Collection
    {
        return $this->analyticsRepository->getStudentAnalytics();
    }

    /**
     * Get detailed analytics for a specific user.
     */
    public function getUserAnalytics(int $userId): array
    {
        return $this->analyticsRepository->getUserAnalytics($userId);
    }

    /**
     * Get comprehensive user report.
     */
    public function getUserReport(int $userId): array
    {
        $userAnalytics = $this->analyticsRepository->getUserAnalytics($userId);
        $homophoneStats = $this->analyticsRepository->getHomophoneAccuracyStats($userId);
        $quizStats = $this->analyticsRepository->getQuizPerformanceStats($userId);
        $typingStats = $this->analyticsRepository->getTypingActivityStats($userId);
        $comparisonStats = $this->analyticsRepository->getComparisonActivityStats($userId);
        $articleStats = $this->analyticsRepository->getArticleCompletionStats($userId);

        return [
            'user' => $userAnalytics,
            'homophones' => $homophoneStats,
            'quizzes' => $quizStats,
            'typing' => $typingStats,
            'comparisons' => $comparisonStats,
            'articles' => $articleStats,
        ];
    }

    /**
     * Get user progress over a specific time period.
     */
    public function getUserProgressOverTime(int $userId, int $days = 30): array
    {
        return $this->analyticsRepository->getUserProgressOverTime($userId, $days);
    }

    /**
     * Get platform-wide statistics.
     */
    public function getPlatformStats(): array
    {
        return $this->analyticsRepository->getPlatformStats();
    }

    /**
     * Get leaderboard data (top performing students).
     */
    public function getLeaderboard(int $limit = 10): Collection
    {
        return $this->analyticsRepository->getStudentAnalytics()
            ->sortByDesc('homophone_avg')
            ->take($limit)
            ->values();
    }

    /**
     * Compare two users' performance.
     */
    public function compareUsers(int $userId1, int $userId2): array
    {
        $user1Stats = $this->analyticsRepository->getUserAnalytics($userId1);
        $user2Stats = $this->analyticsRepository->getUserAnalytics($userId2);

        return [
            'user1' => $user1Stats,
            'user2' => $user2Stats,
            'comparison' => [
                'article_difference' => ($user1Stats['total_articles'] ?? 0) - ($user2Stats['total_articles'] ?? 0),
                'homophone_difference' => ($user1Stats['homophone_avg'] ?? 0) - ($user2Stats['homophone_avg'] ?? 0),
                'quiz_difference' => ($user1Stats['quiz_attempts'] ?? 0) - ($user2Stats['quiz_attempts'] ?? 0),
                'typing_difference' => ($user1Stats['typing_accuracy'] ?? 0) - ($user2Stats['typing_accuracy'] ?? 0),
            ],
        ];
    }

    /**
     * Get user progress summary (simplified).
     */
    public function getUserProgressSummary(int $userId): array
    {
        return $this->userRepository->getUserProgressSummary($userId);
    }
}
