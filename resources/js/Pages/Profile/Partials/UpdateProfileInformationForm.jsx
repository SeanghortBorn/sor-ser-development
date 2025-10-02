import { useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [successMessages, setSuccessMessages] = useState({ info: false });

    const infoForm = useForm({
        name: user.name || "",
        email: user.email,
    });

    const submitInfo = (e) => {
        e.preventDefault();
        infoForm.patch(route("profile.update"), {
            onSuccess: () => {
                setIsEditingInfo(false);
                setSuccessMessages({ info: true });
                setTimeout(() => setSuccessMessages({ info: false }), 2000);
            },
        });
    };

    return (
        <section className={className}>
            {/* Personal Information Section */}
            <div className="pt-2 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Personal Information
                        </h3>
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Noted: </span>
                            To update your personal information, please verify
                            your email address first.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsEditingInfo((v) => !v)}
                        className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-500 rounded-xl font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
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
                            {isEditingInfo ? "Cancel" : "Edit"}
                        </span>
                    </button>
                </div>

                {/* Display User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Full Name
                        </div>
                        <div className="text-gray-900 font-medium">
                            {user.name}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Email Address
                        </div>
                        <div className="text-gray-900 font-medium">
                            {user.email}
                        </div>
                    </div>
                </div>

                {isEditingInfo && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget)
                                setIsEditingInfo(false);
                        }}
                    >
                        <form
                            onSubmit={submitInfo}
                            className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl border border-gray-200"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Edit Personal Information
                            </h2>
                            <p className="text-gray-500 mb-6 text-sm">
                                Update your details to keep your profile
                                up-to-date.
                            </p>

                            <div className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Full Name"
                                    />
                                    <TextInput
                                        id="name"
                                        value={infoForm.data.name}
                                        placeholder="Enter your full name"
                                        onChange={(e) =>
                                            infoForm.setData(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm"
                                    />
                                    <InputError
                                        className="mt-1 text-sm text-red-500"
                                        message={infoForm.errors.name}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email Address"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={infoForm.data.email}
                                        placeholder="Enter your email"
                                        onChange={(e) =>
                                            infoForm.setData(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm"
                                    />
                                    <InputError
                                        className="mt-1 text-sm text-red-500"
                                        message={infoForm.errors.email}
                                    />
                                </div>
                            </div>

                            {/* Email Verification Notice */}
                            {mustVerifyEmail &&
                                user.email_verified_at === null && (
                                    <div className="text-sm mt-2">
                                        <p className="text-blue-700">
                                            Your email address is unverified.{" "}
                                            <Link
                                                href={route(
                                                    "verification.send"
                                                )}
                                                method="post"
                                                as="button"
                                                className="font-medium underline hover:text-blue-900"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>
                                        {status ===
                                            "verification-link-sent" && (
                                            <p className=" font-medium text-green-600">
                                                A new verification link has been
                                                sent.
                                            </p>
                                        )}
                                    </div>
                                )}

                            {/* Buttons */}
                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingInfo(false)}
                                    disabled={infoForm.processing}
                                    className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={infoForm.processing}
                                    className="rounded-[10px] px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                    {infoForm.processing ? "Saving..." : "Save"}
                                </button>
                            </div>

                            {/* Success Message */}
                            <Transition
                                show={successMessages.info}
                                enter="transition ease-in-out duration-150"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition ease-in-out duration-150"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600 font-medium mt-2">
                                    Profile updated successfully.
                                </p>
                            </Transition>
                        </form>
                    </div>
                )}
            </div>
        </section>
    );
}
