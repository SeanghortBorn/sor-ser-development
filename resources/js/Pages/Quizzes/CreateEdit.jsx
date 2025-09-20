import React, { useState, useEffect, useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import { Trash2 } from "lucide-react";

export default function QuizzesCreateEdit() {
    const { datas } = usePage().props;
    const isEdit = datas && datas.id;
    const title = isEdit ? "Edit Quiz" : "New Quiz";

    const [questionType, setQuestionType] = useState("Multiple Choice");
    const [options, setOptions] = useState(["A", "B", "C", "D"]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const breadcrumbLinks = [
        { title: "Home", url: "/" },
        { title: "Quiz", url: route("quizzes.index") },
        { title, url: "" },
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={title} links={breadcrumbLinks} />}>
            <Head title={title} />

            <div className="min-h-screen w-full mx-auto space-y-4 mb-12">
                {/* Top Section */}
                <div className="bg-white rounded-2xl shadow-sm px-8 py-6 sticky top-0 z-10">
                    <div className="flex items-center justify-between gap-6">
                        {/* Quiz Name */}
                        <div className="w-1/3">
                            <label className="block text-gray-700 mb-2 font-medium">
                                Quiz Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                className="w-full py-2 px-3 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Visibility */}
                        <div className="w-1/2">
                            <label className="block text-gray-700 mb-2 font-medium">
                                Visibility
                            </label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility_status"
                                        value="1"
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600"
                                    />
                                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                                        Publish
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="visibility_status"
                                        value="2"
                                        className="h-4 w-4 text-red-500 border-gray-300 focus:ring-red-400 accent-red-500"
                                    />
                                    <span className="text-sm font-medium text-red-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                        Draft
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Create Button */}
                        <div className="flex items-end">
                            <button className="px-6 w-36 py-2 text-blue-700 border-2 border-blue-500 rounded-2xl hover:bg-blue-100 transition">
                                Create
                            </button>
                        </div>
                    </div>
                </div>

                {/* Question Section */}
                <div className="bg-white rounded-2xl shadow-md px-8 py-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Question 1</h2>
                        <button
                            className="flex items-center justify-center w-10 h-10 text-red-500 border-2 border-red-400 rounded-xl hover:bg-red-100 transition"
                            aria-label="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Question Type Dropdown */}
                    <div className="relative w-1/3 mb-6">
                        <label className="block text-gray-700 mb-2 font-medium">
                            Question Type
                        </label>

                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-full flex justify-between items-center px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 text-gray-700 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
                        >
                            {questionType}
                            <i
                                className={`fas fa-chevron-down ml-1 transition-transform ${
                                    dropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div
                                ref={dropdownRef}
                                className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                            >
                                <div className="py-2 px-2 space-y-1">
                                    {[
                                        "Multiple Choice",
                                        "Checkboxes",
                                        "True/False",
                                        "Open Ended",
                                        "Matching",
                                    ].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setQuestionType(type);
                                                setDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                                                questionType === type
                                                    ? "bg-blue-100 text-blue-700 font-semibold"
                                                    : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Question Textarea */}
                    <div className="w-full mb-4">
                        <label className="block text-gray-700 mb-2 font-medium">
                            Question
                        </label>
                        <textarea
                            placeholder="Enter your question"
                            className="flex-1 px-3 py-2 rounded-[10px] bg-gray-50 border w-full border-gray-200 focus:ring-1 focus:ring-blue-400 focus:outline-none resize-none overflow-hidden transition-all duration-150 ease-in-out"
                            rows="3"
                            onInput={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                        />
                    </div>

                    {/* Options */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                            Options
                        </h3>
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 mb-3">
                                <input
                                    type="radio"
                                    name="correctOption"
                                    className="text-blue-500 focus:ring-blue-400"
                                />
                                <input
                                    type="text"
                                    // value={option}
                                    placeholder={`Option ${index + 1}`}
                                    onChange={(e) => {
                                        const updated = [...options];
                                        updated[index] = e.target.value;
                                        setOptions(updated);
                                    }}
                                    className="flex-1 px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                />
                                <button
                                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                                    className="text-red-400 hover:text-red-500 transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => setOptions([...options, ""])}
                            className="mt-3 text-blue-600 hover:underline"
                        >
                            + Add Option
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
