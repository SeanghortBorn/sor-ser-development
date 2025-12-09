<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface extends RepositoryInterface
{
    /**
     * Get users with their roles and permissions.
     */
    public function getAllWithRolesAndPermissions(): Collection;

    /**
     * Get users by role.
     */
    public function getByRole(string $roleName): Collection;

    /**
     * Get user with all analytics data.
     */
    public function getUserWithAnalytics(int $userId): ?User;

    /**
     * Get all users with analytics data for dashboard.
     */
    public function getAllWithAnalytics(): Collection;

    /**
     * Get users who have completed a specific article.
     */
    public function getUsersWhoCompletedArticle(int $articleId): Collection;

    /**
     * Search users by name or email.
     */
    public function search(string $term): Collection;

    /**
     * Get active students only.
     */
    public function getActiveStudents(): Collection;

    /**
     * Get user progress summary.
     */
    public function getUserProgressSummary(int $userId): array;
}
