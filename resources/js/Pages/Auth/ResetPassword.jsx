import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import WaveBackground from "@/Components/Animations/WaveBackground";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Reset Password" />
            <WaveBackground />

            <div className="fixed inset-0 flex items-center justify-center z-10">
                <div
                    className="relative bg-white rounded-xl w-full max-w-xl shadow-sm"
                    style={{
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        className="absolute top-5 right-6 text-gray-400  text-2xl z-10"
                        aria-label="Close"
                        onClick={() => window.history.back()}
                        style={{ background: "none", border: "none" }}
                    >
                        &times;
                    </button>

                    {/* Reset Password Content */}
                    <div className="px-7 py-6">
                        <h2 className="text-2xl font-bold text-[#222a54] mb-2">
                            Reset Your Password
                        </h2>
                        <p className="mb-3 text-base text-gray-600 leading-relaxed">
                            Enter your email and new password to regain access
                            to your account.
                        </p>

                        <form onSubmit={submit} className="space-y-3">
                            {/* Email */}
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
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-all duration-200 ease-in-out text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[16px] font-medium"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-base font-semibold text-[#222a54] mb-2"
                                >
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-all duration-200 ease-in-out text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[16px] font-medium"
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-1"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="block text-base font-semibold text-[#222a54] mb-2"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-all duration-200 ease-in-out text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[16px] font-medium"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-1"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col items-end mt-4">
                                <button
                                    type="submit"
                                    className="w-1/3 justify-center bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-blue-500 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Resetting..."
                                        : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
