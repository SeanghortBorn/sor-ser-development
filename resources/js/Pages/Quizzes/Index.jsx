import React, { useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Search, Edit2, Trash2, Plus, BookOpen, HelpCircle, FileText, RefreshCw } from "lucide-react";

export default function QuizList() {
    const { quizData } = usePage().props;
    const quizzes = quizData.data || [];
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [statusProcessing, setStatusProcessing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Filter quizzes
    const filteredQuizzes = quizzes.filter((q) => {
        const matchesTitle = q.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? q.status === statusFilter : true;
        return matchesTitle && matchesStatus;
    });

    // Delete modal
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

    // Status toggle modal
    const openStatusModal = (quiz) => {
        setStatusTarget(quiz);
        setShowStatusModal(true);
    };

    const confirmStatusChange = () => {
        if (!statusTarget) return;
        setStatusProcessing(true);
        const newStatus = statusTarget.status === "Published" ? "Draft" : "Published";

        router.put(route("quizzes.update", statusTarget.id), { status: newStatus }, {
            preserveScroll: true,
            onFinish: () => {
                setStatusProcessing(false);
                setShowStatusModal(false);
                setStatusTarget(null);
            }
        });
    };

    const headWeb = "Quiz List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    // Stats cards
    const stats = [
        { 
            label: "Total Quizzes", 
            value: quizData.total || 0, 
            icon: HelpCircle, 
            color: "text-blue-500",
            borderColor: "border-blue-100",
            bgColor: "bg-blue-50",
            description: "All quizzes in the system"
        },
        { 
            label: "Published", 
            value: quizzes.filter(q => q.status === "Published").length || 0, 
            icon: BookOpen, 
            color: "text-green-500",
            borderColor: "border-green-100",
            bgColor: "bg-green-50",
            description: "Active and available quizzes"
        },
        { 
            label: "Draft", 
            value: quizzes.filter(q => q.status === "Draft").length || 0, 
            icon: FileText, 
            color: "text-orange-500",
            borderColor: "border-orange-100",
            bgColor: "bg-orange-50",
            description: "Quizzes in draft mode"
        },
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`bg-white px-3 pb-2 pt-3 border-l-4 ${stat.borderColor} shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">
                                            {stat.label}
                                        </p>
                                        <div className={`${stat.color}`}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div className="">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {stat.value}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {stat.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quiz Table */}
                    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200 mb-12">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            <h3 className="text-xl font-semibold">Quiz Management</h3>
                            <div className="flex items-center gap-3 ml-auto">
                                {/* Search */}
                                <form className="inline-block" onSubmit={(e) => e.preventDefault()}>
                                    <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-sm transition text-sm bg-white">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by title..."
                                            className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </form>

                                {/* Status Filter */}
                                <select
                                    className="px-3 py-2 rounded-xl border border-gray-300 bg-white hover:shadow-sm transition text-sm font-medium"
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
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Quiz
                                </Link>
                            </div>
                        </div>
                        {/* Table */}
                        <div className="overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm">
                                    <tr>
                                        <th className="py-4 px-6 font-semibold">#ID</th>
                                        <th className="py-4 px-6 font-semibold">Title</th>
                                        <th className="py-4 px-6 font-semibold">Questions</th>
                                        <th className="py-4 px-6 font-semibold">Status</th>
                                        <th className="py-4 px-6 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700 bg-white divide-y divide-gray-200">
                                    {filteredQuizzes.length > 0 ? (
                                        filteredQuizzes.map((quiz) => (
                                            <tr
                                                key={quiz.id}
                                                className="hover:bg-blue-50 transition-all duration-200">
                                                <td className="py-4 px-6 font-semibold text-gray-900">{quiz.id}</td>
                                                <td className="py-4 px-6">
                                                    <p className="font-medium text-gray-900">{quiz.title}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {quiz.questions?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            quiz.status === "Published"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-orange-100 text-orange-700"
                                                        }`}
                                                    >
                                                        {quiz.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Edit */}
                                                        <div className="relative group">
                                                            <Link
                                                                href={route("quizzes.edit", quiz.id)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Link>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-xl shadow-sm border">
                                                                Edit Quiz
                                                            </div>
                                                        </div>

                                                        {/* Status toggle button */}
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => openStatusModal(quiz)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-xl shadow-sm border">
                                                                Toggle Status
                                                            </div>
                                                        </div>

                                                        {/* Delete */}
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => openDeleteModal(quiz)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-400 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-xl shadow-sm border">
                                                                Delete Quiz
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
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
                                <Pagination
                                    links={quizData.links}
                                    currentPage={quizData.current_page}
                                    perPage={quizData.per_page}
                                />
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
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!deleteProcessing) confirmDelete();
                            }}
                            className="p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                Delete Quiz
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete <span className="font-semibold">"{deleteTarget?.title}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex justify-between gap-3">
                                <button
                                    type="button"
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
                                    type="submit"
                                    className="rounded-xl px-9 py-1 bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    disabled={deleteProcessing}
                                >
                                    {deleteProcessing ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </form>
                    </Modal>

                    {/* Status Toggle Modal */}
                    <Modal
                        show={showStatusModal}
                        onClose={() => {
                            setShowStatusModal(false);
                            setStatusTarget(null);
                            setStatusProcessing(false);
                        }}
                        maxWidth="lg"
                    >
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!statusProcessing) confirmStatusChange();
                            }}
                            className="p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                Change Quiz Status
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to change status of <span className="font-semibold">"{statusTarget?.title}"</span> from <span className="font-semibold">{statusTarget?.status}</span>?
                            </p>
                            <div className="flex justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setStatusTarget(null);
                                        setStatusProcessing(false);
                                    }}
                                    className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                    disabled={statusProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl px-9 py-1 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    disabled={statusProcessing}
                                >
                                    {statusProcessing ? "Processing..." : "Confirm"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
        </AdminLayout>
    );
}
