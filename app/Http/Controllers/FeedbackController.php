<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    // List feedback (latest first)
    public function index()
    {
        $feedbacks = Feedback::latest()->paginate(10)->appends(request()->query());
        return Inertia::render('Feedback/Index', [
            'feedbacks' => $feedbacks
        ]);
    }

    // Show create form
    public function create()
    {
        return Inertia::render('Feedback/CreateEdit');
    }

    // Store normal feedback message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $feedback = Feedback::create([
            'user_id' => Auth::id(),
            'message' => $validated['message'],
        ]);

        // If AJAX, return JSON response
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Feedback submitted successfully',
                'data' => $feedback
            ], 201);
        }

        // Otherwise normal redirect
        return to_route('feedbacks.index')->with('success', 'Feedback submitted successfully');
    }

    // Show edit form
    public function edit($id)
    {
        $feedback = Feedback::findOrFail($id);
        return Inertia::render('Feedback/CreateEdit', [
            'feedback' => $feedback,
        ]);
    }

    // Update feedback
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $feedback = Feedback::findOrFail($id);
        $feedback->update(['message' => $validated['message']]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Feedback updated successfully',
                'data' => $feedback
            ]);
        }

        return to_route('feedbacks.index')->with('success', 'Feedback updated successfully');
    }

    // Delete feedback
    public function destroy(Request $request, $id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Feedback deleted successfully'
            ]);
        }

        return to_route('feedbacks.index')->with('success', 'Feedback deleted successfully');
    }

    // Grammar feedback endpoint (AJAX JSON only)
    public function grammar(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:accept,dismiss,custom_accept',
            'error' => 'required|string|max:255',
            'replacement' => 'nullable|string|max:255',
            'checker_id' => 'nullable|integer',
            'timestamp' => 'nullable|date',
        ]);

        $payload = [
            'type' => 'grammar',
            'action' => $request->action,
            'error' => $request->error,
            'replacement' => $request->replacement,
            'checker_id' => $request->checker_id,
            'timestamp' => $request->timestamp ?? now()->toIso8601String(),
            'ip' => $request->ip(),
            'agent' => $request->userAgent(),
        ];

        $feedback = Feedback::create([
            'user_id' => Auth::id(),
            'message' => json_encode($payload),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Grammar feedback submitted successfully',
            'data' => $payload
        ]);
    }
}
