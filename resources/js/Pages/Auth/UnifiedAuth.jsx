import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthLayoutSplit from "@/Layouts/AuthLayoutSplit";
import InputError from "@/Components/InputError";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { LAYOUT_CONSTANTS } from "@/constants/layout";

export default function UnifiedAuth() {
    const [step, setStep] = useState("email"); // 'email', 'password', 'signup'
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [khmerExperience, setKhmerExperience] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const response = await axios.post(route("auth.check-email"), {
                email,
            });

            if (response.data.exists) {
                setStep("password");
                setMessage("Welcome back! Please enter your password.");
            } else {
                setStep("signup");
                setMessage("Create your account to get started.");
            }
        } catch (error) {
            setErrors({
                email: error.response?.data?.message || "An error occurred",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const response = await axios.post(route("auth.login"), {
                email,
                password,
                remember,
            });

            if (response.data.success) {
                if (response.data.requires_verification) {
                    // Redirect to OTP verification
                    router.visit(route("otp.verify"));
                } else {
                    // Redirect to homophone check
                    window.location.href = response.data.redirect;
                }
            }
        } catch (error) {
            setErrors({
                password:
                    error.response?.data?.message || "Invalid credentials",
            });
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate password confirmation
        if (password !== passwordConfirmation) {
            setErrors({ password_confirmation: "Passwords do not match" });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(route("auth.register"), {
                email,
                password,
                password_confirmation: passwordConfirmation,
                name: name || email,
                age,
                education_level: educationLevel,
                khmer_experience: khmerExperience,
            });

            if (response.data.success && response.data.requires_verification) {
                // Redirect to OTP verification
                router.visit(route("otp.verify"));
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.errors) {
                setErrors(errorData.errors);
            } else {
                setErrors({
                    general: errorData?.message || "Registration failed",
                });
            }
            setLoading(false);
        }
    };

    const resetToEmail = () => {
        setStep("email");
        setPassword("");
        setPasswordConfirmation("");
        setName("");
        setAge("");
        setEducationLevel("");
        setKhmerExperience("");
        setErrors({});
        setMessage("");
    };

    return (
        <AuthLayoutSplit 
            brandTitle="SOR-SER"
            brandSubtitle="Khmer Learning Platform"
            brandMessage={{
                title: "Master Khmer Writing",
                description: "Improve your Khmer writing skills with interactive exercises, real-time feedback, and personalized learning paths.",
                features: [
                    { icon: "✓", text: "Interactive homophone checker" },
                    { icon: "✓", text: "Real-time grammar feedback" },
                    { icon: "✓", text: "Personalized learning path" },
                    { icon: "✓", text: "Track your progress" }
                ]
            }}
        >
            <div className="space-y-6 mt-4">
                {/* Header */}
                <div className="mb-2">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        {step === "email" && "Get Started"}
                        {step === "password" && "Welcome Back"}
                        {step === "signup" && "Create Account"}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {step === "email" && "Enter your email to continue"}
                        {step === "password" && message}
                        {step === "signup" && message}
                    </p>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    <a
                        href={route("auth.google")}
                        className="group hover:bg-blue-600 hover:border-blue-600 hover:shadow-sm hover:scale-[1.02] w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285f4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34a853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#fbbc05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#ea4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-gray-700 group- transition-all duration-200 ease-in-out duration-200 font-medium">
                            Google
                        </span>
                    </a>
                </div>

                {/* Email Step */}
                {step === "email" && (
                    <form onSubmit={handleEmailSubmit} className="space-y-5 mt-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-3 border-2 border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base`}
                                placeholder="you@example.com"
                                required
                                autoFocus
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-sm text-white font-semibold py-3 px-6 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-sm`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Checking...</span>
                                </>
                            ) : (
                                "Continue"
                            )}
                        </button>

                        <div className="text-center">
                            <a
                                href={route("password.reset.otp")}
                                className="text-sm text-blue-600  hover:underline transition-all duration-200 ease-in-out hover:scale-105"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    </form>
                )}

                {/* Password Step (Login) */}
                {step === "password" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={resetToEmail}
                                    className="text-sm text-blue-600 "
                                >
                                    Change email
                                </button>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                                {email}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className={`w-full px-4 py-3 pr-12 border border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base`}
                                    placeholder="Enter your password"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 "
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded-xl focus:ring-blue-500"
                            />
                            <label
                                htmlFor="remember"
                                className="ml-2 text-sm text-gray-700 cursor-pointer"
                            >
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 hover:shadow-sm hover:scale-105 text-white font-semibold py-3 px-6 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <div className="text-center">
                            <a
                                href={route("password.reset.otp")}
                                className="text-sm text-blue-600  hover:underline transition-all duration-200 ease-in-out hover:scale-105"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    </form>
                )}

                {/* Signup Step */}
                {step === "signup" && (
                    <form onSubmit={handleSignup} className="space-y-4 mt-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <button
                                    type="button"
                                    onClick={resetToEmail}
                                    className="text-sm text-blue-600 "
                                >
                                    Change email
                                </button>
                            </div>
                            <div className={`text-sm text-gray-600 px-4 py-3 bg-gray-50 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} mb-3`}>
                                {email}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className={`w-full px-4 py-3 pr-12 border-2 border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base`}
                                    placeholder="Create a strong password"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 "
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showPassword ? "text" : "password"}
                                    value={passwordConfirmation}
                                    onChange={(e) =>
                                        setPasswordConfirmation(e.target.value)
                                    }
                                    className={`w-full px-4 py-3 pr-12 border-2 border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base`}
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 "
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        {/* Optional fields */}
                        <div className="pt-3 border-t border-gray-200 mt-4">
                            <p className="text-xs font-medium text-gray-500 mb-3">
                                Optional: Help us personalize your experience
                            </p>

                            <div className="space-y-2.5">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-xs font-medium text-gray-600 mb-1"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className={`w-full px-3 py-2 border border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.SMALL} focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm`}
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label
                                            htmlFor="age"
                                            className="block text-xs font-medium text-gray-600 mb-1"
                                        >
                                            Age
                                        </label>
                                        <input
                                            id="age"
                                            type="number"
                                            value={age}
                                            onChange={(e) =>
                                                setAge(e.target.value)
                                            }
                                            className={`w-full px-3 py-2 border border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.SMALL} focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm`}
                                            placeholder="Age"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="education"
                                            className="block text-xs font-medium text-gray-600 mb-1"
                                        >
                                            Education
                                        </label>
                                        <select
                                            id="education"
                                            value={educationLevel}
                                            onChange={(e) =>
                                                setEducationLevel(
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full px-3 py-2 border border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.SMALL} focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm`}
                                        >
                                            <option value="">Select</option>
                                            <option value="Primary">
                                                Primary
                                            </option>
                                            <option value="Secondary">
                                                Secondary
                                            </option>
                                            <option value="High School">
                                                High School
                                            </option>
                                            <option value="Bachelor">
                                                Bachelor
                                            </option>
                                            <option value="Master">
                                                Master
                                            </option>
                                            <option value="Doctorate">
                                                Doctorate
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="khmer"
                                        className="block text-xs font-medium text-gray-600 mb-1"
                                    >
                                        Khmer Writing Experience
                                    </label>
                                    <select
                                        id="khmer"
                                        value={khmerExperience}
                                        onChange={(e) =>
                                            setKhmerExperience(e.target.value)
                                        }
                                        className={`w-full px-3 py-2 border border-gray-300 ${LAYOUT_CONSTANTS.ROUNDED.SMALL} focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm`}
                                    >
                                        <option value="">Select</option>
                                        <option value="None">None</option>
                                        <option value="Beginner">
                                            Beginner
                                        </option>
                                        <option value="Intermediate">
                                            Intermediate
                                        </option>
                                        <option value="Advanced">
                                            Advanced
                                        </option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {errors.general && (
                            <div className={`p-3 bg-red-50 border border-red-200 ${LAYOUT_CONSTANTS.ROUNDED.SMALL}`}>
                                <p className="text-sm text-red-700">
                                    {errors.general}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-sm text-white font-semibold py-3 px-6 ${LAYOUT_CONSTANTS.ROUNDED.MEDIUM} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-sm mt-5`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </AuthLayoutSplit>
    );
}
