import React, { useState, useRef, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticationCard from "@/Components/AuthenticationCard";
import AuthenticationCardLogo from "@/Components/AuthenticationCardLogo";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";

const TwoFactorChallenge = () => {
    const [recovery, setRecovery] = useState(false);
    const recoveryCodeInput = useRef(null);
    const codeInput = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        code: "",
        recovery_code: "",
        remember_device: false,
    });

    const toggleRecovery = () => {
        setRecovery((prevRecovery) => !prevRecovery);
    };

    useEffect(() => {
        // Focus the appropriate input after recovery state changes
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

            <AuthenticationCard>
                <AuthenticationCardLogo className="w-20 h-20" />

                <div className="mb-4 text-sm text-gray-600">
                    {!recovery ? (
                        <>
                            Please confirm access to your account by entering
                            the authentication code provided by your
                            authenticator application.
                            <div className="mt-2 text-xs text-gray-500">
                                Open your authenticator app (like Google
                                Authenticator, Microsoft Authenticator, or
                                Authy) and enter the 6-digit code shown for this
                                account.
                            </div>
                        </>
                    ) : (
                        <>
                            Please confirm access to your account by entering
                            one of your emergency recovery codes.
                            <div className="mt-2 text-xs text-gray-500">
                                These are the one-time use codes you saved when
                                setting up two-factor authentication.
                            </div>
                        </>
                    )}
                </div>

                <form onSubmit={submit}>
                    {!recovery ? (
                        <div>
                            <InputLabel htmlFor="code" value="Code" />
                            <TextInput
                                id="code"
                                ref={codeInput}
                                value={data.code}
                                onChange={(e) => {
                                    // Only allow numeric input and limit to 6 characters
                                    const value = e.target.value
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 6);
                                    setData("code", value);
                                }}
                                type="text"
                                inputMode="numeric"
                                className="mt-1 block w-full"
                                autoFocus
                                autoComplete="one-time-code"
                                maxLength="6"
                                placeholder="123456"
                            />
                            <InputError
                                message={errors.code}
                                className="mt-2"
                            />
                        </div>
                    ) : (
                        <div>
                            <InputLabel
                                htmlFor="recovery_code"
                                value="Recovery Code"
                            />
                            <TextInput
                                id="recovery_code"
                                ref={recoveryCodeInput}
                                value={data.recovery_code}
                                onChange={(e) =>
                                    setData("recovery_code", e.target.value)
                                }
                                type="text"
                                className="mt-1 block w-full"
                                autoComplete="one-time-code"
                                placeholder="ABCDEF-GHIJKL"
                            />
                            <InputError
                                message={errors.recovery_code}
                                className="mt-2"
                            />
                        </div>
                    )}

                    <div className="block mt-4">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember_device"
                                checked={data.remember_device}
                                onChange={(e) =>
                                    setData("remember_device", e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Remember this device for 30 days
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <button
                            type="button"
                            className="text-sm text-gray-600 hover:text-gray-900 underline cursor-pointer"
                            onClick={toggleRecovery}
                        >
                            {!recovery
                                ? "Use a recovery code"
                                : "Use an authentication code"}
                        </button>

                        <PrimaryButton
                            className="ms-4"
                            disabled={processing}
                            style={{ opacity: processing ? 0.25 : 1 }}
                        >
                            {processing ? "Verifying..." : "Log in"}
                        </PrimaryButton>
                    </div>
                </form>
            </AuthenticationCard>
        </>
    );
};

export default TwoFactorChallenge;
