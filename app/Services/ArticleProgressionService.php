<?php

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleSetting;
use App\Models\UserArticleCompletion;
use App\Models\GrammarChecker;
use App\Models\UserHomophoneAccuracy;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ArticleProgressionService
{
    /**
     * ArticleProgressionService
     * 
     * Handles all business logic for article progression:
     * - Checking if articles are available
     * - Recording completions
     * - Calculating unlock times
     * - Determining typing mode features
     */

    // ═══════════════════════════════════════════════════════════════════
    // AVAILABILITY CHECKING
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Check if a user can access a specific article
     */
    public function canUserAccessArticle(int $userId, int $articleId): array
    {
        return UserArticleCompletion::checkArticleAvailability($userId, $articleId);
    }

    /**
     * Get all articles with availability status for a user
     * This is the main method for the articles list page
     */
    public function getArticlesForUser(int $userId): array
    {
        return UserArticleCompletion::getArticlesWithStatus($userId);
    }

    /**
     * Get user's overall progress summary
     */
    public function getUserProgressSummary(int $userId): array
    {
        return UserArticleCompletion::getProgressSummary($userId);
    }

    // ═══════════════════════════════════════════════════════════════════
    // COMPLETION RECORDING
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Record that a user started an article
     */
    public function recordArticleStart(int $userId, int $articleId): UserArticleCompletion
    {
        $completion = UserArticleCompletion::getOrCreateForUserArticle($userId, $articleId);
        
        if ($completion->isCompleted()) {
            // User is re-attempting a completed article
            $completion->incrementAttempt();
        } elseif ($completion->status === 'in_progress') {
            // User continuing an in-progress attempt, don't increment
        } else {
            $completion->status = 'in_progress';
            $completion->save();
        }

        Log::info('Article started', [
            'user_id' => $userId,
            'article_id' => $articleId,
            'attempt_count' => $completion->attempt_count,
        ]);

        return $completion;
    }

    /**
     * Record that a user completed an article
     */
    public function recordArticleCompletion(
        int $userId, 
        int $articleId, 
        float $accuracy,
        ?int $grammarCheckerId = null,
        ?int $timeSpent = null
    ): UserArticleCompletion {
        $completion = UserArticleCompletion::getOrCreateForUserArticle($userId, $articleId);
        
        // Update time spent
        if ($timeSpent !== null) {
            $completion->total_time_spent += $timeSpent;
        }
        
        $completion->markCompleted($accuracy, $grammarCheckerId);

        Log::info('Article completed', [
            'user_id' => $userId,
            'article_id' => $articleId,
            'accuracy' => $accuracy,
            'status' => $completion->status,
            'next_unlock_at' => $completion->next_unlock_at,
        ]);

        return $completion;
    }

    /**
     * Automatically record completion from GrammarChecker/UserHomophoneAccuracy
     * Call this when user saves their transcription
     */
    public function autoRecordFromAccuracy(UserHomophoneAccuracy $accuracyRecord): ?UserArticleCompletion
    {
        if (!$accuracyRecord->article_id || !$accuracyRecord->user_id) {
            return null;
        }

        return $this->recordArticleCompletion(
            $accuracyRecord->user_id,
            $accuracyRecord->article_id,
            $accuracyRecord->accuracy ?? 0,
            $accuracyRecord->grammar_checker_id,
            $accuracyRecord->reading_time_seconds
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // TYPING MODE FEATURES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get the typing mode and available features for an article
     */
    public function getArticleTypingMode(int $articleId): array
    {
        $setting = ArticleSetting::where('article_id', $articleId)->first();
        
        $mode = $setting?->typing_mode ?? 'nlp_only';
        
        return [
            'mode' => $mode,
            'features' => $this->getFeaturesByMode($mode),
        ];
    }

    /**
     * Get features available for a typing mode
     */
    public function getFeaturesByMode(string $mode): array
    {
        $baseFeatures = [
            'typing' => true,
            'spell_check' => true,
            'accept_correction' => true,
            'reject_correction' => true,
            'audio_playback' => true,
        ];

        if ($mode === 'nlp_la') {
            return array_merge($baseFeatures, [
                'word_explanations' => true,
                'detailed_analytics' => true,
                'progress_charts' => true,
                'error_breakdown' => true,
                'learning_insights' => true,
                'comparison_history' => true,
            ]);
        }

        // nlp_only mode
        return array_merge($baseFeatures, [
            'word_explanations' => false,
            'detailed_analytics' => false,
            'progress_charts' => false,
            'error_breakdown' => false,
            'learning_insights' => false,
            'comparison_history' => false,
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════
    // UNLOCK TIMING
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get remaining time until an article unlocks
     */
    public function getTimeUntilUnlock(int $userId, int $articleId): ?array
    {
        [$isAvailable, $reason, $availableAt] = $this->canUserAccessArticle($userId, $articleId);

        if ($isAvailable || $availableAt === null) {
            return null;
        }

        $now = Carbon::now();
        $diff = $now->diff($availableAt);

        return [
            'available_at' => $availableAt->toIso8601String(),
            'days_remaining' => $diff->days,
            'hours_remaining' => $diff->h,
            'minutes_remaining' => $diff->i,
            'human_readable' => $availableAt->diffForHumans(),
            'total_seconds' => $now->diffInSeconds($availableAt),
        ];
    }

    /**
     * Get next article that will unlock for user
     */
    public function getNextUnlockingArticle(int $userId): ?array
    {
        $articles = $this->getArticlesForUser($userId);
        
        foreach ($articles as $article) {
            if (!$article['is_available'] && $article['available_at'] !== null) {
                return [
                    'article' => $article['article'],
                    'available_at' => $article['available_at'],
                    'time_remaining' => $this->getTimeUntilUnlock($userId, $article['article']->id),
                ];
            }
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Check if all required articles are completed
     */
    public function hasCompletedAllRequired(int $userId): bool
    {
        $requiredCount = ArticleSetting::active()
            ->where('is_required', true)
            ->count();

        $completedCount = UserArticleCompletion::forUser($userId)
            ->completed()
            ->whereHas('article.setting', function ($q) {
                $q->where('is_required', true);
            })
            ->count();

        return $completedCount >= $requiredCount;
    }

    /**
     * Get the current article the user should work on
     */
    public function getCurrentArticleForUser(int $userId): ?array
    {
        $articles = $this->getArticlesForUser($userId);

        foreach ($articles as $article) {
            // Return first available but not completed article
            if ($article['is_available'] && !$article['is_completed']) {
                return $article;
            }
        }

        // All articles completed or none available
        return null;
    }
}