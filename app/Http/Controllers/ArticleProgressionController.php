<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleSetting;
use App\Models\UserArticleCompletion;
use App\Services\ArticleProgressionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ArticleProgressionController extends Controller
{
    protected ArticleProgressionService $progressionService;

    public function __construct(ArticleProgressionService $progressionService)
    {
        $this->progressionService = $progressionService;
    }

    /**
     * Display articles list with availability status
     * This is the main page users see to select articles
     */
    public function index()
    {
        $userId = Auth::id();
        
        // Get all articles with their availability status
        $articles = $this->progressionService->getArticlesForUser($userId);
        
        // Get progress summary
        $progress = $this->progressionService->getUserProgressSummary($userId);
        
        // Get next unlocking article (if any are time-gated)
        $nextUnlock = $this->progressionService->getNextUnlockingArticle($userId);
        
        // Get current suggested article
        $currentArticle = $this->progressionService->getCurrentArticleForUser($userId);

        return Inertia::render('Articles/ProgressionIndex', [
            'articles' => $articles,
            'progress' => $progress,
            'nextUnlock' => $nextUnlock,
            'currentArticle' => $currentArticle,
        ]);
    }

    /**
     * Show a specific article (with access check)
     */
    public function show(int $id)
    {
        $userId = Auth::id();
        
        // Check if user can access this article
        [$canAccess, $reason, $availableAt] = $this->progressionService->canUserAccessArticle($userId, $id);

        if (!$canAccess) {
            return back()->with('error', $reason)->with('availableAt', $availableAt);
        }

        // Record that user started this article
        $this->progressionService->recordArticleStart($userId, $id);

        // Get article with settings
        $article = Article::with(['file', 'audio'])->findOrFail($id);
        $setting = ArticleSetting::where('article_id', $id)->first();
        
        // Get typing mode features
        $typingMode = $this->progressionService->getArticleTypingMode($id);

        // Get user's completion record for this article
        $completion = UserArticleCompletion::where('user_id', $userId)
            ->where('article_id', $id)
            ->first();

        return Inertia::render('Articles/Show', [
            'article' => $article,
            'setting' => $setting,
            'typingMode' => $typingMode,
            'completion' => $completion,
        ]);
    }

    /**
     * API: Check if article is available (for AJAX requests)
     */
    public function checkAvailability(Request $request, int $id)
    {
        $userId = Auth::id();
        
        [$canAccess, $reason, $availableAt] = $this->progressionService->canUserAccessArticle($userId, $id);
        $timeRemaining = $this->progressionService->getTimeUntilUnlock($userId, $id);

        return response()->json([
            'available' => $canAccess,
            'reason' => $reason,
            'available_at' => $availableAt?->toIso8601String(),
            'time_remaining' => $timeRemaining,
        ]);
    }

    /**
     * API: Record article completion
     */
    public function recordCompletion(Request $request, int $id)
    {
        $validated = $request->validate([
            'accuracy' => 'required|numeric|min:0|max:100',
            'grammar_checker_id' => 'nullable|exists:grammar_checkers,id',
            'time_spent' => 'nullable|integer|min:0',
        ]);

        $userId = Auth::id();
        
        $completion = $this->progressionService->recordArticleCompletion(
            $userId,
            $id,
            $validated['accuracy'],
            $validated['grammar_checker_id'] ?? null,
            $validated['time_spent'] ?? null
        );

        // Get updated progress
        $progress = $this->progressionService->getUserProgressSummary($userId);
        
        // Get next article info
        $nextArticle = $this->progressionService->getCurrentArticleForUser($userId);
        $nextUnlock = $this->progressionService->getNextUnlockingArticle($userId);

        return response()->json([
            'success' => true,
            'completion' => $completion,
            'progress' => $progress,
            'next_article' => $nextArticle,
            'next_unlock' => $nextUnlock,
            'message' => $this->getCompletionMessage($completion),
        ]);
    }

    /**
     * API: Get user progress
     */
    public function getProgress()
    {
        $userId = Auth::id();
        
        return response()->json([
            'progress' => $this->progressionService->getUserProgressSummary($userId),
            'articles' => $this->progressionService->getArticlesForUser($userId),
            'current_article' => $this->progressionService->getCurrentArticleForUser($userId),
            'next_unlock' => $this->progressionService->getNextUnlockingArticle($userId),
            'all_completed' => $this->progressionService->hasCompletedAllRequired($userId),
        ]);
    }

    /**
     * Get completion message based on status
     */
    private function getCompletionMessage(UserArticleCompletion $completion): string
    {
        return match($completion->status) {
            'passed' => '🎉 Excellent! You passed this article!',
            'completed' => '✅ Article completed successfully!',
            'failed' => '📝 Keep practicing! You can try again.',
            default => 'Progress saved.',
        };
    }
}