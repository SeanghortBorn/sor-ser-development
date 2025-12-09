<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected function model(): string
    {
        return User::class;
    }

    public function getAllWithRolesAndPermissions(): Collection
    {
        return $this->with(['roles', 'permissions'])
            ->orderBy('name', 'asc')
            ->all();
    }

    public function getByRole(string $roleName): Collection
    {
        return User::whereHas('roles', function ($query) use ($roleName) {
            $query->where('name', $roleName);
        })
        ->with(['roles', 'permissions'])
        ->orderBy('name', 'asc')
        ->get();
    }

    public function getUserWithAnalytics(int $userId): ?User
    {
        return User::with([
            'roles',
            'permissions',
            'grammarCheckers',
            'comparisonActivities',
            'typingActivities',
            'quizAttempts.quiz.questions',
            'homophoneAccuracies',
        ])
        ->withCount([
            'grammarCheckers as total_articles',
            'comparisonActivities as accepts' => fn($q) => $q->where('action', 'accept'),
            'comparisonActivities as dismiss' => fn($q) => $q->where('action', 'dismiss'),
            'typingActivities as total_typings' => fn($q) => $q->where('status', 1),
            'typingActivities as incorrect_typings' => fn($q) => $q->where('status', 0),
        ])
        ->find($userId);
    }

    public function getAllWithAnalytics(): Collection
    {
        return User::with([
            'roles',
            'permissions',
            'quizAttempts' => function ($query) {
                $query->with(['quiz' => function ($q) {
                    $q->withCount('questions');
                }]);
            },
            'homophoneAccuracies',
        ])
        ->withCount([
            'grammarCheckers as total_articles',
            'comparisonActivities as accepts' => fn($q) => $q->where('action', 'accept'),
            'comparisonActivities as dismiss' => fn($q) => $q->where('action', 'dismiss'),
            'typingActivities as total_typings' => fn($q) => $q->where('status', 1),
            'typingActivities as incorrect_typings' => fn($q) => $q->where('status', 0),
        ])
        ->orderBy('name', 'asc')
        ->get();
    }

    public function getUsersWhoCompletedArticle(int $articleId): Collection
    {
        return User::whereHas('completions', function ($query) use ($articleId) {
            $query->where('article_id', $articleId)
                ->where('status', 'completed');
        })
        ->with(['roles'])
        ->orderBy('name', 'asc')
        ->get();
    }

    public function search(string $term): Collection
    {
        return User::where('name', 'like', "%{$term}%")
            ->orWhere('email', 'like', "%{$term}%")
            ->with(['roles', 'permissions'])
            ->orderBy('name', 'asc')
            ->get();
    }

    public function getActiveStudents(): Collection
    {
        return User::whereHas('roles', function ($query) {
            $query->where('name', 'student');
        })
        ->where('is_active', true)
        ->with(['roles'])
        ->orderBy('name', 'asc')
        ->get();
    }

    public function getUserProgressSummary(int $userId): array
    {
        $user = $this->getUserWithAnalytics($userId);

        if (!$user) {
            return [];
        }

        // Calculate quiz averages
        $quizData = $user->quizAttempts->map(function ($attempt) {
            $totalQuestions = $attempt->quiz->questions_count ?? 0;
            $percentage = $totalQuestions > 0 ? ($attempt->score / $totalQuestions) * 100 : 0;
            return [
                'score' => $attempt->score,
                'total' => $totalQuestions,
                'percentage' => round($percentage, 2),
            ];
        });

        // Calculate homophone average
        $homophoneAvg = $user->homophoneAccuracies->avg('accuracy') ?? 0;

        // Calculate typing accuracy
        $totalTypings = $user->total_typings ?? 0;
        $incorrectTypings = $user->incorrect_typings ?? 0;
        $correctTypings = $totalTypings - $incorrectTypings;
        $typingAccuracy = $totalTypings > 0 ? ($correctTypings / $totalTypings) * 100 : 0;

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'total_articles' => $user->total_articles ?? 0,
            'accepts' => $user->accepts ?? 0,
            'dismissals' => $user->dismiss ?? 0,
            'homophone_avg' => round($homophoneAvg, 2),
            'quiz_attempts' => $user->quizAttempts->count(),
            'quiz_data' => $quizData,
            'typing_accuracy' => round($typingAccuracy, 2),
            'total_typings' => $totalTypings,
            'correct_typings' => $correctTypings,
            'incorrect_typings' => $incorrectTypings,
        ];
    }
}
