import React, { useRef, useState, useEffect } from "react";
import "flag-icons/css/flag-icons.min.css";

// Change root element from <li> to <div> to avoid <li> inside <li> warning
export default function LanguageSwitcher({ lang, setLang }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getFlag = (code) => {
        // Use flag-icons for reliable flag rendering with rounded corners
        if (code === "en") return <span className="fi fi-us" title="English"></span>;
        if (code === "kh") return <span className="fi fi-kh" title="Khmer"></span>;
        return null;
    };

    // Save to localStorage and dispatch event so all components update
    const handleChangeLang = (newLang) => {
        setLang(newLang);
        localStorage.setItem("lang", newLang);
        window.dispatchEvent(new Event("lang-changed"));
        setDropdownOpen(false);
    };

    return (
        <div className="nav-item dropdown position-relative border rounded-lg hover:shadow-md" ref={dropdownRef}>
            <button
                className="nav-link btn btn-link d-flex align-items-center p-2 bg-transparent"
                onClick={() => setDropdownOpen((open) => !open)}
                style={{ outline: "none", boxShadow: "none" }}
            >
                <span className="mx-1 text-sm font-semibold flex items-center gap-1">
                    <span>{getFlag(lang)}</span>
                    <span>{lang === "en" ? "English" : "ភាសាខ្មែរ"}</span>
                </span>
                <i
                    className={`fas fa-chevron-down ml-[0.1rem] transition-transform transform scale-[0.7] ${
                        dropdownOpen ? "rotate-180" : ""
                    }`}
                />
            </button>
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="px-2 py-2 space-y-1">
                        <button
                            className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm ${
                                lang === "en"
                                    ? "bg-blue-100 text-blue-700 font-bold"
                                    : "hover:bg-gray-100 text-gray-700"
                            } rounded-lg transition`}
                            onClick={() => handleChangeLang("en")}
                        >
                            <span className="fi fi-us" title="English"></span>
                            <span>English</span>
                        </button>
                        <button
                            className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm ${
                                lang === "kh"
                                    ? "bg-blue-100 text-blue-700 font-bold"
                                    : "hover:bg-gray-100 text-gray-700"
                            } rounded-lg transition`}
                            onClick={() => handleChangeLang("kh")}
                        >
                            <span className="fi fi-kh" title="Khmer"></span>
                            <span>ភាសាខ្មែរ</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
