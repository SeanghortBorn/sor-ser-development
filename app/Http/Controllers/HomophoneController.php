<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Homophone;
use App\Models\HomophoneVariant;
use App\Services\HomophoneService;
use App\Http\Requests\Homophone\StoreHomophoneRequest;
use App\Http\Requests\Homophone\UpdateHomophoneRequest;
use Illuminate\Support\Facades\DB;

class HomophoneController extends Controller
{
    public function __construct(
        protected HomophoneService $homophoneService
    ) {}

    public function index(Request $request)
    {
        $search = trim($request->query('search', ''));

        $homophones = $this->homophoneService->getPaginated($search, 10);

        // Transform data for frontend compatibility
        $homophones->through(function ($homophone) {
            return $this->homophoneService->formatForFrontend($homophone);
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
        $homophone = $this->homophoneService->getById($id);

        return Inertia::render('HomoPhone/CreateEdit', [
            'homophone' => $this->homophoneService->formatForFrontend($homophone)
        ]);
    }

    public function store(StoreHomophoneRequest $request)
    {
        $this->homophoneService->create($request->validated());

        return redirect()->route('homophones.index')->with('success', 'Homophone added');
    }

    public function update(UpdateHomophoneRequest $request, $id)
    {
        $this->homophoneService->update($id, $request->validated());

        return redirect()->route('homophones.index')->with('success', 'Homophone updated');
    }

    public function destroy($id)
    {
        $this->homophoneService->delete($id);

        return redirect()->route('homophones.index')->with('success', 'Homophone deleted');
    }

    public function import(Request $request)
    {
        try {
            // Remove time limit for large imports
            set_time_limit(0);

            // Increase memory limit for large files
            ini_set('memory_limit', '512M');

            // Accept either file upload or direct homophones array
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $content = file_get_contents($file->getRealPath());
                if (!mb_detect_encoding($content, 'UTF-8', true)) {
                    $content = mb_convert_encoding($content, 'UTF-8');
                }
                $homophones = json_decode($content, true);
                if (json_last_error() !== JSON_ERROR_NONE || !is_array($homophones)) {
                    return back()->withErrors(['import' => 'Invalid JSON file: ' . json_last_error_msg()]);
                }
            } elseif ($request->has('homophones') && is_array($request->homophones)) {
                $homophones = $request->homophones;
            } else {
                return back()->withErrors(['import' => 'No file or homophones data provided.']);
            }
        } catch (\Exception $e) {
            \Log::error('Homophone import failed during file reading', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()->withErrors(['import' => 'Failed to read import file: ' . $e->getMessage()]);
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

        $normalize = function($str) {
            return preg_replace('/\s+/u', ' ', trim((string)$str));
        };

        // DUPLICATE DETECTION: Check if we need to scan for duplicates
        if ($request->query('scan', false)) {
            return $this->scanForDuplicates($homophones, $normalize);
        }

        // Get duplicate resolution choices from request (if provided)
        $duplicateResolutions = $request->input('duplicate_resolutions', []);

        // Build existing homophones cache (word + pronunciation for duplicate detection)
        $existingHomophones = Homophone::select('id', 'word', 'pronunciation')
            ->get()
            ->mapWithKeys(function ($item) use ($normalize) {
                $key = $normalize($item->word) . '|' . $normalize($item->pronunciation ?? '');
                return [$key => $item->id];
            })
            ->toArray();

        $imported = 0;
        $skipped = 0;
        $replaced = 0;

        try {
            // CHUNKED PROCESSING: Process in batches to avoid timeouts
            $chunkSize = 1000; // Process 1000 items at a time
            $chunks = array_chunk($homophones, $chunkSize);
            $totalChunks = count($chunks);

            \Log::info("Starting homophone import", [
                'total_items' => $count,
                'total_chunks' => $totalChunks,
                'chunk_size' => $chunkSize,
            ]);

            foreach ($chunks as $chunkIndex => $chunk) {
            // Process each chunk in its own transaction
            DB::transaction(function () use ($chunk, $normalize, &$existingHomophones, $duplicateResolutions, &$imported, &$skipped, &$replaced) {
                $homophonesToInsert = [];
                $homophonesToUpdate = [];
                $variantsToInsert = [];
                $now = now();
                $insertIndex = 0; // Track index for this batch only

                foreach ($chunk as $dataIndex => $data) {
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

                    $pronunciation = $normalized['pro'] ?? $normalized['phoneme'] ?? $normalized['pos'];

                    // Check for duplicate by word + pronunciation
                    $normalizedWord = $normalize($normalized['word']);
                    $normalizedPronunciation = $normalize($pronunciation ?? '');
                    $duplicateKey = $normalizedWord . '|' . $normalizedPronunciation;

                    if (isset($existingHomophones[$duplicateKey])) {
                        $existingId = $existingHomophones[$duplicateKey];

                        // Check if user provided resolution for this duplicate
                        $resolution = $duplicateResolutions[$duplicateKey] ?? 'skip';

                        if ($resolution === 'skip') {
                            $skipped++;
                            continue;
                        } elseif ($resolution === 'replace') {
                            // Update existing homophone
                            $homophonesToUpdate[$existingId] = [
                                'word' => $normalized['word'],
                                'pronunciation' => $pronunciation,
                                'definition' => $normalized['definition'],
                                'examples' => $normalized['example'] ? json_encode([$normalized['example']]) : null,
                                'updated_at' => $now,
                            ];
                            $replaced++;
                            continue;
                        }
                    }

                    // Convert homophone string to array
                    if (is_string($normalized['homophone'])) {
                        $normalized['homophone'] = array_filter(array_map('trim', explode(',', $normalized['homophone'])));
                    }

                    // Prepare homophone for batch insert
                    $homophonesToInsert[] = [
                        'word' => $normalized['word'],
                        'pronunciation' => $normalized['pro'] ?? $normalized['phoneme'] ?? $normalized['pos'],
                        'definition' => $normalized['definition'],
                        'examples' => $normalized['example'] ? json_encode([$normalized['example']]) : null,
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

                    // Store variants for later (use batch index, not global imported counter)
                    if (!empty($normalized['homophone']) && is_array($normalized['homophone'])) {
                        $variantsToInsert[$insertIndex] = $normalized['homophone'];
                    }

                    $insertIndex++; // Increment batch index
                    $imported++; // Increment global counter
                    $existingHomophones[$duplicateKey] = null; // Update cache (ID will be set after insert)
                }

                // Batch update homophones (for replacements)
                if (!empty($homophonesToUpdate)) {
                    foreach ($homophonesToUpdate as $id => $updateData) {
                        DB::table('homophones')->where('id', $id)->update($updateData);

                        // Delete old variants for this homophone
                        DB::table('homophone_variants')->where('homophone_id', $id)->delete();
                    }
                }

                // Batch insert homophones (much faster than individual inserts)
                if (!empty($homophonesToInsert)) {
                    // Insert homophones individually to get their IDs (still in same transaction)
                    $insertedIds = [];
                    foreach ($homophonesToInsert as $homophoneData) {
                        $id = DB::table('homophones')->insertGetId($homophoneData);
                        $insertedIds[] = $id;
                    }

                    // Prepare variants for batch insert using ACTUAL inserted IDs
                    $allVariants = [];
                    foreach ($variantsToInsert as $index => $variants) {
                        // Use the actual inserted ID at this index
                        if (!isset($insertedIds[$index])) {
                            \Log::error("Missing inserted ID", [
                                'index' => $index,
                                'insertedCount' => count($insertedIds),
                            ]);
                            continue;
                        }

                        $homophoneId = $insertedIds[$index];
                        foreach ($variants as $sortOrder => $variant) {
                            if (!empty($variant)) {
                                $allVariants[] = [
                                    'homophone_id' => $homophoneId,
                                    'variant_word' => $variant,
                                    'sort_order' => $sortOrder,
                                    'created_at' => $now,
                                    'updated_at' => $now,
                                ];
                            }
                        }
                    }

                    // Batch insert variants
                    if (!empty($allVariants)) {
                        DB::table('homophone_variants')->insert($allVariants);
                    }
                }
            });

                // Optional: Log progress for debugging
                \Log::info("Homophone import progress: Chunk " . ($chunkIndex + 1) . "/{$totalChunks} completed. Imported: {$imported}, Skipped: {$skipped}");
            }

            \Log::info("Homophone import completed successfully", [
                'imported' => $imported,
                'skipped' => $skipped,
                'replaced' => $replaced,
            ]);

            $message = "Import complete! Imported: {$imported}, Skipped: {$skipped}";
            if ($replaced > 0) {
                $message .= ", Replaced: {$replaced}";
            }
            $message .= " out of {$count} items.";

            return redirect()->route('homophones.index')->with('success', $message);

        } catch (\Exception $e) {
            \Log::error('Homophone import failed during processing', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'imported_so_far' => $imported,
                'skipped_so_far' => $skipped,
            ]);

            return back()->withErrors([
                'import' => 'Import failed after processing ' . $imported . ' items. Error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Scan for duplicates in the import data
     */
    private function scanForDuplicates($homophones, $normalize)
    {
        // Build existing homophones map (word + pronunciation)
        $existingHomophones = Homophone::select('id', 'word', 'pronunciation', 'definition')
            ->get()
            ->mapWithKeys(function ($item) use ($normalize) {
                $key = $normalize($item->word) . '|' . $normalize($item->pronunciation ?? '');
                return [$key => [
                    'id' => $item->id,
                    'word' => $item->word,
                    'pronunciation' => $item->pronunciation,
                    'definition' => $item->definition,
                ]];
            })
            ->toArray();

        $duplicates = [];

        foreach ($homophones as $index => $data) {
            $word = $data['word'] ?? $data['Word'] ?? null;
            $pronunciation = $data['pro'] ?? $data['Pronunciation'] ?? $data['pos'] ?? $data['POS'] ?? $data['phoneme'] ?? $data['Phoneme'] ?? null;
            $definition = $data['definition'] ?? $data['Definition'] ?? null;

            if (empty($word)) {
                continue;
            }

            $duplicateKey = $normalize($word) . '|' . $normalize($pronunciation ?? '');

            if (isset($existingHomophones[$duplicateKey])) {
                $existing = $existingHomophones[$duplicateKey];
                $duplicates[] = [
                    'key' => $duplicateKey,
                    'index' => $index,
                    'new' => [
                        'word' => $word,
                        'pronunciation' => $pronunciation,
                        'definition' => $definition,
                    ],
                    'existing' => $existing,
                ];
            }
        }

        return response()->json([
            'has_duplicates' => count($duplicates) > 0,
            'duplicate_count' => count($duplicates),
            'duplicates' => $duplicates,
            'total_items' => count($homophones),
        ]);
    }

    public function clear()
    {
        $this->homophoneService->clearAll();

        return redirect()->route('homophones.index')->with('success', 'All homophones cleared from database.');
    }
}
