import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";

export default function UpdatePasswordForm({ className = "" }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(true); // changed to true

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowPasswordModal(false);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Change Password
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Keep your account secure by updating your password
                        regularly.
                    </p>
                </div>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-500 rounded-xl font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200 ease-in-out"
                >
                    <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    <span className="text-sm">
                            {showPasswordModal ? "Cancel" : "Edit"}
                        </span>
                </button>
            </div>

            <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-2">
                    <li>
                        <span className="font-medium text-red-500">
                            Change your password regularly
                        </span>{" "}
                        to keep your account safe.
                    </li>
                    <li>
                        Use a{" "}
                        <span className="font-medium text-red-500">
                            strong password
                        </span>{" "}
                        with a mix of letters, numbers, and symbols.
                    </li>
                    <li>
                        <span className="font-medium text-red-500">
                            Avoid simple passwords
                        </span>{" "}
                        like "123456" or your name, and don’t reuse passwords
                        from other sites.
                    </li>
                    <li>
                        After changing your password, your old password will no
                        longer work. Use your new password the next time you log
                        in.
                    </li>
                </ul>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget)
                            setShowPasswordModal(false);
                    }}
                >
                    <form
                        onSubmit={updatePassword}
                        className="bg-white rounded-xl w-full max-w-xl p-8 shadow-sm border border-gray-200"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Change Password
                        </h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Update your password to keep your account secure.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="current_password"
                                    value="Current Password"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(e) =>
                                            setData(
                                                "current_password",
                                                e.target.value
                                            )
                                        }
                                        type={
                                            showCurrentPassword
                                                ? "text"
                                                : "password"
                                        }
                                        className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm pr-10"
                                        autoComplete="current-password"
                                        placeholder="Enter your current password"
                                    />
                                </div>
                                <InputError
                                    message={errors.current_password}
                                    className="mt-2 text-sm text-red-500"
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="New Password"
                                />
                                <TextInput
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    type="password"
                                    className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm"
                                    autoComplete="new-password"
                                    placeholder="Enter a new password"
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-2 text-sm text-red-500"
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    type="password"
                                    className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm"
                                    autoComplete="new-password"
                                    placeholder="Re-enter your new password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2 text-sm text-red-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(false)}
                                disabled={processing}
                                className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                            >
                                {processing ? "Saving..." : "Save"}
                            </button>
                        </div>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition ease-in-out"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600 font-medium mt-2">
                                Password updated successfully.
                            </p>
                        </Transition>
                    </form>
                </div>
            )}
        </section>
    );
}
