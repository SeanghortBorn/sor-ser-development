import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import WaveBackground from "@/Components/Animations/WaveBackground";
import InputError from "@/Components/InputError";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <WaveBackground />
            <div className="fixed inset-0 flex items-center justify-center z-10">
                <div
                    className="relative bg-white rounded-2xl w-full max-w-xl shadow-xl"
                    style={{
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 text-2xl z-10"
                        aria-label="Close"
                        onClick={() => window.history.back()}
                        style={{
                            background: "none",
                            border: "none",
                        }}
                    >
                        &times;
                    </button>
                    {/* Login Form Content */}
                    <div className="px-7 py-6">
                        <h2 className="text-2xl font-bold text-[#222a54] mb-3">
                            Login
                        </h2>
                        {status && (
                            <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                                {status}
                            </div>
                        )}
                        <a
                            href={route("auth.google")}
                            className="w-full flex items-center justify-center gap-3 px-3 py-[14px] border-[3px] border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors mb-4"
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
                            <span className="text-gray-700 font-medium">
                                Continue with Google
                            </span>
                        </a>
                        <div className="flex items-center mb-2">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-3 text-base text-gray-400 font-medium">
                                Or
                            </span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                        <form className="space-y-2" onSubmit={submit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-base font-semibold text-[#222a54] mb-2"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    autoComplete="username"
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px] font-medium mb-2"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-base font-semibold text-[#222a54] mb-1"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px] font-medium mb-2"
                                />
                                <button
                                    type="button"
                                    className="absolute right-10 mt-[-38px] text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                    aria-label="Toggle password visibility"
                                    style={{ background: "none", border: "none" }}
                                >
                                </button>
                                <InputError
                                    message={errors.password}
                                    className="mt-1"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-1/3 mt-3 border-2 border-blue-500 text-blue-600 hover:bg-[#f5f7ff] font-semibold py-1.5 rounded-xl transition text-md"
                                disabled={processing}
                            >
                                {processing ? "Logging in..." : "Login"}
                            </button>
                        </form>
                        <div className="mt-2 text-start space-y-1">
                            <a
                                href={route("password.request")}
                                className="text-base text-[#2563eb] hover:underline font-medium block"
                            >
                                Forgot your password?
                            </a>
                            <a
                                href={route("register")}
                                className="text-base text-[#2563eb] hover:underline font-medium block"
                            >
                                Create Account
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
