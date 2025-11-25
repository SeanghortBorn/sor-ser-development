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
        // Get all users with related data
        $users = User::with(['roles', 'permissions'])->get();

        // Prepare analytics data for each user
        $data = $users->map(function ($user) {
            // Role
            $role = $user->roles->first();
            $roleName = $role ? $role->name : ($user->permissions->count() > 0 ? 'Student' : 'N/A');

            // Age, Education, Experience
            $age = $user->age ?? 'N/A';
            $education = $user->education_level ?? 'N/A';
            $experience = $user->khmer_experience ?? 'N/A';

            // Total Articles (GrammarChecker)
            $totalArticles = GrammarChecker::where('user_id', $user->id)->count();
            // Accepts/Dismiss (from comparison activities table)
            $accepts = UserComparisonActivity::where('user_id', $user->id)->where('action', 'accept')->count();
            $dismiss = UserComparisonActivity::where('user_id', $user->id)->where('action', 'dismiss')->count();

            // Total Typings/Incorrect Typings (from user_typing_activities)
            // status = 1 => correct/typed (total), status = 0 => incorrect (per your note)
            $totalTypings = UserTypingActivity::where('user_id', $user->id)->where('status', 1)->count();
            $incorrectTypings = UserTypingActivity::where('user_id', $user->id)->where('status', 0)->count();

            // Quiz metrics (from quiz_attempts, questions)
            $attempts = QuizAttempt::where('user_id', $user->id)->get();
            $totalQuizzes = $attempts->pluck('quiz_id')->unique()->count();
            $totalQuestions = 0;
            $incorrectQuestions = 0;
            $attemptPercentages = [];

            foreach ($attempts as $attempt) {
                $quizId = $attempt->quiz_id;
                $questionsCount = Question::where('quiz_id', $quizId)->count();
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

            // Homo Avg (accuracy)
            $accuracy = UserHomophoneAccuracy::where('user_id', $user->id)->avg('accuracy');
            $homoAvg = $accuracy !== null ? round($accuracy, 2) : 'N/A';

            // Avg Pause (s)
            $avgPause = UserHomophoneAccuracy::where('user_id', $user->id)->avg('avg_pause_duration');
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
