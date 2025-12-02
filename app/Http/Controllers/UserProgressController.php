<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\GrammarChecker;
use App\Models\UserHomophoneAccuracy;
use App\Models\UserComparisonActivity;
use App\Models\UserTypingActivity;
use App\Models\UserAudioActivity;
use App\Models\Article;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserProgressController extends Controller
{
    /**
     * Display comprehensive progress dashboard for a specific user
     */
    public function show($id)
    {
        // Get user with relationships
        $user = User::with(['roles', 'permissions'])->findOrFail($id);

        // Get user's profile data
        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->toArray(),
            'permissions' => $user->permissions->pluck('name')->toArray(),
            'created_at' => $user->created_at->format('Y-m-d'),
            'status' => $user->blocked ? 'Blocked' : 'Active',
            'total_checks' => GrammarChecker::where('user_id', $id)->count(),
        ];

        // Get articles attempted by user
        $articlesAttempted = $this->getArticlesAttempted($id);

        // Get daily accuracy trends (last 30 days)
        $accuracyTrends = $this->getDailyAccuracyTrends($id);

        // Get correction patterns (accept/reject)
        $correctionPatterns = $this->getCorrectionPatterns($id);

        // Get typing activity analysis
        $typingActivity = $this->getTypingActivity($id);

        // Get audio listening behavior
        $audioBehavior = $this->getAudioBehavior($id);

        // Get overall learning metrics
        $learningMetrics = $this->getLearningMetrics($id);

        return Inertia::render('Users/Progress', [
            'user' => $profileData,
            'articlesAttempted' => $articlesAttempted,
            'accuracyTrends' => $accuracyTrends,
            'correctionPatterns' => $correctionPatterns,
            'typingActivity' => $typingActivity,
            'audioBehavior' => $audioBehavior,
            'learningMetrics' => $learningMetrics,
        ]);
    }

    /**
     * Get articles attempted by user with accuracy
     */
    private function getArticlesAttempted($userId)
    {
        $grammarCheckers = GrammarChecker::where('user_id', $userId)
            ->with('article.file')
            ->orderBy('created_at', 'desc')
            ->get();

        $articles = [];
        foreach ($grammarCheckers as $gc) {
            $articleId = $gc->article_id;
            
            // Get accuracy for this grammar checker
            $accuracy = UserHomophoneAccuracy::where('user_id', $userId)
                ->where('grammar_checker_id', $gc->id)
                ->first();

            $articleTitle = $gc->article ? $gc->article->title : 'Untitled';
            
            if (!isset($articles[$articleId])) {
                $articles[$articleId] = [
                    'article_id' => $articleId,
                    'title' => $articleTitle,
                    'attempts' => 0,
                    'latest_attempt' => null,
                    'best_accuracy' => 0,
                    'average_accuracy' => 0,
                    'accuracies' => [],
                ];
            }

            $articles[$articleId]['attempts']++;
            $articles[$articleId]['latest_attempt'] = $gc->created_at->format('Y-m-d H:i');
            
            if ($accuracy) {
                $accValue = (float) $accuracy->accuracy;
                $articles[$articleId]['accuracies'][] = $accValue;
                $articles[$articleId]['best_accuracy'] = max(
                    $articles[$articleId]['best_accuracy'], 
                    $accValue
                );
            }
        }

        // Calculate average accuracy for each article
        foreach ($articles as &$article) {
            if (!empty($article['accuracies'])) {
                $article['average_accuracy'] = round(
                    array_sum($article['accuracies']) / count($article['accuracies']), 
                    2
                );
            }
            unset($article['accuracies']); // Remove raw data
        }

        return array_values($articles);
    }

    /**
     * Get daily accuracy trends for the last 30 days
     */
    private function getDailyAccuracyTrends($userId)
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $dailyData = UserHomophoneAccuracy::where('user_id', $userId)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('AVG(accuracy) as avg_accuracy'),
                DB::raw('COUNT(*) as attempts')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $trends = [];
        foreach ($dailyData as $data) {
            $trends[] = [
                'date' => Carbon::parse($data->date)->format('M d'),
                'accuracy' => round($data->avg_accuracy, 2),
                'attempts' => $data->attempts,
            ];
        }

        return $trends;
    }

    /**
     * Get correction patterns (accept/reject) by day
     */
    private function getCorrectionPatterns($userId)
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $patterns = UserComparisonActivity::where('user_id', $userId)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN action = "accept" THEN 1 ELSE 0 END) as accepted'),
                DB::raw('SUM(CASE WHEN action = "dismiss" THEN 1 ELSE 0 END) as rejected')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $result = [];
        foreach ($patterns as $pattern) {
            $result[] = [
                'date' => Carbon::parse($pattern->date)->format('M d'),
                'accepted' => $pattern->accepted,
                'rejected' => $pattern->rejected,
            ];
        }

        return $result;
    }

    /**
     * Get typing activity analysis
     */
    private function getTypingActivity($userId)
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        // Get daily typing counts
        $dailyTyping = UserTypingActivity::where('user_id', $userId)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as characters_typed')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $typingData = [];
        foreach ($dailyTyping as $data) {
            $typingData[] = [
                'date' => Carbon::parse($data->date)->format('M d'),
                'characters' => $data->characters_typed,
            ];
        }

        // Get total stats
        $totalCharacters = UserTypingActivity::where('user_id', $userId)->count();
        $averagePerSession = GrammarChecker::where('user_id', $userId)
            ->avg('word_count');

        return [
            'daily' => $typingData,
            'total_characters' => $totalCharacters,
            'average_per_session' => round($averagePerSession ?? 0, 2),
        ];
    }

    /**
     * Get audio listening behavior
     */
    private function getAudioBehavior($userId)
    {
        $audioActivities = UserAudioActivity::where('user_id', $userId)->get();

        $totalPlays = $audioActivities->where('activity_type', 'audio_play')->count();
        $totalRewinds = $audioActivities->sum('rewind_count');
        $totalForwards = $audioActivities->sum('forward_count');
        $avgPlaybackPosition = $audioActivities->avg('playback_position');

        // Get daily audio activity for last 30 days
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $dailyAudio = UserAudioActivity::where('user_id', $userId)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as plays')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $audioData = [];
        foreach ($dailyAudio as $data) {
            $audioData[] = [
                'date' => Carbon::parse($data->date)->format('M d'),
                'plays' => $data->plays,
            ];
        }

        return [
            'total_plays' => $totalPlays,
            'total_rewinds' => $totalRewinds,
            'total_forwards' => $totalForwards,
            'avg_playback_position' => round($avgPlaybackPosition ?? 0, 2),
            'daily' => $audioData,
        ];
    }

    /**
     * Calculate overall learning metrics and insights
     */
    private function getLearningMetrics($userId)
    {
        // Get all accuracies
        $accuracies = UserHomophoneAccuracy::where('user_id', $userId)
            ->orderBy('created_at', 'asc')
            ->get();

        if ($accuracies->isEmpty()) {
            return [
                'overall_accuracy' => 0,
                'progress_trend' => 'No data',
                'total_attempts' => 0,
                'improvement_rate' => 0,
                'strengths' => [],
                'weaknesses' => [],
            ];
        }

        $totalAccuracy = $accuracies->avg('accuracy');
        $totalAttempts = $accuracies->count();

        // Calculate improvement rate (compare first 5 vs last 5 attempts)
        $firstFive = $accuracies->take(5)->avg('accuracy');
        $lastFive = $accuracies->reverse()->take(5)->avg('accuracy');
        $improvementRate = $lastFive - $firstFive;

        // Determine trend
        $trend = 'Stable';
        if ($improvementRate > 5) {
            $trend = 'Improving';
        } elseif ($improvementRate < -5) {
            $trend = 'Declining';
        }

        // Analyze strengths and weaknesses based on error types
        $comparisonActivities = UserComparisonActivity::where('user_id', $userId)->get();
        
        $missingWords = $comparisonActivities->where('comparison_type', 'missing')->count();
        $replacedWords = $comparisonActivities->where('comparison_type', 'replaced')->count();
        $extraWords = $comparisonActivities->where('comparison_type', 'extra')->count();

        $strengths = [];
        $weaknesses = [];

        $total = $missingWords + $replacedWords + $extraWords;
        if ($total > 0) {
            $missingPct = ($missingWords / $total) * 100;
            $replacedPct = ($replacedWords / $total) * 100;
            $extraPct = ($extraWords / $total) * 100;

            // Weaknesses (highest error percentages)
            if ($missingPct > 30) {
                $weaknesses[] = "Missing words (" . round($missingPct, 1) . "%)";
            }
            if ($replacedPct > 30) {
                $weaknesses[] = "Word substitutions (" . round($replacedPct, 1) . "%)";
            }
            if ($extraPct > 30) {
                $weaknesses[] = "Extra words (" . round($extraPct, 1) . "%)";
            }

            // Strengths (lowest error percentages)
            if ($missingPct < 20) {
                $strengths[] = "Good word retention";
            }
            if ($replacedPct < 20) {
                $strengths[] = "Accurate word recognition";
            }
            if ($extraPct < 20) {
                $strengths[] = "Precise typing";
            }
        }

        return [
            'overall_accuracy' => round($totalAccuracy, 2),
            'progress_trend' => $trend,
            'total_attempts' => $totalAttempts,
            'improvement_rate' => round($improvementRate, 2),
            'strengths' => $strengths,
            'weaknesses' => $weaknesses,
        ];
    }
}