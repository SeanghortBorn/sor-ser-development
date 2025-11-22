<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Article;
use App\Models\GrammarChecker;
use App\Models\UserComparisonActivity;
use App\Models\UserTypingActivity;
use App\Models\UserHomophoneAccuracy;
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
                'accepts' => $accepts ?: 'N/A',
                'dismiss' => $dismiss ?: 'N/A',
                'total_typings' => $totalTypings ?: 'N/A',
                'incorrect_typings' => $incorrectTypings ?: 'N/A',
                'homo_avg' => $homoAvg,
                'avg_pause' => $avgPause,
            ];
        });

        return Inertia::render('StudentAnalytics/Index', [
            'analytics' => $data,
        ]);
    }
}
