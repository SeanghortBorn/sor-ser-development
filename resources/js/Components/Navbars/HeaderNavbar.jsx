import React, { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import Brand from '@/Components/Shared/Brand';
import PageContainer from '@/Components/Shared/PageContainer';
import ProfileCard from '@/Components/Shared/ProfileCard';
import { AnimatePresence, motion } from 'framer-motion';

export default function HeaderNavbar() {
    const page = usePage();
    const { auth } = page.props || {};
    const currentUrl = page.url || "";
    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log('HeaderNavbar Debug:', {
            auth,
            hasUser: !!auth?.user,
            canStudent: auth?.can?.["student"],
            screenWidth: window.innerWidth,
            currentUrl
        });
    }, [auth, currentUrl]);

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

    const isActive = (path) => currentUrl.startsWith(path) ? "text-blue-600 font-semibold" : "text-gray-700 ";

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
            <PageContainer>
                <nav className="flex items-center justify-between h-16 gap-2">
                    {/* Left: Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <Brand logoSize="md" logoVariant="blue" textVariant="short" />
                    </div>

                    {/* Center: Desktop Nav Links */}
                    <div className="hidden sm:flex items-center gap-1 flex-1 justify-center" style={{display: window.innerWidth >= 640 ? 'flex' : 'none'}}>
                        <Link
                            href="/home"
                            className={`px-2 sm:px-3 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${isActive("/home")}`}
                        >
                            Home
                        </Link>

                        <Link
                            href="/library"
                            className={`px-2 sm:px-3 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${isActive("/library")}`}
                        >
                            Your History
                        </Link>

                        <Link
                            href="/homophone-check"
                            className={`px-2 sm:px-3 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${isActive("/homophone-check")}`}
                        >
                            Homophone Check
                        </Link>

                        <Link
                            href="/quiz-practice"
                            className={`px-2 sm:px-3 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${isActive("/quiz-practice")}`}
                        >
                            Quiz & Practice
                        </Link>
                    </div>

                    {/* Right: User Profile & Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {auth.user ? (
                            <>
                                {/* Dashboard/Upgrade Button */}
                                {(Array.isArray(auth.user.roles) && auth.user.roles.length > 0) ||
                                (Array.isArray(auth.user.roles_list) && auth.user.roles_list.length > 0) ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition shadow-sm hover:shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/subscribe"
                                        className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-xl transition shadow-sm hover:shadow-sm"
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
                                        className="flex items-center gap-2 hover:bg-gray-50 hover:shadow-sm rounded-xl py-2 px-2 sm:px-3 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                                    >
                                        <img
                                            src="/images/person-icon.svg"
                                            className="h-10 w-10 rounded-full"
                                            alt="User avatar"
                                        />
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-sm font-semibold text-gray-900 leading-tight break-words">
                                                {auth?.user?.name}
                                            </span>
                                            <span className="text-xs text-gray-500 leading-tight break-words">
                                                {userRole}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                                className="absolute right-0 mt-2 w-[340px] bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden origin-top-right"
                                            >
                                                <ProfileCard
                                                    user={auth?.user}
                                                    className="border-0 p-4"
                                                    actions={(
                                                        <div className="flex gap-3">
                                                            <Link
                                                                href={route('profile.edit')}
                                                                onClick={() => setDropdownOpen(false)}
                                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-xl text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
                                                            >
                                                                Profile
                                                            </Link>
                                                            <Link
                                                                method="post"
                                                                href={route('logout')}
                                                                as="button"
                                                                onClick={() => setDropdownOpen(false)}
                                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
                                                            >
                                                                Sign Out
                                                            </Link>
                                                        </div>
                                                    )}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={route("auth")}
                                    className="hidden sm:inline-block text-gray-700  font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route("auth")}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition shadow-sm hover:shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}

                        {/* Mobile Hamburger Menu */}
                        <button
                            className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
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
                    className="sm:hidden border-t border-gray-200 bg-white shadow-sm"
                >
                    <PageContainer className="py-4">
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/home"
                                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ease-in-out ${isActive("/home")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <Link
                                href="/library"
                                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ease-in-out ${isActive("/library")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Your History
                            </Link>

                            <Link
                                href="/homophone-check"
                                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ease-in-out ${isActive("/homophone-check")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Homophone Check
                            </Link>

                            <Link
                                href="/quiz-practice"
                                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ease-in-out ${isActive("/quiz-practice")} hover:bg-gray-50`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Quiz & Practice
                            </Link>

                            {/* Mobile Auth Actions */}
                            {auth.user ? (
                                <>
                                    <hr className="my-2 border-gray-200" />
                                    {(Array.isArray(auth.user.roles) && auth.user.roles.length > 0) ||
                                    (Array.isArray(auth.user.roles_list) && auth.user.roles_list.length > 0) ? (
                                        <Link
                                            href={route("dashboard")}
                                            className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/subscribe"
                                            className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-center hover:from-orange-600 hover:to-orange-700 transition-all"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Upgrade
                                        </Link>
                                    )}
                                    <Link
                                        href={route("profile.edit")}
                                        className="py-3 px-4 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 ease-in-out"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Account
                                    </Link>
                                    <Link
                                        method="post"
                                        href={route("logout")}
                                        as="button"
                                        className="py-3 px-4 rounded-xl text-red-600 font-medium text-center hover:bg-red-50 transition-all duration-200 ease-in-out"
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
                                        className="py-3 px-4 rounded-xl text-gray-700 font-medium text-center hover:bg-gray-50 transition-all duration-200 ease-in-out"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route("auth")}
                                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all"
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
