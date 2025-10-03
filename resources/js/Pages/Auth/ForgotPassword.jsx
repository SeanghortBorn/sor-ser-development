import { Head, useForm, Link } from "@inertiajs/react";
import WaveBackground from "@/Components/Animations/WaveBackground";
import InputError from "@/Components/InputError";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <>
            <Head title="Forgot Password" />
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
                    >
                        &times;
                    </button>

                    {/* Forgot Password Content */}
                    <div className="px-7 py-6">
                        <h2 className="text-2xl font-bold text-[#222a54] mb-2">
                            Forgot Password
                        </h2>

                        <p className="mb-3 text-base text-gray-600 leading-relaxed">
                            Enter your registered email address and we’ll send
                            you a reset link to create a new password.
                        </p>

                        <form onSubmit={submit} className="space-y-4">
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
                                    className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[16px] font-medium"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>

                            {status && (
                                <div className="text-center text-sm text-green-700">
                                    {status}
                                </div>
                            )}

                            <div className="flex flex-col items-center mt-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-blue-500 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {processing
                                        ? "Sending..."
                                        : "Send Password Reset Link"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
