<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Article;
use App\Models\GrammarChecker;
use App\Models\UserHomophoneAccuracy;
use App\Models\UserComparisonActivity;
use App\Models\UserTypingActivity;
use App\Models\UserAudioActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * UserArticleDetailController
 * 
 * Provides detailed analytics for a specific user's performance on a specific article.
 * This controller supports thesis Experiment 2 validation by providing comprehensive
 * behavioral data tracking across multiple attempts.
 * 
 * @package App\Http\Controllers
 */
class UserArticleDetailController extends Controller
{
    /**
     * Display detailed analytics for a user's performance on a specific article
     * 
     * @param int $userId User ID
     * @param int $articleId Article ID
     * @return \Inertia\Response
     */
    public function show($userId, $articleId)
    {
        // Fetch user and article
        $user = User::with(['roles', 'permissions'])->findOrFail($userId);
        $article = Article::with('file')->findOrFail($articleId);

        // Get all session data for this user-article combination
        $sessionTimeline = $this->getSessionTimeline($userId, $articleId);
        $errorAnalysis = $this->getErrorAnalysis($userId, $articleId);
        $keystrokePatterns = $this->getKeystrokePatterns($userId, $articleId);
        $audioBehavior = $this->getAudioBehavior($userId, $articleId);
        $comparisonMetrics = $this->getComparisonMetrics($userId, $articleId);
        $temporalProgression = $this->getTemporalProgression($userId, $articleId);

        // Calculate summary metrics
        $summaryMetrics = $this->calculateSummaryMetrics($sessionTimeline);

        return Inertia::render('Users/ArticleDetail', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
                'content' => substr($article->content, 0, 500) . '...', // Preview only
                'word_count' => $article->word_count,
                'audio_url' => $article->file ? asset('storage/' . $article->file->file_path) : null,
            ],
            'summaryMetrics' => $summaryMetrics,
            'sessionTimeline' => $sessionTimeline,
            'errorAnalysis' => $errorAnalysis,
            'keystrokePatterns' => $keystrokePatterns,
            'audioBehavior' => $audioBehavior,
            'comparisonMetrics' => $comparisonMetrics,
            'temporalProgression' => $temporalProgression,
        ]);
    }

    /**
     * Get session-by-session timeline for user-article combination
     * 
     * Returns all attempts chronologically with key metrics per session
     * 
     * @param int $userId
     * @param int $articleId
     * @return array
     */
    protected function getSessionTimeline($userId, $articleId)
    {
        $sessions = GrammarChecker::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->orderBy('created_at', 'asc')
            ->get();

        $timeline = [];
        $attemptNumber = 1;

        foreach ($sessions as $session) {
            // Get accuracy record for this session
            $accuracy = UserHomophoneAccuracy::where('user_id', $userId)
                ->where('grammar_checker_id', $session->id)
                ->first();

            // Get correction interactions for this session
            $corrections = UserComparisonActivity::where('user_id', $userId)
                ->where('grammar_checker_id', $session->id)
                ->get();

            $totalCorrections = $corrections->count();
            $acceptedCorrections = $corrections->where('action', 'accept')->count();
            $dismissedCorrections = $corrections->where('action', 'dismiss')->count();

            // Get typing activity summary
            $typingCount = UserTypingActivity::where('user_id', $userId)
                ->where('grammar_checker_id', $session->id)
                ->count();

            // Get audio activity summary
            $audioActivity = UserAudioActivity::where('user_id', $userId)
                ->where('article_id', $articleId)
                ->whereBetween('created_at', [
                    $session->created_at->subMinutes(30),
                    $session->created_at->addMinutes(30)
                ])
                ->get();

            $audioPlays = $audioActivity->where('action', 'play')->count();
            $audioRewinds = $audioActivity->where('action', 'rewind')->count();
            $audioForwards = $audioActivity->where('action', 'forward')->count();

            // Calculate session duration (if we have typing activity)
            $sessionDuration = null;
            if ($typingCount > 0) {
                $firstTyping = UserTypingActivity::where('user_id', $userId)
                    ->where('grammar_checker_id', $session->id)
                    ->orderBy('created_at', 'asc')
                    ->first();
                
                $lastTyping = UserTypingActivity::where('user_id', $userId)
                    ->where('grammar_checker_id', $session->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($firstTyping && $lastTyping) {
                    $sessionDuration = $lastTyping->created_at->diffInMinutes($firstTyping->created_at);
                }
            }

            // Calculate typing speed (WPM)
            $typingSpeedWpm = null;
            if ($sessionDuration && $sessionDuration > 0 && $session->word_count) {
                $typingSpeedWpm = round(($session->word_count / $sessionDuration), 1);
            }

            // Build timeline entry
            $timeline[] = [
                'attempt_number' => $attemptNumber,
                'grammar_checker_id' => $session->id,
                'session_date' => $session->created_at->toIso8601String(),
                'session_date_formatted' => $session->created_at->format('Y-m-d H:i'),
                
                // Accuracy metrics
                'accuracy_percent' => $accuracy ? round($accuracy->accuracy, 2) : null,
                'total_errors' => $accuracy ? $accuracy->total_errors : 0,
                'replaced_errors' => $accuracy ? $accuracy->replaced_count : 0,
                'extra_errors' => $accuracy ? $accuracy->extra_count : 0,
                'missing_errors' => $accuracy ? $accuracy->missing_count : 0,
                
                // Typing metrics
                'word_count' => $session->word_count,
                'characters_typed' => $typingCount,
                'typing_speed_wpm' => $typingSpeedWpm,
                'session_duration_minutes' => $sessionDuration,
                
                // Correction interaction metrics
                'total_corrections' => $totalCorrections,
                'corrections_accepted' => $acceptedCorrections,
                'corrections_dismissed' => $dismissedCorrections,
                'acceptance_rate_percent' => $totalCorrections > 0 
                    ? round(($acceptedCorrections / $totalCorrections) * 100, 2) 
                    : null,
                
                // Audio engagement metrics
                'audio_plays' => $audioPlays,
                'audio_rewinds' => $audioRewinds,
                'audio_forwards' => $audioForwards,
                
                // Raw session data
                'raw_session' => $session,
                'raw_accuracy' => $accuracy,
            ];

            $attemptNumber++;
        }

        return $timeline;
    }

    /**
     * Analyze error patterns and evolution across attempts
     * 
     * @param int $userId
     * @param int $articleId
     * @return array
     */
    protected function getErrorAnalysis($userId, $articleId)
    {
        $sessions = GrammarChecker::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->orderBy('created_at', 'asc')
            ->get();

        $errorEvolution = [];
        $errorTypeBreakdown = [
            'replaced' => [],
            'extra' => [],
            'missing' => [],
        ];

        $allErrors = [];
        $repeatedErrors = [];

        foreach ($sessions as $index => $session) {
            $accuracy = UserHomophoneAccuracy::where('user_id', $userId)
                ->where('grammar_checker_id', $session->id)
                ->first();

            if (!$accuracy) continue;

            $attemptNumber = $index + 1;

            // Track error counts over time
            $errorEvolution[] = [
                'attempt' => $attemptNumber,
                'total_errors' => $accuracy->total_errors,
                'replaced' => $accuracy->replaced_count,
                'extra' => $accuracy->extra_count,
                'missing' => $accuracy->missing_count,
            ];

            // Accumulate by error type
            $errorTypeBreakdown['replaced'][] = $accuracy->replaced_count;
            $errorTypeBreakdown['extra'][] = $accuracy->extra_count;
            $errorTypeBreakdown['missing'][] = $accuracy->missing_count;

            // Get specific errors from comparison activities
            $sessionErrors = UserComparisonActivity::where('user_id', $userId)
                ->where('grammar_checker_id', $session->id)
                ->get();

            foreach ($sessionErrors as $error) {
                $errorKey = $error->error_type . ':' . ($error->incorrect_word ?? 'unknown');
                
                if (isset($allErrors[$errorKey])) {
                    // This error appeared before - it's a repeated error
                    $repeatedErrors[$errorKey] = ($repeatedErrors[$errorKey] ?? 1) + 1;
                } else {
                    $allErrors[$errorKey] = 1;
                }
            }
        }

        // Calculate repeated error statistics
        $uniqueErrors = count($allErrors);
        $totalRepeats = array_sum($repeatedErrors);
        $errorsRepeated = count($repeatedErrors);
        $repeatedErrorRate = $uniqueErrors > 0 
            ? round(($errorsRepeated / $uniqueErrors) * 100, 2) 
            : 0;

        // Calculate error reduction metrics
        $firstAttemptErrors = $errorEvolution[0]['total_errors'] ?? 0;
        $lastAttemptErrors = end($errorEvolution)['total_errors'] ?? 0;
        $errorReduction = $firstAttemptErrors > 0 
            ? round((($firstAttemptErrors - $lastAttemptErrors) / $firstAttemptErrors) * 100, 2)
            : 0;

        return [
            'error_evolution' => $errorEvolution,
            'error_type_breakdown' => $errorTypeBreakdown,
            'repeated_error_analysis' => [
                'unique_errors' => $uniqueErrors,
                'errors_repeated' => $errorsRepeated,
                'repeated_error_rate_percent' => $repeatedErrorRate,
                'total_repeat_occurrences' => $totalRepeats,
            ],
            'error_reduction' => [
                'first_attempt_errors' => $firstAttemptErrors,
                'last_attempt_errors' => $lastAttemptErrors,
                'reduction_percent' => $errorReduction,
            ],
        ];
    }

    /**
     * Analyze keystroke patterns and typing behavior
     * 
     * @param int $userId
     * @param int $articleId
     * @return array
     */
    protected function getKeystrokePatterns($userId, $articleId)
    {
        $sessions = GrammarChecker::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->orderBy('created_at', 'asc')
            ->get();

        $typingEvolution = [];
        $pauseAnalysis = [];
        $backspaceUsage = [];

        foreach ($sessions as $index => $session) {
            $attemptNumber = $index + 1;

            // Get all typing activities for this session
            $typingActivities = UserTypingActivity::where('user_id', $userId)
                ->where('grammar_checker_id', $session->id)
                ->orderBy('created_at', 'asc')
                ->get();

            if ($typingActivities->isEmpty()) continue;

            // Calculate typing speed
            $firstTyping = $typingActivities->first();
            $lastTyping = $typingActivities->last();
            $durationMinutes = $lastTyping->created_at->diffInMinutes($firstTyping->created_at);
            $durationMinutes = max($durationMinutes, 1); // Avoid division by zero

            $charactersTyped = $typingActivities->count();
            $wordsTyped = $session->word_count ?? 0;
            $typingSpeedWpm = round(($wordsTyped / $durationMinutes), 1);

            // Analyze pauses (gaps > 2 seconds between keystrokes)
            $pauses = [];
            $previousTimestamp = null;

            foreach ($typingActivities as $typing) {
                if ($previousTimestamp) {
                    $gap = $typing->created_at->diffInMilliseconds($previousTimestamp);
                    if ($gap > 2000) { // More than 2 seconds
                        $pauses[] = $gap;
                    }
                }
                $previousTimestamp = $typing->created_at;
            }

            $avgPauseDuration = count($pauses) > 0 
                ? round(array_sum($pauses) / count($pauses), 0)
                : 0;

            $pauseCount = count($pauses);

            // Count backspaces (event_type = 'delete' or character = 'Backspace')
            $backspaceCount = $typingActivities->where(function($activity) {
                return $activity->event_type === 'delete' || 
                       $activity->character === 'Backspace' ||
                       $activity->character === 'Delete';
            })->count();

            $backspaceRate = $charactersTyped > 0 
                ? round(($backspaceCount / $charactersTyped) * 100, 2)
                : 0;

            $typingEvolution[] = [
                'attempt' => $attemptNumber,
                'typing_speed_wpm' => $typingSpeedWpm,
                'characters_typed' => $charactersTyped,
                'session_duration_minutes' => $durationMinutes,
            ];

            $pauseAnalysis[] = [
                'attempt' => $attemptNumber,
                'pause_count' => $pauseCount,
                'avg_pause_duration_ms' => $avgPauseDuration,
            ];

            $backspaceUsage[] = [
                'attempt' => $attemptNumber,
                'backspace_count' => $backspaceCount,
                'backspace_rate_percent' => $backspaceRate,
            ];
        }

        // Calculate trends
        $firstTypingSpeed = $typingEvolution[0]['typing_speed_wpm'] ?? 0;
        $lastTypingSpeed = end($typingEvolution)['typing_speed_wpm'] ?? 0;
        $typingSpeedImprovement = $firstTypingSpeed > 0 
            ? round((($lastTypingSpeed - $firstTypingSpeed) / $firstTypingSpeed) * 100, 2)
            : 0;

        $firstBackspaceRate = $backspaceUsage[0]['backspace_rate_percent'] ?? 0;
        $lastBackspaceRate = end($backspaceUsage)['backspace_rate_percent'] ?? 0;
        $backspaceReduction = $firstBackspaceRate > 0 
            ? round((($firstBackspaceRate - $lastBackspaceRate) / $firstBackspaceRate) * 100, 2)
            : 0;

        return [
            'typing_evolution' => $typingEvolution,
            'pause_analysis' => $pauseAnalysis,
            'backspace_usage' => $backspaceUsage,
            'trends' => [
                'typing_speed_improvement_percent' => $typingSpeedImprovement,
                'backspace_reduction_percent' => $backspaceReduction,
                'first_typing_speed_wpm' => $firstTypingSpeed,
                'last_typing_speed_wpm' => $lastTypingSpeed,
            ],
        ];
    }

    /**
     * Analyze audio listening behavior and dependency patterns
     * 
     * @param int $userId
     * @param int $articleId
     * @return array
     */
    protected function getAudioBehavior($userId, $articleId)
    {
        $sessions = GrammarChecker::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->orderBy('created_at', 'asc')
            ->get();

        $audioEvolution = [];

        foreach ($sessions as $index => $session) {
            $attemptNumber = $index + 1;

            // Get audio activities around this session time (±30 minutes window)
            $audioActivities = UserAudioActivity::where('user_id', $userId)
                ->where('article_id', $articleId)
                ->whereBetween('created_at', [
                    $session->created_at->subMinutes(30),
                    $session->created_at->addMinutes(30)
                ])
                ->get();

            if ($audioActivities->isEmpty()) {
                $audioEvolution[] = [
                    'attempt' => $attemptNumber,
                    'plays' => 0,
                    'rewinds' => 0,
                    'forwards' => 0,
                    'pauses' => 0,
                    'avg_position_percent' => 0,
                ];
                continue;
            }

            $plays = $audioActivities->where('action', 'play')->count();
            $rewinds = $audioActivities->where('action', 'rewind')->count();
            $forwards = $audioActivities->where('action', 'forward')->count();
            $pauses = $audioActivities->where('action', 'pause')->count();

            // Calculate average listening position
            $positions = $audioActivities->whereNotNull('position')->pluck('position');
            $avgPosition = $positions->isNotEmpty() 
                ? round($positions->avg(), 1)
                : 0;

            $audioEvolution[] = [
                'attempt' => $attemptNumber,
                'plays' => $plays,
                'rewinds' => $rewinds,
                'forwards' => $forwards,
                'pauses' => $pauses,
                'avg_position_percent' => $avgPosition,
            ];
        }

        // Calculate audio dependency trend
        $firstPlays = $audioEvolution[0]['plays'] ?? 0;
        $lastPlays = end($audioEvolution)['plays'] ?? 0;
        $audioDependencyChange = $firstPlays > 0 
            ? round((($lastPlays - $firstPlays) / $firstPlays) * 100, 2)
            : 0;

        $trend = 'stable';
        if ($audioDependencyChange < -20) {
            $trend = 'declining'; // Good - becoming more independent
        } elseif ($audioDependencyChange > 20) {
            $trend = 'increasing'; // May indicate difficulty
        }

        return [
            'audio_evolution' => $audioEvolution,
            'dependency_trend' => [
                'first_plays' => $firstPlays,
                'last_plays' => $lastPlays,
                'change_percent' => $audioDependencyChange,
                'trend' => $trend,
            ],
        ];
    }

    /**
     * Generate comparative metrics between first and last attempts
     * 
     * @param int $userId
     * @param int $articleId
     * @return array
     */
    protected function getComparisonMetrics($userId, $articleId)
    {
        $sessions = GrammarChecker::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->orderBy('created_at', 'asc')
            ->get();

        if ($sessions->count() < 2) {
            return [
                'has_comparison' => false,
                'message' => 'Need at least 2 attempts for comparison',
            ];
        }

        $firstSession = $sessions->first();
        $lastSession = $sessions->last();

        // Get accuracy data
        $firstAccuracy = UserHomophoneAccuracy::where('user_id', $userId)
            ->where('grammar_checker_id', $firstSession->id)
            ->first();

        $lastAccuracy = UserHomophoneAccuracy::where('user_id', $userId)
            ->where('grammar_checker_id', $lastSession->id)
            ->first();

        // Compare accuracy
        $accuracyComparison = [
            'first' => $firstAccuracy ? round($firstAccuracy->accuracy, 2) : 0,
            'last' => $lastAccuracy ? round($lastAccuracy->accuracy, 2) : 0,
            'improvement' => 0,
        ];

        if ($firstAccuracy && $lastAccuracy) {
            $accuracyComparison['improvement'] = round(
                $lastAccuracy->accuracy - $firstAccuracy->accuracy,
                2
            );
        }

        // Compare errors
        $errorComparison = [
            'first' => $firstAccuracy ? $firstAccuracy->total_errors : 0,
            'last' => $lastAccuracy ? $lastAccuracy->total_errors : 0,
            'reduction' => 0,
            'reduction_percent' => 0,
        ];

        if ($firstAccuracy && $lastAccuracy && $firstAccuracy->total_errors > 0) {
            $errorComparison['reduction'] = $firstAccuracy->total_errors - $lastAccuracy->total_errors;
            $errorComparison['reduction_percent'] = round(
                (($firstAccuracy->total_errors - $lastAccuracy->total_errors) / $firstAccuracy->total_errors) * 100,
                2
            );
        }

        // Compare correction acceptance
        $firstCorrections = UserComparisonActivity::where('user_id', $userId)
            ->where('grammar_checker_id', $firstSession->id)
            ->get();

        $lastCorrections = UserComparisonActivity::where('user_id', $userId)
            ->where('grammar_checker_id', $lastSession->id)
            ->get();

        $firstAcceptanceRate = $firstCorrections->count() > 0
            ? round(($firstCorrections->where('action', 'accept')->count() / $firstCorrections->count()) * 100, 2)
            : 0;

        $lastAcceptanceRate = $lastCorrections->count() > 0
            ? round(($lastCorrections->where('action', 'accept')->count() / $lastCorrections->count()) * 100, 2)
            : 0;

        $acceptanceComparison = [
            'first' => $firstAcceptanceRate,
            'last' => $lastAcceptanceRate,
            'change' => round($lastAcceptanceRate - $firstAcceptanceRate, 2),
        ];

        // Calculate effect size (Cohen's d)
        $allAccuracies = [];
        foreach ($sessions as $session) {
            $acc = UserHomophoneAccuracy::where('user_id', $userId)
                ->where('grammar_checker_id', $session->id)
                ->first();
            if ($acc) {
                $allAccuracies[] = $acc->accuracy;
            }
        }

        $cohensD = 0;
        if (count($allAccuracies) >= 2) {
            $stdDev = $this->calculateStdDev($allAccuracies);
            if ($stdDev > 0) {
                $cohensD = round(
                    ($accuracyComparison['last'] - $accuracyComparison['first']) / $stdDev,
                    3
                );
            }
        }

        return [
            'has_comparison' => true,
            'total_attempts' => $sessions->count(),
            'time_span_days' => $firstSession->created_at->diffInDays($lastSession->created_at),
            'accuracy_comparison' => $accuracyComparison,
            'error_comparison' => $errorComparison,
            'acceptance_comparison' => $acceptanceComparison,
            'effect_size_cohens_d' => $cohensD,
        ];
    }

    /**
     * Analyze temporal progression and learning patterns
     * 
     * @param int $userId
     * @param int $articleId
     * @return array
     */
    protected function getTemporalProgression($userId, $articleId)
    {
        $sessions = GrammarChecker::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->orderBy('created_at', 'asc')
            ->get();

        $timeline = [];
        $gaps = [];
        $previousDate = null;

        foreach ($sessions as $index => $session) {
            $timeline[] = [
                'attempt' => $index + 1,
                'date' => $session->created_at->toIso8601String(),
                'date_formatted' => $session->created_at->format('Y-m-d'),
            ];

            if ($previousDate) {
                $daysBetween = $previousDate->diffInDays($session->created_at);
                $gaps[] = $daysBetween;
            }

            $previousDate = $session->created_at;
        }

        $avgGapDays = count($gaps) > 0 ? round(array_sum($gaps) / count($gaps), 1) : 0;

        return [
            'timeline' => $timeline,
            'session_gaps_days' => $gaps,
            'avg_gap_days' => $avgGapDays,
            'first_attempt_date' => $sessions->first()->created_at->format('Y-m-d'),
            'last_attempt_date' => $sessions->last()->created_at->format('Y-m-d'),
            'total_duration_days' => $sessions->first()->created_at->diffInDays($sessions->last()->created_at),
        ];
    }

    /**
     * Calculate overall summary metrics
     * 
     * @param array $sessionTimeline
     * @return array
     */
    protected function calculateSummaryMetrics($sessionTimeline)
    {
        if (empty($sessionTimeline)) {
            return [
                'total_attempts' => 0,
                'first_attempt_accuracy' => 0,
                'last_attempt_accuracy' => 0,
                'learning_gain' => 0,
                'avg_accuracy' => 0,
                'best_accuracy' => 0,
            ];
        }

        $accuracies = array_column($sessionTimeline, 'accuracy_percent');
        $accuracies = array_filter($accuracies, fn($val) => $val !== null);

        $firstAccuracy = $sessionTimeline[0]['accuracy_percent'] ?? 0;
        $lastAccuracy = end($sessionTimeline)['accuracy_percent'] ?? 0;

        return [
            'total_attempts' => count($sessionTimeline),
            'first_attempt_accuracy' => $firstAccuracy,
            'last_attempt_accuracy' => $lastAccuracy,
            'learning_gain' => round($lastAccuracy - $firstAccuracy, 2),
            'relative_gain_percent' => $firstAccuracy > 0 
                ? round((($lastAccuracy - $firstAccuracy) / $firstAccuracy) * 100, 2)
                : 0,
            'avg_accuracy' => count($accuracies) > 0 ? round(array_sum($accuracies) / count($accuracies), 2) : 0,
            'best_accuracy' => count($accuracies) > 0 ? round(max($accuracies), 2) : 0,
            'worst_accuracy' => count($accuracies) > 0 ? round(min($accuracies), 2) : 0,
        ];
    }

    /**
     * Export user-article data in specified format
     * 
     * @param int $userId
     * @param int $articleId
     * @param string $format (csv|json|xml)
     * @return \Illuminate\Http\Response
     */
    public function exportData($userId, $articleId, $format)
    {
        // Validate format
        if (!in_array($format, ['csv', 'json', 'xml'])) {
            abort(400, 'Invalid export format');
        }

        // Fetch user and article
        $user = User::findOrFail($userId);
        $article = Article::findOrFail($articleId);

        // Get all data
        $sessionTimeline = $this->getSessionTimeline($userId, $articleId);
        $errorAnalysis = $this->getErrorAnalysis($userId, $articleId);
        $keystrokePatterns = $this->getKeystrokePatterns($userId, $articleId);
        $audioBehavior = $this->getAudioBehavior($userId, $articleId);
        $comparisonMetrics = $this->getComparisonMetrics($userId, $articleId);
        $summaryMetrics = $this->calculateSummaryMetrics($sessionTimeline);

        // Generate export
        switch ($format) {
            case 'csv':
                return $this->exportAsCSV($user, $article, $sessionTimeline);
            case 'json':
                return $this->exportAsJSON($user, $article, $sessionTimeline, $errorAnalysis, 
                                           $keystrokePatterns, $audioBehavior, $comparisonMetrics, 
                                           $summaryMetrics);
            case 'xml':
                return $this->exportAsXML($user, $article, $sessionTimeline, $errorAnalysis, 
                                          $keystrokePatterns, $audioBehavior, $comparisonMetrics, 
                                          $summaryMetrics);
        }
    }

    /**
     * Export data as CSV
     */
    protected function exportAsCSV($user, $article, $sessionTimeline)
    {
        $filename = sprintf('user_%d_article_%d_sessions_%s.csv', 
                           $user->id, $article->id, now()->format('YmdHis'));

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($user, $article, $sessionTimeline) {
            $file = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($file, [
                'user_id', 'user_name', 'article_id', 'article_title', 'attempt_number',
                'session_date', 'accuracy_percent', 'total_errors', 'replaced_errors',
                'extra_errors', 'missing_errors', 'word_count', 'typing_speed_wpm',
                'session_duration_minutes', 'corrections_accepted', 'corrections_dismissed',
                'acceptance_rate_percent', 'audio_plays', 'audio_rewinds', 'audio_forwards'
            ]);

            // CSV Rows
            foreach ($sessionTimeline as $session) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $article->id,
                    $article->title,
                    $session['attempt_number'],
                    $session['session_date_formatted'],
                    $session['accuracy_percent'],
                    $session['total_errors'],
                    $session['replaced_errors'],
                    $session['extra_errors'],
                    $session['missing_errors'],
                    $session['word_count'],
                    $session['typing_speed_wpm'],
                    $session['session_duration_minutes'],
                    $session['corrections_accepted'],
                    $session['corrections_dismissed'],
                    $session['acceptance_rate_percent'],
                    $session['audio_plays'],
                    $session['audio_rewinds'],
                    $session['audio_forwards'],
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export data as JSON
     */
    protected function exportAsJSON($user, $article, $sessionTimeline, $errorAnalysis, 
                                    $keystrokePatterns, $audioBehavior, $comparisonMetrics, 
                                    $summaryMetrics)
    {
        $filename = sprintf('user_%d_article_%d_detailed_%s.json', 
                           $user->id, $article->id, now()->format('YmdHis'));

        $data = [
            'export_metadata' => [
                'generated_at' => now()->toIso8601String(),
                'user_id' => $user->id,
                'user_name' => $user->name,
                'article_id' => $article->id,
                'article_title' => $article->title,
                'total_attempts' => count($sessionTimeline),
                'date_range' => [
                    'first_attempt' => $sessionTimeline[0]['session_date'] ?? null,
                    'latest_attempt' => end($sessionTimeline)['session_date'] ?? null,
                ],
            ],
            'summary_metrics' => $summaryMetrics,
            'comparison_metrics' => $comparisonMetrics,
            'detailed_sessions' => $sessionTimeline,
            'error_analysis' => $errorAnalysis,
            'keystroke_patterns' => $keystrokePatterns,
            'audio_behavior' => $audioBehavior,
        ];

        return response()->json($data)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Export data as XML
     */
    protected function exportAsXML($user, $article, $sessionTimeline, $errorAnalysis, 
                                   $keystrokePatterns, $audioBehavior, $comparisonMetrics, 
                                   $summaryMetrics)
    {
        $filename = sprintf('user_%d_article_%d_analysis_%s.xml', 
                           $user->id, $article->id, now()->format('YmdHis'));

        $xml = new \SimpleXMLElement('<user_article_analysis/>');

        // Metadata
        $metadata = $xml->addChild('metadata');
        $metadata->addChild('generated_at', now()->toIso8601String());
        
        $userNode = $metadata->addChild('user');
        $userNode->addChild('id', $user->id);
        $userNode->addChild('name', htmlspecialchars($user->name));

        $articleNode = $metadata->addChild('article');
        $articleNode->addChild('id', $article->id);
        $articleNode->addChild('title', htmlspecialchars($article->title));

        // Summary metrics
        $summary = $xml->addChild('summary_metrics');
        foreach ($summaryMetrics as $key => $value) {
            $summary->addChild($key, is_numeric($value) ? $value : htmlspecialchars($value));
        }

        // Sessions
        $sessions = $xml->addChild('sessions');
        foreach ($sessionTimeline as $session) {
            $sessionNode = $sessions->addChild('session');
            $sessionNode->addAttribute('attempt', $session['attempt_number']);
            $sessionNode->addAttribute('id', $session['grammar_checker_id']);

            foreach ($session as $key => $value) {
                if (is_array($value) || is_object($value)) continue;
                if ($value === null) continue;
                $sessionNode->addChild($key, is_numeric($value) ? $value : htmlspecialchars($value));
            }
        }

        $headers = [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response($xml->asXML(), 200, $headers);
    }

    /**
     * Calculate standard deviation
     */
    protected function calculateStdDev($values)
    {
        if (count($values) < 2) return 0;

        $mean = array_sum($values) / count($values);
        $variance = 0;

        foreach ($values as $value) {
            $variance += pow($value - $mean, 2);
        }

        return sqrt($variance / count($values));
    }
}