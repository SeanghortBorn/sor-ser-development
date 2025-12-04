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
     * UPDATED: Now uses min_completion_percentage from settings
     */
    public function canUserAccessArticle(int $userId, int $articleId): array
    {
        $setting = ArticleSetting::where('article_id', $articleId)->first();
        
        // If no setting or article is inactive
        if (!$setting || !$setting->is_active) {
            return [false, 'Article not available', null];
        }

        // Always available mode
        if ($setting->availability_mode === 'always') {
            return [true, 'Always available', null];
        }

        // Check if user has completed prerequisite
        if ($setting->prerequisite_article_id) {
            $prerequisiteCompletion = UserArticleCompletion::where([
                'user_id' => $userId,
                'article_id' => $setting->prerequisite_article_id,
            ])->first();

            // Get the prerequisite's minimum completion percentage
            $prerequisiteSetting = ArticleSetting::where('article_id', $setting->prerequisite_article_id)->first();
            $minPercentage = $prerequisiteSetting->min_completion_percentage ?? 70.00;

            // Check if prerequisite is completed with required accuracy
            if (!$prerequisiteCompletion || 
                $prerequisiteCompletion->best_accuracy < $minPercentage) {
                
                $prerequisiteTitle = Article::find($setting->prerequisite_article_id)->title ?? 'previous article';
                return [
                    false, 
                    "Complete '{$prerequisiteTitle}' with at least {$minPercentage}% accuracy first",
                    null
                ];
            }

            // Sequential mode: prerequisite completed, allow access
            if ($setting->availability_mode === 'sequential') {
                return [true, 'Prerequisite completed', null];
            }

            // Time-gated mode: check if enough time has passed
            if ($setting->availability_mode === 'time_gated') {
                $delaySeconds = ($setting->unlock_delay_days * 24 * 3600) + 
                              ($setting->unlock_delay_hours * 3600);
                
                $unlockTime = $prerequisiteCompletion->completed_at->addSeconds($delaySeconds);
                
                if (now()->lt($unlockTime)) {
                    $remaining = now()->diff($unlockTime);
                    $message = sprintf(
                        'Unlocks in %d days, %d hours',
                        $remaining->days,
                        $remaining->h
                    );
                    return [false, $message, $unlockTime];
                }
                
                return [true, 'Time delay met', null];
            }
        }

        return [false, 'Unknown availability mode', null];
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

    /**
     * Get effective typing mode for user on specific article
     * Takes into account both article settings and user role
     * 
     * @param int $articleId
     * @param int|User $user User ID or User model
     * @return string 'nlp_only' or 'nlp_la'
     */
    public function getEffectiveTypingMode($articleId, $user): string
    {
        // Get user model if ID provided
        if (!($user instanceof \App\Models\User)) {
            $user = \App\Models\User::findOrFail($user);
        }

        // Get article settings
        $settings = \App\Models\ArticleSetting::where('article_id', $articleId)->first();
        
        // If no settings, default to nlp_la
        if (!$settings) {
            return 'nlp_la';
        }

        $articleTypingMode = $settings->typing_mode;

        // Case 1: Article set to "nlp_only" → ALL users get nlp_only
        if ($articleTypingMode === 'nlp_only') {
            return 'nlp_only';
        }

        // Case 2: Article set to "none" (adaptive) → Use user's role default
        if ($articleTypingMode === 'none') {
            return $this->getUserDefaultTypingMode($user);
        }

        // Case 3: Article set to "nlp_la" → Respect user's role
        if ($articleTypingMode === 'nlp_la') {
            $userDefault = $this->getUserDefaultTypingMode($user);
            
            // If user is nlp_only group, they can't access nlp_la features
            if ($userDefault === 'nlp_only') {
                return 'nlp_only';
            }
            
            // User has nlp_la access
            return 'nlp_la';
        }

        // Fallback
        return 'nlp_la';
    }

    /**
     * Get user's default typing mode based on their role
     * 
     * @param User $user
     * @return string 'nlp_only' or 'nlp_la'
     */
    protected function getUserDefaultTypingMode($user): string
    {
        // Admin always gets full features
        if ($user->hasRole('Admin') || $user->hasRole('admin')) {
            return 'nlp_la';
        }

        // Check role name for typing mode hints
        $roleName = $user->roles->first()->name ?? '';
        
        // If role name contains "NLP-only" or "basic" → nlp_only
        if (stripos($roleName, 'NLP-only') !== false || 
            stripos($roleName, 'basic') !== false ||
            stripos($roleName, 'Group A') !== false) {
            return 'nlp_only';
        }

        // If role name contains "NLP+LA" or "full" or "advanced" → nlp_la
        if (stripos($roleName, 'NLP+LA') !== false || 
            stripos($roleName, 'full') !== false ||
            stripos($roleName, 'Group B') !== false ||
            stripos($roleName, 'advanced') !== false) {
            return 'nlp_la';
        }

        // Check permissions - if user has advanced permissions, give nlp_la
        if ($user->can('article-create') || $user->can('quiz-create')) {
            return 'nlp_la';
        }

        // Default to nlp_only for safety
        return 'nlp_only';
    }

    /**
     * Get all available articles for a specific user
     * Returns only articles that user can currently access
     * 
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAvailableArticles($userId)
    {
        $allArticles = \App\Models\Article::with(['file', 'audio'])->orderBy('id', 'asc')->get();
        $availableArticles = [];

        foreach ($allArticles as $article) {
            [$canAccess, $message, $unlockTime] = $this->canUserAccessArticle($userId, $article->id);
            
            if ($canAccess) {
                // Add typing mode info
                $article->effective_typing_mode = $this->getEffectiveTypingMode($article->id, $userId);
                $article->typing_mode_label = $article->effective_typing_mode === 'nlp_only' ? 'Basic' : 'Full Features';
                $availableArticles[] = $article;
            }
        }

        return collect($availableArticles);
    }

    /**
     * Get ALL articles (locked and unlocked) with status for user
     * NEW: For showing all articles in dropdown with locked ones disabled
     * 
     * @param int $userId
     * @return \Illuminate\Support\Collection
     */
    public function getAllArticlesWithStatus($userId)
    {
        $allArticles = \App\Models\Article::with(['file', 'audio', 'setting'])
            ->whereHas('setting', function ($query) {
                $query->where('is_active', true);
            })
            ->get()
            ->sortBy(function ($article) {
                return $article->setting->display_order ?? 999;
            })
            ->values();

        return $allArticles->map(function ($article) use ($userId) {
            [$canAccess, $lockMessage, $unlockTime] = $this->canUserAccessArticle($userId, $article->id);
            
            // Get typing mode
            $typingMode = $this->getEffectiveTypingMode($article->id, $userId);
            
            // Get completion status
            $completion = UserArticleCompletion::where([
                'user_id' => $userId,
                'article_id' => $article->id,
            ])->first();
            
            return [
                'id' => $article->id,
                'title' => $article->title,
                'audios_id' => $article->audios_id,
                'can_access' => $canAccess,
                'is_locked' => !$canAccess,
                'lock_message' => $lockMessage,
                'unlock_time' => $unlockTime,
                'typing_mode' => $typingMode,
                'display_order' => $article->setting->display_order ?? 999,
                'best_accuracy' => $completion->best_accuracy ?? null,
                'attempt_count' => $completion->attempt_count ?? 0,
                'is_completed' => $completion && $completion->status === 'completed',
                // All unlock criteria
                'min_completion_percentage' => $article->setting->min_completion_percentage ?? 70.00,
                'min_completion_accuracy' => $article->setting->min_completion_accuracy ?? null,
                'max_attempts' => $article->setting->max_attempts ?? null,
                'unlock_delay_days' => $article->setting->unlock_delay_days ?? 0,
                'unlock_delay_hours' => $article->setting->unlock_delay_hours ?? 0,
                'availability_mode' => $article->setting->availability_mode ?? 'sequential',
                'prerequisite_article_id' => $article->setting->prerequisite_article_id ?? null,
            ];
        });
    }
}