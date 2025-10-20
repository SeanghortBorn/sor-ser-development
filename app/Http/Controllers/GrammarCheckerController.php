<?php

namespace App\Http\Controllers;

use App\Models\GrammarChecker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class GrammarCheckerController extends Controller
{
    public function index(Request $request)
    {
        $query = GrammarChecker::with('tags');

        // Search by title if search term is provided
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $checkers = $query->orderBy('id', 'asc')->paginate();
        $checkers->appends($request->only('search'));

        // For API/JS fetch, return JSON
        if ($request->wantsJson()) {
            return response()->json($checkers);
        }

        // For Inertia page render
        return Inertia::render('GrammarChecks/Index', [
            'checkers' => $checkers,
            'csrf_token' => csrf_token(),
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

     public function create()
    {
        return Inertia::render('GrammarChecks/GrammarCheck');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255', // allow empty title
            'paragraph' => 'nullable|string',
            'word_count' => 'required|integer',
            'incorrect_word_count' => 'required|integer',
            'reading_time' => 'required|integer',
            'article_id' => 'nullable|exists:articles,id', // <-- add validation
        ]);

        $data = [
            'paragraph' => $request->paragraph,
            'word_count' => $request->word_count,
            'incorrect_word_count' => $request->incorrect_word_count,
            'reading_time' => $request->reading_time,
            'user_id' => Auth::id(),
            'article_id' => $request->article_id, // <-- add this line
        ];
        // Only set title if not empty, otherwise let DB default
        if ($request->filled('title')) {
            $data['title'] = $request->title;
        }

        $checker = GrammarChecker::create($data);

        // For auto-save, return JSON
        if ($request->wantsJson()) {
            return response()->json($checker, 201);
        }

        return redirect()->route('grammar-checkers.index')->with('success', 'Grammar check created successfully.');
    }

    public function show(GrammarChecker $grammarChecker)
    {
        return response()->json($grammarChecker->load('tags'));
    }

    public function update(Request $request, GrammarChecker $grammarChecker)
    {
        $request->validate([
            'title' => 'nullable|string|max:255', // allow empty title
            'paragraph' => 'nullable|string',
            'word_count' => 'required|integer',
            'incorrect_word_count' => 'required|integer',
            'reading_time' => 'required|integer',
            'article_id' => 'nullable|exists:articles,id', // <-- add validation
        ]);

        $data = $request->all();
        // Only set title if not empty, otherwise let DB default
        if (array_key_exists('title', $data) && !$data['title']) {
            unset($data['title']);
        }

        // Ensure article_id is set (even if null)
        if (!array_key_exists('article_id', $data)) {
            $data['article_id'] = null;
        }

        $grammarChecker->update($data);

        // For auto-save, return JSON
        if ($request->wantsJson()) {
            return response()->json($grammarChecker);
        }

        return redirect()->route('grammar-checkers.index')->with('success', 'Grammar check updated successfully.');
    }

    public function destroy(GrammarChecker $grammarChecker)
    {
        $grammarChecker->delete();

        // Support JSON response for API/JS calls
        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('grammar-checkers.index')->with('success', 'Grammar check deleted successfully.');
    }

    // Add this method at the end of the controller class
    public function updateTags(Request $request, GrammarChecker $grammarChecker)
    {
        $request->validate([
            'tag_ids' => 'array',
            'tag_ids.*' => 'exists:tags,id',
        ]);
        $grammarChecker->tags()->sync($request->tag_ids ?? []);
        return response()->json($grammarChecker->load('tags'));
    }
}
