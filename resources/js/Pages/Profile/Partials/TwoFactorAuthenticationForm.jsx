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

    const confirmationForm = useForm({
        code: "",
    });

    // Check if 2FA is enabled
    const twoFactorEnabled = auth.user?.two_factor_enabled;

    // Check if 2FA needs confirmation
    const needsConfirmation =
        twoFactorEnabled && !auth.user?.two_factor_confirmed_at;

    useEffect(() => {
        // If 2FA is enabled but not confirmed, show confirmation UI
        if (needsConfirmation) {
            setConfirming(true);
            fetchQrCodeAndSetupKey();
        }
        // If 2FA is fully enabled, fetch recovery codes if we don't have them
        else if (twoFactorEnabled && auth.user?.two_factor_confirmed_at) {
            fetchQrCodeAndSetupKey();
            fetchRecoveryCodes();
        }
    }, [twoFactorEnabled, auth.user?.two_factor_confirmed_at]);

    const fetchQrCodeAndSetupKey = async () => {
        try {
            // Fetch QR code - this will trigger password confirmation via middleware
            const qrResponse = await fetch(route("two-factor.qr-code"));
            if (qrResponse.ok) {
                const qrData = await qrResponse.json();
                setQrCode(qrData.svg);
                console.log("QR code fetched successfully:", !!qrData.svg);

                // Fetch setup key right after successful QR code fetch
                const keyResponse = await fetch(route("two-factor.secret-key"));
                if (keyResponse.ok) {
                    const keyData = await keyResponse.json();
                    console.log("Setup key response:", keyData); // Log the full response

                    // Check the structure of the response
                    if (keyData.secret) {
                        setSetupKey(keyData.secret);
                        console.log("Setup key set:", keyData.secret);
                    } else {
                        console.error(
                            "Secret key not found in response:",
                            keyData
                        );
                        // Try to extract the key from a different property
                        const potentialKey =
                            keyData.secretKey ||
                            keyData.key ||
                            Object.values(keyData)[0];
                        if (potentialKey && typeof potentialKey === "string") {
                            setSetupKey(potentialKey);
                            console.log(
                                "Using alternative key property:",
                                potentialKey
                            );
                        }
                    }
                } else {
                    console.error(
                        "Failed to fetch secret key:",
                        await keyResponse.text()
                    );
                }
            } else {
                console.error(
                    "Failed to fetch QR code:",
                    await qrResponse.text()
                );
            }
        } catch (error) {
            console.error("Error fetching 2FA data:", error);
        }
    };

    const fetchRecoveryCodes = async () => {
        try {
            // Fetch recovery codes - this will trigger password confirmation
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
                onError: () => {
                    setEnabling(false);
                },
                onFinish: () => {
                    setEnabling(false);
                },
            }
        );
    };

    const confirmTwoFactorAuthentication = () => {
        confirmationForm.post(route("two-factor.confirm"), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(false);
                fetchRecoveryCodes();
            },
        });
    };

    const regenerateRecoveryCodes = () => {
        router.post(
            route("two-factor.regenerate-recovery-codes"),
            {},
            {
                preserveScroll: true,
                onSuccess: async () => {
                    await fetchRecoveryCodes();
                },
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
            onFinish: () => {
                setDisabling(false);
            },
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Two Factor Authentication
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Add additional security to your account using two factor
                    authentication.
                </p>
            </header>

            <div className="">
                <div className="max-w-xl">
                    {twoFactorEnabled && !confirming ? (
                        <h3 className="text-lg font-medium text-gray-900">
                            You have enabled two factor authentication.
                        </h3>
                    ) : twoFactorEnabled && confirming ? (
                        <h3 className="text-lg font-medium text-gray-900">
                            Finish enabling two factor authentication.
                        </h3>
                    ) : (
                        <h3 className="text-lg font-medium text-gray-900">
                            You have not enabled two factor authentication.
                        </h3>
                    )}

                    <div className="mt-3 text-sm text-gray-600">
                        <p>
                            When two factor authentication is enabled, you will
                            be prompted for a secure, random token during
                            authentication. You may retrieve this token from
                            your phone's Google Authenticator application.
                        </p>
                    </div>

                    {twoFactorEnabled && (
                        <div className="mt-4">
                            {qrCode && (
                                <div className="mt-4">
                                    <p className="font-semibold mb-2 text-sm text-gray-600">
                                        {confirming
                                            ? "To finish enabling two factor authentication, scan the following QR code using your phone's authenticator application."
                                            : "Two factor authentication is now enabled. Scan the following QR code using your phone's authenticator application."}
                                    </p>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: qrCode,
                                        }}
                                        className="p-2 inline-block bg-white border border-gray-200 rounded"
                                    />
                                </div>
                            )}

                            {setupKey && (
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
                                        authenticator app.
                                    </p>
                                </div>
                            )}

                            {confirming && (
                                <div className="mt-4">
                                    <InputLabel htmlFor="code" value="Code" />
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
                                        inputMode="numeric"
                                        className="block mt-1 w-1/2"
                                        autoFocus
                                        autoComplete="one-time-code"
                                    />
                                    <InputError
                                        message={confirmationForm.errors.code}
                                        className="mt-2"
                                    />
                                </div>
                            )}

                            {recoveryCodes.length > 0 && !confirming && (
                                <>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p className="font-semibold">
                                            Store these recovery codes in a
                                            secure password manager. They can be
                                            used to recover access to your
                                            account if your two factor
                                            authentication device is lost.
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
                                <PrimaryButton
                                    type="button"
                                    className={enabling ? "opacity-25" : ""}
                                    disabled={enabling}
                                >
                                    Enable
                                </PrimaryButton>
                            </ConfirmsPassword>
                        ) : (
                            <>
                                {confirming && (
                                    <ConfirmsPassword
                                        onConfirmed={
                                            confirmTwoFactorAuthentication
                                        }
                                    >
                                        <PrimaryButton
                                            type="button"
                                            className={`me-3 ${
                                                enabling ? "opacity-25" : ""
                                            }`}
                                            disabled={enabling}
                                        >
                                            Confirm
                                        </PrimaryButton>
                                    </ConfirmsPassword>
                                )}

                                {recoveryCodes.length > 0 && !confirming && (
                                    <ConfirmsPassword
                                        onConfirmed={regenerateRecoveryCodes}
                                    >
                                        <SecondaryButton className="me-3">
                                            Regenerate Recovery Codes
                                        </SecondaryButton>
                                    </ConfirmsPassword>
                                )}

                                {recoveryCodes.length === 0 && !confirming && (
                                    <ConfirmsPassword
                                        onConfirmed={fetchRecoveryCodes}
                                    >
                                        <SecondaryButton className="me-3">
                                            Show Recovery Codes
                                        </SecondaryButton>
                                    </ConfirmsPassword>
                                )}

                                <ConfirmsPassword
                                    onConfirmed={disableTwoFactorAuthentication}
                                >
                                    <DangerButton
                                        className={
                                            disabling ? "opacity-25" : ""
                                        }
                                        disabled={disabling}
                                    >
                                        {confirming ? "Cancel" : "Disable"}
                                    </DangerButton>
                                </ConfirmsPassword>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TwoFactorAuthenticationForm;
