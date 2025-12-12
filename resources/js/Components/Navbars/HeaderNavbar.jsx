import React, { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import Brand from '@/Components/Shared/Brand';
import PageContainer from '@/Components/Shared/PageContainer';

export default function HeaderNavbar() {
    const page = usePage();
    const { auth } = page.props || {};
    const currentUrl = page.url || "";
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

    // Get user's primary role
    const getUserRole = () => {
        if (!auth?.user) return null;

        // Check roles array (most common structure)
        if (Array.isArray(auth.user.roles) && auth.user.roles.length > 0) {
            const role = auth.user.roles[0];
            // Handle both object {name: "Admin"} and string "Admin"
            return typeof role === 'object' ? (role.name || role.role || 'User') : role;
        }

        // Check roles_list array (alternative structure)
        if (Array.isArray(auth.user.roles_list) && auth.user.roles_list.length > 0) {
            const role = auth.user.roles_list[0];
            return typeof role === 'object' ? (role.name || role.role || 'User') : role;
        }

        // Check if user has admin permissions
        if (auth?.can?.admin || auth?.can?.administrator) {
            return "Admin";
        }

        // Check if user has teacher permissions
        if (auth?.can?.teacher || auth?.can?.instructor) {
            return "Teacher";
        }

        // Check if user has student permissions
        if (auth?.can?.student) {
            return "Student";
        }

        // Fallback - check user object for role property
        if (auth.user.role) {
            return typeof auth.user.role === 'object'
                ? (auth.user.role.name || auth.user.role.role || 'User')
                : auth.user.role;
        }

        return "User";
    };

    const userRole = getUserRole();

    const isActive = (path) =>
        currentUrl.startsWith(path)
            ? "text-blue-600 font-semibold"
            : "text-gray-700 hover:text-blue-600";

    return (
        <header className="sticky top-0 left-0 z-50 w-full bg-white border-b border-gray-200">
            <PageContainer>
                <nav className="flex items-center justify-between h-16">
                    {/* Left: Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <Brand logoSize="md" logoVariant="blue" textVariant="short" />
                    </div>

                    {/* Center: Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                        <Link
                            href="/home"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/home")}`}
                        >
                            Home
                        </Link>

                        {auth?.can?.["student"] && (
                            <Link
                                href="/library"
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/library")}`}
                            >
                                Your History
                            </Link>
                        )}

                        <Link
                            href="/homophone-check"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/homophone-check")}`}
                        >
                            Homophone Check
                        </Link>

                        <Link
                            href="/quiz-practice"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/quiz-practice")}`}
                        >
                            Quiz & Practice
                        </Link>

                        <Link
                            href="/contacts"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive("/contacts")}`}
                        >
                            Contacts
                        </Link>
                    </div>

                    {/* Right: User Profile & Actions */}
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <>
                                {/* Dashboard/Upgrade Button */}
                                {(Array.isArray(auth.user.roles) && auth.user.roles.length > 0) ||
                                (Array.isArray(auth.user.roles_list) && auth.user.roles_list.length > 0) ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/subscribe"
                                        className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Upgrade
                                    </Link>
                                )}

                                {/* User Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg py-2 px-3 transition-all duration-200"
                                    >
                                        <img
                                            src="/images/person-icon.svg"
                                            className="h-10 w-10 rounded-full border-2 border-gray-200"
                                            alt="User avatar"
                                        />
                                        <div className="hidden lg:flex flex-col items-start">
                                            <span className="text-sm font-semibold text-gray-900 leading-tight">
                                                {auth?.user?.name}
                                            </span>
                                            <span className="text-xs text-gray-500 leading-tight">
                                                {userRole}
                                            </span>
                                        </div>
                                        <svg
                                            className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                            {/* User Info Header */}
                                            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src="/images/person-icon.svg"
                                                        className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                                                        alt="User avatar"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {auth?.user?.name}
                                                        </span>
                                                        <span className="text-xs text-blue-600 font-medium">
                                                            {userRole}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-gray-600">
                                                                {auth?.user?.email}
                                                            </span>
                                                            {!auth?.user?.email_verified_at && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                                    Unverified
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Email Verification Notice */}
                                            {!auth?.user?.email_verified_at && (
                                                <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100">
                                                    <p className="text-xs text-yellow-800 mb-2">
                                                        Please verify your email address
                                                    </p>
                                                    <Link
                                                        href={route("verification.send.otp")}
                                                        method="post"
                                                        as="button"
                                                        className="w-full text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1.5 px-3 rounded transition-colors"
                                                    >
                                                        Verify Email
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    href={route("profile.edit")}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    My Account
                                                </Link>
                                                <hr className="my-1 border-gray-200" />
                                                <Link
                                                    method="post"
                                                    href={route("logout")}
                                                    as="button"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
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
                                    href={route("auth")}
                                    className="hidden lg:inline-block text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route("auth")}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}

                        {/* Mobile Hamburger Menu */}
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            id="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </nav>
            </PageContainer>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div
                    id="mobile-menu"
                    className="lg:hidden border-t border-gray-200 bg-white shadow-lg"
                >
                    <PageContainer className="py-4">
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/home"
                                className={`py-3 px-4 rounded-lg font-medium transition-colors ${isActive("/home")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>

                            {auth?.can?.["student"] && (
                                <Link
                                    href="/library"
                                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${isActive("/library")} hover:bg-gray-50`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Your History
                                </Link>
                            )}

                            <Link
                                href="/homophone-check"
                                className={`py-3 px-4 rounded-lg font-medium transition-colors ${isActive("/homophone-check")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Homophone Check
                            </Link>

                            <Link
                                href="/quiz-practice"
                                className={`py-3 px-4 rounded-lg font-medium transition-colors ${isActive("/quiz-practice")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Quiz & Practice
                            </Link>

                            <Link
                                href="/contacts"
                                className={`py-3 px-4 rounded-lg font-medium transition-colors ${isActive("/contacts")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contacts
                            </Link>

                            {/* Mobile Auth Actions */}
                            {auth.user ? (
                                <>
                                    <hr className="my-2 border-gray-200" />
                                    {(Array.isArray(auth.user.roles) && auth.user.roles.length > 0) ||
                                    (Array.isArray(auth.user.roles_list) && auth.user.roles_list.length > 0) ? (
                                        <Link
                                            href={route("dashboard")}
                                            className="py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/subscribe"
                                            className="py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-center hover:from-orange-600 hover:to-orange-700 transition-all"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Upgrade
                                        </Link>
                                    )}
                                    <Link
                                        href={route("profile.edit")}
                                        className="py-3 px-4 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Account
                                    </Link>
                                    <Link
                                        method="post"
                                        href={route("logout")}
                                        as="button"
                                        className="py-3 px-4 rounded-lg text-red-600 font-medium text-center hover:bg-red-50 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <hr className="my-2 border-gray-200" />
                                    <Link
                                        href={route("auth")}
                                        className="py-3 px-4 rounded-lg text-gray-700 font-medium text-center hover:bg-gray-50 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route("auth")}
                                        className="py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </PageContainer>
                </div>
            )}
        </header>
    );
}
