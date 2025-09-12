import React from "react";

const todayDocuments = [
    { title: "Untitled document 3", desc: "Hello My name is Socheat i study" }
];

const previousDocuments = [
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 2", desc: "Hello My name is Socheat i study" },
    { title: "Untitled document 1", desc: "Hello My name is Socheat i study" }
];

export default function SidebarHistory() {
    return (
        <div className="w-80 h-[100vh] bg-white border-r flex flex-col p-3">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
                <button className="text-2xl text-gray-500 hover:text-gray-700">
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
                            className="flex-1 w-full bg-transparent outline-none pl-3 pr-10 py-1 border border-gray-300 rounded-lg focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Document History */}
            <div className="overflow-y-auto h-[90vh] hide-scrollbar">               
                {/* Topic section */}
                <div className="mb-2 text-gray-500 text-sm">Previous Topics</div>
                {previousDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 mb-2 cursor-pointer">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-[14px] text-gray-700">
                                {doc.title}
                            </span>
                            <span className="text-gray-400 text-xl cursor-pointer">
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
                            </span>
                        </div>
                        <div className="text-gray-600 text-[12px]">
                            {doc.desc}
                        </div>
                    </div>
                )) }
            </div>
        </div>
    );
}