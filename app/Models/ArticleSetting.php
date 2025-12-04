<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ArticleSetting extends Model
{
    /**
     * ArticleSetting Model
     * 
     * Handles all article progression settings including:
     * - Ordering and sequencing
     * - Time gating
     * - Typing modes
     * - Availability modes
     * - Completion thresholds (NEW in FIX21)
     * - Group-specific redirects (NEW in FIX21)
     */
    
    protected $fillable = [
        'article_id',
        'display_order',
        'prerequisite_article_id',
        'unlock_delay_days',
        'unlock_delay_hours',
        'availability_mode',
        'typing_mode',
        'slug',
        'category',
        'description',
        'admin_notes',
        'is_active',
        'is_required',
        'max_attempts',
        'min_completion_accuracy',
        'min_completion_percentage',  // NEW: Threshold for unlocking next article
        'group_a_redirect',           // NEW: Redirect URL for Group A users
        'group_b_redirect',           // NEW: Redirect URL for Group B users
    ];

    protected $casts = [
        'display_order' => 'integer',
        'unlock_delay_days' => 'integer',
        'unlock_delay_hours' => 'integer',
        'is_active' => 'boolean',
        'is_required' => 'boolean',
        'max_attempts' => 'integer',
        'min_completion_accuracy' => 'decimal:2',
        'min_completion_percentage' => 'decimal:2', // NEW
    ];

    // ═══════════════════════════════════════════════════════════════════
    // RELATIONSHIPS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get the article this setting belongs to
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Get the prerequisite article (if any)
     */
    public function prerequisiteArticle(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'prerequisite_article_id');
    }

    // ═══════════════════════════════════════════════════════════════════
    // SCOPES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Only active articles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Ordered by display_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc');
    }

    /**
     * Filter by typing mode
     */
    public function scopeTypingMode($query, string $mode)
    {
        return $query->where('typing_mode', $mode);
    }

    /**
     * Filter by availability mode
     */
    public function scopeAvailabilityMode($query, string $mode)
    {
        return $query->where('availability_mode', $mode);
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get total unlock delay in hours
     */
    public function getTotalUnlockDelayHours(): int
    {
        return ($this->unlock_delay_days * 24) + $this->unlock_delay_hours;
    }

    /**
     * Get human-readable unlock delay string
     * Example: "10 days", "1 day 12 hours", "Immediately"
     */
    public function getUnlockDelayTextAttribute(): string
    {
        $days = $this->unlock_delay_days ?? 0;
        $hours = $this->unlock_delay_hours ?? 0;

        if ($days === 0 && $hours === 0) {
            return 'Immediately';
        }

        $parts = [];
        
        if ($days > 0) {
            $parts[] = $days . ' ' . ($days === 1 ? 'day' : 'days');
        }
        
        if ($hours > 0) {
            $parts[] = $hours . ' ' . ($hours === 1 ? 'hour' : 'hours');
        }

        return implode(' ', $parts);
    }

    /**
     * Get human-readable availability mode
     */
    public function getAvailabilityModeTextAttribute(): string
    {
        return match($this->availability_mode) {
            'always' => 'Always Available',
            'sequential' => 'Sequential (requires prerequisite)',
            'time_gated' => 'Time-Gated (requires prerequisite + waiting period)',
            default => 'Unknown',
        };
    }

    /**
     * Get human-readable typing mode
     */
    public function getTypingModeTextAttribute(): string
    {
        return match($this->typing_mode) {
            'nlp_only' => 'NLP Only (Basic features)',
            'nlp_la' => 'NLP + LA (Full features with analytics)',
            'none' => 'Adaptive (based on user role)',
            default => 'Unknown',
        };
    }

    /**
     * Check if this article has a prerequisite
     */
    public function hasPrerequisite(): bool
    {
        return $this->prerequisite_article_id !== null;
    }

    /**
     * Check if this article has a time delay
     */
    public function hasTimeDelay(): bool
    {
        return $this->getTotalUnlockDelayHours() > 0;
    }

    /**
     * Check if this is an NLP+LA (full features) article
     */
    public function isFullFeatureMode(): bool
    {
        return $this->typing_mode === 'nlp_la';
    }

    /**
     * NEW: Get formatted completion percentage for display
     */
    public function getMinCompletionPercentageFormattedAttribute(): string
    {
        $percentage = $this->min_completion_percentage ?? 70;
        return number_format($percentage, 0) . '%';
    }

    /**
     * NEW: Get completion threshold as decimal (for comparisons)
     */
    public function getCompletionThresholdAttribute(): float
    {
        return (float) ($this->min_completion_percentage ?? 70.00);
    }

    // ═══════════════════════════════════════════════════════════════════
    // STATIC HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get all articles in order with their settings
     */
    public static function getOrderedArticles()
    {
        return static::with(['article.file', 'article.audio', 'prerequisiteArticle'])
            ->active()
            ->ordered()
            ->get();
    }

    /**
     * Get the next article in sequence after a given article
     */
    public static function getNextArticle(int $currentArticleId): ?ArticleSetting
    {
        $currentSetting = static::where('article_id', $currentArticleId)->first();
        
        if (!$currentSetting) {
            return null;
        }

        return static::where('display_order', '>', $currentSetting->display_order)
            ->active()
            ->ordered()
            ->first();
    }

    /**
     * Create or get settings for an article
     */
    public static function getOrCreateForArticle(int $articleId): ArticleSetting
    {
        return static::firstOrCreate(
            ['article_id' => $articleId],
            [
                'display_order' => static::max('display_order') + 1,
                'availability_mode' => 'sequential',
                'typing_mode' => 'nlp_only',
                'is_active' => true,
                'is_required' => true,
                'min_completion_percentage' => 70.00, // Default threshold
            ]
        );
    }
}