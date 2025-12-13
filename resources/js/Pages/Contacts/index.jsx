import Footer from "@/Components/Footer/Footer";
import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { BRAND_CONSTANTS } from "@/constants/brand";

const Icon = ({ children, className = "w-6 h-6" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {children}
    </svg>
);

const StatCard = ({ value, label }) => (
    <div className="bg-white rounded-xl p-4 text-center shadow-sm transition-all duration-200 ease-in-out">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {value}
        </div>
        <div className="text-sm text-gray-500 mt-1.5 font-medium">{label}</div>
    </div>
);

export default function index() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        phone: "",
        topic: "general",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                name: "",
                email: "",
                company: "",
                phone: "",
                topic: "general",
                message: "",
            });
        }, 3000);
    };
    return (
        <div className="bg-[#f5f6fa]">
            <Head title="Contact" />
            <HeaderNavbar />
            <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
                <section className="mb-20">
                    <div className="bg-blue-600 rounded-xl shadow-sm p-5 md:p-12 lg:p-16 hover:translate-y-[-2px] hover:shadow-sm transition-all duration-300">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left content */}
                            <div>
                                <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                                    We're here to help
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-white">
                                    Homophones with Khmer{" "}
                                    <span className="bg-gradient-to-r from-orange-400 to-orange-400 bg-clip-text text-transparent">
                                        {BRAND_CONSTANTS.NAME.SHORT_SPACED}
                                    </span>
                                </h1>
                                <p className="text-md font-medium text-blue-100 mb-8">
                                    {BRAND_CONSTANTS.COPY.CONTACT_SUBTITLE}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <a
                                        href="/homophone-check"
                                        className="px-4 py-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl font-semibold hover:shadow-sm hover:translate-y-[-1px] transition-all"
                                    >
                                        Explore Features
                                    </a>
                                    <a
                                        href="#roadmap"
                                        className="px-4 py-2 border-2 border-blue-300 text-white rounded-xl font-semibold hover:border-blue-100 hover:bg-blue-500/30 transition-all"
                                    >
                                        View Roadmap
                                    </a>
                                </div>
                            </div>

                            {/* Right image with floating animation */}
                            <div className="flex justify-end items-end relative">
                                <img
                                    src="images/children.png"
                                    alt="Robot"
                                    className="w-[440px] h-[300px] z-10 relative animate-float"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tailwind custom animation */}
                    <style >{`
                        @keyframes float {
                            0%,
                            100% {
                                transform: translateY(0);
                            }
                            50% {
                                transform: translateY(-15px);
                            }
                        }
                        .animate-float {
                            animation: float 6s ease-in-out infinite;
                        }
                    `}</style>
                </section>

                <section>
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold mb-3">
                            Get in Touch
                        </h2>
                        <p className="text-gray-500 font-medium text-md max-w-3xl mx-auto">
                            We’re here to help! Reach out to us via email,
                            phone, or by visiting our office.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {/* Email Support */}
                        <div className="bg-white rounded-xl py-4 px-4 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-500/30">
                                    <Icon className="w-7 h-7 text-white">
                                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </Icon>
                                </div>
                                {/* Text */}
                                <div>
                                    <h3 className="text-lg font-bold mb-1">
                                        Email Support
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Get help from our support team
                                    </p>
                                    <a
                                        href="mailto:hello@sor-ser.com"
                                        className="text-blue-600  font-semibold text-sm inline-flex items-center gap-1 group"
                                    >
                                        hello@sor-ser.com
                                        <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </Icon>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Phone Support */}
                        <div className="bg-white rounded-xl py-4 px-4 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/30">
                                    <Icon className="w-7 h-7 text-white">
                                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </Icon>
                                </div>
                                {/* Text */}
                                <div>
                                    <h3 className="text-lg font-bold mb-1">
                                        Phone Support
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Mon-Fri, 9AM-6PM ICT
                                    </p>
                                    <a
                                        href="tel:+85512345678"
                                        className="text-emerald-500  font-semibold text-sm inline-flex items-center gap-1 group"
                                    >
                                        +855 12 345 678
                                        <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </Icon>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Visit Office */}
                        <div className="bg-white rounded-xl py-4 px-4 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-purple-500/30">
                                    <Icon className="w-7 h-7 text-white">
                                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </Icon>
                                </div>
                                {/* Text */}
                                <div>
                                    <h3 className="text-lg font-bold mb-1">
                                        Visit Our Office
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Street 242, Phnom Penh
                                    </p>
                                    <button className="text-purple-600  font-semibold text-sm inline-flex items-center gap-1 group transition-all duration-200 ease-in-out hover:scale-105">
                                        Get Directions
                                        <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </Icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    {/* Form Section */}
                    <div className="grid lg:grid-cols-5 gap-6 mb-12">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-3 bg-white rounded-xl p-6 lg:p-8 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-3xl font-bold mb-2">
                                    Send us a message
                                </h2>
                                <p className="text-gray-500 font-sans">
                                    Fill out the form below and we'll get back
                                    to you within 24 hours.
                                </p>
                            </div>
{/* 
                            {submitted && (
                                <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl flex items-start gap-4">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-4 h-4 text-white">
                                            <path d="M5 13l4 4L19 7" />
                                        </Icon>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900 mb-1">
                                            Message sent successfully!
                                        </h4>
                                        <p className="text-sm text-green-700">
                                            We've received your message and will
                                            respond shortly.
                                        </p>
                                    </div>
                                </div>
                            )} */}

                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Bun Heng"
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="bunheng06@gmail.com"
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Company / School
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    company: e.target.value,
                                                })
                                            }
                                            placeholder="Royal University of Phnom Penh"
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                            placeholder="+855 12 345 678"
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        What can we help you with?{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            {
                                                value: "general",
                                                label: "General",
                                                icon: "💬",
                                            },
                                            {
                                                value: "support",
                                                label: "Support",
                                                icon: "🛠️",
                                            },
                                            {
                                                value: "sales",
                                                label: "Sales",
                                                icon: "💼",
                                            },
                                            {
                                                value: "partnership",
                                                label: "Partnership",
                                                icon: "🤝",
                                            },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        topic: option.value,
                                                    })
                                                }
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                                    formData.topic ===
                                                    option.value
                                                        ? "border-blue-500 bg-blue-50 shadow-sm"
                                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">
                                                    {option.icon}
                                                </div>
                                                <div className="text-sm font-semibold">
                                                    {option.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div> */}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Message{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                message: e.target.value,
                                            })
                                        }
                                        placeholder="Tell us more about what you need..."
                                        rows="6"
                                        className="w-full px-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full md:w-auto px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-sm shadow-blue-500/30 hover:shadow-sm hover:shadow-blue-500/40 hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                                >
                                    Send Message
                                    <Icon className="w-5 h-5">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                    </Icon>
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Info */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Quick Info */}
                            <div className="bg-white rounded-xl p-8 shadow-sm">
                                <h3 className="text-[26px] font-bold mb-4">
                                    Quick Information
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Icon className="w-5 h-5 text-blue-600">
                                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </Icon>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold mb-1">
                                                Response Time
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Average response within 2-4
                                                hours during business hours
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Icon className="w-5 h-5 text-emerald-600">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </Icon>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold mb-1">
                                                Support Available
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Monday to Friday, 9:00 AM - 6:00
                                                PM ICT
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Icon className="w-5 h-5 text-purple-600 transition-all duration-200 ease-in-out hover:scale-105">
                                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </Icon>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold mb-1">
                                                Email Updates
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Get notified about platform
                                                updates and new features
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Connect */}
                            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-[26px] font-semibold mb-4">
                                    Connect With Us
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href="#"
                                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <Icon className="w-5 h-5 text-gray-600 group-">
                                            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                        </Icon>
                                        <span className="font-medium text-gray-700 group- text-sm">
                                            Facebook
                                        </span>
                                    </a>

                                    <a
                                        href="#"
                                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                                    >
                                        <Icon className="w-5 h-5 text-gray-600 group-">
                                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                        </Icon>
                                        <span className="font-medium text-gray-700 group- text-sm">
                                            Twitter
                                        </span>
                                    </a>

                                    <a
                                        href="#"
                                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-700 hover:bg-blue-50 transition-all group"
                                    >
                                        <Icon className="w-5 h-5 text-gray-600 group-">
                                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                                            <circle cx="4" cy="4" r="2" />
                                        </Icon>
                                        <span className="font-medium text-gray-700 group- text-sm">
                                            LinkedIn
                                        </span>
                                    </a>

                                    <a
                                        href="#"
                                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group"
                                    >
                                        <Icon className="w-5 h-5 text-gray-600 group-">
                                            <rect
                                                x="2"
                                                y="2"
                                                width="20"
                                                height="20"
                                                rx="5"
                                                ry="5"
                                            />
                                            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                            <path d="M17.5 6.5h.01" />
                                        </Icon>
                                        <span className="font-medium text-gray-700 group- text-sm">
                                            Instagram
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
}
