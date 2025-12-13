import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "admin-lte/dist/css/adminlte.min.css";
import "bootstrap";
import "admin-lte/dist/js/adminlte.min.js";
import MenuSideBar from "./MenuSideBar";
import { Link, usePage } from "@inertiajs/react";
import LanguageSwitcher from "@/Components/Languages/LanguageSwitcher";

const AdminLayout = ({ breadcrumb, children }) => {
    const { auth } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [lang, setLang] = useState(
        () => localStorage.getItem("lang") || "en"
    );
    const dropdownRef = useRef(null);
    const can = auth?.can ?? {};

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setDropdownOpen(false);
        }
    };

    // Save lang to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("lang", lang);
    }, [lang]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="wrapper h-screen overflow-hidden flex flex-col">
            {/* Navbar */}
            <nav className="main-header py-3 navbar navbar-expand navbar-white navbar-light border-b border-gray-200 shadow-sm bg-white">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            data-widget="pushmenu"
                            href="#"
                            role="button"
                        >
                            {/* <i className="fas fa-bars"></i> */}
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 border border-gray-300 px-2 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
                                <svg
                                    className="block"
                                    width="16"
                                    height="12"
                                    viewBox="0 0 16 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                        </a>
                    </li>
                </ul>

                {/* Center - Search bar */}
                {/* <div className="flex-1 max-w-2xl mx-8">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Search or type command..."
                            className="h-10 w-full rounded-xl border xl:w-[430px] border-gray-200 bg-white py-2.5 pr-14 pl-12 text-base font-sans text-gray-900"
                        />
                    </div>
                </div> */}

                {/* Right navbar links */}
                <ul className="navbar-nav ml-auto mr-2 flex items-center gap-3">
                    {/* Language Switcher */}
                    <li>
                        <LanguageSwitcher lang={lang} setLang={setLang} />
                    </li>

                    {/* User Dropdown */}
                    <li
                        className="nav-item dropdown position-relative"
                        ref={dropdownRef}
                    >
                        <button
                            className="nav-link btn btn-link d-flex align-items-center px-3 py-2 border border-gray-300 rounded-2xl bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{ outline: "none", boxShadow: "none" }}
                        >
                            <img
                                src={"/images/person-icon.svg"}
                                className="mr-2 h-8 w-8 overflow-hidden rounded-full border-2 border-blue-200"
                                alt="User avatar"
                            />
                            <span className="text-sm mr-2 block font-semibold text-gray-700">
                                {auth?.user?.name}
                            </span>
                            <i
                                className={`fas fa-chevron-down ml-1 transition-transform duration-200 ease-in-out transform scale-[0.7] text-gray-500 ${
                                    dropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                                {/* User Info Header */}
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={"/images/person-icon.svg"}
                                            className="h-12 w-12 overflow-hidden rounded-full border-2 border-blue-300 shadow-sm"
                                            alt="User avatar"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">
                                                {auth?.user?.name}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {auth?.user?.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="flex flex-col py-2 px-2">
                                    <Link
                                        href={route("profile.edit")}
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    >
                                        <i className="fas fa-user-circle w-4 mr-3 text-blue-500"></i>
                                        My Account
                                    </Link>
                                    <hr className="my-1.5 border-gray-200" />
                                    <Link
                                        method="post"
                                        href={route("logout")}
                                        as="button"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    >
                                        <i className="fas fa-sign-out-alt w-4 mr-3 text-red-500"></i>
                                        Sign Out
                                    </Link>
                                </div>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>

            {/* Sidebar */}
            <MenuSideBar lang={lang} setLang={setLang} />

            {/* Main content */}
            <div className="content-wrapper flex-1 overflow-y-auto bg-gray-50">
                <section className="content p-6">{children}</section>
            </div>
        </div>
    );
};

export default AdminLayout;
