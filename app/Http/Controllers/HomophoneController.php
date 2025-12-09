<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Homophone;
use App\Models\HomophoneVariant;
use Illuminate\Support\Facades\DB;

class HomophoneController extends Controller
{
    public function index(Request $request)
    {
        // OPTIMIZED: Use Eloquent query builder instead of loading all into memory
        $search = trim($request->query('search', ''));

        $query = Homophone::withVariants()
            ->active()
            ->orderBy('id', 'asc');

        // Apply search filter using database query
        if ($search !== '') {
            $query->search($search);
        }

        // Use Laravel's built-in pagination (much more efficient!)
        $homophones = $query->paginate(10)
            ->withQueryString() // Preserve search query in pagination links
            ->through(function ($homophone) {
                // Transform data for frontend compatibility
                return [
                    'id' => $homophone->id,
                    'word' => $homophone->word,
                    'pos' => $homophone->pronunciation, // Map to old 'pos' field
                    'pro' => $homophone->pronunciation, // Map to old 'pro' field
                    'definition' => $homophone->definition,
                    'example' => is_array($homophone->examples) ? implode(', ', $homophone->examples) : ($homophone->examples ?? ''),
                    'phoneme' => $homophone->pronunciation, // Map to old 'phoneme' field
                    'homophone' => $homophone->variant_words, // Use accessor for variants
                    'is_active' => $homophone->is_active,
                    'created_at' => $homophone->created_at,
                ];
            });

        return Inertia::render('HomoPhone/Index', [
            'homophones' => $homophones,
            'search' => $search,
        ]);
    }

    public function create()
    {
        return Inertia::render('HomoPhone/CreateEdit');
    }

    public function edit($id)
    {
        $homophone = Homophone::withVariants()->findOrFail($id);

        // Transform for frontend compatibility
        return Inertia::render('HomoPhone/CreateEdit', [
            'homophone' => [
                'id' => $homophone->id,
                'word' => $homophone->word,
                'pos' => $homophone->pronunciation,
                'pro' => $homophone->pronunciation,
                'definition' => $homophone->definition,
                'example' => is_array($homophone->examples) ? implode(', ', $homophone->examples) : ($homophone->examples ?? ''),
                'phoneme' => $homophone->pronunciation,
                'homophone' => $homophone->variant_words,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'word' => 'required|string|max:255',
            'pos' => 'nullable|string|max:255',
            'pro' => 'nullable|string|max:255',
            'definition' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:1000',
            'phoneme' => 'nullable|string|max:255',
            'homophone' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated) {
            // Create main homophone record
            $homophone = Homophone::create([
                'word' => $validated['word'],
                'pronunciation' => $validated['pro'] ?? $validated['phoneme'] ?? $validated['pos'] ?? null,
                'definition' => $validated['definition'] ?? null,
                'examples' => $validated['example'] ? [$validated['example']] : null,
                'is_active' => true,
            ]);

            // Create variant records
            if (!empty($validated['homophone']) && is_array($validated['homophone'])) {
                foreach ($validated['homophone'] as $index => $variant) {
                    if (!empty($variant)) {
                        HomophoneVariant::create([
                            'homophone_id' => $homophone->id,
                            'variant_word' => $variant,
                            'sort_order' => $index,
                        ]);
                    }
                }
            }
        });

        return redirect()->route('homophones.index')->with('success', 'Homophone added');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'word' => 'required|string|max:255',
            'pos' => 'nullable|string|max:255',
            'pro' => 'nullable|string|max:255',
            'definition' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:1000',
            'phoneme' => 'nullable|string|max:255',
            'homophone' => 'nullable|array',
        ]);

        DB::transaction(function () use ($id, $validated) {
            $homophone = Homophone::findOrFail($id);

            // Update main record
            $homophone->update([
                'word' => $validated['word'],
                'pronunciation' => $validated['pro'] ?? $validated['phoneme'] ?? $validated['pos'] ?? null,
                'definition' => $validated['definition'] ?? null,
                'examples' => $validated['example'] ? [$validated['example']] : null,
            ]);

            // Delete existing variants
            $homophone->variants()->delete();

            // Create new variants
            if (!empty($validated['homophone']) && is_array($validated['homophone'])) {
                foreach ($validated['homophone'] as $index => $variant) {
                    if (!empty($variant)) {
                        HomophoneVariant::create([
                            'homophone_id' => $homophone->id,
                            'variant_word' => $variant,
                            'sort_order' => $index,
                        ]);
                    }
                }
            }
        });

        return redirect()->route('homophones.index')->with('success', 'Homophone updated');
    }

    public function destroy($id)
    {
        $homophone = Homophone::findOrFail($id);
        $homophone->delete(); // Soft delete (cascade deletes variants due to foreign key)

        return redirect()->route('homophones.index')->with('success', 'Homophone deleted');
    }

    public function import(Request $request)
    {
        set_time_limit(300);

        // Accept either file upload or direct homophones array
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $content = file_get_contents($file->getRealPath());
            if (!mb_detect_encoding($content, 'UTF-8', true)) {
                $content = mb_convert_encoding($content, 'UTF-8');
            }
            $homophones = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($homophones)) {
                return back()->withErrors(['import' => 'Invalid JSON file.']);
            }
        } elseif ($request->has('homophones') && is_array($request->homophones)) {
            $homophones = $request->homophones;
        } else {
            return back()->withErrors(['import' => 'No file or homophones data provided.']);
        }

        $count = count($homophones);
        $estimatedSeconds = round($count * 0.01, 2);

        if ($request->query('estimate', false)) {
            return response()->json([
                'count' => $count,
                'estimated_seconds' => $estimatedSeconds,
                'estimated_minutes' => round($estimatedSeconds / 60, 2),
                'message' => "Estimated import time: {$estimatedSeconds} seconds ({$count} items)"
            ]);
        }

        // OPTIMIZED: Build existing set using database query (much faster!)
        $normalize = function($str) {
            return preg_replace('/\s+/u', ' ', trim((string)$str));
        };

        $existingWords = Homophone::pluck('word', 'id')->toArray();
        $imported = 0;
        $skipped = 0;

        DB::transaction(function () use ($homophones, $normalize, $existingWords, &$imported, &$skipped) {
            foreach ($homophones as $data) {
                $normalized = [
                    'word' => $data['word'] ?? $data['Word'] ?? null,
                    'pos' => $data['pos'] ?? $data['POS'] ?? null,
                    'pro' => $data['pro'] ?? $data['Pronunciation'] ?? null,
                    'definition' => $data['definition'] ?? $data['Definition'] ?? null,
                    'example' => $data['example'] ?? $data['Example'] ?? '',
                    'phoneme' => $data['phoneme'] ?? $data['Phoneme'] ?? '',
                    'homophone' => $data['homophone'] ?? [],
                ];

                if (empty($normalized['word']) || empty($normalized['definition'])) {
                    $skipped++;
                    continue;
                }

                // Check for duplicate by word (simplified - can be enhanced)
                if (in_array($normalize($normalized['word']), array_map($normalize, $existingWords))) {
                    $skipped++;
                    continue;
                }

                // Convert homophone string to array
                if (is_string($normalized['homophone'])) {
                    $normalized['homophone'] = array_filter(array_map('trim', explode(',', $normalized['homophone'])));
                }

                // Create homophone with variants
                $homophone = Homophone::create([
                    'word' => $normalized['word'],
                    'pronunciation' => $normalized['pro'] ?? $normalized['phoneme'] ?? $normalized['pos'],
                    'definition' => $normalized['definition'],
                    'examples' => $normalized['example'] ? [$normalized['example']] : null,
                    'is_active' => true,
                ]);

                // Create variants
                if (!empty($normalized['homophone']) && is_array($normalized['homophone'])) {
                    foreach ($normalized['homophone'] as $index => $variant) {
                        if (!empty($variant)) {
                            HomophoneVariant::create([
                                'homophone_id' => $homophone->id,
                                'variant_word' => $variant,
                                'sort_order' => $index,
                            ]);
                        }
                    }
                }

                $imported++;
                $existingWords[$homophone->id] = $homophone->word; // Update cache
            }
        });

        return redirect()->route('homophones.index')
            ->with('success', "Import complete! Imported: {$imported}, Skipped: {$skipped}. Time: {$estimatedSeconds}s for {$count} items.");
    }

    public function clear()
    {
        // OPTIMIZED: Use database truncate instead of JSON file
        DB::transaction(function () {
            HomophoneVariant::query()->delete();
            Homophone::query()->delete();
        });

        return redirect()->route('homophones.index')->with('success', 'All homophones cleared from database.');
    }
}
