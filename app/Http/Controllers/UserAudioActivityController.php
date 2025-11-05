<?php

namespace App\Http\Controllers;

use App\Models\UserAudioActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserAudioActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = UserAudioActivity::query();

        // Filter by user
        if ($userId = Auth::id()) {
            $query->where('user_id', $userId);
        }

        // Filter by grammar_checker_id
        if ($request->has('grammar_checker_id') && $request->grammar_checker_id) {
            $query->where('grammar_checker_id', $request->grammar_checker_id);
        }

        // Filter by article_id
        if ($request->has('article_id') && $request->article_id) {
            $query->where('article_id', $request->article_id);
        }

        // Filter by audio_id
        if ($request->has('audio_id') && $request->audio_id) {
            $query->where('audio_id', $request->audio_id);
        }

        $activities = $query->orderBy('created_at', 'desc')
            ->limit($request->get('limit', 200))
            ->get();

        return response()->json($activities);
    }
}
