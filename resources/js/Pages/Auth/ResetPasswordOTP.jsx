import { useState, useRef, useEffect } from "react";
import AuthLayoutSplit from "@/Layouts/AuthLayoutSplit";
import { LAYOUT_CONSTANTS } from "@/constants/layout";
import InputError from "@/Components/InputError";
import axios from "axios";
import { Loader2, Mail, Shield, Key, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordOTP() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    // Auto-sync password confirmation
    useEffect(() => {
        setPasswordConfirmation(password);
    }, [password]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const steps = [
        { number: 1, title: 'Email', icon: Mail },
        { number: 2, title: 'Verify Code', icon: Shield },
        { number: 3, title: 'New Password', icon: Key },
    ];

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(route('password.reset.otp.send'), { email });

            if (response.data.success) {
                setStep(2);
                setResendCooldown(60);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all 6 digits are entered
        if (index === 5 && value && newOtp.every(digit => digit !== '')) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleOtpKeyDown = (index, e) => {
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

                const lastIndex = Math.min(digits.length, 5);
                inputRefs.current[lastIndex]?.focus();

                if (digits.length === 6) {
                    handleVerifyOTP(newOtp.join(''));
                }
            });
        }
    };

    const handleVerifyOTP = async (otpCode = null) => {
        const code = otpCode || otp.join('');

        if (code.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(route('password.reset.otp.verify'), {
                email,
                otp: code
            });

            if (response.data.success) {
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(route('password.reset.otp.reset'), {
                email,
                otp: otp.join(''),
                password,
                password_confirmation: passwordConfirmation
            });

            if (response.data.success) {
                // Redirect to homophone check
                window.location.href = response.data.redirect;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            const response = await axios.post(route('password.reset.otp.resend'), { email });

            if (response.data.success) {
                setResendCooldown(60);
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
                title: "Reset Your Password",
                description: "Follow the simple steps to reset your password and regain access to your account.",
                features: [
                    { icon: "✓", text: "Secure process" },
                    { icon: "✓", text: "3 simple steps" },
                    { icon: "✓", text: "Email verification" },
                    { icon: "✓", text: "Instant access" }
                ]
            }}
        >
            <div className="space-y-6">
                {/* Step Indicator */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="flex items-center w-full">
                        {steps.map((s, index) => {
                            const Icon = s.icon;
                            const isActive = step === s.number;
                            const isCompleted = step > s.number;

                            return (
                                <>
                                    <div key={s.number} className="flex flex-col items-center flex-shrink-0">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                                isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs mt-2 font-medium whitespace-nowrap ${
                                                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                            }`}
                                        >
                                            {s.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-4 rounded ${
                                                step > s.number ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </>
                            );
                        })}
                    </div>
                </div>
                

                {/* Step Content */}
                <div className="max-w-md mx-auto mt-8">
                    {/* Step 1: Email */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter your email to receive a verification code
                                </p>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                                        placeholder="Enter your email"
                                        required
                                        autoFocus
                                    />
                                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-sm hover:scale-105 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        'Send Verification Code'
                                    )}
                                </button>

                                <div className="text-center">
                                    <a
                                        href={route('auth')}
                                        className="text-sm text-blue-600  hover:underline transition-all duration-200 ease-in-out hover:scale-105"
                                    >
                                        Back to Sign In
                                    </a>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <div className="space-y-6 text-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Verify Code</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter the 6-digit code sent to {email}
                                </p>
                            </div>

                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={() => handleVerifyOTP()}
                                disabled={loading || otp.some(d => !d)}
                                className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-sm hover:scale-105 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </button>

                            <div className="text-sm text-gray-600">
                                Didn't receive the code?{' '}
                                {resendCooldown > 0 ? (
                                    <span className="text-gray-500">Resend in {resendCooldown}s</span>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="text-blue-600  font-semibold disabled:opacity-50"
                                    >
                                        {resending ? 'Sending...' : 'Resend Code'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Choose a strong password for your account
                                </p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                                            placeholder="Enter new password"
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 "
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type={showPassword ? "text" : "password"}
                                        value={passwordConfirmation}
                                        readOnly
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-base"
                                        placeholder="Same as above"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-sm hover:scale-105 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Resetting...</span>
                                        </>
                                    ) : (
                                        'Reset Password & Sign In'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthLayoutSplit>
    );
}
