import { useState, useRef, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import AuthLayoutSplit from "@/Layouts/AuthLayoutSplit";
import { LAYOUT_CONSTANTS } from "@/constants/layout";
import axios from "axios";
import { Loader2, Mail, CheckCircle } from "lucide-react";

export default function VerifyOTP({ email }) {
    const { flash } = usePage().props;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [successMessage, setSuccessMessage] = useState(flash?.success || '');
    const inputRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (index === 5 && value && newOtp.every(digit => digit !== '')) {
            handleSubmit(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                const newOtp = [...otp];
                digits.forEach((digit, i) => {
                    if (i < 6) newOtp[i] = digit;
                });
                setOtp(newOtp);

                // Focus last filled input
                const lastIndex = Math.min(digits.length, 5);
                inputRefs.current[lastIndex]?.focus();

                // Auto-submit if all 6 digits
                if (digits.length === 6) {
                    handleSubmit(newOtp.join(''));
                }
            });
        }
    };

    const handleSubmit = async (otpCode = null) => {
        const code = otpCode || otp.join('');

        if (code.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(route('otp.verify.submit'), {
                otp: code
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = response.data.redirect;
                }, 1000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            const response = await axios.post(route('otp.resend'));

            if (response.data.success) {
                setResendCooldown(60); // 60 seconds cooldown
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthLayoutSplit
            brandTitle="SOR-SER"
            brandSubtitle="Khmer Learning Platform"
            brandMessage={{
                title: "Verify Your Email",
                description: "We sent a verification code to your email. Enter it below to continue.",
                features: [
                    { icon: "✓", text: "Secure verification" },
                    { icon: "✓", text: "Quick and simple" },
                    { icon: "✓", text: "One-time code" },
                    { icon: "✓", text: "Valid for 10 minutes" }
                ]
            }}
        >
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        {success ? 'Email Verified!' : 'Verify Your Email'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {success
                            ? 'Your email has been verified successfully'
                            : `We sent a 6-digit code to ${email}`
                        }
                    </p>
                </div>

                {!success && (
                    <>
                        {/* Success Message */}
                        {successMessage && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                                <p className="text-sm text-green-700">{successMessage}</p>
                            </div>
                        )}

                        {/* OTP Input */}
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-12 h-12 text-center text-xl font-bold border-2 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${error ? 'border-red-300' : 'border-gray-300'}`}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={() => handleSubmit()}
                            disabled={loading || otp.some(d => !d)}
                            className={`w-full bg-blue-600 hover:bg-blue-700 hover:shadow-sm hover:scale-105 text-white font-semibold py-3 px-6 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </button>

                        {/* Resend */}
                        <div className="text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            {resendCooldown > 0 ? (
                                <span className="text-gray-500">
                                    Resend in {resendCooldown}s
                                </span>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="text-blue-600  hover:scale-110 font-semibold transition-all duration-300 disabled:opacity-50"
                                >
                                    {resending ? 'Sending...' : 'Resend Code'}
                                </button>
                            )}
                        </div>
                    </>
                )}

                {success && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Redirecting...</span>
                    </div>
                )}
            </div>
        </AuthLayoutSplit>
    );
}
