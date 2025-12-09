<?php

namespace App\Services;

use App\Models\User;
use App\Models\Article;
use App\Models\UserArticleCompletion;
use App\Models\UserHomophoneAccuracy;
use App\Services\ArticleProgressionService;
use Illuminate\Support\Facades\DB;

class UserProgressService
{
    public function __construct(
        protected ArticleProgressionService $articleProgressionService
    ) {}

    /**
     * Get user's overall progress summary.
     */
    public function getUserProgress(int $userId): array
    {
        $user = User::with([
            'completions',
            'homophoneAccuracies',
            'quizAttempts',
            'roles',
        ])->findOrFail($userId);

        $totalArticles = Article::count();
        $completedArticles = $user->completions()
            ->where('status', 'completed')
            ->distinct('article_id')
            ->count();

        $homophoneAvg = $user->homophoneAccuracies->avg('accuracy') ?? 0;
        $quizAttempts = $user->quizAttempts->count();

        return [
            'user_id' => $userId,
            'user_name' => $user->name,
            'total_articles' => $totalArticles,
            'completed_articles' => $completedArticles,
            'progress_percentage' => $totalArticles > 0 ? round(($completedArticles / $totalArticles) * 100, 2) : 0,
            'homophone_average' => round($homophoneAvg, 2),
            'quiz_attempts' => $quizAttempts,
            'last_activity' => $user->completions()->latest()->first()?->updated_at,
        ];
    }

    /**
     * Get articles accessible by user based on progression rules.
     */
    public function getAccessibleArticles(int $userId): array
    {
        $articles = Article::with(['file', 'audio', 'setting'])
            ->orderBy('order', 'asc')
            ->get();

        $accessible = [];

        foreach ($articles as $article) {
            [$canAccess, $message] = $this->articleProgressionService->canUserAccessArticle($userId, $article->id);

            $accessible[] = [
                'id' => $article->id,
                'title' => $article->title,
                'can_access' => $canAccess,
                'reason' => $message,
                'is_completed' => $this->isArticleCompleted($userId, $article->id),
            ];
        }

        return $accessible;
    }

    /**
     * Check if user has completed an article.
     */
    public function isArticleCompleted(int $userId, int $articleId): bool
    {
        return UserArticleCompletion::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->where('status', 'completed')
            ->exists();
    }

    /**
     * Save article completion.
     */
    public function saveArticleCompletion(int $userId, int $articleId, array $data): UserArticleCompletion
    {
        return UserArticleCompletion::updateOrCreate(
            [
                'user_id' => $userId,
                'article_id' => $articleId,
            ],
            [
                'status' => 'completed',
                'accuracy' => $data['accuracy'] ?? 0,
                'time_spent' => $data['time_spent'] ?? 0,
                'completed_at' => now(),
            ]
        );
    }

    /**
     * Save homophone accuracy record.
     */
    public function saveHomophoneAccuracy(int $userId, int $articleId, float $accuracy, array $data = []): UserHomophoneAccuracy
    {
        return UserHomophoneAccuracy::create([
            'user_id' => $userId,
            'article_id' => $articleId,
            'accuracy' => $accuracy,
            'total_words' => $data['total_words'] ?? 0,
            'correct_words' => $data['correct_words'] ?? 0,
            'incorrect_words' => $data['incorrect_words'] ?? 0,
        ]);
    }

    /**
     * Get user's article completion history.
     */
    public function getCompletionHistory(int $userId, int $limit = 10): array
    {
        $completions = UserArticleCompletion::with('article')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->limit($limit)
            ->get();

        return $completions->map(function ($completion) {
            return [
                'article_id' => $completion->article_id,
                'article_title' => $completion->article->title ?? 'Unknown',
                'accuracy' => $completion->accuracy,
                'time_spent' => $completion->time_spent,
                'completed_at' => $completion->completed_at,
            ];
        })->toArray();
    }

    /**
     * Get next available article for user.
     */
    public function getNextArticle(int $userId): ?array
    {
        $articles = Article::with(['setting'])
            ->orderBy('order', 'asc')
            ->get();

        foreach ($articles as $article) {
            $isCompleted = $this->isArticleCompleted($userId, $article->id);

            if (!$isCompleted) {
                [$canAccess, $message] = $this->articleProgressionService->canUserAccessArticle($userId, $article->id);

                if ($canAccess) {
                    return [
                        'id' => $article->id,
                        'title' => $article->title,
                        'order' => $article->order,
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Get user's learning streak (consecutive days with activity).
     */
    public function getLearningStreak(int $userId): int
    {
        $completions = UserArticleCompletion::where('user_id', $userId)
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->get();

        if ($completions->isEmpty()) {
            return 0;
        }

        $streak = 1;
        $lastDate = $completions->first()->completed_at->startOfDay();

        foreach ($completions->skip(1) as $completion) {
            $currentDate = $completion->completed_at->startOfDay();
            $daysDiff = $lastDate->diffInDays($currentDate);

            if ($daysDiff === 1) {
                $streak++;
                $lastDate = $currentDate;
            } elseif ($daysDiff > 1) {
                break;
            }
        }

        return $streak;
    }

    /**
     * Get user's achievements/milestones.
     */
    public function getUserAchievements(int $userId): array
    {
        $progress = $this->getUserProgress($userId);
        $streak = $this->getLearningStreak($userId);

        $achievements = [];

        if ($progress['completed_articles'] >= 1) {
            $achievements[] = ['name' => 'First Step', 'description' => 'Complete your first article'];
        }

        if ($progress['completed_articles'] >= 5) {
            $achievements[] = ['name' => 'Getting Started', 'description' => 'Complete 5 articles'];
        }

        if ($progress['completed_articles'] >= 10) {
            $achievements[] = ['name' => 'Committed Learner', 'description' => 'Complete 10 articles'];
        }

        if ($progress['homophone_average'] >= 80) {
            $achievements[] = ['name' => 'Homophone Master', 'description' => 'Achieve 80%+ average accuracy'];
        }

        if ($streak >= 7) {
            $achievements[] = ['name' => 'Week Warrior', 'description' => 'Maintain a 7-day learning streak'];
        }

        return $achievements;
    }

    /**
     * Reset user's progress (for admin use).
     */
    public function resetUserProgress(int $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            UserArticleCompletion::where('user_id', $userId)->delete();
            UserHomophoneAccuracy::where('user_id', $userId)->delete();
            return true;
        });
    }
}
