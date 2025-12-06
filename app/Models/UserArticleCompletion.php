<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class UserArticleCompletion extends Model
{
    /**
     * UserArticleCompletion Model
     * 
     * Tracks user progress through articles and determines unlock status
     */
    
    protected $fillable = [
        'user_id',
        'article_id',
        'completed_at',
        'best_accuracy',
        'typing_speed',
        'attempt_count',
        'grammar_checker_id',
        'next_unlock_at',
        'status',
        'total_time_spent',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'next_unlock_at' => 'datetime',
        'best_accuracy' => 'decimal:2',
        'typing_speed' => 'decimal:2',
        'attempt_count' => 'integer',
        'total_time_spent' => 'integer',
    ];

    // ═══════════════════════════════════════════════════════════════════
    // RELATIONSHIPS
    // ═══════════════════════════════════════════════════════════════════

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function grammarChecker(): BelongsTo
    {
        return $this->belongsTo(GrammarChecker::class);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SCOPES
    // ═══════════════════════════════════════════════════════════════════

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['completed', 'passed']);
    }

    public function scopePassed($query)
    {
        return $query->where('status', 'passed');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    // ═══════════════════════════════════════════════════════════════════
    // STATUS HELPERS
    // ═══════════════════════════════════════════════════════════════════

    public function isCompleted(): bool
    {
        return in_array($this->status, ['completed', 'passed']);
    }

    public function isPassed(): bool
    {
        return $this->status === 'passed';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    // ═══════════════════════════════════════════════════════════════════
    // COMPLETION & UNLOCK LOGIC
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Mark article as completed and calculate next unlock time
     */
    public function markCompleted(float $accuracy, ?float $typingSpeed = null, ?int $grammarCheckerId = null): void
    {
        $articleSetting = ArticleSetting::where('article_id', $this->article_id)->first();

        // Update best accuracy if this attempt is better
        if ($accuracy > ($this->best_accuracy ?? 0)) {
            $this->best_accuracy = $accuracy;
        }

        // Update typing speed
        if ($typingSpeed !== null) {
            $this->typing_speed = $typingSpeed;
        }

        $this->completed_at = Carbon::now();
        $this->grammar_checker_id = $grammarCheckerId;
        $this->attempt_count = ($this->attempt_count ?? 0) + 1;

        // Determine status based on minimum accuracy requirement
        if ($articleSetting && $articleSetting->min_completion_accuracy !== null) {
            $this->status = $accuracy >= $articleSetting->min_completion_accuracy
                ? 'passed'
                : 'failed';
        } else {
            // No minimum accuracy required, just completing counts as passed
            $this->status = 'completed';
        }

        // Calculate when the NEXT article unlocks
        $nextArticleSetting = ArticleSetting::getNextArticle($this->article_id);
        if ($nextArticleSetting && $nextArticleSetting->hasTimeDelay()) {
            $this->next_unlock_at = Carbon::now()
                ->addDays($nextArticleSetting->unlock_delay_days)
                ->addHours($nextArticleSetting->unlock_delay_hours);
        }

        $this->save();
    }

    /**
     * Increment attempt count (when user starts but doesn't complete)
     */
    public function incrementAttempt(): void
    {
        $this->increment('attempt_count');
        
        if ($this->status === 'failed') {
            // Reset to in_progress when retrying
            $this->status = 'in_progress';
            $this->save();
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // STATIC METHODS FOR CHECKING AVAILABILITY
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Check if an article is available for a user
     * Returns: [bool $isAvailable, string $reason, ?Carbon $availableAt]
     */
    public static function checkArticleAvailability(int $userId, int $articleId): array
    {
        $articleSetting = ArticleSetting::where('article_id', $articleId)->first();

        // No settings = always available (default behavior for legacy articles)
        if (!$articleSetting) {
            return [true, 'No restrictions', null];
        }

        // Not active = not available
        if (!$articleSetting->is_active) {
            return [false, 'This article is currently not available', null];
        }

        // Always available mode
        if ($articleSetting->availability_mode === 'always') {
            return [true, 'Always available', null];
        }

        // Check prerequisite completion
        if ($articleSetting->hasPrerequisite()) {
            $prerequisiteCompletion = static::where('user_id', $userId)
                ->where('article_id', $articleSetting->prerequisite_article_id)
                ->completed()
                ->first();

            if (!$prerequisiteCompletion) {
                $prerequisiteArticle = Article::find($articleSetting->prerequisite_article_id);
                $prerequisiteName = $prerequisiteArticle?->title ?? 'previous article';
                return [
                    false, 
                    "Please complete '{$prerequisiteName}' first", 
                    null
                ];
            }

            // Check time gating
            if ($articleSetting->availability_mode === 'time_gated' && $articleSetting->hasTimeDelay()) {
                $unlockAt = $prerequisiteCompletion->completed_at
                    ->copy()
                    ->addDays($articleSetting->unlock_delay_days)
                    ->addHours($articleSetting->unlock_delay_hours);

                if (Carbon::now()->lt($unlockAt)) {
                    $waitTime = Carbon::now()->diffForHumans($unlockAt, [
                        'syntax' => Carbon::DIFF_ABSOLUTE,
                        'parts' => 2,
                    ]);
                    return [
                        false, 
                        "Available in {$waitTime}", 
                        $unlockAt
                    ];
                }
            }
        }

        // Check max attempts
        if ($articleSetting->max_attempts !== null) {
            $currentCompletion = static::where('user_id', $userId)
                ->where('article_id', $articleId)
                ->first();
            
            if ($currentCompletion && $currentCompletion->attempt_count >= $articleSetting->max_attempts) {
                return [
                    false, 
                    "Maximum attempts ({$articleSetting->max_attempts}) reached", 
                    null
                ];
            }
        }

        return [true, 'Available', null];
    }

    /**
     * Get all articles with availability status for a user
     */
    public static function getArticlesWithStatus(int $userId): array
    {
        $articles = ArticleSetting::with(['article.file', 'article.audio', 'prerequisiteArticle'])
            ->active()
            ->ordered()
            ->get();

        $result = [];
        
        foreach ($articles as $setting) {
            [$isAvailable, $reason, $availableAt] = static::checkArticleAvailability(
                $userId, 
                $setting->article_id
            );

            $completion = static::where('user_id', $userId)
                ->where('article_id', $setting->article_id)
                ->first();

            $result[] = [
                'article' => $setting->article,
                'setting' => $setting,
                'is_available' => $isAvailable,
                'availability_reason' => $reason,
                'available_at' => $availableAt,
                'completion' => $completion,
                'is_completed' => $completion?->isCompleted() ?? false,
                'is_passed' => $completion?->isPassed() ?? false,
                'best_accuracy' => $completion?->best_accuracy,
                'attempt_count' => $completion?->attempt_count ?? 0,
            ];
        }

        return $result;
    }

    /**
     * Get or create a completion record for a user-article pair
     */
    public static function getOrCreateForUserArticle(int $userId, int $articleId): self
    {
        return static::firstOrCreate(
            [
                'user_id' => $userId,
                'article_id' => $articleId,
            ],
            [
                'status' => 'in_progress',
                'attempt_count' => 0,
            ]
        );
    }

    /**
     * Get user's progress summary
     */
    public static function getProgressSummary(int $userId): array
    {
        $totalArticles = ArticleSetting::active()->count();
        $completedCount = static::forUser($userId)->completed()->count();
        $passedCount = static::forUser($userId)->passed()->count();
        $inProgressCount = static::forUser($userId)->inProgress()->count();

        $latestCompletion = static::forUser($userId)
            ->completed()
            ->latest('completed_at')
            ->with('article')
            ->first();

        return [
            'total_articles' => $totalArticles,
            'completed_count' => $completedCount,
            'passed_count' => $passedCount,
            'in_progress_count' => $inProgressCount,
            'completion_percentage' => $totalArticles > 0 
                ? round(($completedCount / $totalArticles) * 100, 1) 
                : 0,
            'latest_completion' => $latestCompletion,
        ];
    }
}