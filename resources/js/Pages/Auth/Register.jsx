import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import WaveBackground from "@/Components/Animations/WaveBackground";
import InputError from "@/Components/InputError";
import Checkbox from "@/Components/Checkbox";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        agreeTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <>
            <Head title="Sign Up" />
            <WaveBackground />
            <div className="fixed inset-0 flex items-center justify-center z-10">
                <div
                    className="relative bg-white rounded-2xl w-full max-w-xl shadow-xl"
                    style={{
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 text-2xl z-10"
                        aria-label="Close"
                        onClick={() => window.history.back()}
                        style={{ background: "none", border: "none" }}
                    >
                        &times;
                    </button>

                    {/* Form Content */}
                    <div className="px-8 py-6">
                        <h2 className="text-2xl font-bold text-[#222a54] mb-3">
                            Sign Up
                        </h2>

                        <a
                            href={route("auth.google")}
                            className="w-full flex items-center justify-center gap-3 px-3 py-[14px] border-[3px] border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors mb-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-gray-700 font-medium">
                                Sign Up with Google
                            </span>
                        </a>

                        <div className="flex items-center mb-2">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-3 text-md text-gray-400">Or</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        <form onSubmit={submit} className="space-y-1">
                            {/* Name */}
                            <label
                                htmlFor="name"
                                className="block text-md text-[#222a54] font-semibold mb-2"
                            >
                                Full Name
                            </label>
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={e => setData("name", e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px] mb-2"
                                    required
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            {/* Email */}
                            <label
                                htmlFor="email"
                                className="block text-md text-[#222a54] font-semibold mb-2"
                            >
                                Email Address
                            </label>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={e => setData("email", e.target.value)}
                                    placeholder="Email Address"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px] mb-2"
                                    required
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                            {/* Password */}
                            <label
                                htmlFor="password"
                                className="block text-md text-[#222a54] font-semibold mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={e => setData("password", e.target.value)}
                                    placeholder="Password"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px] mb-2"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {/* {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} */}
                                </button>
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            {/* Confirm Password */}
                            <label
                                htmlFor="password_confirmation"
                                className="block text-md text-[#222a54] font-semibold mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswordConfirm ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={e => setData("password_confirmation", e.target.value)}
                                    placeholder="Confirm Password"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px] mb-2"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {/* {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />} */}
                                </button>
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </div>
                            {/* Terms */}
                            <div className="flex items-center mt-2">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="agreeTerms"
                                        checked={data.agreeTerms}
                                        onChange={e => setData("agreeTerms", e.target.checked)}
                                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                                        required
                                    />
                                    <span className="ml-2 text-md text-gray-600">
                                        I agree to the Terms of Use and Privacy Policy
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-1/3 mt-3 border-[3px] border-blue-500 text-blue-600 hover:bg-[#f5f7ff] font-semibold py-2 rounded-2xl transition text-md"
                            >
                                Sign Up
                            </button>
                        </form>

                        <div className="mt-2 text-start">
                            <a
                                href={route("login")}
                                className="text-md font-medium text-[#2563eb] hover:underline block"
                            >
                                Login to an existing account!
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}