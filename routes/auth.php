<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\UnifiedAuthController;
use App\Http\Controllers\Auth\OTPVerificationController;
use App\Http\Controllers\Auth\OTPPasswordResetController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // New unified auth routes (email-first login/signup)
    Route::get('auth', [UnifiedAuthController::class, 'create'])->name('auth');
    Route::post('auth/check-email', [UnifiedAuthController::class, 'checkEmail'])->name('auth.check-email');
    Route::post('auth/login', [UnifiedAuthController::class, 'login'])->name('auth.login');
    Route::post('auth/register', [UnifiedAuthController::class, 'register'])->name('auth.register');

    // OTP password reset routes
    Route::get('reset-password-otp', [OTPPasswordResetController::class, 'show'])->name('password.reset.otp');
    Route::post('reset-password-otp/send', [OTPPasswordResetController::class, 'sendOTP'])->name('password.reset.otp.send');
    Route::post('reset-password-otp/verify', [OTPPasswordResetController::class, 'verifyOTP'])->name('password.reset.otp.verify');
    Route::post('reset-password-otp/reset', [OTPPasswordResetController::class, 'resetPassword'])->name('password.reset.otp.reset');
    Route::post('reset-password-otp/resend', [OTPPasswordResetController::class, 'resendOTP'])->name('password.reset.otp.resend');

    // Legacy routes (keep for backward compatibility)
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    // OTP verification routes (for logged-in users)
    Route::get('verify-otp', [OTPVerificationController::class, 'show'])->name('otp.verify');
    Route::post('verify-otp', [OTPVerificationController::class, 'verify'])->name('otp.verify.submit');
    Route::post('verify-otp/resend', [OTPVerificationController::class, 'resend'])->name('otp.resend');
    Route::post('verify-email/send', [OTPVerificationController::class, 'sendVerificationEmail'])->name('verification.send.otp');

    // Legacy email verification routes
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('users/{user}/reset-password', [PasswordController::class, 'adminReset'])
        ->name('users.reset-password');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
