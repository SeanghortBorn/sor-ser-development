import React, { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";

export default function HeaderNavbar() {
    const { auth } = usePage().props;
    const currentUrl = usePage().url;

    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
            // Close mobile menu if click outside
            if (
                mobileMenuOpen &&
                !event.target.closest("#mobile-menu") &&
                !event.target.closest("#mobile-menu-toggle")
            ) {
                setMobileMenuOpen(false);
            }
        };

        if (dropdownOpen || mobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen, mobileMenuOpen]);

    const isActive = (path) =>
        currentUrl.startsWith(path)
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-blue-900 hover:text-blue-600";

    return (
        <header className="sticky top-0 left-0 z-50 w-full bg-white shadow-sm">
            <nav className="flex items-center justify-between px-6 sm:px-6 md:px-16 lg:px-28">
                {/* Left: Logo + Links */}
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
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

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/home"
                            className={`px-3 py-[1.3rem] font-medium transition ${isActive(
                                "/home"
                            )}`}
                        >
                            Home
                        </Link>
                        {auth.user && (
                            <Link
                                href="/library"
                                className={`px-3 py-[1.3rem] font-medium transition ${isActive(
                                    "/library"
                                )}`}
                            >
                                Your History
                            </Link>
                        )}
                        <Link
                            href="/grammar-check"
                            className={`px-3 py-[1.3rem] font-medium transition ${isActive(
                                "/grammar-check"
                            )}`}
                        >
                            Grammar Check
                        </Link>
                        <Link
                            href="/quiz-practice"
                            className={`px-3 py-[1.3rem] font-medium transition ${isActive(
                                "/quiz-practice"
                            )}`}
                        >
                            Quiz & Practice
                        </Link>
                        <Link
                            href="/contacts"
                            className={`px-3 py-[1.3rem] font-medium transition ${isActive(
                                "/contacts"
                            )}`}
                        >
                            Contacts
                        </Link>
                    </div>
                </div>
                
                {/* Authentication & Mobile Hamburger */}
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <>
                            {(Array.isArray(auth.user.roles) &&
                                auth.user.roles.length > 0) ||
                            (Array.isArray(auth.user.roles_list) &&
                                auth.user.roles_list.length > 0) ? (
                                <Link
                                    href={route("dashboard")}
                                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-6 rounded-full hidden md:inline-block"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/subscribe"
                                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-6 rounded-full hidden md:inline-block"
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
                                        src="/images/person-icon.svg"
                                        className="h-8 w-8 rounded-full"
                                        alt="User avatar"
                                    />
                                    <span className="hidden md:inline">
                                        {auth?.user?.name}
                                    </span>
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
                                className="text-blue-900 font-medium px-3 hover:text-secondary hidden md:inline-block"
                            >
                                Sign In
                            </Link>
                            <Link
                                href={route("register")}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 md:inline-block"
                            >
                                Get Started
                            </Link>
                        </>
                    )}

                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden text-blue-900"
                        id="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <i className="fas fa-bars text-2xl py-6"></i>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div
                        id="mobile-menu"
                        className="absolute top-full left-0 w-full bg-white shadow-md md:hidden z-40"
                    >
                        <div className="flex flex-col gap-1 py-4 px-4">
                            <Link
                                href="/home"
                                className={`py-2 px-3 rounded-lg ${isActive(
                                    "/home"
                                )} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            {auth.user && (
                                <Link
                                    href="/library"
                                    className={`py-2 px-3 rounded-lg ${isActive(
                                        "/library"
                                    )} hover:bg-gray-50`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Your History
                                </Link>
                            )}
                            <Link
                                href="/grammar-check"
                                className={`py-2 px-3 rounded-lg ${isActive(
                                    "/grammar-check"
                                )} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Grammar Check
                            </Link>
                            <Link
                                href="/quiz-practice"
                                className={`py-2 px-3 rounded-lg ${isActive(
                                    "/quiz-practice"
                                )} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Quiz & Practice
                            </Link>
                            <Link
                                href="/contacts"
                                className={`py-2 px-3 rounded-lg ${isActive(
                                    "/contacts"
                                )} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contacts
                            </Link>

                            {/* Authenticated User Actions */}
                            {auth.user ? (
                                <>
                                    {(Array.isArray(auth.user.roles) &&
                                        auth.user.roles.length > 0) ||
                                    (Array.isArray(auth.user.roles_list) &&
                                        auth.user.roles_list.length > 0) ? (
                                        <Link
                                            href={route("dashboard")}
                                            className="py-2 px-3 rounded-lg bg-orange-500 text-white text-center hover:bg-orange-400"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/subscribe"
                                            className="py-2 px-3 rounded-lg bg-orange-500 text-white text-center hover:bg-orange-400"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            Upgrade
                                        </Link>
                                    )}
                                    <Link
                                        href={route("profile.edit")}
                                        className="py-2 px-3 rounded-lg text-blue-900 text-center hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Account
                                    </Link>
                                    <Link
                                        method="post"
                                        href={route("logout")}
                                        as="button"
                                        className="py-2 px-3 rounded-lg text-red-600 text-center hover:bg-red-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route("login")}
                                        className="py-2 px-3 rounded-lg text-blue-900 text-center hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="py-2 px-3 rounded-lg bg-orange-500 text-white text-center hover:bg-orange-400"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
