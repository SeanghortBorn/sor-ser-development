import { useState, useRef, useEffect } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import Modal from "@/Components/Modal";

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
    const [khmerDropdownOpen, setKhmerDropdownOpen] = useState(false);
    const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
    const khmerDropdownRef = useRef(null);
    const educationDropdownRef = useRef(null);

    const infoForm = useForm({
        name: user.name || "",
        email: user.email,
        age: user.age || "",
        education_level: user.education_level || "",
        khmer_experience: user.khmer_experience || "",
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

    // Close dropdowns on outside click (works for both dropdowns)
    useEffect(() => {
        function handleClickOutside(event) {
            // If click is outside BOTH dropdowns, close both
            if (
                khmerDropdownRef.current &&
                !khmerDropdownRef.current.contains(event.target) &&
                educationDropdownRef.current &&
                !educationDropdownRef.current.contains(event.target)
            ) {
                setKhmerDropdownOpen(false);
                setEducationDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Khmer experience options
    const khmerOptions = [
        { value: "", label: "Select Experience Level" },
        { value: "None", label: "None" },
        { value: "Beginner", label: "Beginner" },
        { value: "Intermediate", label: "Intermediate" },
        { value: "Advanced", label: "Advanced" },
        { value: "Expert", label: "Expert" },
    ];

    // Education options
    const educationOptions = [
        { value: "", label: "Select Education Level" },
        { value: "Primary", label: "Primary" },
        { value: "Secondary", label: "Secondary" },
        { value: "High School", label: "High School" },
        { value: "Bachelor", label: "Bachelor" },
        { value: "Master", label: "Master" },
        { value: "Doctorate", label: "Doctorate" },
        { value: "Other", label: "Other" },
    ];

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
                            {isEditingInfo ? "Cancel" : "Edit"}
                        </span>
                    </button>
                </div>

                {/* Display User Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 space-y-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Full Name
                        </div>
                        <div className="text-gray-900 font-medium">
                            {user.name ? user.name : "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Email Address
                        </div>
                        <div className="text-gray-900 font-medium">
                            {user.email ? user.email : "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Age</div>
                        <div className="text-gray-900 font-medium">
                            {user.age ? user.age : "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Education Level
                        </div>
                        <div className="text-gray-900 font-medium">
                            {user.education_level
                                ? user.education_level
                                : "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Khmer Writing Experience
                        </div>
                        <div className="text-gray-900 font-medium">
                            {user.khmer_experience
                                ? user.khmer_experience
                                : "N/A"}
                        </div>
                    </div>
                </div>

                {/* Use Modal component for editing info */}
                <Modal
                    show={isEditingInfo}
                    onClose={() => setIsEditingInfo(false)}
                    maxWidth="2xl"
                >
                    <form
                        onSubmit={submitInfo}
                        className="bg-white w-full max-w-2xl p-8 shadow-sm border border-gray-200"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Edit Personal Information
                        </h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Update your details to keep your profile up-to-date.
                        </p>

                        <div className="space-y-4">
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
                            <div className="grid grid-cols-2 gap-4">
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
                                {/* Age field below dropdowns for 2-col layout */}
                                <div>
                                    <InputLabel htmlFor="age" value="Age" />
                                    <TextInput
                                        id="age"
                                        type="number"
                                        value={infoForm.data.age}
                                        placeholder="Enter your age"
                                        onChange={(e) =>
                                            infoForm.setData(
                                                "age",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm"
                                    />
                                    <InputError
                                        className="mt-1 text-sm text-red-500"
                                        message={infoForm.errors.age}
                                    />
                                </div>
                            </div>

                            {/* Age, Education Level, Khmer Writing Experience in two columns */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Khmer Experience Dropdown (dropup) */}
                                <div
                                    className="relative"
                                    ref={khmerDropdownRef}
                                >
                                    <label
                                        htmlFor="khmer_experience"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Khmer Writing Experience
                                    </label>
                                    <button
                                        type="button"
                                        className={`w-full px-3 py-2 text-[18px] rounded-xl border bg-white shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 ${
                                            infoForm.errors.khmer_experience
                                                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                        }`}
                                        onClick={() => {
                                            setKhmerDropdownOpen(
                                                !khmerDropdownOpen
                                            );
                                            setEducationDropdownOpen(false); // close other dropdown
                                        }}
                                    >
                                        {khmerOptions.find(
                                            (opt) =>
                                                opt.value ===
                                                infoForm.data.khmer_experience
                                        )?.label || "Select Experience Level"}
                                        <svg
                                            className={`w-4 h-4 ml-2 transition-transform ${
                                                khmerDropdownOpen
                                                    ? "rotate-180"
                                                    : "rotate-0"
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {khmerDropdownOpen && (
                                        <div className="absolute right-0 bottom-full mb-0 w-full bg-white border border-gray-200 rounded-xl shadow-sm z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                {khmerOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`flex items-center w-full text-left px-4 py-2 text-[16px] rounded-xl transition ${
                                                            infoForm.data
                                                                .khmer_experience ===
                                                            opt.value
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            infoForm.setData(
                                                                "khmer_experience",
                                                                opt.value
                                                            );
                                                            setKhmerDropdownOpen(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <InputError
                                        message={
                                            infoForm.errors.khmer_experience
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                {/* Education Level Dropdown (dropup) */}
                                <div
                                    className="relative"
                                    ref={educationDropdownRef}
                                >
                                    <label
                                        htmlFor="education_level"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Education Level
                                    </label>
                                    <button
                                        type="button"
                                        className={`w-full px-3 py-2 text-[18px] rounded-xl border bg-white shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 ${
                                            infoForm.errors.education_level
                                                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                        }`}
                                        onClick={() => {
                                            setEducationDropdownOpen(
                                                !educationDropdownOpen
                                            );
                                            setKhmerDropdownOpen(false); // close other dropdown
                                        }}
                                    >
                                        {educationOptions.find(
                                            (opt) =>
                                                opt.value ===
                                                infoForm.data.education_level
                                        )?.label || "Select Education Level"}
                                        <svg
                                            className={`w-4 h-4 ml-2 transition-transform ${
                                                educationDropdownOpen
                                                    ? "rotate-180"
                                                    : "rotate-0"
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {educationDropdownOpen && (
                                        <div className="absolute right-0 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-sm z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                {educationOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`flex items-center w-full text-left px-4 py-2 text-[16px] rounded-xl transition ${
                                                            infoForm.data
                                                                .education_level ===
                                                            opt.value
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            infoForm.setData(
                                                                "education_level",
                                                                opt.value
                                                            );
                                                            setEducationDropdownOpen(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <InputError
                                        message={
                                            infoForm.errors.education_level
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Verification Notice */}
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="text-sm mt-2">
                                <p className="text-blue-700">
                                    Your email address is unverified.{" "}
                                    <Link
                                        href={route("verification.send")}
                                        method="post"
                                        as="button"
                                        className="font-medium underline "
                                    >
                                        Click here to re-send the verification
                                        email.
                                    </Link>
                                </p>
                                {status === "verification-link-sent" && (
                                    <p className=" font-medium text-green-600">
                                        A new verification link has been sent.
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
                                className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={infoForm.processing}
                                className="rounded-xl px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
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
                </Modal>
            </div>
        </section>
    );
}
