<?php

namespace App\Http\Controllers;

use App\Models\Homophone;
use App\Models\Article;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserActivity;
use App\Models\GrammarChecker;
use App\Models\Feedback;
use App\Models\UserHomophoneAccuracy;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // KPI counts and month-over-month change (if timestamps available)
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfPrevMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfPrevMonth = $now->copy()->subMonth()->endOfMonth();

        // Use Article count for the first KPI (requested)
        $homophones = Article::count();
        $quizzes = Quiz::count();
        $students = User::count();
        // Replace KPI with comparison: users that HAVE 'student' permission (and no roles) vs users with NO permissions and NO roles
        $studentCount = 0;
        $normalCount = 0;
        if (Schema::hasTable('users') && Schema::hasTable('permissions')) {
            $studentCount = User::whereHas('permissions', function ($q) {
                $q->where('name', 'student');
            })->whereDoesntHave('roles')->count();

            $normalCount = User::whereDoesntHave('permissions')
                ->whereDoesntHave('roles')
                ->count();
        }

        // Compute changes if possible (fall back to null)
        // Month-over-month change for Articles (uses timestamps)
        $homophonesPrev = Article::whereBetween('created_at', [$startOfPrevMonth, $endOfPrevMonth])->count();
        $homophonesCurr = Article::whereBetween('created_at', [$startOfMonth, $now])->count();

        $quizzesPrev = Quiz::whereBetween('created_at', [$startOfPrevMonth, $endOfPrevMonth])->count();
        $quizzesCurr = Quiz::whereBetween('created_at', [$startOfMonth, $now])->count();

        $studentsPrev = User::whereBetween('created_at', [$startOfPrevMonth, $endOfPrevMonth])->count();
        $studentsCurr = User::whereBetween('created_at', [$startOfMonth, $now])->count();

        // For composite KPI we keep neutral change
        $sessionsPrev = 0;
        $sessionsCurr = 0;

        $toChange = function ($prev, $curr) {
            if ($prev === 0) return $curr > 0 ? '+100%' : '+0%';
            $delta = (($curr - $prev) / max(1, $prev)) * 100;
            $sign = $delta >= 0 ? '+' : '';
            return $sign . number_format($delta, 0) . '%';
        };

        // Active users and avg words per check (7d window)
        $gcHasTable = Schema::hasTable('grammar_checkers');
        $start7 = $now->copy()->subDays(6)->startOfDay();
        $prevStart7 = $now->copy()->subDays(13)->startOfDay();
        $prevEnd7 = $now->copy()->subDays(7)->endOfDay();

        $activeUsers7 = $gcHasTable ? GrammarChecker::where('created_at', '>=', $start7)->distinct('user_id')->count('user_id') : 0;
        $activeUsers7Prev = $gcHasTable ? GrammarChecker::whereBetween('created_at', [$prevStart7, $prevEnd7])->distinct('user_id')->count('user_id') : 0;

        $checks7 = $gcHasTable ? GrammarChecker::where('created_at', '>=', $start7)->count() : 0;
        $words7 = $gcHasTable ? GrammarChecker::where('created_at', '>=', $start7)->sum('word_count') : 0;
        $avgWords7 = $checks7 > 0 ? (int) round($words7 / $checks7) : 0;

        $checks7Prev = $gcHasTable ? GrammarChecker::whereBetween('created_at', [$prevStart7, $prevEnd7])->count() : 0;
        $words7Prev = $gcHasTable ? GrammarChecker::whereBetween('created_at', [$prevStart7, $prevEnd7])->sum('word_count') : 0;
        $avgWords7Prev = $checks7Prev > 0 ? (int) round($words7Prev / $checks7Prev) : 0;

        // Accuracy metrics (7d) from user_homophone_accuracies
        $hasAccuracy = Schema::hasTable('user_homophone_accuracies');
        $acc7Avg = 0; $acc7AvgPrev = 0; $acc7High = 0; $acc7HighPrev = 0;
        if ($hasAccuracy) {
            $acc7Avg = (float) (UserHomophoneAccuracy::where('created_at', '>=', $start7)->avg('accuracy') ?? 0);
            $acc7AvgPrev = (float) (UserHomophoneAccuracy::whereBetween('created_at', [$prevStart7, $prevEnd7])->avg('accuracy') ?? 0);
            $acc7High = (int) UserHomophoneAccuracy::where('created_at', '>=', $start7)->where('accuracy', '>=', 90)->count();
            $acc7HighPrev = (int) UserHomophoneAccuracy::whereBetween('created_at', [$prevStart7, $prevEnd7])->where('accuracy', '>=', 90)->count();
        }

        $stats = [
            'homophones' => ['count' => $homophones, 'change' => $toChange($homophonesPrev, $homophonesCurr)],
            'quizzes'    => ['count' => $quizzes, 'change' => $toChange($quizzesPrev, $quizzesCurr)],
            'students'   => ['count' => $students, 'change' => $toChange($studentsPrev, $studentsCurr)],
            // Composite value "students/normal" as requested
            'sessions'   => ['count' => $studentCount . '/' . $normalCount, 'change' => '+0%'],
            'activeUsers' => ['count' => $activeUsers7, 'change' => $toChange($activeUsers7Prev, $activeUsers7)],
            'avgWords' => ['count' => $avgWords7, 'change' => $toChange($avgWords7Prev, $avgWords7)],
            'avgAccuracy' => ['count' => (int) round($acc7Avg), 'change' => $toChange((int) round($acc7AvgPrev), (int) round($acc7Avg))],
            'highAccuracy' => ['count' => $acc7High, 'change' => $toChange($acc7HighPrev, $acc7High)],
        ];

        // Weekly activity: last 7 days derived from Homophone Check (GrammarChecker)
        $days = collect(range(0, 6))->map(function ($i) use ($now) {
            return $now->copy()->subDays(6 - $i)->startOfDay();
        });

        $hasGC = Schema::hasTable('grammar_checkers');
        $weeklyData = $days->map(function (Carbon $day) use ($hasGC) {
            $end = $day->copy()->endOfDay();
            if (!$hasGC) {
                return [ 'day' => $day->format('D'), 'sessions' => 0, 'engagement' => 0 ];
            }
            $sessions = GrammarChecker::whereBetween('created_at', [$day, $end])->count();
            $engagement = GrammarChecker::whereBetween('created_at', [$day, $end])->sum('word_count');
            return [
                'day' => $day->format('D'),
                'sessions' => (int) $sessions,
                'engagement' => (int) $engagement,
            ];
        })->values();

        // Top Articles by checks (GrammarChecker)
        $topArticles = collect();
        if ($gcHasTable) {
            $topArticles = GrammarChecker::select('article_id', DB::raw('count(*) as checks'))
                ->whereNotNull('article_id')
                ->groupBy('article_id')
                ->orderByDesc('checks')
                ->join('articles', 'articles.id', '=', 'grammar_checkers.article_id')
                ->take(5)
                ->get(['articles.title as title', 'grammar_checkers.article_id as article_id', DB::raw('count(*) as checks')])
                ->map(fn ($r) => [ 'name' => $r->title ?? ('Article #' . $r->article_id), 'attempts' => (int) $r->checks ]);
        }

        // Keep levelData for compatibility (not used in UI)
        $levelData = [
            ['level' => 'Beginner', 'students' => 0],
            ['level' => 'Intermediate', 'students' => 0],
            ['level' => 'Advanced', 'students' => 0],
        ];

        // Recent activity section removed from frontend; keep empty to be safe
        $recentActivities = collect();

        // Comparison: users with role 'student' vs users with no roles, based on GrammarChecker activity
        $comparison = [
            'totals' => ['student' => 0, 'norole' => 0],
            'avgWordPerCheck' => ['student' => 0, 'norole' => 0],
            'avgChecksPerUser' => ['student' => 0, 'norole' => 0],
            'trend7d' => [],
            'distribution' => [
                ['name' => 'Student', 'value' => 0],
                ['name' => 'No Role', 'value' => 0],
            ],
        ];
        if (
            $hasGC &&
            Schema::hasTable('users') &&
            Schema::hasTable('permissions') &&
            Schema::hasTable('model_has_permissions')
        ) {
            // Students identified by having 'student' PERMISSION and no roles (matches Users controller logic)
            $studentIds = User::whereHas('permissions', function ($q) {
                $q->where('name', 'student');
            })->whereDoesntHave('roles')->pluck('id');
            // "No Role" group = users with NO permissions AND NO roles
            $noRoleIds = User::whereDoesntHave('permissions')->whereDoesntHave('roles')->pluck('id');

            $studentTotal = GrammarChecker::whereIn('user_id', $studentIds)->count();
            $noRoleTotal = GrammarChecker::whereIn('user_id', $noRoleIds)->count();

            $studentAvgWord = (int) round(GrammarChecker::whereIn('user_id', $studentIds)->avg('word_count') ?? 0);
            $noRoleAvgWord = (int) round(GrammarChecker::whereIn('user_id', $noRoleIds)->avg('word_count') ?? 0);

            $studentUsers = GrammarChecker::whereIn('user_id', $studentIds)->distinct('user_id')->count('user_id');
            $noRoleUsers = GrammarChecker::whereIn('user_id', $noRoleIds)->distinct('user_id')->count('user_id');
            $studentAvgChecksPerUser = $studentUsers > 0 ? (float) round($studentTotal / $studentUsers, 2) : 0;
            $noRoleAvgChecksPerUser = $noRoleUsers > 0 ? (float) round($noRoleTotal / $noRoleUsers, 2) : 0;

            $trend = $days->map(function (Carbon $day) use ($studentIds, $noRoleIds) {
                $end = $day->copy()->endOfDay();
                $student = GrammarChecker::whereBetween('created_at', [$day, $end])->whereIn('user_id', $studentIds)->count();
                $norole = GrammarChecker::whereBetween('created_at', [$day, $end])->whereIn('user_id', $noRoleIds)->count();
                return [
                    'day' => $day->format('D'),
                    'student' => (int) $student,
                    'norole' => (int) $norole,
                ];
            })->values();

            $comparison = [
                'totals' => ['student' => $studentTotal, 'norole' => $noRoleTotal],
                'avgWordPerCheck' => ['student' => $studentAvgWord, 'norole' => $noRoleAvgWord],
                'avgChecksPerUser' => ['student' => $studentAvgChecksPerUser, 'norole' => $noRoleAvgChecksPerUser],
                'trend7d' => $trend,
                'distribution' => [
                    ['name' => 'Student', 'value' => $studentTotal],
                    ['name' => 'No Role', 'value' => $noRoleTotal],
                ],
            ];
        }

        return Inertia::render('Dashboards/Dashboard', [
            'stats' => $stats,
            'weeklyData' => $weeklyData,
            'topArticles' => $topArticles,
            'levelData' => $levelData,
            'recentActivities' => $recentActivities,
            'comparison' => $comparison,
        ]);
    }
}
