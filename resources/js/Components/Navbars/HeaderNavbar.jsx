import { Link, usePage } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";

export default function HeaderNavbar() {
    const { auth } = usePage().props;
    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Detect outside clicks for dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    // Get current URL from Inertia
    const currentUrl = usePage().url;
    // Utility to check active route
    const isActive = (path) => currentUrl.startsWith(path);

    return (
        <header className="top-0 left-0 w-full bg-white shadow-sm z-50 sticky">
            <nav className="flex items-center justify-between px-28 py-3">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <span className="flex items-center gap-2">
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
                            <span className="font-bold text-xl text-blue-900">
                                Sor Ser
                            </span>
                        </span>
                    </Link>

                    {/* Nav Links with active highlight */}
                    <Link
                        href="/home"
                        className={`font-medium px-3 transition ${
                            isActive("/home")
                                ? "text-orange-500 border-b-2 border-orange-500"
                                : "text-blue-900 hover:text-orange-500"
                        }`}
                    >
                        Home
                    </Link>

                    {auth.user && (
                        <Link
                            href="/library"
                            className={`font-medium px-3 transition ${
                                isActive("/library")
                                    ? "text-orange-500 border-b-2 border-orange-500"
                                    : "text-blue-900 hover:text-orange-500"
                            }`}
                        >
                            Your Library
                        </Link>
                    )}

                    <Link
                        href="/grammar-check"
                        className={`font-medium px-3 transition ${
                            isActive("/grammar-check")
                                ? "text-orange-500 border-b-2 border-orange-500"
                                : "text-blue-900 hover:text-orange-500"
                        }`}
                    >
                        Grammar Check
                    </Link>

                    <Link
                        href="/quiz"
                        className={`font-medium px-3 transition ${
                            isActive("/quiz")
                                ? "text-orange-500 border-b-2 border-orange-500"
                                : "text-blue-900 hover:text-orange-500"
                        }`}
                    >
                        Quiz
                    </Link>

                    <Link
                        href="/about"
                        className={`font-medium px-3 transition ${
                            isActive("/about")
                                ? "text-orange-500 border-b-2 border-orange-500"
                                : "text-blue-900 hover:text-orange-500"
                        }`}
                    >
                        About
                    </Link>
                </div>

                {/* Auth Section */}
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
                                    className="flex items-center gap-2 text-blue-900 font-medium hover:text-orange-500 transition"
                                >
                                    <img
                                        src={"/images/person-icon.svg"}
                                        className="h-8 w-8 rounded-full"
                                        alt="User avatar"
                                    />
                                    <span>{auth?.user?.name}</span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 bg-white border w-48 border-gray-100 rounded-xl shadow-lg z-50">
                                        {/* <div className="px-4 py-3 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-800">
                                                {auth?.user?.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {auth?.user?.email}
                                            </span>
                                        </div> */}

                                        <div className="flex flex-col py-2 px-2">
                                            <Link
                                                href={route("profile.edit")}
                                                onClick={() =>
                                                    setDropdownOpen(false)
                                                }
                                                className="flex items-center px-4 py-2 text-sm text-blue-900 hover:bg-gray-100 rounded-lg transition"
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
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
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
                                className={`px-3 font-medium ${
                                    isActive("/login")
                                        ? "text-orange-500 border-b-2 border-orange-500"
                                        : "text-blue-900 hover:text-orange-500"
                                }`}
                            >
                                Sign In
                            </Link>
                            <Link
                                href={route("register")}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full"
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
