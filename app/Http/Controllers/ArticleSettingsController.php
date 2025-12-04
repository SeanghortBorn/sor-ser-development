<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleSetting;
use App\Models\UserArticleCompletion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ArticleSettingsController extends Controller
{
    /**
     * Display all articles with their settings (Admin View)
     * Shows the article order, prerequisites, timing, and modes
     */
    public function index()
    {
        // Check permission
        if (!auth()->user()->can('article-create')) {
            abort(403, 'You do not have permission to access article settings.');
        }
        
        // Get all articles with their settings, ordered by display_order
        $articles = Article::with(['file', 'audio'])
            ->get()
            ->map(function ($article) {
                // Get or create settings for each article
                $setting = ArticleSetting::getOrCreateForArticle($article->id);
                $setting->load('prerequisiteArticle');
                
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'file' => $article->file,
                    'audio' => $article->audio,
                    'setting' => [
                        'id' => $setting->id,
                        'display_order' => $setting->display_order,
                        'prerequisite_article_id' => $setting->prerequisite_article_id,
                        'prerequisite_title' => $setting->prerequisiteArticle?->title,
                        'unlock_delay_days' => $setting->unlock_delay_days,
                        'unlock_delay_hours' => $setting->unlock_delay_hours,
                        'unlock_delay_text' => $setting->unlock_delay_text,
                        'availability_mode' => $setting->availability_mode,
                        'availability_mode_text' => $setting->availability_mode_text,
                        'typing_mode' => $setting->typing_mode,
                        'typing_mode_text' => $setting->typing_mode_text,
                        'slug' => $setting->slug,
                        'category' => $setting->category,
                        'description' => $setting->description,
                        'is_active' => $setting->is_active,
                        'is_required' => $setting->is_required,
                        'max_attempts' => $setting->max_attempts,
                        'min_completion_accuracy' => $setting->min_completion_accuracy,
                        'min_completion_percentage' => $setting->min_completion_percentage ?? 70, // NEW
                        'group_a_redirect' => $setting->group_a_redirect, // NEW
                        'group_b_redirect' => $setting->group_b_redirect, // NEW
                    ],
                ];
            })
            ->sortBy('setting.display_order')
            ->values();

        // Get list of all articles for prerequisite dropdown
        $articleOptions = Article::select('id', 'title')->get();

        return Inertia::render('ArticleSettings/Index', [
            'articles' => $articles,
            'articleOptions' => $articleOptions,
        ]);
    }

    /**
     * Update settings for a single article
     * FIXED: Now properly handles all fields including new completion threshold
     */
    public function update(Request $request, $id)
    {
        try {
            // Find the setting by article_id
            $setting = ArticleSetting::where('article_id', $id)->firstOrFail();
            
            // Validate the request
            $validated = $request->validate([
                'display_order' => 'nullable|integer|min:0',
                'prerequisite_article_id' => 'nullable|exists:articles,id',
                'unlock_delay_days' => 'nullable|integer|min:0',
                'unlock_delay_hours' => 'nullable|integer|min:0|max:23',
                'availability_mode' => ['nullable', Rule::in(['always', 'sequential', 'time_gated'])],
                'typing_mode' => ['nullable', Rule::in(['nlp_only', 'nlp_la', 'none'])],
                'slug' => 'nullable|string|max:50',
                'category' => 'nullable|string|max:50',
                'description' => 'nullable|string|max:500',
                'is_active' => 'nullable|boolean',
                'is_required' => 'nullable|boolean',
                'max_attempts' => 'nullable|integer|min:1',
                'min_completion_accuracy' => 'nullable|numeric|min:0|max:100',
                // NEW FIELDS
                'min_completion_percentage' => 'nullable|numeric|min:0|max:100',
                'group_a_redirect' => 'nullable|string|max:255',
                'group_b_redirect' => 'nullable|string|max:255',
            ]);

            // Update the setting
            $setting->update($validated);

            // Log the update
            Log::info('Article setting updated', [
                'setting_id' => $setting->id,
                'article_id' => $setting->article_id,
                'updated_by' => auth()->id(),
                'updated_fields' => array_keys($validated),
            ]);

            // Return Inertia redirect back with success message
            return back()->with('success', 'Article settings updated successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Article setting validation failed', [
                'article_id' => $id,
                'errors' => $e->errors(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Article setting not found', [
                'article_id' => $id,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Article settings not found',
            ], 404);
            
        } catch (\Exception $e) {
            Log::error('Failed to update article setting', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'article_id' => $id,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update display order for multiple articles (drag & drop reordering)
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'order' => 'required|array',
            'order.*.article_id' => 'required|exists:articles,id',
            'order.*.display_order' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['order'] as $item) {
                ArticleSetting::where('article_id', $item['article_id'])
                    ->update(['display_order' => $item['display_order']]);
            }
        });

        return back()->with('success', 'Article order updated successfully.');
    }

    /**
     * Bulk update: Set typing mode for multiple articles
     */
    public function bulkUpdateTypingMode(Request $request)
    {
        $validated = $request->validate([
            'article_ids' => 'required|array',
            'article_ids.*' => 'exists:articles,id',
            'typing_mode' => ['required', Rule::in(['nlp_only', 'nlp_la', 'none'])],
        ]);

        ArticleSetting::whereIn('article_id', $validated['article_ids'])
            ->update(['typing_mode' => $validated['typing_mode']]);

        return back()->with('success', 'Typing mode updated for selected articles.');
    }

    /**
     * Quick setup: Create a sequential progression chain
     * Takes articles in order and sets up prerequisites automatically
     */
    public function setupSequentialChain(Request $request)
    {
        $validated = $request->validate([
            'article_ids' => 'required|array|min:1',
            'article_ids.*' => 'exists:articles,id',
            'default_delay_days' => 'integer|min:0',
            'default_delay_hours' => 'integer|min:0|max:23',
        ]);

        $articleIds = $validated['article_ids'];
        $delayDays = $validated['default_delay_days'] ?? 0;
        $delayHours = $validated['default_delay_hours'] ?? 0;

        DB::transaction(function () use ($articleIds, $delayDays, $delayHours) {
            $previousArticleId = null;

            foreach ($articleIds as $index => $articleId) {
                $setting = ArticleSetting::getOrCreateForArticle($articleId);
                
                $setting->update([
                    'display_order' => $index + 1,
                    'prerequisite_article_id' => $previousArticleId,
                    'availability_mode' => $previousArticleId 
                        ? ($delayDays > 0 || $delayHours > 0 ? 'time_gated' : 'sequential') 
                        : 'always', // First article is always available
                    'unlock_delay_days' => $previousArticleId ? $delayDays : 0,
                    'unlock_delay_hours' => $previousArticleId ? $delayHours : 0,
                ]);

                $previousArticleId = $articleId;
            }
        });

        return back()->with('success', 'Sequential chain setup completed.');
    }

    /**
     * Reset all settings to default
     */
    public function resetToDefault()
    {
        DB::transaction(function () {
            $articles = Article::orderBy('id')->get();
            
            foreach ($articles as $index => $article) {
                ArticleSetting::updateOrCreate(
                    ['article_id' => $article->id],
                    [
                        'display_order' => $index + 1,
                        'prerequisite_article_id' => null,
                        'unlock_delay_days' => 0,
                        'unlock_delay_hours' => 0,
                        'availability_mode' => 'always',
                        'typing_mode' => 'nlp_only',
                        'is_active' => true,
                        'is_required' => true,
                        'min_completion_percentage' => 70,
                    ]
                );
            }
        });

        return back()->with('success', 'All settings reset to default.');
    }

    /**
     * Preview progression chain (shows what users will see)
     */
    public function previewChain()
    {
        $chain = ArticleSetting::with(['article', 'prerequisiteArticle'])
            ->active()
            ->ordered()
            ->get()
            ->map(function ($setting, $index) {
                return [
                    'step' => $index + 1,
                    'article_title' => $setting->article->title,
                    'prerequisite_title' => $setting->prerequisiteArticle?->title ?? 'None',
                    'unlock_delay' => $setting->unlock_delay_text,
                    'availability_mode' => $setting->availability_mode_text,
                    'typing_mode' => $setting->typing_mode_text,
                    'completion_threshold' => ($setting->min_completion_percentage ?? 70) . '%',
                ];
            });

        return response()->json([
            'chain' => $chain,
            'total_articles' => $chain->count(),
        ]);
    }
}