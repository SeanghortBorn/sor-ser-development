import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { Pencil, Trash2, Plus, Tags, FileText } from "lucide-react";
import Footer from "@/Components/Footer/Footer";

export default function Library() {
    const tags = [
        { name: "Work", color: "#F87171" },
        { name: "Personal", color: "#60A5FA" },
        { name: "Work", color: "#F87171" },
        { name: "Personal", color: "#60A5FA" },
    ];

    const document = [
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

    return (
        <>
            <Head title="Library" />
            <HeaderNavbar />
            <div className="min-h-screen w-full max-w-7xl mx-auto py-8">
                {/* Tags Section */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[25px] text-blue-900 font-semibold">
                            My Tags
                        </h2>
                        <button className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                            <Plus size={16} />
                            Create Tag
                        </button>
                    </div>

                    {/* Tag List */}
                    <div className="tags-container">
                        {tags.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center px-4 py-3 mb-3 bg-gray-50 border rounded-xl border-gray-200 shadow hover:shadow-xl hover:-translate-y-1 transition duration-300"
                                    >
                                        {/* Color Indicator */}
                                        <div
                                            className="w-6 h-6 rounded-md flex-shrink-0 transition-transform duration-300"
                                            style={{
                                                backgroundColor: tag.color,
                                            }}
                                        ></div>

                                        {/* Tag Name */}
                                        <p className="mx-3 mb-0 truncate font-medium">
                                            {tag.name}
                                        </p>

                                        {/* Spacer */}
                                        <div className="flex-1"></div>

                                        {/* Action Buttons */}
                                        <button className="p-1 hover:bg-gray-100 rounded-md mr-1">
                                            <Pencil
                                                size={18}
                                                className="text-gray-500"
                                            />
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded-md">
                                            <Trash2
                                                size={18}
                                                className="text-red-500"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Empty State
                            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 text-center mb-9">
                                <Tags
                                    size={32}
                                    className="text-orange-500 mb-2 hover:text-orange-600 mx-auto"
                                />
                                <h3 className="text-[22px] font-semibold mb-2">
                                    No tags yet
                                </h3>
                                <p className="text-gray-600">
                                    Create tags to organize your flashcards and
                                    document
                                </p>
                                <button className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition">
                                    <Plus size={16} />
                                    Create First Tag
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[25px] text-blue-900 font-semibold">
                            History
                        </h2>
                        <button className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                            <Plus size={16} />
                            Start New
                        </button>
                    </div>
                    {/* document List */}
                    {document.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {document.map((documents) => (
                                <div
                                    key={documents.id}
                                    className="border rounded-xl p-4 shadow hover:shadow-lg hover:-translate-y-1 transition duration-300"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">
                                            {documents.title ||
                                                "Untitled documents"}
                                        </h3>
                                        <button className="text-gray-400 text-xl cursor-pointer flex items-center">
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
                                                <circle cx="12" cy="12" r="1" />
                                                <circle cx="12" cy="5" r="1" />
                                                <circle cx="12" cy="19" r="1" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {documents.paragraph}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-1">
                                        <span className="text-[14px] font-semibold">Words: </span>
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
                    {document.length === 0 && (
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
