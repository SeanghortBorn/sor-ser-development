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
                'grammar_checker_id' => 'nullable|exists:grammar_checkers,id', // <-- added
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
                'grammar_checker_id' => $validated['grammar_checker_id'] ?? null, // <-- include grammar_checker_id
                'activity_type' => $validated['activity_type'],
                'playback_position' => $validated['playback_position'] ?? null,
                'session_id' => $sessionId,
                'metadata' => json_encode(['timestamp' => now()->toISOString()]),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Increment counters based on activity type
            if ($validated['activity_type'] === 'audio_play') {
                $data['play_count'] = 1;
                if (isset($validated['pause_duration']) && $validated['pause_duration'] > 0) {
                    $data['pause_duration'] = $validated['pause_duration'];
                } else {
                    // Find the most recent pause for this audio in this session (and same grammar_checker if provided)
                    $lastPauseQuery = DB::table('user_audio_activities')
                        ->where('user_id', $userId)
                        ->where('audio_id', $validated['audio_id'])
                        ->where('session_id', $sessionId)
                        ->where('activity_type', 'audio_pause')
                        ->whereNotNull('pause_started_at');

                    if (!empty($validated['grammar_checker_id'])) {
                        $lastPauseQuery->where('grammar_checker_id', $validated['grammar_checker_id']);
                    }

                    $lastPause = $lastPauseQuery->orderBy('created_at', 'desc')->first();

                    if ($lastPause && $lastPause->pause_started_at) {
                        // Ensure proper DateTime handling
                        $pauseStarted = \Carbon\Carbon::parse($lastPause->pause_started_at);
                        $pauseDuration = now()->diffInSeconds($pauseStarted);
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
            $sessionId = $request->query('session_id') ?? $request->input('session_id') ?? null;

            // If not authenticated and no session_id provided, return empty object instead of 500
            if (!$userId && !$sessionId) {
                return response()->json([]);
            }

            // Helper to build a base query for the given table scoped by user/session
            $buildQuery = function (string $table) use ($userId, $sessionId) {
                $q = DB::table($table);
                if ($userId) {
                    $q->where('user_id', $userId);
                } elseif ($sessionId) {
                    $q->where('session_id', $sessionId);
                }
                return $q;
            };

            // Comparison activities
            $total_comparisons = $buildQuery('user_comparison_activities')->count();
            $accepts = $buildQuery('user_comparison_activities')->where('action', 'accept')->count();
            $dismisses = $buildQuery('user_comparison_activities')->where('action', 'dismiss')->count();

            // counts by comparison_type (overall, regardless of accept/dismiss)
            $replaced_count = $buildQuery('user_comparison_activities')->where('comparison_type', 'replaced')->count();
            $extra_count = $buildQuery('user_comparison_activities')->where('comparison_type', 'extra')->count();
            $missing_count = $buildQuery('user_comparison_activities')->where('comparison_type', 'missing')->count();

            // Audio activities
            $total_audio_plays = (int) $buildQuery('user_audio_activities')->sum('play_count');
            $total_rewinds = (int) $buildQuery('user_audio_activities')->sum('rewind_count');
            $total_forwards = (int) $buildQuery('user_audio_activities')->sum('forward_count');

            $pause_count = $buildQuery('user_audio_activities')->where('activity_type', 'audio_pause')->count();
            $avg_pause_duration = $buildQuery('user_audio_activities')->whereNotNull('pause_duration')->avg('pause_duration');
            $avg_pause_duration = $avg_pause_duration ? (float) $avg_pause_duration : null;

            $result = [
                // keep backward-compatible keys UI may expect
                'total_comparisons' => (int) $total_comparisons,
                'accepts' => (int) $accepts,
                'dismisses' => (int) $dismisses,
                'replaced_count' => (int) $replaced_count,
                'extra_count' => (int) $extra_count,
                'missing_count' => (int) $missing_count,
                'total_audio_plays' => (int) $total_audio_plays,
                'total_rewinds' => (int) $total_rewinds,
                'total_forwards' => (int) $total_forwards,
                'pause_count' => (int) $pause_count,
                'avg_pause_duration' => $avg_pause_duration,
                'session_id' => $sessionId ?? null,
            ];

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Get stats error: ' . $e->getMessage(), ['request' => $request->all()]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
