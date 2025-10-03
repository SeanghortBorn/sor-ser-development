import { router, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import ConfirmsPassword from "@/Components/ConfirmsPassword";

const TwoFactorAuthenticationForm = ({ className = "" }) => {
    const { auth } = usePage().props;
    const [enabling, setEnabling] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [setupKey, setSetupKey] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [localConfirmError, setLocalConfirmError] = useState("");
    const [confirming2FA, setConfirming2FA] = useState(false);
    const [regeneratingCodes, setRegeneratingCodes] = useState(false);

    const confirmationForm = useForm({
        code: "",
    });

    const twoFactorEnabled = auth.user?.two_factor_enabled;
    const needsConfirmation =
        twoFactorEnabled && !auth.user?.two_factor_confirmed_at;

    useEffect(() => {
        if (needsConfirmation) {
            setConfirming(true);
            fetchQrCodeAndSetupKey();
        } else if (twoFactorEnabled && auth.user?.two_factor_confirmed_at) {
            setConfirming(false);
            fetchRecoveryCodes();
            setQrCode(null);
            setSetupKey(null);
        }
    }, [twoFactorEnabled, auth.user?.two_factor_confirmed_at]);

    const fetchQrCodeAndSetupKey = async () => {
        try {
            const qrResponse = await fetch(route("two-factor.qr-code"));
            if (qrResponse.ok) {
                const qrData = await qrResponse.json();
                setQrCode(qrData.svg);

                const keyResponse = await fetch(route("two-factor.secret-key"));
                if (keyResponse.ok) {
                    const keyData = await keyResponse.json();
                    if (keyData.secret) {
                        setSetupKey(keyData.secret);
                    } else {
                        const potentialKey =
                            keyData.secretKey ||
                            keyData.key ||
                            Object.values(keyData)[0];
                        if (potentialKey && typeof potentialKey === "string") {
                            setSetupKey(potentialKey);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching 2FA data:", error);
        }
    };

    const fetchRecoveryCodes = async () => {
        try {
            const response = await fetch(route("two-factor.recovery-codes"));
            if (response.ok) {
                const codes = await response.json();
                setRecoveryCodes(codes);
            }
        } catch (error) {
            console.error("Error fetching recovery codes:", error);
        }
    };

    const enableTwoFactorAuthentication = () => {
        setEnabling(true);
        router.post(
            route("two-factor.enable"),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirming(true);
                    fetchQrCodeAndSetupKey();
                },
                onError: () => setEnabling(false),
                onFinish: () => setEnabling(false),
            }
        );
    };

    useEffect(() => {
        if (!confirming) {
            confirmationForm.reset();
            setLocalConfirmError("");
        }
    }, [confirming, twoFactorEnabled]);

    const confirmTwoFactorAuthentication = () => {
        setConfirming2FA(true);
        confirmationForm.post(route("two-factor.confirm"), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(false);
                confirmationForm.reset();
                setLocalConfirmError("");
                fetchRecoveryCodes();
            },
            onError: (errors) => {
                setLocalConfirmError(
                    errors.code ||
                        confirmationForm.errors.code ||
                        "Invalid authentication code."
                );
            },
            onFinish: () => setConfirming2FA(false),
        });
    };

    const regenerateRecoveryCodes = () => {
        setRegeneratingCodes(true);
        router.post(
            route("two-factor.regenerate-recovery-codes"),
            {},
            {
                preserveScroll: true,
                onSuccess: async () => {
                    await fetchRecoveryCodes();
                },
                onFinish: () => setRegeneratingCodes(false),
            }
        );
    };

    const disableTwoFactorAuthentication = () => {
        setDisabling(true);
        router.delete(route("two-factor.disable"), {
            preserveScroll: true,
            onSuccess: () => {
                setQrCode(null);
                setSetupKey(null);
                setRecoveryCodes([]);
                setConfirming(false);
            },
            onFinish: () => setDisabling(false),
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Two-Factor Authentication
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Add additional security to your account using two factor
                    authentication.
                </p>
            </header>

            <div className="max-w-xl">
                {twoFactorEnabled && !confirming ? (
                    <h3 className="text-lg font-medium text-gray-900">
                        You have enabled Two-Factor Authentication.
                    </h3>
                ) : twoFactorEnabled && confirming ? (
                    <h3 className="text-lg font-medium text-gray-900">
                        Finish enabling Two-Factor Authentication.
                    </h3>
                ) : (
                    <h3 className="text-lg font-medium text-gray-900">
                        You have not enabled Two-Factor Authentication.
                    </h3>
                )}

                <div className="mt-3 text-sm text-gray-600">
                    <p>
                        When two factor authentication is enabled, you will be
                        prompted for a secure, random token during
                        authentication. You may retrieve this token from your
                        phone's Google Authenticator application.
                    </p>
                </div>

                {twoFactorEnabled && (
                    <div className="mt-4">
                        {confirming && qrCode && (
                            <div className="mt-4">
                                <p className="font-semibold mb-2 text-sm text-gray-600">
                                    {confirming
                                        ? "To finish enabling two factor authentication, scan the following QR code using your phone's authenticator application."
                                        : "Two factor authentication is now enabled. Scan the following QR code using your phone's authenticator application."}
                                </p>
                                <div
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                    className="p-2 inline-block bg-white border border-gray-200 rounded"
                                />
                            </div>
                        )}

                        {confirming && setupKey && (
                            <div className="mt-4 text-sm text-gray-600">
                                <p className="font-semibold">
                                    Setup Key:{" "}
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                        {setupKey}
                                    </span>
                                </p>
                                <p className="mt-1">
                                    If you can't scan the QR code, you can
                                    manually enter this setup key into your
                                    Authenticator App.
                                </p>
                            </div>
                        )}

                        {confirming && (
                            <div className="mt-2">
                                <InputLabel
                                    htmlFor="code"
                                    value="Authentication Code"
                                />
                                <TextInput
                                    id="code"
                                    value={confirmationForm.data.code}
                                    onChange={(e) =>
                                        confirmationForm.setData(
                                            "code",
                                            e.target.value
                                        )
                                    }
                                    type="text"
                                    placeholder="Enter Code 6 Digits"
                                    maxLength={6}
                                    inputMode="numeric"
                                    className="block mt-1 w-1/2 rounded-xl border border-gray-300 shadow-sm"
                                    autoFocus
                                    autoComplete="one-time-code"
                                />
                                <InputError
                                    message={localConfirmError}
                                    className="mt-2"
                                />
                            </div>
                        )}

                        {recoveryCodes.length > 0 && !confirming && (
                            <>
                                <div className="mt-2 text-sm text-gray-600">
                                    <p className="font-semibold">
                                        Store these recovery codes safely (like
                                        in a password manager). You can use them
                                        to access your account if you lose your
                                        two-factor authentication device. Each
                                        code can be used only once after a new
                                        login.
                                    </p>
                                </div>
                                <div className="grid gap-1 mt-4 px-4 py-4 font-mono text-sm bg-gray-100 rounded-lg">
                                    {recoveryCodes.map((code) => (
                                        <div key={code}>{code}</div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="mt-5">
                    {!twoFactorEnabled ? (
                        <ConfirmsPassword
                            onConfirmed={enableTwoFactorAuthentication}
                        >
                            <button
                                type="button"
                                disabled={enabling}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-[10px] border-2 border-blue-500 text-blue-700 hover:bg-blue-100 transition font-semibold disabled:opacity-60
                                    ${
                                        enabling
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-blue-100"
                                    } 
                                    border-blue-500`}
                            >
                                <svg
                                    className="w-4 h-4 text-blue-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>

                                <span className="text-sm font-medium text-blue-600">
                                    Enable
                                </span>
                            </button>
                        </ConfirmsPassword>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <ConfirmsPassword
                                onConfirmed={disableTwoFactorAuthentication}
                            >
                                <button
                                    type="button"
                                    disabled={disabling}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-[10px] border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60
                                        ${
                                            disabling
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-gray-100"
                                        } 
                                        border-gray-300`}
                                >
                                    <span className="text-sm text-gray-700">
                                        {confirming ? "Cancel" : "Disable"}
                                    </span>
                                </button>
                            </ConfirmsPassword>

                            {confirming && (
                                <button
                                    type="button"
                                    disabled={enabling || confirming2FA}
                                    onClick={confirmTwoFactorAuthentication}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-[10px] bg-blue-600 text-blue-700 transition font-semibold disabled:opacity-60
                                        ${
                                            enabling || confirming2FA
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-blue-500"
                                        }`}
                                >
                                    <span className="text-sm text-white">
                                        {confirming2FA
                                            ? "Confirming..."
                                            : "Confirm"}
                                    </span>
                                </button>
                            )}

                            {recoveryCodes.length > 0 && !confirming && (
                                <button
                                    type="button"
                                    onClick={regenerateRecoveryCodes}
                                    disabled={regeneratingCodes}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-[10px] bg-blue-600 text-blue-700 hover:bg-blue-500 transition font-semibold disabled:opacity-60"
                                >
                                    <span className="text-sm text-white">
                                        {regeneratingCodes
                                            ? "Generating..."
                                            : "Generate New"}
                                    </span>
                                </button>
                            )}

                            {recoveryCodes.length === 0 && !confirming && (
                                <ConfirmsPassword
                                    onConfirmed={fetchRecoveryCodes}
                                >
                                    <button className="flex items-center space-x-2 px-4 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-500 text-blue-700 transition font-semibold disabled:opacity-60">
                                        <span className="text-sm text-white">
                                            Show Recovery Codes
                                        </span>
                                    </button>
                                </ConfirmsPassword>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TwoFactorAuthenticationForm;
