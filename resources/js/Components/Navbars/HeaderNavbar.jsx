import React, { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";

export default function HeaderNavbar() {
    const { auth } = usePage().props;
    const currentUrl = usePage().url;

    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    // Check active route
    const isActive = (path) =>
        currentUrl.startsWith(path)
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-blue-900 hover:text-blue-600";

    return (
        <header className="sticky top-0 left-0 z-50 w-full bg-white shadow-sm">
            <nav className="flex items-center justify-between px-28">
                {/* ====== Logo & Navigation Links ====== */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                width="32"
                                height="32"
                                rx="8"
                                fill="#2563EB"
                            />
                            <path
                                d="M16 10L22 13.5V19.5L16 23L10 19.5V13.5L16 10Z"
                                fill="white"
                            />
                        </svg>
                        <span className="text-xl font-bold text-blue-900">
                            Sor Ser
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <Link
                        href="/home"
                        className={`px-3 py-[1.2rem] font-medium transition ${isActive(
                            "/home"
                        )}`}
                    >
                        Home
                    </Link>

                    {auth.user && (
                        <Link
                            href="/library"
                            className={`px-3 py-[1.2rem] font-medium transition ${isActive(
                                "/library"
                            )}`}
                        >
                            Your Library
                        </Link>
                    )}

                    <Link
                        href="/grammar-check"
                        className={`px-3 py-[1.2rem] font-medium transition ${isActive(
                            "/grammar-check"
                        )}`}
                    >
                        Grammar Check
                    </Link>

                    <Link
                        href="/quiz-practice"
                        className={`px-3 py-[1.2rem] font-medium transition ${isActive(
                            "/quiz-practice"
                        )}`}
                    >
                        Quiz & Practice
                    </Link>

                    <Link
                        href="/about"
                        className={`px-3 py-[1.2rem] font-medium transition ${isActive(
                            "/about"
                        )}`}
                    >
                        About
                    </Link>
                </div>

                {/* ====== Authentication Section ====== */}
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <>
                            {(Array.isArray(auth.user.roles) &&
                                auth.user.roles.length > 0) ||
                            (Array.isArray(auth.user.roles_list) &&
                                auth.user.roles_list.length > 0) ? (
                                <Link
                                    href={route("dashboard")}
                                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-6 rounded-full"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/subscribe"
                                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-6 rounded-full"
                                >
                                    Upgrade
                                </Link>
                            )}

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setDropdownOpen(!dropdownOpen)
                                    }
                                    className="flex items-center gap-2 text-blue-900 font-medium hover:text-blue-500 transition"
                                >
                                    <img
                                        src={"/images/person-icon.svg"}
                                        className="h-8 w-8 rounded-full"
                                        alt="User avatar"
                                    />
                                    <span>{auth?.user?.name}</span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 bg-white border mx-auto max-w-xl border-gray-100 rounded-xl shadow-lg z-50">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {auth?.user?.name}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {auth?.user?.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col py-2 px-2">
                                            <Link
                                                href={route("profile.edit")}
                                                onClick={() =>
                                                    setDropdownOpen(false)
                                                }
                                                className="flex items-center px-3 py-2 text-sm text-blue-900 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <i className="fas fa-user-circle w-4 mr-3 text-gray-500"></i>
                                                My Account
                                            </Link>
                                            <hr className="my-1 border-gray-200" />
                                            <Link
                                                method="post"
                                                href={route("logout")}
                                                as="button"
                                                onClick={() =>
                                                    setDropdownOpen(false)
                                                }
                                                className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <i className="fas fa-sign-out-alt w-4 mr-3 text-red-500"></i>
                                                Sign Out
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className="text-blue-900 font-medium px-3 hover:text-secondary"
                            >
                                Sign In
                            </Link>
                            <Link
                                href={route("register")}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
