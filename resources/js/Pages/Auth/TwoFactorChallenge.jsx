import React, { useState, useRef, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import Checkbox from "@/Components/Checkbox";
import WaveBackground from "@/Components/Animations/WaveBackground";

const TwoFactorChallenge = () => {
    const [recovery, setRecovery] = useState(false);
    const recoveryCodeInput = useRef(null);
    const codeInput = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        code: "",
        recovery_code: "",
        remember_device: false,
    });

    const toggleRecovery = () => setRecovery((prev) => !prev);

    useEffect(() => {
        if (recovery) {
            recoveryCodeInput.current?.focus();
            setData("code", "");
        } else {
            codeInput.current?.focus();
            setData("recovery_code", "");
        }
    }, [recovery]);

    const submit = (e) => {
        e.preventDefault();
        post(route("two-factor.login"));
    };

    return (
        <>
            <Head title="Two-factor Confirmation" />
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

                    {/* Content */}
                    <div className="px-7 py-6">
                        <h2 className="text-2xl font-bold text-[#222a54] mb-1">
                            Two-Factor Authentication
                        </h2>

                        <p className="text-base text-gray-600 mb-3">
                            {!recovery
                                ? "Enter the 6-digit code from your authenticator app."
                                : "Enter one of your emergency recovery codes."}
                        </p>

                        <form onSubmit={submit} className="space-y-5">
                            {!recovery ? (
                                <div>
                                    <label
                                        htmlFor="code"
                                        className="block text-base font-semibold text-[#222a54] mb-2"
                                    >
                                        Authentication Code
                                    </label>
                                    <input
                                        id="code"
                                        ref={codeInput}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="6"
                                        autoComplete="one-time-code"
                                        placeholder="123456"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData(
                                                "code",
                                                e.target.value
                                                    .replace(/[^0-9]/g, "")
                                                    .slice(0, 6)
                                            )
                                        }
                                        className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-blue-100 focus:outline-none text-[16px] font-medium placeholder-gray-400"
                                        required
                                    />
                                    <InputError
                                        message={errors.code}
                                        className="mt-1"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label
                                        htmlFor="recovery_code"
                                        className="block text-base font-semibold text-[#222a54] mb-2"
                                    >
                                        Recovery Code
                                    </label>
                                    <input
                                        id="recovery_code"
                                        ref={recoveryCodeInput}
                                        type="text"
                                        placeholder="ABCDEF-GHIJKL"
                                        autoComplete="one-time-code"
                                        value={data.recovery_code}
                                        onChange={(e) =>
                                            setData(
                                                "recovery_code",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-[12px] border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-blue-100 focus:outline-none text-[16px] font-medium placeholder-gray-400"
                                        required
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            <div className="flex items-center">
                                <Checkbox
                                    name="remember_device"
                                    checked={data.remember_device}
                                    onChange={(e) =>
                                        setData(
                                            "remember_device",
                                            e.target.checked
                                        )
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Remember this device for 30 days
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 mt-2 space-x-1">
                                <button
                                    type="button"
                                    onClick={toggleRecovery}
                                    className="text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    {!recovery
                                        ? "Use a recovery code"
                                        : "Use an authentication code"}
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-1/3 flex items-center justify-center bg-blue-600 text-white font-semibold py-1.5 px-4 rounded-xl hover:bg-blue-500 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {processing ? "Verifying..." : "Log In"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TwoFactorChallenge;
