import React, { useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Search, Edit2, Trash2, Plus } from "lucide-react";
import moment from "moment";

export default function QuizList() {
    const { quizData } = usePage().props;
    const quizzes = quizData.data || [];
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const filteredQuizzes = quizzes.filter((q) => {
        const matchesTitle = q.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? q.status === statusFilter : true;
        return matchesTitle && matchesStatus;
    });

    const openDeleteModal = (quiz) => {
        setDeleteTarget(quiz);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleteProcessing(true);
        router.delete(route("quizzes.destroy", deleteTarget.id), {
            onFinish: () => {
                setDeleteProcessing(false);
                setShowDeleteModal(false);
                setDeleteTarget(null);
            },
        });
    };

    const headWeb = "Quiz List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    {/* Header + Search + Add */}
                    <div className="bg-white shadow-md rounded-xl mb-6 overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            <h3 className="text-xl font-semibold">Quiz Management</h3>

                            <div className="flex items-center gap-3 ml-auto">
                                {/* Search */}
                                <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-lg transition text-sm bg-white">
                                    <Search className="w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by title..."
                                        className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    className="px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>

                                {/* Add Quiz */}
                                <Link
                                    href={route("quizzes.create")}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Quiz
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm">
                                    <tr>
                                        <th className="py-3 px-4">#ID</th>
                                        <th className="py-3 px-4">Title</th>
                                        <th className="py-3 px-4">Groups</th>
                                        <th className="py-3 px-4">Questions</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {filteredQuizzes.length > 0 ? (
                                        filteredQuizzes.map((quiz) => (
                                            <tr
                                                key={quiz.id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >
                                                <td className="py-3 px-4 font-semibold">{quiz.id}</td>
                                                <td className="py-3 px-4">{quiz.title}</td>
                                                <td className="py-3 px-4">
                                                    {Array.isArray(quiz.groups) ? quiz.groups.join(", ") : ""}
                                                </td>
                                                <td className="py-3 px-4">{quiz.questions?.length || 0}</td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            quiz.status === "Published"
                                                                ? "bg-green-600 text-white"
                                                                : "bg-gray-200 text-gray-600"
                                                        }`}
                                                    >
                                                        {quiz.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center flex justify-center gap-2">
                                                    <Link
                                                        href={route("quizzes.edit", quiz.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-xs"
                                                    >
                                                        <Edit2 className="w-3 h-3" /> Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(quiz)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-xs"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-500">
                                                No quizzes found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {quizData.total > 10 && (
                            <div className="px-6 py-3 border-t flex justify-center">
                                <Pagination links={quizData.links} currentPage={quizData.current_page} perPage={quizData.per_page} />
                            </div>
                        )}
                    </div>

                    {/* Delete Modal */}
                    <Modal
                        show={showDeleteModal}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setDeleteTarget(null);
                            setDeleteProcessing(false);
                        }}
                        maxWidth="lg"
                    >
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Delete Quiz</h2>
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteTarget(null);
                                        setDeleteProcessing(false);
                                    }}
                                    className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                    disabled={deleteProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="rounded-xl px-9 py-1 bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                                    disabled={deleteProcessing}
                                >
                                    {deleteProcessing ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </section>
        </AdminLayout>
    );
}
