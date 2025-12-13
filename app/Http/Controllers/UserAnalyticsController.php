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

class UserAnalyticsController extends Controller
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
            'articleCompletions as total_articles',
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

        return Inertia::render('Users/UserAnalytics', [
            'analytics' => $data,
        ]);
    }

    /**
     * Export detailed user analytics data
     */
    public function exportDetailed(Request $request)
    {
        try {
            $userIds = $request->input('user_ids', []);
            
            if (empty($userIds)) {
                return response()->json(['error' => 'No user IDs provided'], 400);
            }

            // Load ALL user data with all relationships that exist
            $users = User::with([
                'roles',
                'permissions',
                'quizAttempts',
                'homophoneAccuracies',
                'typingActivities',
                'comparisonActivities',
                'articleCompletions',
                'feedbacks'
            ])
            ->whereIn('id', $userIds)
            ->get();

            $detailedData = $users->map(function ($user) {
                // Quiz Attempts
                $quizAttempts = $user->quizAttempts ? $user->quizAttempts->map(function ($attempt) {
                    return [
                        'quiz_id' => $attempt->quiz_id,
                        'quiz_title' => $attempt->quiz ? $attempt->quiz->title : null,
                        'score' => $attempt->score,
                        'answers' => $attempt->answers,
                        'time_spent_seconds' => $attempt->time_spent,
                        'completed_at' => $attempt->created_at,
                    ];
                })->toArray() : [];
                
                // Homophone Accuracies
                $homophoneAccuracies = $user->homophoneAccuracies ? $user->homophoneAccuracies->map(function ($accuracy) {
                    return [
                        'article_id' => $accuracy->article_id,
                        'grammar_checker_id' => $accuracy->grammar_checker_id,
                        'accuracy' => $accuracy->accuracy,
                        'replaced_count' => $accuracy->replaced_count,
                        'extra_count' => $accuracy->extra_count,
                        'missing_count' => $accuracy->missing_count,
                        'user_word_count' => $accuracy->user_word_count,
                        'article_total_words' => $accuracy->article_total_words,
                        'reading_time_seconds' => $accuracy->reading_time_seconds,
                        'avg_pause_duration' => $accuracy->avg_pause_duration,
                        'pause_count' => $accuracy->pause_count,
                        'created_at' => $accuracy->created_at,
                    ];
                })->toArray() : [];
                
                // Typing Activities
                $typingActivities = $user->typingActivities ? $user->typingActivities->map(function ($activity) {
                    return [
                        'grammar_checker_id' => $activity->grammar_checker_id,
                        'character' => $activity->character,
                        'status' => $activity->status,
                        'typed_at' => $activity->created_at,
                    ];
                })->toArray() : [];
                
                // Deleted Characters
                $deletedCharacters = $user->typingActivities ? $user->typingActivities->where('status', 0)->map(function ($activity) {
                    return [
                        'character' => $activity->character,
                        'deleted_at' => $activity->created_at,
                    ];
                })->toArray() : [];
                
                // Comparison Activities
                $comparisonActivities = $user->comparisonActivities ? $user->comparisonActivities->map(function ($activity) {
                    return [
                        'article_id' => $activity->article_id,
                        'grammar_checker_id' => $activity->grammar_checker_id,
                        'action' => $activity->action,
                        'comparison_type' => $activity->comparison_type,
                        'user_word' => $activity->user_word,
                        'article_word' => $activity->article_word,
                        'word_position' => $activity->word_position,
                        'metadata' => $activity->metadata,
                        'session_id' => $activity->session_id,
                        'action_at' => $activity->created_at,
                    ];
                })->toArray() : [];
                
                // Article Completions
                $articleCompletions = $user->articleCompletions ? $user->articleCompletions->map(function ($completion) {
                    return [
                        'article_id' => $completion->article_id,
                        'completed_at' => $completion->created_at,
                    ];
                })->toArray() : [];
                
                // Feedbacks
                $feedbacks = $user->feedbacks ? $user->feedbacks->map(function ($feedback) {
                    return [
                        'feedback_text' => $feedback->message,
                        'submitted_at' => $feedback->created_at,
                    ];
                })->toArray() : [];
                
                return [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'age' => $user->age,
                    'education_level' => $user->education_level,
                    'khmer_experience' => $user->khmer_experience,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                    'roles' => $user->roles ? $user->roles->pluck('name')->toArray() : [],
                    'permissions' => $user->permissions ? $user->permissions->pluck('name')->toArray() : [],
                    'quiz_attempts' => $quizAttempts,
                    'homophone_accuracies' => $homophoneAccuracies,
                    'typing_activities' => $typingActivities,
                    'deleted_characters' => $deletedCharacters,
                    'comparison_activities' => $comparisonActivities,
                    'article_completions' => $articleCompletions,
                    'feedbacks' => $feedbacks,
                    'summary' => [
                        'total_quiz_attempts' => $user->quizAttempts ? $user->quizAttempts->count() : 0,
                        'total_articles_completed' => $user->articleCompletions ? $user->articleCompletions->count() : 0,
                        'total_typing_activities' => $user->typingActivities ? $user->typingActivities->count() : 0,
                        'total_correct_typings' => $user->typingActivities ? $user->typingActivities->where('status', 1)->count() : 0,
                        'total_incorrect_typings' => $user->typingActivities ? $user->typingActivities->where('status', 0)->count() : 0,
                        'total_deleted_characters' => $user->typingActivities ? $user->typingActivities->where('status', 0)->count() : 0,
                        'total_accepts' => $user->comparisonActivities ? $user->comparisonActivities->where('action', 'accept')->count() : 0,
                        'total_dismisses' => $user->comparisonActivities ? $user->comparisonActivities->where('action', 'dismiss')->count() : 0,
                        'average_accuracy' => $user->homophoneAccuracies ? $user->homophoneAccuracies->avg('accuracy') : 0,
                        'average_pause_duration' => $user->homophoneAccuracies ? $user->homophoneAccuracies->avg('avg_pause_duration') : 0,
                        'total_pause_count' => $user->homophoneAccuracies ? $user->homophoneAccuracies->sum('pause_count') : 0,
                    ],
                ];
            });

            return response()->json($detailedData);
        } catch (\Exception $e) {
            \Log::error('Export error: ' . $e->getMessage(), [
                'user_ids' => $request->input('user_ids', []),
                'error' => $e,
            ]);
            return response()->json([
                'error' => 'Server error occurred during export',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
