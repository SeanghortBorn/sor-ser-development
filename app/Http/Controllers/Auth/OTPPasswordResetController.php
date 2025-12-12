<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class OTPPasswordResetController extends Controller
{
    protected $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show password reset page
     */
    public function show()
    {
        return Inertia::render('Auth/ResetPasswordOTP');
    }

    /**
     * Step 1: Send OTP to email
     */
    public function sendOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($this->otpService->sendOTP($user, 'reset')) {
            return response()->json([
                'success' => true,
                'message' => 'OTP sent to your email',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to send OTP',
        ], 500);
    }

    /**
     * Step 2: Verify OTP
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($this->otpService->verifyOTP($user, $request->otp)) {
            return response()->json([
                'success' => true,
                'message' => 'OTP verified successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired OTP',
        ], 422);
    }

    /**
     * Step 3: Reset password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Verify OTP one more time
        if (!$this->otpService->verifyOTP($user, $request->otp)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Clear OTP
        $this->otpService->clearOTP($user);

        // Log the user in
        Auth::login($user);

        // Regenerate session
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully',
            'redirect' => route('homophone-check.index'),
        ]);
    }

    /**
     * Resend OTP
     */
    public function resendOTP(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($this->otpService->sendOTP($user, 'reset')) {
            return response()->json([
                'success' => true,
                'message' => 'OTP resent successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to resend OTP',
        ], 500);
    }
}
