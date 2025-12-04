<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Article;
use App\Models\UserArticleCompletion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');

        if ($isAdmin) {
            // ═══════════════════════════════════════════════════════════════
            // ADMIN VIEW - System-wide statistics
            // ═══════════════════════════════════════════════════════════════
            
            $stats = [
                'homophones' => [
                    'count' => $this->safeCount('homophones'),
                    'change' => '+5%',
                ],
                'quizzes' => [
                    'count' => $this->safeCount('quizzes'),
                    'change' => '+3%',
                ],
                'students' => [
                    'count' => User::whereHas('roles', function($q) {
                        $q->whereIn('name', ['Group A: NLP-only', 'Group B: NLP+LA', 'Student']);
                    })->count(),
                    'change' => '+12%',
                ],
                'sessions' => [
                    'count' => $this->safeCount('user_article_completions'),
                    'change' => '+8%',
                ],
                'articles' => [
                    'count' => Article::count(),
                    'change' => '+10%',
                ],
                'users' => [
                    'count' => User::count(),
                    'change' => '+8%',
                ],
            ];

            // Recent activity
            $recentActivity = [];
            if (Schema::hasTable('user_article_completions')) {
                $recentActivity = UserArticleCompletion::with(['user', 'article'])
                    ->orderBy('completed_at', 'desc')
                    ->limit(10)
                    ->get();
            }

            return Inertia::render('Dashboard', [
                'stats' => $stats,
                'recentActivity' => $recentActivity,
                'isAdmin' => true,
            ]);
        } else {
            // ═══════════════════════════════════════════════════════════════
            // STUDENT VIEW - Personal statistics only
            // ═══════════════════════════════════════════════════════════════
            
            $totalArticles = Article::count();
            $completedArticles = 0;
            
            if (Schema::hasTable('user_article_completions')) {
                $completedArticles = UserArticleCompletion::where('user_id', $user->id)
                    ->distinct('article_id')
                    ->count();
            }
            
            $completionRate = $totalArticles > 0 
                ? round(($completedArticles / $totalArticles) * 100, 2) 
                : 0;

            $stats = [
                'articles_completed' => $completedArticles,
                'total_articles' => $totalArticles,
                'completion_rate' => $completionRate,
            ];

            $recentActivity = [];
            if (Schema::hasTable('user_article_completions')) {
                $recentActivity = UserArticleCompletion::with('article')
                    ->where('user_id', $user->id)
                    ->orderBy('completed_at', 'desc')
                    ->limit(10)
                    ->get();
            }

            return Inertia::render('Dashboard', [
                'stats' => $stats,
                'recentActivity' => $recentActivity,
                'isAdmin' => false,
            ]);
        }
    }

    /**
     * Safely count records from table (returns 0 if table doesn't exist)
     */
    protected function safeCount($tableName)
    {
        try {
            if (Schema::hasTable($tableName)) {
                return DB::table($tableName)->count();
            }
            return 0;
        } catch (\Exception $e) {
            return 0;
        }
    }
}