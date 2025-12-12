<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class OTPService
{
    /**
     * Generate a 6-digit OTP code
     */
    public function generateOTP(): string
    {
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP code to user's email
     */
    public function sendOTP(User $user, string $purpose = 'verification'): bool
    {
        try {
            // Generate OTP
            $otp = $this->generateOTP();

            // Store OTP in database (expires in 10 minutes)
            $user->update([
                'otp_code' => $otp,
                'otp_expires_at' => Carbon::now()->addMinutes(10),
                'email_verification_sent_at' => Carbon::now(),
            ]);

            // Send email
            $subject = $purpose === 'reset' ? 'Password Reset OTP' : 'Email Verification OTP';
            $message = $this->getOTPEmailContent($otp, $purpose);

            Mail::send([], [], function ($mail) use ($user, $subject, $message) {
                $mail->to($user->email)
                    ->subject($subject)
                    ->html($message);
            });

            Log::info("OTP sent to user", [
                'user_id' => $user->id,
                'email' => $user->email,
                'purpose' => $purpose
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send OTP", [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Verify OTP code
     */
    public function verifyOTP(User $user, string $otp): bool
    {
        // Check if OTP exists and hasn't expired
        if (!$user->otp_code || !$user->otp_expires_at) {
            return false;
        }

        // Check if OTP has expired
        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return false;
        }

        // Verify OTP matches
        if ($user->otp_code !== $otp) {
            return false;
        }

        return true;
    }

    /**
     * Clear OTP from user record
     */
    public function clearOTP(User $user): void
    {
        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);
    }

    /**
     * Mark email as verified
     */
    public function markEmailAsVerified(User $user): void
    {
        $user->update([
            'email_verified_at' => Carbon::now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);
    }

    /**
     * Get OTP email HTML content
     */
    private function getOTPEmailContent(string $otp, string $purpose): string
    {
        $title = $purpose === 'reset' ? 'Password Reset Request' : 'Email Verification';
        $description = $purpose === 'reset'
            ? 'You recently requested to reset your password. Use the OTP code below to proceed:'
            : 'Welcome to Sor-Ser! Please verify your email address using the OTP code below:';

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    color: #ffffff;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 40px 30px;
                }
                .otp-box {
                    background: #f8f9fa;
                    border: 2px dashed #667eea;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 30px 0;
                }
                .otp-code {
                    font-size: 36px;
                    font-weight: bold;
                    color: #667eea;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .warning {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>{$title}</h1>
                </div>
                <div class='content'>
                    <p>{$description}</p>

                    <div class='otp-box'>
                        <p style='margin: 0 0 10px 0; color: #666; font-size: 14px;'>Your OTP Code</p>
                        <div class='otp-code'>{$otp}</div>
                    </div>

                    <div class='warning'>
                        <strong>⚠️ Important:</strong> This code will expire in 10 minutes. Never share this code with anyone.
                    </div>

                    <p style='color: #666; font-size: 14px; margin-top: 30px;'>
                        If you didn't request this, please ignore this email or contact our support team.
                    </p>
                </div>
                <div class='footer'>
                    <p>&copy; " . date('Y') . " Sor-Ser. All rights reserved.</p>
                    <p>Khmer Language Learning Platform</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
