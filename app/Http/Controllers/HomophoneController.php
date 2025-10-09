<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Homophone;

class HomophoneController extends Controller
{
    public function index(Request $request)
    {
        $all = Homophone::all();
        // Search filter
        $search = trim($request->query('search', ''));
        if ($search !== '') {
            $searchLower = mb_strtolower($search, 'UTF-8');
            $all = array_filter($all, function ($item) use ($searchLower) {
                return (
                    mb_stripos($item['word'] ?? '', $searchLower, 0, 'UTF-8') !== false ||
                    mb_stripos($item['pos'] ?? '', $searchLower, 0, 'UTF-8') !== false ||
                    mb_stripos($item['pro'] ?? '', $searchLower, 0, 'UTF-8') !== false
                );
            });
            $all = array_values($all); // reindex after filter
        }
        // Sort by id ascending (start from id 1)
        usort($all, fn($a, $b) => $a['id'] <=> $b['id']);
        $page = max(1, (int)$request->query('page', 1));
        $perPage = 10;
        $total = count($all);
        $offset = ($page - 1) * $perPage;
        $data = array_slice($all, $offset, $perPage);

        // Build smart pagination links for Inertia Pagination component
        $lastPage = max(1, ceil($total / $perPage));
        $links = [];
        // Previous button with text
        $links[] = [
            'url' => $page > 1 ? url()->current() . '?page=' . ($page - 1) : null,
            'label' => 'Previous',
            'active' => false,
        ];

        if ($lastPage <= 6) {
            // Show all pages
            for ($i = 1; $i <= $lastPage; $i++) {
                $links[] = [
                    'url' => $i === $page ? null : url()->current() . '?page=' . $i,
                    'label' => (string)$i,
                    'active' => $i === $page,
                ];
            }
        } else {
            // Always show first, last, current, and neighbors
            $links[] = [
                'url' => $page === 1 ? null : url()->current() . '?page=1',
                'label' => '1',
                'active' => $page === 1,
            ];
            if ($page > 3) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }
            // Show up to 3 neighbors before/after current
            for ($i = max(2, $page - 1); $i <= min($lastPage - 1, $page + 1); $i++) {
                $links[] = [
                    'url' => $i === $page ? null : url()->current() . '?page=' . $i,
                    'label' => (string)$i,
                    'active' => $i === $page,
                ];
            }
            if ($page < $lastPage - 2) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }
            $links[] = [
                'url' => $page === $lastPage ? null : url()->current() . '?page=' . $lastPage,
                'label' => (string)$lastPage,
                'active' => $page === $lastPage,
            ];
        }

        // Next button with text
        $links[] = [
            'url' => $page < $lastPage ? url()->current() . '?page=' . ($page + 1) : null,
            'label' => 'Next',
            'active' => false,
        ];

        return Inertia::render('HomoPhone/Index', [
            'homophones' => [
                'data' => $data,
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'links' => $links,
            ],
            'search' => $search, // pass to frontend
        ]);
    }

    public function create()
    {
        return Inertia::render('HomoPhone/CreateEdit');
    }

    public function edit($id)
    {
        $homophone = Homophone::find($id);
        return Inertia::render('HomoPhone/CreateEdit', [
            'homophone' => $homophone
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'word' => 'required|string|max:255',
            'pos' => 'nullable|string|max:255',
            'pro' => 'nullable|string|max:255',
            'definition' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:1000',
            'phoneme' => 'nullable|string|max:255',
            'homophone' => 'nullable|array',
        ]);
        Homophone::create($data);
        return redirect()->route('homophones.index')->with('success', 'Homophone added');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'word' => 'required|string|max:255',
            'pos' => 'nullable|string|max:255',
            'pro' => 'nullable|string|max:255',
            'definition' => 'nullable|string|max:1000',
            'example' => 'nullable|string|max:1000',
            'phoneme' => 'nullable|string|max:255',
            'homophone' => 'nullable|array',
        ]);
        Homophone::update($id, $data);
        return redirect()->route('homophones.index')->with('success', 'Homophone updated');
    }

    public function destroy($id)
    {
        Homophone::delete($id);
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

        // --- Estimate import time ---
        $count = count($homophones);
        $estimatedSeconds = round($count * 0.01, 2); // 0.01s per item
        $estimateMode = $request->query('estimate', false);
        if ($estimateMode) {
            return response()->json([
                'count' => $count,
                'estimated_seconds' => $estimatedSeconds,
                'estimated_minutes' => round($estimatedSeconds / 60, 2),
                'message' => "Estimated import time: {$estimatedSeconds} seconds ({$count} items)"
            ]);
        }

        // Normalize keys and import only valid entries
        $existing = Homophone::all();
        // Build a set of existing entries by word+pos+pro+definition (normalized)
        function normalize($str) {
            return preg_replace('/\s+/u', ' ', trim((string)$str));
        }
        $existingSet = [];
        foreach ($existing as $item) {
            $key = md5(
                normalize($item['word'] ?? '') . '|' .
                normalize($item['pos'] ?? '') . '|' .
                normalize($item['pro'] ?? '') . '|' .
                normalize($item['definition'] ?? '')
            );
            $existingSet[$key] = $item;
        }

        $imported = 0;
        foreach ($homophones as $data) {
            // Map keys if needed
            $normalized = [
                'word' => $data['word'] ?? $data['Word'] ?? null,
                'pos' => $data['pos'] ?? $data['POS'] ?? null,
                'pro' => $data['pro'] ?? $data['Pronunciation'] ?? null,
                'definition' => $data['definition'] ?? $data['Definition'] ?? null,
                'example' => $data['example'] ?? $data['Example'] ?? '',
                'phoneme' => $data['phoneme'] ?? $data['Phoneme'] ?? '',
                'homophone' => $data['homophone'] ?? [],
            ];
            // Only import if all required fields exist
            if (
                empty($normalized['word']) ||
                empty($normalized['pos']) ||
                empty($normalized['pro']) ||
                empty($normalized['definition'])
            ) {
                continue; // skip invalid
            }
            // If homophone is string, convert to array
            if (is_string($normalized['homophone'])) {
                $normalized['homophone'] = array_filter(array_map('trim', explode(',', $normalized['homophone'])));
            }
            // Check for full duplicate (word+pos+pro+definition, normalized)
            $key = md5(
                normalize($normalized['word']) . '|' .
                normalize($normalized['pos']) . '|' .
                normalize($normalized['pro']) . '|' .
                normalize($normalized['definition'])
            );
            if (isset($existingSet[$key])) {
                // Already exists, skip
                continue;
            } else {
                Homophone::create($normalized);
                $imported++;
            }
        }

        return redirect()->route('homophones.index')->with('success', "Homophones imported: {$imported}. Estimated time: {$estimatedSeconds}s for {$count} items.");
    }

    public function clear()
    {
        file_put_contents(storage_path('app/homophones.json'), json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return redirect()->route('homophones.index')->with('success', 'All homophones cleared.');
    }
}
