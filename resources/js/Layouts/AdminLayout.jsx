import React, { useRef, useState } from "react";
import MenuSideBar from "./MenuSideBar";
import ProfileCard from "@/Components/Shared/ProfileCard";
import { Link, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";

const AdminLayout = ({ breadcrumb, children }) => {
    const { auth } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
    const dropdownRef = useRef(null);

    const roleName = (auth?.user?.roles_list && auth.user.roles_list[0]?.name)
        || (auth?.user?.roles && auth.user.roles[0]?.name)
        || (auth?.user?.role?.name)
        || "User";

    return (
        <div className="wrapper h-screen overflow-hidden flex flex-col">
            {/* Navbar */}
            <nav className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shadow-sm bg-white z-10">
                <div className="flex items-center gap-3">
                    {/* Hamburger toggler */}
                    <button
                        className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200"
                        aria-label="Toggle sidebar"
                        onClick={() => setSidebarOpen((v) => !v)}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M1.333 0.25h13.333c.414 0 .75.336.75.75s-.336.75-.75.75H1.333a.75.75 0 0 1 0-1.5Zm0 10h13.333c.414 0 .75.336.75.75s-.336.75-.75.75H1.333a.75.75 0 1 1 0-1.5ZM1.333 4.5h6.667c.414 0 .75.336.75.75s-.336.75-.75.75H1.333a.75.75 0 0 1 0-1.5Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>

                {/* Right navbar links */}
                <ul className="flex items-center gap-3 ml-auto mr-2">
                    {/* User Dropdown */}
                    <li className="relative" ref={dropdownRef}>
                        <button
                            className="flex items-center gap-2 px-3 h-12 rounded-xl bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{ outline: "none", boxShadow: "none" }}
                        >
                            <img
                                src={"/images/person-icon.svg"}
                                className="h-10 w-10 overflow-hidden rounded-full"
                                alt="User avatar"
                            />
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-sm font-semibold text-gray-800 leading-tight break-words">{auth?.user?.name}</span>
                                <span className="text-xs text-gray-500 leading-tight break-words">{roleName}</span>
                            </div>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    className="absolute right-0 mt-2 w-[340px] bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden origin-top-right"
                                >
                                    <ProfileCard
                                        user={auth?.user}
                                        className="border-0 p-4"
                                        actions={(
                                            <div className="flex gap-3">
                                                        <Link
                                                            href={route("profile.edit")}
                                                            onClick={() => setDropdownOpen(false)}
                                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-xl text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
                                                        >
                                                            Profile
                                                        </Link>
                                                        <Link
                                                            method="post"
                                                            href={route("logout")}
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
                    </li>
                </ul>
            </nav>

            {/* Sidebar */}
            <MenuSideBar lang={lang} setLang={setLang} open={sidebarOpen} />

            {/* Main content */}
            <div className={`flex-1 overflow-y-auto bg-gray-50 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
                <div className="px-6 py-6 space-y-6">
                    {/* Breadcrumb */}
                    {breadcrumb}
                    {/* Content */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
