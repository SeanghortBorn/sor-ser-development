import { Head, useForm, Link } from "@inertiajs/react";
import WaveBackground from "@/Components/Animations/WaveBackground";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <>
            <Head title="Email Verification" />
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
                        style={{
                            background: "none",
                            border: "none",
                        }}
                    >
                        &times;
                    </button>

                    {/* Verify Email Content */}
                    <div className="px-7 py-6">
                        <h2 className="text-2xl font-bold text-[#222a54] mb-3">
                            Verify Your Email
                        </h2>

                        <p className="mb-3 text-base text-gray-600 leading-relaxed">
                            Thanks for signing up! Before getting started,
                            please verify your email address by clicking on the
                            link we just sent. Didn’t receive the email? You can
                            request another below.
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="text-sm text-green-700 ">
                                A new verification link has been sent to your
                                registered email address.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-3">
                            <div className="flex flex-col items-center mt-3">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-blue-500 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Sending..."
                                        : "Resend Verification Email"}
                                </button>

                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="text-base text-[#2563eb] hover:underline font-medium mt-3"
                                >
                                    Log Out
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
