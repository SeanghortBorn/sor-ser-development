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
            ]
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

        // Validate each homophone entry
        foreach ($homophones as $data) {
            Homophone::create($data);
        }

        return redirect()->route('homophones.index')->with('success', "Homophones imported successfully. Estimated time: {$estimatedSeconds}s for {$count} items.");
    }

    public function clear()
    {
        file_put_contents(storage_path('app/homophones.json'), json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return redirect()->route('homophones.index')->with('success', 'All homophones cleared.');
    }
}
