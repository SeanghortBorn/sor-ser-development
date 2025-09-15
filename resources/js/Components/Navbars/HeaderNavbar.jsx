import { Link, usePage } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";

export default function HeaderNavbar() {
    const { auth } = usePage().props;
    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
                setMoreDropdownOpen(false);
            }
        }
        if (dropdownOpen || moreDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen, moreDropdownOpen]);

    return (
        <header className="top-0 left-0 w-full bg-white shadow-sm z-50 sticky">
            <nav className="flex items-center justify-between px-28 py-3">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <span className="flex items-center gap-2">
                            {/* Logo icon */}
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
                    <Link
                        href="/home"
                        className="text-blue-900 font-medium px-3 hover:text-secondary"
                    >
                        Home
                    </Link>
                    {auth.user ? (
                        <Link
                            href="/library"
                            className="text-blue-900 font-medium px-3 hover:text-secondary"
                        >
                            Your Library
                        </Link>
                    ) : (
                        <></>
                    )}
                    <Link
                        href="/grammar-check"
                        className="text-blue-900 font-medium px-3 hover:text-secondary"
                    >
                        Grammar Check
                    </Link>
                    <Link
                        href="/about"
                        className="text-blue-900 font-medium px-3 hover:text-secondary"
                    >
                        About
                    </Link>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="text-blue-900 font-medium px-3 flex items-center gap-1 focus:outline-none hover:text-secondary"
                            onClick={() =>
                                setMoreDropdownOpen(!moreDropdownOpen)
                            }
                        >
                            More
                            <svg
                                className={`ml-1 w-4 h-4 transition-transform ${
                                    moreDropdownOpen ? "rotate-180" : ""
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.063a.75.75 0 111.08 1.04l-4.25 4.667a.75.75 0 01-1.08 0l-4.25-4.667a.75.75 0 01.02-1.06z" />
                            </svg>
                        </button>
                        {moreDropdownOpen && (
                            <div className="absolute left-0 w-40 mt-2 bg-white rounded-xl shadow-lg z-10 border border-gray-100 flex flex-col py-2 px-2">
                                <Link
                                    href="/privacy"
                                    onClick={() => setMoreDropdownOpen(false)}
                                    className="px-4 py-2 text-base text-blue-900 rounded-lg hover:bg-gray-100 font-medium transition text-center"
                                >
                                    Privacy
                                </Link>
                                <Link
                                    href="/contact"
                                    onClick={() => setMoreDropdownOpen(false)}
                                    className="px-4 py-2 text-base text-blue-900 rounded-lg hover:bg-gray-100 font-medium transition text-center"
                                >
                                    Contact
                                </Link>
                            </div>
                        )}
                    </div>
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
                                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/subscribe"
                                    className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2"
                                >
                                    Upgrade
                                </Link>
                            )}

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                {/* Dropdown Toggle */}
                                <button
                                    onClick={() =>
                                        setDropdownOpen(!dropdownOpen)
                                    }
                                    className="flex items-center gap-2 text-blue-900 font-medium focus:outline-none hover:text-orange-500 transition"
                                >
                                    <img
                                        src={"/images/person-icon.svg"}
                                        className="h-8 w-8 overflow-hidden rounded-full"
                                        alt="User avatar"
                                    />
                                    <span className="text-blue-900 font-medium hover:text-secondary">
                                        {auth?.user?.name}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 bg-white border w-48 border-gray-100 rounded-xl shadow-lg z-50">
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

                                        {/* Menu Items */}
                                        <div className="flex flex-col py-2 px-2">
                                            <Link
                                                href={route("profile.edit")}
                                                onClick={() =>
                                                    setDropdownOpen(false)
                                                }
                                                className="flex items-center px-4 py-2 text-sm text-blue-900 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <i className="fas fa-user-circle w-4 mr-3 text-gray-500 "></i>
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
