<?php

namespace App\Repositories\Contracts;

use App\Models\Article;
use Illuminate\Database\Eloquent\Collection;

interface ArticleRepositoryInterface extends RepositoryInterface
{
    /**
     * Get articles with their settings and files.
     */
    public function getAllWithRelations(): Collection;

    /**
     * Get active articles only.
     */
    public function getActive(): Collection;

    /**
     * Get articles by category.
     */
    public function getByCategory(int $categoryId): Collection;

    /**
     * Get articles accessible by a user.
     */
    public function getAccessibleForUser(int $userId): Collection;

    /**
     * Get articles with completion status for a user.
     */
    public function getWithCompletionStatus(int $userId): Collection;

    /**
     * Search articles by title or content.
     */
    public function search(string $term): Collection;

    /**
     * Get articles ordered by custom order field.
     */
    public function getOrderedArticles(): Collection;

    /**
     * Get article with all related data (file, audio, setting, tags).
     */
    public function getFullArticle(int $articleId): ?Article;
}
