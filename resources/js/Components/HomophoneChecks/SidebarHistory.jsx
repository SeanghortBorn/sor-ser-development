import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function SidebarHistory({
    setShowRenameModal,
    setRenameValue,
    setRenameId,
    previousDocuments,
    fetchHistory
}) {
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRefs = useRef({});

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownOpen !== null &&
                dropdownRefs.current[dropdownOpen] &&
                !dropdownRefs.current[dropdownOpen].contains(event.target)
            ) {
                setDropdownOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    // Rename handler uses parent state
    const handleRename = (id, currentTitle) => {
        setRenameId(id);
        setRenameValue(currentTitle);
        setDropdownOpen(null);
        setShowRenameModal(true);
    };

    const handleDelete = (id) => {
        // Use the correct RESTful endpoint: /grammar-checkers/{id}
        axios.delete(`/grammar-checkers/${id}`, { headers: { 'Accept': 'application/json' } })
            .then(() => {
                fetchHistory(); // Refresh history after delete
                setDropdownOpen(null);
            })
            .catch(err => {
                console.error("Delete error:", err.response?.data);
            });
    };

    return (
        <div className="w-68 h-[100vh] bg-white border-r flex flex-col p-3">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
                <button className="text-2xl text-gray-500 ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevrons-left-icon lucide-chevrons-left"
                    >
                        <path d="m11 17-5-5 5-5" />
                        <path d="m18 17-5-5 5-5" />
                    </svg>
                </button>
                <button className="px-3 py-1 text-[14px] border-2 border-blue-400 rounded-full text-blue-900 font-semibold hover:bg-blue-50">
                    + New
                </button>
            </div>
            {/* Search bar */}
            <div className="mb-6">
                <div className="flex items-center">
                    <div className="relative w-full flex items-center">
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="19"
                                height="19"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-search-icon lucide-search"
                            >
                                <path d="m21 21-4.34-4.34" />
                                <circle cx="11" cy="11" r="8" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search"
                            className="flex-1 w-full bg-transparent outline-none pl-3 pr-10 py-1 border border-gray-300 rounded-xl focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Document History */}
            <div className="overflow-y-auto h-[90vh] hide-scrollbar">
                {/* Topic section */}
                <div className="mb-2 text-gray-500 text-sm">Previous Topics</div>
                {Array.isArray(previousDocuments) && previousDocuments.length > 0 ?
                    previousDocuments.map((doc, idx) => (
                        <div key={doc.id ?? idx} className="bg-gray-50 rounded-xl p-3 mb-2 cursor-pointer relative">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[14px] text-gray-700">
                                    {doc.title}
                                </span>
                                <div className="relative" ref={el => dropdownRefs.current[doc.id] = el}>
                                    <button
                                        className="text-gray-400 text-xl cursor-pointer flex items-center"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setDropdownOpen(dropdownOpen === doc.id ? null : doc.id);
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"
                                        >
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="5" r="1" />
                                            <circle cx="12" cy="19" r="1" />
                                        </svg>
                                    </button>
                                    {dropdownOpen === doc.id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-sm z-10">
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                                                onClick={() => handleRename(doc.id, doc.title)}
                                            >
                                                {/* Rename Icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="mr-2 text-blue-500"
                                                >
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                </svg>
                                                Rename
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                {/* Delete Icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="mr-2 text-red-500"
                                                >
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                                    <line x1="10" y1="11" x2="10" y2="17" />
                                                    <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-gray-600 text-[12px]">
                                {doc.paragraph}
                            </div>
                        </div>
                    ))
                    :
                    <div className="text-gray-400 text-sm px-3">No history found.</div>
                }
            </div>
        </div>
    );
}