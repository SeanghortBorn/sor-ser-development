<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

            $activity = UserActivity::create([
                'user_id' => Auth::id(),
                'grammar_checker_id' => $validated['grammar_checker_id'] ?? null,
                'activity_type' => 'text_input',
                'character_entered' => $validated['character_entered'],
                'session_id' => $validated['session_id'] ?? Str::uuid(),
            ]);

            return response()->json(['success' => true, 'activity_id' => $activity->id]);
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

            $activity = UserActivity::create([
                'user_id' => Auth::id(),
                'grammar_checker_id' => $validated['grammar_checker_id'] ?? null,
                'article_id' => $validated['article_id'] ?? null,
                'activity_type' => 'comparison_action',
                'action' => $validated['action'],
                'comparison_type' => $validated['comparison_type'],
                'user_word' => $validated['user_word'] ?? '',
                'article_word' => $validated['article_word'] ?? '',
                'word_position' => $validated['word_position'] ?? null,
                'session_id' => $validated['session_id'] ?? Str::uuid(),
                'metadata' => [
                    'timestamp' => now()->toISOString(),
                ],
            ]);

            return response()->json(['success' => true, 'activity_id' => $activity->id]);
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
            ];

            // Increment counters based on activity type
            if ($validated['activity_type'] === 'audio_play') {
                $data['play_count'] = 1;
                
                // If pause duration is provided from frontend, use it
                if (isset($validated['pause_duration']) && $validated['pause_duration'] > 0) {
                    $data['pause_duration'] = $validated['pause_duration'];
                } else {
                    // Find the most recent pause for this audio in this session
                    $lastPause = UserActivity::where('user_id', $userId)
                        ->where('audio_id', $validated['audio_id'])
                        ->where('session_id', $sessionId)
                        ->where('activity_type', 'audio_pause')
                        ->whereNotNull('pause_started_at')
                        ->orderBy('created_at', 'desc')
                        ->first();
                    
                    // Calculate pause duration if there was a previous pause
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

            $activity = UserActivity::create($data);

            return response()->json([
                'success' => true, 
                'activity_id' => $activity->id,
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
