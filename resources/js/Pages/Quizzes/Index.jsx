import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, usePage, router } from "@inertiajs/react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";

export default function QuizList() {
    const { quizData } = usePage().props;
    const quizzes = quizData.data || [];
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("");
    const [status, setStatus] = useState("");

    // Filter quizzes client-side
    const filteredQuizzes = quizzes.filter((q) => {
        const matchesTitle = q.title.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = subject ? q.subject === subject : true;
        const matchesStatus = status ? q.status === status : true;
        return matchesTitle && matchesSubject && matchesStatus;
    });

    // Delete quiz
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this quiz?")) {
            router.delete(route("quizzes.destroy", id));
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">📋 Quiz List</h2>
                    <Link
                        href={route("quizzes.create")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Quiz
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="bg-white shadow-sm rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    {/* Subject */}
                    <select
                        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        <option value="Math">Math</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                    </select>
                    {/* Status */}
                    <select
                        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100 text-gray-700 text-sm">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Subject</th>
                                <th className="px-4 py-3 text-left">Groups</th>
                                <th className="px-4 py-3 text-center">Questions</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-200">
                            {filteredQuizzes.length > 0 ? (
                                filteredQuizzes.map((quiz) => (
                                    <tr
                                        key={quiz.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3">{quiz.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {quiz.title}
                                        </td>
                                        <td className="px-4 py-3">{quiz.subject}</td>
                                        <td className="px-4 py-3">
                                            {Array.isArray(quiz.groups)
                                                ? quiz.groups.join(", ")
                                                : ""}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {quiz.questions ? quiz.questions.length : 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    quiz.status === "Published"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-600"
                                                }`}
                                            >
                                                {quiz.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                                            <Link
                                                href={route("quizzes.edit", quiz.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-xs"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-xs"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-6 text-gray-500"
                                    >
                                        No quizzes found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {quizData.links && (
                    <div className="flex flex-wrap items-center gap-2">
                        {quizData.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || "#"}
                                className={`px-3 py-1 rounded-lg text-sm border ${
                                    link.active
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
