<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ArticleProgressionService;

class HomophoneCheckController extends Controller
{
    protected $progressionService;

    public function __construct(ArticleProgressionService $progressionService)
    {
        $this->progressionService = $progressionService;
    }

    /**
     * Display the homophone check page
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            // Guest user - redirect to login
            return redirect()->route('login');
        }

        // Get only available articles for this user (progression-filtered)
        $availableArticles = $this->progressionService->getAvailableArticles($user->id);

        return Inertia::render('HomophoneChecks/Index', [
            'articles' => $availableArticles,
            'userRole' => $user->roles->first()->name ?? 'No Role',
        ]);

        $user = $request->user();
    
    // Get only available articles
    $articles = $this->progressionService->getAvailableArticles($user->id);
    
    // DEBUG: Log what we're sending
    \Log::info('HomophoneCheck articles', [
        'user_id' => $user->id,
        'user_email' => $user->email,
        'articles_count' => $articles->count(),
        'article_ids' => $articles->pluck('id')->toArray(),
    ]);
    
    return Inertia::render('HomophoneChecks/Index', [
        'articles' => $articles,
        'userRole' => $user->roles->first()?->name ?? 'No Role',
    ]);
    }
}