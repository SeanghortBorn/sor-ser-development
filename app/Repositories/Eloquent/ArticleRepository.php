<?php

namespace App\Repositories\Eloquent;

use App\Models\Article;
use App\Repositories\Contracts\ArticleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ArticleRepository extends BaseRepository implements ArticleRepositoryInterface
{
    protected function model(): string
    {
        return Article::class;
    }

    public function getAllWithRelations(): Collection
    {
        return $this->with(['file', 'audio', 'setting', 'category'])
            ->orderBy('order', 'asc')
            ->all();
    }

    public function getActive(): Collection
    {
        return $this->where('is_active', '=', true)
            ->orderBy('order', 'asc')
            ->all();
    }

    public function getByCategory(int $categoryId): Collection
    {
        return $this->where('category_id', '=', $categoryId)
            ->with(['file', 'audio', 'setting'])
            ->orderBy('order', 'asc')
            ->all();
    }

    public function getAccessibleForUser(int $userId): Collection
    {
        return Article::with(['file', 'audio', 'setting'])
            ->whereHas('setting', function ($query) {
                $query->where('availability_mode', 'always');
            })
            ->orWhereHas('completions', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('status', 'completed');
            })
            ->orderBy('order', 'asc')
            ->get();
    }

    public function getWithCompletionStatus(int $userId): Collection
    {
        return Article::with([
            'file',
            'audio',
            'setting',
            'completions' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }
        ])
        ->orderBy('order', 'asc')
        ->get()
        ->map(function ($article) {
            $article->is_completed = $article->completions->where('status', 'completed')->isNotEmpty();
            $article->completion_data = $article->completions->first();
            return $article;
        });
    }

    public function search(string $term): Collection
    {
        return Article::where('title', 'like', "%{$term}%")
            ->orWhere('content', 'like', "%{$term}%")
            ->with(['file', 'audio', 'setting'])
            ->orderBy('order', 'asc')
            ->get();
    }

    public function getOrderedArticles(): Collection
    {
        return $this->with(['file', 'audio', 'setting'])
            ->orderBy('order', 'asc')
            ->all();
    }

    public function getFullArticle(int $articleId): ?Article
    {
        return Article::with([
            'file',
            'audio',
            'setting',
            'tags',
            'category',
            'completions'
        ])->find($articleId);
    }
}
