<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }

    /**
     * Admin resets a user's password.
     */
    public function adminReset(Request $request, $userId)
    {
        // You may want to add authorization logic here (e.g., Gate/Policy)
        $request->validate([
            'password' => ['required', Password::defaults()],
        ]);

        $user = User::findOrFail($userId);
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
