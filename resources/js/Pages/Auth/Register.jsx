import { useState, useEffect, useRef } from "react";
import { Head, useForm } from "@inertiajs/react";
import WaveBackground from "@/Components/Animations/WaveBackground";
import InputError from "@/Components/InputError";
import Checkbox from "@/Components/Checkbox";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        agreeTerms: false,
        age: "",
        education_level: "",
        khmer_experience: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [khmerDropdownOpen, setKhmerDropdownOpen] = useState(false);
    const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
    const khmerDropdownRef = useRef(null);
    const educationDropdownRef = useRef(null);

    const khmerOptions = [
        { value: "", label: "Select Experience Level" },
        { value: "None", label: "None" },
        { value: "Beginner", label: "Beginner" },
        { value: "Intermediate", label: "Intermediate" },
        { value: "Advanced", label: "Advanced" },
        { value: "Expert", label: "Expert" },
    ];

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

    // Keep password_confirmation always in sync with password
    useEffect(() => {
        setData("password_confirmation", data.password);
    }, [data.password]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                khmerDropdownRef.current &&
                !khmerDropdownRef.current.contains(event.target)
            ) {
                setKhmerDropdownOpen(false);
            }
            if (
                educationDropdownRef.current &&
                !educationDropdownRef.current.contains(event.target)
            ) {
                setEducationDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <>
            <Head title="Sign Up" />
            <WaveBackground />
            <div className="fixed inset-0 flex items-center justify-center z-10">
                <div className="relative bg-white rounded-xl w-full max-w-3xl shadow-sm">
                    {/* Close Button */}
                    <button
                        type="button"
                        className="absolute top-5 right-6 text-gray-400  text-2xl z-10"
                        aria-label="Close"
                        onClick={() => window.history.back()}
                        style={{ background: "none", border: "none" }}
                    >
                        &times;
                    </button>

                    {/* Form Content */}
                    <div className="px-8 py-6">
                        <h2 className="text-2xl font-bold text-[#222a54] mb-3">
                            Sign Up
                        </h2>

                        <a
                            href={route("auth.google")}
                            className="w-full flex items-center justify-center gap-3 px-3 py-[14px] border-[3px] border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 ease-in-out mb-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285f4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34a853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#fbbc05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#ea4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="text-gray-700 font-medium">
                                Sign Up with Google
                            </span>
                        </a>

                        <div className="flex items-center mb-2">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-3 text-md text-gray-400">
                                Or
                            </span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Row 1: Full Name + Age */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="Full Name"
                                        className="w-full px-3 py-[12px] border border-gray-300 rounded-xl text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px]"
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="age"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={data.age}
                                        onChange={(e) =>
                                            setData("age", e.target.value)
                                        }
                                        placeholder="Age"
                                        className="w-full px-3 py-[12px] border border-gray-300 rounded-xl text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px]"
                                        required
                                    />
                                    <InputError
                                        message={errors.age}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Khmer Experience + Education Level */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Khmer Experience Dropdown */}
                                <div className="relative" ref={khmerDropdownRef}>
                                    <label
                                        htmlFor="khmer_experience"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Khmer Writing Experience
                                    </label>
                                    <button
                                        type="button"
                                        className={`w-full px-3 py-[12px] text-[18px] rounded-xl border bg-white shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 ${
                                            errors.khmer_experience
                                                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                        }`}
                                        onClick={() =>
                                            setKhmerDropdownOpen(
                                                !khmerDropdownOpen
                                            )
                                        }
                                    >
                                        {
                                            khmerOptions.find(
                                                (opt) =>
                                                    opt.value ===
                                                    data.khmer_experience
                                            )?.label || "Select Experience Level"
                                        }
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
                                        <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                {khmerOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`flex items-center w-full text-left px-4 py-2 text-[16px] rounded-xl transition ${
                                                            data.khmer_experience ===
                                                            opt.value
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            setData(
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
                                        message={errors.khmer_experience}
                                        className="mt-1"
                                    />
                                </div>

                                {/* Education Level Dropdown */}
                                <div className="relative" ref={educationDropdownRef}>
                                    <label
                                        htmlFor="education_level"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Education Level
                                    </label>
                                    <button
                                        type="button"
                                        className={`w-full px-3 py-[12px] text-[18px] rounded-xl border bg-white shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 ${
                                            errors.education_level
                                                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                        }`}
                                        onClick={() =>
                                            setEducationDropdownOpen(
                                                !educationDropdownOpen
                                            )
                                        }
                                    >
                                        {
                                            educationOptions.find(
                                                (opt) => opt.value ===
                                                    data.education_level
                                            )?.label || "Select Education Level"
                                        }
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
                                        <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                {educationOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`flex items-center w-full text-left px-4 py-2 text-[16px] rounded-xl transition ${
                                                            data.education_level ===
                                                            opt.value
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            setData(
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
                                        message={errors.education_level}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Email + Password */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="Email Address"
                                        className="w-full px-3 py-[12px] border border-gray-300 rounded-xl text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px]"
                                        required
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="relative">
                                    <label
                                        htmlFor="password"
                                        className="block text-md text-[#222a54] font-semibold mb-2"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="Password"
                                        className="w-full px-3 py-[12px] border border-gray-300 rounded-xl text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-4 top-[45px] text-gray-400 "
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                    <InputError
                                        message={errors.password}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mt-2">
                                    <label className="flex items-center cursor-pointer select-none">
                                        <Checkbox
                                            name="agreeTerms"
                                            checked={data.agreeTerms}
                                            onChange={(e) =>
                                                setData(
                                                    "agreeTerms",
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                                            required
                                        />
                                        <span className="ml-2 text-md text-gray-600">
                                            I agree to the Terms & Privacy
                                            Policy
                                        </span>
                                    </label>
                                </div>
                                {/* Submit Button */}
                                <div className="flex justify-start">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-1/3 border-2 border-blue-500 text-blue-600 hover:bg-[#f5f7ff] font-semibold py-2 rounded-xl transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95 text-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {processing
                                            ? "Registering..."
                                            : "Register"}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-2 text-start">
                            <a
                                href={route("login")}
                                className="text-md font-medium text-[#2563eb] hover:underline block"
                            >
                                Login to an existing account!
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}