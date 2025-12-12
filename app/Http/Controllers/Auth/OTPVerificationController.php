<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OTPVerificationController extends Controller
{
    protected $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show OTP verification page
     */
    public function show()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        // If already verified, redirect to homophone check
        if ($user->email_verified_at) {
            return redirect()->route('homophone-check.index');
        }

        return Inertia::render('Auth/VerifyOTP', [
            'email' => $user->email,
        ]);
    }

    /**
     * Verify OTP code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        if ($this->otpService->verifyOTP($user, $request->otp)) {
            // Mark email as verified
            $this->otpService->markEmailAsVerified($user);

            // Refresh the user instance to get updated data
            $user->refresh();

            // Force session to update with fresh user data
            Auth::setUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully',
                'redirect' => route('homophone-check.index'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired OTP code',
        ], 422);
    }

    /**
     * Resend OTP code
     */
    public function resend()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified',
            ], 422);
        }

        if ($this->otpService->sendOTP($user, 'verification')) {
            return response()->json([
                'success' => true,
                'message' => 'OTP code sent successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to send OTP. Please try again.',
        ], 500);
    }

    /**
     * Send verification email to existing unverified users
     */
    public function sendVerificationEmail(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->email_verified_at) {
            return back()->with('error', 'Email already verified');
        }

        if ($this->otpService->sendOTP($user, 'verification')) {
            // Redirect to OTP verification page
            return redirect()->route('otp.verify')->with('success', 'Verification code sent to your email');
        }

        return back()->with('error', 'Failed to send verification email. Please try again.');
    }
}
