<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserTypingActivity;

class UserTypingActivityController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'grammar_checker_id' => 'required|integer|exists:grammar_checkers,id',
            'user_id'            => 'required|integer|exists:users,id',
            'character'          => 'nullable|string|max:50',   // NULL allowed!
            'status'             => 'required|in:0,1',
        ]);

        if (Auth::check() && $request->user_id != Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        UserTypingActivity::create([
            'grammar_checker_id' => $request->grammar_checker_id,
            'user_id'            => $request->user_id,
            'character'          => $request->character,    // can be null
            'status'             => (int) $request->status,
        ]);

        return response()->json(['success' => true], 201);
    }
}