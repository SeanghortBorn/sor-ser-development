<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsRepository implements AnalyticsRepositoryInterface
{
    public function getStudentAnalytics(): Collection
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
        ->get()
        ->map(function ($user) {
            // Calculate quiz averages
            $quizData = $user->quizAttempts->map(function ($attempt) {
                $totalQuestions = $attempt->quiz->questions_count ?? 0;
                $percentage = $totalQuestions > 0 ? ($attempt->score / $totalQuestions) * 100 : 0;
                return [
                    'quiz_id' => $attempt->quiz_id,
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
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
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
        });
    }

    public function getUserAnalytics(int $userId): array
    {
        $user = User::with([
            'roles',
            'permissions',
            'quizAttempts.quiz.questions',
            'homophoneAccuracies',
            'grammarCheckers',
            'comparisonActivities',
            'typingActivities',
        ])
        ->withCount([
            'grammarCheckers as total_articles',
            'comparisonActivities as accepts' => fn($q) => $q->where('action', 'accept'),
            'comparisonActivities as dismiss' => fn($q) => $q->where('action', 'dismiss'),
            'typingActivities as total_typings' => fn($q) => $q->where('status', 1),
            'typingActivities as incorrect_typings' => fn($q) => $q->where('status', 0),
        ])
        ->find($userId);

        if (!$user) {
            return [];
        }

        return $this->formatUserAnalytics($user);
    }

    public function getHomophoneAccuracyStats(int $userId): array
    {
        $accuracies = DB::table('user_homophone_accuracies')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $average = $accuracies->avg('accuracy') ?? 0;
        $highest = $accuracies->max('accuracy') ?? 0;
        $lowest = $accuracies->min('accuracy') ?? 0;

        return [
            'average' => round($average, 2),
            'highest' => round($highest, 2),
            'lowest' => round($lowest, 2),
            'total_checks' => $accuracies->count(),
            'recent_checks' => $accuracies->toArray(),
        ];
    }

    public function getQuizPerformanceStats(int $userId): array
    {
        $attempts = DB::table('quiz_attempts')
            ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
            ->where('quiz_attempts.user_id', $userId)
            ->select(
                'quiz_attempts.*',
                'quizzes.title as quiz_title',
                DB::raw('(SELECT COUNT(*) FROM quiz_questions WHERE quiz_questions.quiz_id = quizzes.id) as total_questions')
            )
            ->orderBy('quiz_attempts.created_at', 'desc')
            ->get();

        $averageScore = $attempts->avg(function ($attempt) {
            return $attempt->total_questions > 0
                ? ($attempt->score / $attempt->total_questions) * 100
                : 0;
        });

        return [
            'total_attempts' => $attempts->count(),
            'average_score' => round($averageScore ?? 0, 2),
            'attempts' => $attempts->map(function ($attempt) {
                $percentage = $attempt->total_questions > 0
                    ? ($attempt->score / $attempt->total_questions) * 100
                    : 0;
                return [
                    'quiz_title' => $attempt->quiz_title,
                    'score' => $attempt->score,
                    'total' => $attempt->total_questions,
                    'percentage' => round($percentage, 2),
                    'date' => $attempt->created_at,
                ];
            })->toArray(),
        ];
    }

    public function getTypingActivityStats(int $userId): array
    {
        $typings = DB::table('user_typing_activities')
            ->where('user_id', $userId)
            ->select(
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as correct'),
                DB::raw('SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as incorrect')
            )
            ->first();

        $accuracy = $typings->total > 0
            ? ($typings->correct / $typings->total) * 100
            : 0;

        return [
            'total' => $typings->total,
            'correct' => $typings->correct,
            'incorrect' => $typings->incorrect,
            'accuracy' => round($accuracy, 2),
        ];
    }

    public function getComparisonActivityStats(int $userId): array
    {
        $activities = DB::table('user_comparison_activities')
            ->where('user_id', $userId)
            ->select(
                'action',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('action')
            ->get()
            ->keyBy('action');

        return [
            'accepts' => $activities->get('accept')->count ?? 0,
            'dismissals' => $activities->get('dismiss')->count ?? 0,
            'total' => $activities->sum('count'),
        ];
    }

    public function getArticleCompletionStats(int $userId): array
    {
        $completions = DB::table('user_article_completions')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->get();

        return [
            'total_completed' => $completions->count(),
            'average_accuracy' => round($completions->avg('accuracy') ?? 0, 2),
            'recent_completions' => $completions
                ->sortByDesc('completed_at')
                ->take(5)
                ->values()
                ->toArray(),
        ];
    }

    public function getPlatformStats(): array
    {
        return [
            'total_users' => User::count(),
            'total_articles' => DB::table('articles')->count(),
            'total_homophones' => DB::table('homophones')->where('is_active', true)->count(),
            'total_quizzes' => DB::table('quizzes')->count(),
            'total_completions' => DB::table('user_article_completions')->where('status', 'completed')->count(),
            'average_accuracy' => round(DB::table('user_homophone_accuracies')->avg('accuracy') ?? 0, 2),
        ];
    }

    public function getUserProgressOverTime(int $userId, int $days = 30): array
    {
        $startDate = now()->subDays($days);

        $completions = DB::table('user_article_completions')
            ->where('user_id', $userId)
            ->where('completed_at', '>=', $startDate)
            ->selectRaw('DATE(completed_at) as date, COUNT(*) as count, AVG(accuracy) as avg_accuracy')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return [
            'period' => $days,
            'data' => $completions->map(function ($item) {
                return [
                    'date' => $item->date,
                    'completions' => $item->count,
                    'average_accuracy' => round($item->avg_accuracy ?? 0, 2),
                ];
            })->toArray(),
        ];
    }

    protected function formatUserAnalytics($user): array
    {
        $quizData = $user->quizAttempts->map(function ($attempt) {
            $totalQuestions = $attempt->quiz->questions->count();
            $percentage = $totalQuestions > 0 ? ($attempt->score / $totalQuestions) * 100 : 0;
            return [
                'quiz_id' => $attempt->quiz_id,
                'quiz_title' => $attempt->quiz->title ?? 'Unknown',
                'score' => $attempt->score,
                'total' => $totalQuestions,
                'percentage' => round($percentage, 2),
            ];
        });

        $homophoneAvg = $user->homophoneAccuracies->avg('accuracy') ?? 0;
        $totalTypings = $user->total_typings ?? 0;
        $incorrectTypings = $user->incorrect_typings ?? 0;
        $correctTypings = $totalTypings - $incorrectTypings;
        $typingAccuracy = $totalTypings > 0 ? ($correctTypings / $totalTypings) * 100 : 0;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name'),
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
