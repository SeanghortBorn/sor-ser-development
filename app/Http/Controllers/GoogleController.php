<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Exception;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class GoogleController extends Controller
{
    /**
     * Redirect to Google for authentication.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google callback and login or register the user.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Try to find existing user by Google ID
            $findUser = User::where('google_id', $googleUser->id)->first();

            if ($findUser) {
                // Check for 2FA
                if ($findUser->two_factor_secret && $findUser->two_factor_confirmed_at) {
                    // Set session for 2FA challenge (like Fortify)
                    session(['login.id' => $findUser->getAuthIdentifier()]);
                    return redirect()->route('two-factor.login');
                }
                Auth::login($findUser);
                return redirect()->intended(route('homophone-check.index'));
            }

            // If not found, try by email
            $existingUser = User::where('email', $googleUser->email)->first();

            if ($existingUser) {
                // Update existing user with Google ID and mark email as verified
                $existingUser->update([
                    'google_id' => $googleUser->id,
                    'email_verified_at' => now(),
                ]);
                // Check for 2FA
                if ($existingUser->two_factor_secret && $existingUser->two_factor_confirmed_at) {
                    session(['login.id' => $existingUser->getAuthIdentifier()]);
                    return redirect()->route('two-factor.login');
                }
                Auth::login($existingUser);
                return redirect()->intended(route('homophone-check.index'));
            }

            // Otherwise, register new user
            $newUser = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'google_id' => $googleUser->id,
                'password' => \Illuminate\Support\Facades\Hash::make('12345678'),
                'email_verified_at' => now(),
            ]);

            // Assign default 'user' role to new Google signup users (same as manual signup)
            if ($newUser && \Spatie\Permission\Models\Role::where('name', 'user')->exists()) {
                $newUser->assignRole('user');
            }

            Auth::login($newUser);
            return redirect()->intended(route('homophone-check.index'));

        } catch (Exception $e) {
            return redirect('/login')->with('error', 'Failed to login with Google: ' . $e->getMessage());
        }
    }
}
