import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head } from "@inertiajs/react";
import { useRef, useState, useEffect } from "react";
import { Plus, FileText, Pencil, Trash2, Tags } from "lucide-react";
import Footer from "@/Components/Footer/Footer";
import TagsSection from "@/Components/Tags/TagsSection";

export default function Library() {
    const documentsData = [
        {
            id: 1,
            title: "JavaScript Basics",
            paragraph: "Test your knowledge of JS fundamentals.",
            wordCount: 8,
            createdAt: "2025-09-01",
        },
        {
            id: 2,
            title: "React Concepts",
            paragraph: "Covers hooks, components, and props.",
            wordCount: 10,
            createdAt: "2025-09-10",
        },
        {
            id: 3,
            title: "CSS Mastery",
            paragraph: "Deep dive into styling and layouts.",
            wordCount: 7,
            createdAt: "2025-09-14",
        },
        {
            id: 4,
            title: "JavaScript Basics",
            paragraph: "Test your knowledge of JS fundamentals.",
            wordCount: 8,
            createdAt: "2025-09-01",
        },
    ];

    // Track which document's dropdown is open (by id)
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRefs = useRef({});

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            // Check all dropdown refs
            Object.entries(dropdownRefs.current).forEach(([id, ref]) => {
                if (ref && !ref.contains(event.target)) {
                    setOpenDropdownId(null);
                }
            });
        }
        if (openDropdownId !== null) {
            window.document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            window.document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [openDropdownId]);

    return (
        <>
            <Head title="Library" />
            <HeaderNavbar />
            <div className="min-h-screen w-full max-w-7xl mx-auto py-8">
                {/* Tags Section */}
                <TagsSection />

                {/* Documents Section */}
                <section className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[25px] text-blue-900 font-semibold">
                            Grammar Check
                        </h2>
                        <button className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                            <Plus size={16} />
                            Start New
                        </button>
                    </div>
                    {/* document List */}
                    {documentsData.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {documentsData.map((documents) => (
                                <div
                                    key={documents.id}
                                    className="border rounded-xl p-4 shadow hover:shadow-lg hover:-translate-y-1 transition duration-300 relative"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">
                                            {documents.title ||
                                                "Untitled documents"}
                                        </h3>
                                        <div
                                            className="relative"
                                            ref={(el) =>
                                                (dropdownRefs.current[
                                                    documents.id
                                                ] = el)
                                            }
                                        >
                                            <button
                                                className="text-gray-400 text-xl cursor-pointer flex items-center hover:bg-gray-100 p-1 rounded-full"
                                                onClick={() =>
                                                    setOpenDropdownId(
                                                        openDropdownId ===
                                                            documents.id
                                                            ? null
                                                            : documents.id
                                                    )
                                                }
                                            >
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
                                                    className="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="1"
                                                    />
                                                    <circle
                                                        cx="12"
                                                        cy="5"
                                                        r="1"
                                                    />
                                                    <circle
                                                        cx="12"
                                                        cy="19"
                                                        r="1"
                                                    />
                                                </svg>
                                            </button>
                                            {openDropdownId ===
                                                documents.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                                    <div className="px-2 py-2 space-y-1">
                                                        <button
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 rounded-lg transition"
                                                            // onClick={...}
                                                        >
                                                            <Pencil
                                                                size={16}
                                                                className="text-blue-500"
                                                            />
                                                            Edit Name
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 rounded-lg transition"
                                                            // onClick={...}
                                                        >
                                                            <Tags
                                                                size={16}
                                                                className="text-green-500"
                                                            />
                                                            Edit Tags
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 rounded-lg transition"
                                                            // onClick={...}
                                                        >
                                                            <Trash2
                                                                size={16}
                                                                className="text-red-500"
                                                            />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {documents.paragraph}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-1">
                                        <span className="text-[14px] font-semibold">
                                            Words:{" "}
                                        </span>
                                        {documents.wordCount}
                                    </p>
                                    <div className="mt-2 flex justify-between items-center text-sm">
                                        <span className="text-gray-500 text-sm">
                                            Created on: {documents.createdAt}
                                        </span>
                                        <button className="text-blue-700 text-md hover:underline">
                                            Open
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {documentsData.length === 0 && (
                        <div className="p-6 text-center border rounded-xl">
                            <FileText
                                size={32}
                                className="text-orange-500 mb-2 hover:text-orange-600 mx-auto"
                            />

                            <h3 className="text-[22px] font-semibold mb-2">
                                No document yet
                            </h3>
                            <p className="text-gray-600">
                                Create your first documents to test your
                                knowledge
                            </p>

                            <div className="flex justify-center gap-4">
                                <button className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition">
                                    <Plus size={16} />
                                    Create First Tag
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Footer Section */}
            <Footer />
        </>
    );
}