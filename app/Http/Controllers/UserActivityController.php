<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserActivityController extends Controller
{
    // Track text input
    public function trackTextInput(Request $request)
    {
        try {
            $validated = $request->validate([
                'grammar_checker_id' => 'nullable|exists:grammar_checkers,id',
                'character_entered' => 'required|string',
                'session_id' => 'nullable|string',
            ]);

            $data = [
                'user_id' => Auth::id(),
                'grammar_checker_id' => $validated['grammar_checker_id'] ?? null,
                'character_entered' => $validated['character_entered'],
                'session_id' => $validated['session_id'] ?? \Illuminate\Support\Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $activityId = DB::table('user_text_activities')->insertGetId($data);

            return response()->json(['success' => true, 'activity_id' => $activityId]);
        } catch (\Exception $e) {
            Log::error('Track text input error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Track comparison action (accept/dismiss)
    public function trackComparisonAction(Request $request)
    {
        try {
            $validated = $request->validate([
                'grammar_checker_id' => 'nullable|exists:grammar_checkers,id',
                'article_id' => 'nullable|exists:articles,id',
                'action' => 'required|in:accept,dismiss',
                'comparison_type' => 'required|in:missing,replaced,extra',
                'user_word' => 'nullable|string',
                'article_word' => 'nullable|string',
                'word_position' => 'nullable|integer',
                'session_id' => 'nullable|string',
            ]);

            $data = [
                'user_id' => Auth::id(),
                'grammar_checker_id' => $validated['grammar_checker_id'] ?? null,
                'article_id' => $validated['article_id'] ?? null,
                'action' => $validated['action'],
                'comparison_type' => $validated['comparison_type'],
                'user_word' => $validated['user_word'] ?? '',
                'article_word' => $validated['article_word'] ?? '',
                'word_position' => $validated['word_position'] ?? null,
                'session_id' => $validated['session_id'] ?? \Illuminate\Support\Str::uuid(),
                'metadata' => json_encode(['timestamp' => now()->toISOString()]),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $activityId = DB::table('user_comparison_activities')->insertGetId($data);

            return response()->json(['success' => true, 'activity_id' => $activityId]);
        } catch (\Exception $e) {
            Log::error('Track comparison action error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Track audio playback with automatic pause duration calculation
    public function trackAudioActivity(Request $request)
    {
        try {
            $validated = $request->validate([
                'audio_id' => 'required|exists:audios,id',
                'article_id' => 'nullable|exists:articles,id',
                'activity_type' => 'required|in:audio_play,audio_pause,audio_rewind,audio_forward',
                'playback_position' => 'nullable|numeric',
                'pause_duration' => 'nullable|numeric',
                'session_id' => 'nullable|string',
            ]);

            $userId = Auth::id();
            $sessionId = $validated['session_id'] ?? Str::uuid();

            $data = [
                'user_id' => $userId,
                'audio_id' => $validated['audio_id'],
                'article_id' => $validated['article_id'] ?? null,
                'activity_type' => $validated['activity_type'],
                'playback_position' => $validated['playback_position'] ?? null,
                'session_id' => $sessionId,
                'metadata' => json_encode(['timestamp' => now()->toISOString()]), // <-- set metadata
                'created_at' => now(), // <-- set created_at
                'updated_at' => now(), // <-- set updated_at
            ];

            // Increment counters based on activity type
            if ($validated['activity_type'] === 'audio_play') {
                $data['play_count'] = 1;
                if (isset($validated['pause_duration']) && $validated['pause_duration'] > 0) {
                    $data['pause_duration'] = $validated['pause_duration'];
                } else {
                    // Find the most recent pause for this audio in this session
                    $lastPause = DB::table('user_audio_activities')
                        ->where('user_id', $userId)
                        ->where('audio_id', $validated['audio_id'])
                        ->where('session_id', $sessionId)
                        ->where('activity_type', 'audio_pause')
                        ->whereNotNull('pause_started_at')
                        ->orderBy('created_at', 'desc')
                        ->first();
                    if ($lastPause && $lastPause->pause_started_at) {
                        $pauseDuration = now()->diffInSeconds($lastPause->pause_started_at);
                        $data['pause_duration'] = $pauseDuration;
                    }
                }
            } elseif ($validated['activity_type'] === 'audio_rewind') {
                $data['rewind_count'] = 1;
            } elseif ($validated['activity_type'] === 'audio_forward') {
                $data['forward_count'] = 1;
            } elseif ($validated['activity_type'] === 'audio_pause') {
                $data['pause_started_at'] = now();
            }

            // Insert into user_audio_activities table
            $activityId = DB::table('user_audio_activities')->insertGetId($data);

            return response()->json([
                'success' => true, 
                'activity_id' => $activityId,
                'pause_duration' => $data['pause_duration'] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Track audio activity error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false, 
                'error' => $e->getMessage(),
                'message' => 'Failed to track audio activity'
            ], 500);
        }
    }

    // Get user activity stats
    public function getStats(Request $request)
    {
        try {
            $userId = Auth::id();
            
            $stats = [
                'total_text_inputs' => UserActivity::where('user_id', $userId)
                    ->where('activity_type', 'text_input')
                    ->count(),
                'total_comparisons' => UserActivity::where('user_id', $userId)
                    ->where('activity_type', 'comparison_action')
                    ->count(),
                'accepts' => UserActivity::where('user_id', $userId)
                    ->where('activity_type', 'comparison_action')
                    ->where('action', 'accept')
                    ->count(),
                'dismisses' => UserActivity::where('user_id', $userId)
                    ->where('activity_type', 'comparison_action')
                    ->where('action', 'dismiss')
                    ->count(),
                'total_audio_plays' => UserActivity::where('user_id', $userId)
                    ->where('activity_type', 'audio_play')
                    ->sum('play_count'),
                'total_rewinds' => UserActivity::where('user_id', $userId)
                    ->where('activity_type', 'audio_rewind')
                    ->sum('rewind_count'),
                'total_forwards' => UserActivity::where('user_id', $userId)
                    ->where('activity_type', 'audio_forward')
                    ->sum('forward_count'),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Get stats error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
