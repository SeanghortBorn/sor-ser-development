<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserHomophoneAccuracy;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AccuracyController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'grammar_checker_id' => 'nullable|integer',
            'article_id' => 'nullable|integer',
            'accuracy' => 'nullable|numeric',
            'replaced_count' => 'nullable|integer',
            'extra_count' => 'nullable|integer',
            'missing_count' => 'nullable|integer',
            'avg_pause_duration' => 'nullable|numeric',
            // new fields from UI
            'user_word_count' => 'nullable|integer',
            'article_total_words' => 'nullable|integer',
            'reading_time_seconds' => 'nullable|integer',
        ]);

        try {
            $userId = Auth::id();

            // Find existing record:
            // 1) prefer matching user_id + grammar_checker_id
            $existing = null;
            if (!empty($data['grammar_checker_id'])) {
                if ($userId) {
                    $existing = UserHomophoneAccuracy::where('user_id', $userId)
                        ->where('grammar_checker_id', $data['grammar_checker_id'])
                        ->first();
                }
            }

            $payload = [
                'user_id' => $userId,
                'grammar_checker_id' => $data['grammar_checker_id'] ?? null,
                'article_id' => $data['article_id'] ?? null,
                'accuracy' => isset($data['accuracy']) ? round($data['accuracy'], 2) : null,
                'replaced_count' => $data['replaced_count'] ?? 0,
                'extra_count' => $data['extra_count'] ?? 0,
                'missing_count' => $data['missing_count'] ?? 0,
                'avg_pause_duration' => (function($v) {
                    if (!isset($v)) return null;
                    // handle empty string explicitly
                    if ($v === '' || $v === 'null' || $v === null) return null;
                    if (!is_numeric($v)) return null;
                    return round((float)$v, 2);
                })($data['avg_pause_duration'] ?? null),
                // store UI values
                'user_word_count' => $data['user_word_count'] ?? null,
                'article_total_words' => $data['article_total_words'] ?? null,
                'reading_time_seconds' => $data['reading_time_seconds'] ?? null,
            ];

            // Backend fallback: if avg_pause_duration still null and we have a user + grammar_checker,
            // compute average from recent user_audio_activities to avoid storing NULL when data exists.
            if ($payload['avg_pause_duration'] === null && $userId && !empty($payload['grammar_checker_id'])) {
                $avg = DB::table('user_audio_activities')
                    ->where('user_id', $userId)
                    ->where('grammar_checker_id', $payload['grammar_checker_id'])
                    ->whereNotNull('pause_duration')
                    ->avg('pause_duration');
                if ($avg !== null) {
                    $payload['avg_pause_duration'] = round(floatval($avg), 2);
                }
            }

            if ($existing) {
                // Explicitly assign each payload key so nulls are applied (->update can sometimes skip/transform)
                foreach ($payload as $key => $value) {
                    $existing->{$key} = $value;
                }
                $existing->save();
                $record = $existing;
                $created = false;
            } else {
                // Create new record; ensure user_id null if not authenticated
                if (empty($payload['user_id'])) {
                    $payload['user_id'] = null;
                }
                $record = UserHomophoneAccuracy::create($payload);
                $created = true;
            }

            return response()->json([
                'success' => true,
                'id' => $record->id,
                'created' => $created,
            ], $created ? 201 : 200);
        } catch (\Exception $e) {
            Log::error('Accuracy store error: ' . $e->getMessage(), ['payload' => $request->all()]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Add index method to return accuracies (scoped to current user when available)
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();
            $query = UserHomophoneAccuracy::query();

            // If authenticated, return only that user's records by default
            if ($userId) {
                $query->where('user_id', $userId);
            }

            // Optional filters
            if ($request->filled('grammar_checker_id')) {
                $query->where('grammar_checker_id', $request->input('grammar_checker_id'));
            }
            if ($request->filled('article_id')) {
                $query->where('article_id', $request->input('article_id'));
            }

            $items = $query->get();

            return response()->json($items);
        } catch (\Exception $e) {
            Log::error('Accuracy index error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
