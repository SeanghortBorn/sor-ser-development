<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Article;
use App\Models\GrammarChecker;
use App\Models\UserComparisonActivity;
use App\Models\UserTypingActivity;
use App\Models\UserHomophoneAccuracy;
use App\Models\Question;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentAnalyticsController extends Controller
{
    public function index()
    {
        // OPTIMIZED: Eager load all relationships and use withCount to avoid N+1 queries
        // This reduces 700+ queries to ~10 queries!
        $users = User::with([
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
        ->get();

        // Map data using eager-loaded relationships (NO queries in loop!)
        $data = $users->map(function ($user) {
            // Role
            $role = $user->roles->first();
            $roleName = $role ? $role->name : ($user->permissions->count() > 0 ? 'Student' : 'N/A');

            // Age, Education, Experience
            $age = $user->age ?? 'N/A';
            $education = $user->education_level ?? 'N/A';
            $experience = $user->khmer_experience ?? 'N/A';

            // Total Articles - from withCount (no query!)
            $totalArticles = $user->total_articles;

            // Accepts/Dismiss - from withCount (no query!)
            $accepts = $user->accepts;
            $dismiss = $user->dismiss;

            // Total Typings/Incorrect Typings - from withCount (no query!)
            $totalTypings = $user->total_typings;
            $incorrectTypings = $user->incorrect_typings;

            // Quiz metrics - from eager-loaded relationships (no queries!)
            $attempts = $user->quizAttempts;
            $totalQuizzes = $attempts->pluck('quiz_id')->unique()->count();
            $totalQuestions = 0;
            $incorrectQuestions = 0;
            $attemptPercentages = [];

            foreach ($attempts as $attempt) {
                // Use eager-loaded quiz with questions_count (no query!)
                $questionsCount = $attempt->quiz->questions_count ?? 0;
                $totalQuestions += $questionsCount;

                $answers = $attempt->answers;
                if (is_string($answers)) {
                    $answers = json_decode($answers, true);
                }
                if (is_array($answers)) {
                    foreach ($answers as $ans) {
                        if (isset($ans['isCorrect']) && $ans['isCorrect'] === false) {
                            $incorrectQuestions++;
                        }
                    }
                }

                if ($questionsCount > 0) {
                    $attemptPercentages[] = ($attempt->score / $questionsCount) * 100;
                }
            }

            $avgScore = !empty($attemptPercentages) ? round(array_sum($attemptPercentages) / count($attemptPercentages), 2) : 'N/A';

            // Homo Avg (accuracy) - from eager-loaded collection (no query!)
            $accuracy = $user->homophoneAccuracies->avg('accuracy');
            $homoAvg = $accuracy !== null ? round($accuracy, 2) : 'N/A';

            // Avg Pause (s) - from eager-loaded collection (no query!)
            $avgPause = $user->homophoneAccuracies->avg('avg_pause_duration');
            $avgPause = $avgPause !== null ? round($avgPause, 2) : 'N/A';

            return [
                'id' => $user->id,
                'name' => $user->name ?? 'N/A',
                'email' => $user->email ?? 'N/A',
                'role' => $roleName ?? 'N/A',
                'age' => $age,
                'education' => $education,
                'experience' => $experience,
                'total_articles' => $totalArticles ?: 'N/A',
                'total_quizzes' => $totalQuizzes ?: 'N/A',
                'total_questions' => $totalQuestions ?: 'N/A',
                'incorrect_questions' => $incorrectQuestions ?: 'N/A',
                'accepts' => $accepts ?: 'N/A',
                'dismiss' => $dismiss ?: 'N/A',
                'total_typings' => $totalTypings ?: 'N/A',
                'incorrect_typings' => $incorrectTypings ?: 'N/A',
                'homo_avg' => $homoAvg,
                'avg_score' => $avgScore,
                'avg_pause' => $avgPause,
            ];
        });

        return Inertia::render('StudentAnalytics/Index', [
            'analytics' => $data,
        ]);
    }
}
