import React, { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "./Modal";
import InputError from "./InputError";
import InputLabel from "./InputLabel";
import TextInput from "./TextInput";
import axios from "axios";

export default function ConfirmsPassword({ onConfirmed, children }) {
    const [confirmingPassword, setConfirmingPassword] = useState(false);
    const passwordInput = useRef();
    const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
    const [localErrors, setLocalErrors] = useState({});
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        const handleLangChange = () => {
            setLang(localStorage.getItem("lang") || "en");
        };
        window.addEventListener("lang-changed", handleLangChange);
        window.addEventListener("storage", handleLangChange);
        return () => {
            window.removeEventListener("lang-changed", handleLangChange);
            window.removeEventListener("storage", handleLangChange);
        };
    }, []);

    const { data, setData, post, processing, reset, errors } = useForm({
        password: "",
    });

    const confirmPassword = () => {
        setConfirmingPassword(true);
        setTimeout(() => passwordInput.current?.focus(), 250);
    };

    const closeModal = () => {
        setConfirmingPassword(false);
        reset();
        setLocalErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setConfirming(true);
        axios
            .post(route("password.confirm"), {
                password: data.password,
            })
            .then((response) => {
                closeModal();
                reset();
                setLocalErrors({});
                setTimeout(() => {
                    onConfirmed();
                }, 100);
            })
            .catch((error) => {
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.errors
                ) {
                    const newErrors = {};
                    Object.keys(error.response.data.errors).forEach((key) => {
                        newErrors[key] = error.response.data.errors[key][0];
                    });
                    setLocalErrors(newErrors);
                    setData("password", "");
                }
                passwordInput.current?.focus();
            })
            .finally(() => setConfirming(false));
    };

    return (
        <span>
            <span onClick={confirmPassword}>{children}</span>

            <Modal show={confirmingPassword} onClose={closeModal} maxWidth="lg">
                <form className="p-6" onSubmit={handleSubmit}>
                    <h2 className="text-lg font-medium text-gray-900">
                        Security Confirmation
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        For your security, please confirm your password to
                        continue.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Enter Password" />

                        <TextInput
                            id="password"
                            ref={passwordInput}
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm"
                            placeholder="Enter your Password"
                        />

                        <InputError
                            message={localErrors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={confirming}
                            className="rounded-xl px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                        >
                            {confirming ? "Confirming..." : "Confirm"}
                        </button>
                    </div>
                </form>
            </Modal>
        </span>
    );
}
