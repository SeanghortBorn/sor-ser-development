<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    // Cache TTL constants (in seconds)
    const SHORT_TTL = 300;      // 5 minutes
    const MEDIUM_TTL = 1800;    // 30 minutes
    const LONG_TTL = 3600;      // 1 hour
    const DAY_TTL = 86400;      // 24 hours

    /**
     * Get user progress data with caching.
     */
    public function getUserProgress(int $userId, callable $callback): array
    {
        $key = "user_progress_{$userId}";
        return Cache::remember($key, self::SHORT_TTL, $callback);
    }

    /**
     * Invalidate user progress cache.
     */
    public function invalidateUserProgress(int $userId): bool
    {
        $key = "user_progress_{$userId}";
        return Cache::forget($key);
    }

    /**
     * Get all articles with caching.
     */
    public function getArticles(callable $callback): mixed
    {
        $key = "articles_all";
        return Cache::remember($key, self::DAY_TTL, $callback);
    }

    /**
     * Invalidate articles cache.
     */
    public function invalidateArticles(): bool
    {
        return Cache::forget("articles_all");
    }

    /**
     * Get user permissions with caching.
     */
    public function getUserPermissions(int $userId, callable $callback): array
    {
        $key = "user_permissions_{$userId}";
        return Cache::remember($key, self::SHORT_TTL, $callback);
    }

    /**
     * Invalidate user permissions cache.
     */
    public function invalidateUserPermissions(int $userId): bool
    {
        $key = "user_permissions_{$userId}";
        return Cache::forget($key);
    }

    /**
     * Get homophone data with caching.
     */
    public function getHomophones(callable $callback): mixed
    {
        $key = "homophones_active";
        return Cache::remember($key, self::LONG_TTL, $callback);
    }

    /**
     * Invalidate homophones cache.
     */
    public function invalidateHomophones(): bool
    {
        return Cache::forget("homophones_active");
    }

    /**
     * Get quiz data with caching.
     */
    public function getQuiz(int $quizId, callable $callback): mixed
    {
        $key = "quiz_{$quizId}";
        return Cache::remember($key, self::LONG_TTL, $callback);
    }

    /**
     * Invalidate quiz cache.
     */
    public function invalidateQuiz(int $quizId): bool
    {
        $key = "quiz_{$quizId}";
        return Cache::forget($key);
    }

    /**
     * Get analytics data with caching.
     */
    public function getAnalytics(string $type, callable $callback): mixed
    {
        $key = "analytics_{$type}";
        return Cache::remember($key, self::MEDIUM_TTL, $callback);
    }

    /**
     * Invalidate analytics cache.
     */
    public function invalidateAnalytics(string $type): bool
    {
        $key = "analytics_{$type}";
        return Cache::forget($key);
    }

    /**
     * Get platform stats with caching.
     */
    public function getPlatformStats(callable $callback): array
    {
        $key = "platform_stats";
        return Cache::remember($key, self::LONG_TTL, $callback);
    }

    /**
     * Invalidate platform stats cache.
     */
    public function invalidatePlatformStats(): bool
    {
        return Cache::forget("platform_stats");
    }

    /**
     * Generic cache method with custom key and TTL.
     */
    public function remember(string $key, int $ttl, callable $callback): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Generic cache invalidation.
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Flush all cache.
     */
    public function flush(): bool
    {
        return Cache::flush();
    }

    /**
     * Invalidate all user-related caches.
     */
    public function invalidateUserCaches(int $userId): bool
    {
        $this->invalidateUserProgress($userId);
        $this->invalidateUserPermissions($userId);
        $this->invalidateAnalytics('student');
        return true;
    }

    /**
     * Invalidate all article-related caches.
     */
    public function invalidateArticleCaches(): bool
    {
        $this->invalidateArticles();
        return true;
    }

    /**
     * Warm cache with frequently accessed data.
     */
    public function warmCache(): void
    {
        // This would be called by a scheduled command
        // to pre-populate cache with commonly accessed data

        // Example: Cache all active articles
        $this->getArticles(function () {
            return \App\Models\Article::with(['file', 'audio', 'setting'])
                ->where('is_active', true)
                ->get();
        });

        // Example: Cache all active homophones
        $this->getHomophones(function () {
            return \App\Models\Homophone::with('variants')
                ->where('is_active', true)
                ->get();
        });

        // Example: Cache platform stats
        $this->getPlatformStats(function () {
            return [
                'total_users' => \App\Models\User::count(),
                'total_articles' => \App\Models\Article::count(),
                'total_homophones' => \App\Models\Homophone::where('is_active', true)->count(),
            ];
        });
    }

    /**
     * Get cache statistics.
     */
    public function getStats(): array
    {
        // This would require a cache driver that supports statistics
        // For now, return basic info
        return [
            'driver' => config('cache.default'),
            'prefix' => config('cache.prefix'),
        ];
    }
}
