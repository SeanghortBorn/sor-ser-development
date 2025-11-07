import React, { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, X, ChevronDown, User, LogOut, Settings } from "lucide-react";

export default function HeaderNavbar() {
    const page = usePage();
    const { auth } = page.props || {};
    const currentUrl = page.url || "";
    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);

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

    const [canAccessLibrary, setCanAccessLibrary] = useState(() => {
        if (auth?.can?.["student"]) return true;
        if (
            typeof window !== "undefined" &&
            window.__canAccessLibrary !== undefined
        )
            return window.__canAccessLibrary;
        return null;
    });

    useEffect(() => {
        if (canAccessLibrary === true || !auth?.user) return;
        let cancelled = false;
        (async () => {
            try {
                const useAxios = typeof window !== "undefined" && window.axios;
                const res = useAxios
                    ? await window.axios.get("/library", {
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                        validateStatus: () => true,
                    })
                    : await fetch("/library", {
                        credentials: "same-origin",
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                    });
                const ok = useAxios ? res.status === 200 : res.ok;
                if (!cancelled) {
                    setCanAccessLibrary(ok);
                    if (typeof window !== "undefined")
                        window.__canAccessLibrary = ok;
                }
            } catch {
                if (!cancelled) {
                    setCanAccessLibrary(false);
                    if (typeof window !== "undefined")
                        window.__canAccessLibrary = false;
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [auth?.user, canAccessLibrary]);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
                setShowHeader(false); // hide header on scroll down
            } else {
                setShowHeader(true); // show header on scroll up
            }
            lastScrollY.current = window.scrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const isActive = (path) =>
        currentUrl.startsWith(path)
            ? "text-[#0052CC] font-semibold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0052CC]"
            : "text-gray-700 hover:text-[#0052CC]";

    return (
        <header className={`sticky top-0 left-0 z-50 w-full bg-white border-b border-gray-100 backdrop-blur-sm bg-opacity-95 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
            <nav className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center gap-3 flex-shrink-0">
                        <div className="relative">
                            <img
                                src="/images/sor-ser logo.png"
                                alt="Sor-Ser logo"
                                className="h-9 w-9"
                                style={{
                                    filter: "brightness(0) saturate(100%) invert(21%) sepia(94%) saturate(2783%) hue-rotate(210deg) brightness(96%) contrast(97%)"
                                }}
                                width="36"
                                height="36"
                            />
                        </div>
                        <span className="text-xl font-bold text-[#0052CC]">
                            Sor-Ser
                        </span>
                    </Link>
                    {/* Center: Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                        <Link
                            href="/home"
                            className={`px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/home")}`}
                        >
                            Home
                        </Link>
                        {auth?.user && canAccessLibrary === true && (
                            <Link
                                href="/library"
                                className={`px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/library")}`}
                            >
                                Your History
                            </Link>
                        )}
                        <Link
                            href="/homophone-check"
                            className={`px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/homophone-check")}`}
                        >
                            Homophone Check
                        </Link>
                        <Link
                            href="/quiz-practice"
                            className={`px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/quiz-practice")}`}
                        >
                            Quiz & Practice
                        </Link>
                        <Link
                            href="/contacts"
                            className={`px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/contacts")}`}
                        >
                            Contacts
                        </Link>
                    </div>

                    {/* Right: Authentication & Actions */}
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <>
                                {/* Dashboard/Upgrade Button */}
                                {(Array.isArray(auth.user.roles) &&
                                    auth.user.roles.length > 0) ||
                                    (Array.isArray(auth.user.roles_list) &&
                                        auth.user.roles_list.length > 0) ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="hidden lg:inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-5 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/subscribe"
                                        className="hidden lg:inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-5 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        Upgrade
                                    </Link>
                                )}

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0052CC] to-[#0047B3] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                            {auth?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="hidden md:inline text-sm font-medium text-gray-700">
                                            {auth?.user?.name}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-50">
                                            {/* User Info */}
                                            <div className="px-4 py-3 bg-gradient-to-br from-[#0052CC]/5 to-[#0052CC]/10 border-b border-[#0052CC]/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0052CC] to-[#0047B3] flex items-center justify-center text-white font-bold shadow-sm">
                                                        {auth?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {auth?.user?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600 truncate">
                                                            {auth?.user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="py-2">
                                                <Link
                                                    href={route("profile.edit")}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#0052CC]/10 transition-colors duration-150"
                                                >
                                                    <Settings className="w-4 h-4 text-gray-500" />
                                                    <span className="font-medium">My Account</span>
                                                </Link>
                                                <div className="my-1 border-t border-gray-100"></div>
                                                <Link
                                                    method="post"
                                                    href={route("logout")}
                                                    as="button"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="font-medium">Sign Out</span>
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
                                    className="hidden lg:inline-flex items-center text-gray-700 font-medium px-4 py-2 rounded-2xl hover:bg-gray-50 transition-all duration-200 text-sm"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-5 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}

                        {/* Mobile Hamburger */}
                        <button
                            className="lg:hidden p-2 rounded-2xl hover:bg-gray-100 transition-colors duration-200"
                            id="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div
                        id="mobile-menu"
                        className="lg:hidden border-t border-gray-100 py-4"
                    >
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/home"
                                className={`px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/home")}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            {auth?.user && canAccessLibrary === true && (
                                <Link
                                    href="/library"
                                    className={`px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/library")}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Your History
                                </Link>
                            )}
                            <Link
                                href="/homophone-check"
                                className={`px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/homophone-check")}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Homophone Check
                            </Link>
                            <Link
                                href="/quiz-practice"
                                className={`px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/quiz-practice")}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Quiz & Practice
                            </Link>
                            <Link
                                href="/contacts"
                                className={`px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-200 ${isActive("/contacts")}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contacts
                            </Link>

                            {/* Mobile Auth Actions */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                {auth.user ? (
                                    <>
                                        {(Array.isArray(auth.user.roles) &&
                                            auth.user.roles.length > 0) ||
                                            (Array.isArray(auth.user.roles_list) &&
                                                auth.user.roles_list.length > 0) ? (
                                            <Link
                                                href={route("dashboard")}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 mb-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm shadow-sm"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/subscribe"
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 mb-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm shadow-sm"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Upgrade
                                            </Link>
                                        )}
                                        <Link
                                            href={route("profile.edit")}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            My Account
                                        </Link>
                                        <Link
                                            method="post"
                                            href={route("logout")}
                                            as="button"
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="flex items-center justify-center px-4 py-2.5 mb-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm shadow-sm"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}