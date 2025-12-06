<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleSetting;
use App\Models\UserArticleCompletion;
use App\Services\ArticleProgressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HomophoneCheckController extends Controller
{
    protected $progressionService;

    public function __construct(ArticleProgressionService $progressionService)
    {
        $this->progressionService = $progressionService;
    }

    /**
     * Display the homophone check page with ALL articles (locked and unlocked)
     * UPDATED: Now shows all articles, with locked ones disabled
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            // Guest user - redirect to login
            return redirect()->route('login');
        }

        // Get ALL articles with their status (locked/unlocked)
        $allArticles = $this->progressionService->getAllArticlesWithStatus($user->id);

        Log::info('HomophoneCheck page loaded', [
            'user_id' => $user->id,
            'total_articles' => $allArticles->count(),
            'unlocked_articles' => $allArticles->where('can_access', true)->count(),
            'locked_articles' => $allArticles->where('can_access', false)->count(),
        ]);

        return Inertia::render('HomophoneChecks/Index', [
            'articles' => $allArticles,
            'userRole' => $user->roles->first()?->name ?? 'No Role',
        ]);
    }

    /**
     * Save article completion and return completion feedback
     * FIXED: Only saves fields that exist in database
     */
    public function saveCompletion(Request $request, $articleId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $validated = $request->validate([
                'accuracy' => 'required|numeric|min:0|max:100',
                'typing_speed' => 'nullable|numeric|min:0|max:999',
                'time_spent' => 'nullable|integer|min:0',
                'grammar_checker_id' => 'nullable|integer|exists:grammar_checkers,id',
            ]);

            // Get existing completion or create new one
            $completion = UserArticleCompletion::where([
                'user_id' => $user->id,
                'article_id' => $articleId,
            ])->first();

            if ($completion) {
                // Update existing record
                $newBestAccuracy = max($completion->best_accuracy ?? 0, $validated['accuracy']);
                $completion->update([
                    'best_accuracy' => $newBestAccuracy,
                    'typing_speed' => $validated['typing_speed'] ?? $completion->typing_speed,
                    'completed_at' => now(),
                    'status' => 'completed',
                    'total_time_spent' => ($completion->total_time_spent ?? 0) + ($validated['time_spent'] ?? 0),
                    'grammar_checker_id' => $validated['grammar_checker_id'] ?? $completion->grammar_checker_id,
                ]);
                $completion->increment('attempt_count');
            } else {
                // Create new record
                $completion = UserArticleCompletion::create([
                    'user_id' => $user->id,
                    'article_id' => $articleId,
                    'best_accuracy' => $validated['accuracy'],
                    'typing_speed' => $validated['typing_speed'] ?? null,
                    'completed_at' => now(),
                    'status' => 'completed',
                    'attempt_count' => 1,
                    'total_time_spent' => $validated['time_spent'] ?? 0,
                    'grammar_checker_id' => $validated['grammar_checker_id'] ?? null,
                ]);
            }

            // Refresh to get updated values
            $completion->refresh();

            // Get article setting for completion threshold and redirect
            $setting = ArticleSetting::where('article_id', $articleId)->first();
            $minPercentage = $setting->min_completion_percentage ?? 70.00;
            $minTypingSpeed = $setting->min_typing_speed ?? null;

            // Determine if user unlocked next article based on best_accuracy AND typing_speed
            $unlockedNext = $completion->best_accuracy >= $minPercentage;

            // Also check typing speed if it's required
            if ($unlockedNext && $minTypingSpeed !== null) {
                $unlockedNext = ($completion->typing_speed ?? 0) >= $minTypingSpeed;
            }

            // Get next article if unlocked
            $nextArticle = null;
            if ($unlockedNext) {
                $nextArticleSetting = ArticleSetting::where('prerequisite_article_id', $articleId)
                    ->where('is_active', true)
                    ->first();

                if ($nextArticleSetting) {
                    $nextArticle = Article::find($nextArticleSetting->article_id);
                }
            }

            // Determine redirect URL based on user's group
            $redirectUrl = $this->getRedirectUrl($user, $setting);

            // Log completion
            Log::info('Article completion saved', [
                'user_id' => $user->id,
                'article_id' => $articleId,
                'accuracy' => $validated['accuracy'],
                'best_accuracy' => $completion->best_accuracy,
                'unlocked_next' => $unlockedNext,
                'next_article_id' => $nextArticle?->id,
            ]);

            return response()->json([
                'success' => true,
                'completion' => [
                    'accuracy' => $validated['accuracy'],
                    'unlocked_next' => $unlockedNext,
                    'min_required' => $minPercentage,
                    'best_accuracy' => $completion->best_accuracy,
                    'attempt_count' => $completion->attempt_count,
                    'next_article' => $nextArticle ? [
                        'id' => $nextArticle->id,
                        'title' => $nextArticle->title,
                    ] : null,
                    'redirect_url' => $redirectUrl,
                    'message' => $this->getCompletionMessage(
                        $validated['accuracy'],
                        $minPercentage,
                        $unlockedNext,
                        $completion->best_accuracy,
                        $completion->typing_speed,
                        $minTypingSpeed
                    ),
                ],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Completion save validation failed', [
                'user_id' => $user->id,
                'article_id' => $articleId,
                'errors' => $e->errors(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Failed to save completion', [
                'user_id' => $user->id,
                'article_id' => $articleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save completion: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current live progress for an article (for real-time display)
     */
    public function getLiveProgress(Request $request, $articleId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $validated = $request->validate([
                'current_accuracy' => 'required|numeric|min:0|max:100',
            ]);

            // Get article setting for completion threshold
            $setting = ArticleSetting::where('article_id', $articleId)->first();
            $minPercentage = $setting->min_completion_percentage ?? 70.00;

            // Get user's best accuracy so far
            $completion = UserArticleCompletion::where([
                'user_id' => $user->id,
                'article_id' => $articleId,
            ])->first();

            $bestAccuracy = $completion->best_accuracy ?? 0;
            $currentAccuracy = $validated['current_accuracy'];

            return response()->json([
                'success' => true,
                'progress' => [
                    'current_accuracy' => $currentAccuracy,
                    'best_accuracy' => $bestAccuracy,
                    'min_required' => $minPercentage,
                    'percentage_to_goal' => min(100, ($currentAccuracy / $minPercentage) * 100),
                    'will_unlock_next' => $currentAccuracy >= $minPercentage,
                    'remaining_to_unlock' => max(0, $minPercentage - $currentAccuracy),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get progress: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Determine redirect URL based on user's group and article settings
     */
    protected function getRedirectUrl($user, $setting)
    {
        $userRole = $user->roles->first()?->name ?? '';
        
        // Check if user is Group A (NLP-only)
        if (str_contains(strtolower($userRole), 'nlp-only') || 
            str_contains(strtolower($userRole), 'group a')) {
            return $setting->group_a_redirect ?? '/homophone-check';
        }
        
        // Check if user is Group B (NLP+LA)
        if (str_contains(strtolower($userRole), 'nlp+la') || 
            str_contains(strtolower($userRole), 'group b')) {
            $redirect = $setting->group_b_redirect ?? '/users/{id}/progress';
            // Replace {id} placeholder with actual user ID
            return str_replace('{id}', $user->id, $redirect);
        }
        
        // Admin or other roles - default to homophone check
        return '/homophone-check';
    }

    /**
     * Generate completion feedback message
     */
    protected function getCompletionMessage($accuracy, $minRequired, $unlockedNext, $bestAccuracy = null, $typingSpeed = null, $minTypingSpeed = null)
    {
        $accuracy = round($accuracy, 1);
        $minRequired = round($minRequired, 0);
        $bestAccuracy = $bestAccuracy ? round($bestAccuracy, 1) : $accuracy;

        $meetsAccuracy = $bestAccuracy >= $minRequired;
        $meetsTypingSpeed = $minTypingSpeed === null || ($typingSpeed ?? 0) >= $minTypingSpeed;

        if ($meetsAccuracy && $meetsTypingSpeed) {
            if ($unlockedNext) {
                return "Great job! Your best score is {$bestAccuracy}%" .
                       ($typingSpeed ? " with {$typingSpeed} WPM" : "") .
                       " and you've unlocked the next article!";
            } else {
                return "Excellent! Your best score is {$bestAccuracy}%" .
                       ($typingSpeed ? " with {$typingSpeed} WPM" : "") .
                       ". You've completed this article.";
            }
        } else {
            $messages = [];

            if (!$meetsAccuracy) {
                $needed = $minRequired - $bestAccuracy;
                $needed = round($needed, 1);
                $messages[] = "Accuracy: {$bestAccuracy}% (need {$needed}% more to reach {$minRequired}%)";
            }

            if (!$meetsTypingSpeed) {
                $speedNeeded = $minTypingSpeed - ($typingSpeed ?? 0);
                $speedNeeded = round($speedNeeded, 1);
                $messages[] = "Typing Speed: " . ($typingSpeed ?? 0) . " WPM (need {$speedNeeded} more WPM to reach {$minTypingSpeed} WPM)";
            }

            return "Keep practicing! " . implode(". ", $messages) . ".";
        }
    }
}