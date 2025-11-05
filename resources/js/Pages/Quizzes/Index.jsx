import React, { useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Search, Edit2, Trash2, Plus, BookOpen, HelpCircle, FileText } from "lucide-react";
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

    // Stats cards configuration matching Users page style
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
            <section className="content">
                <div className="container-fluid">
                    {/* Stats Cards matching Users page style */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`bg-white px-3 pb-2 pt-3 border-l-4 ${stat.borderColor} shadow-sm rounded-xl flex flex-col hover:shadow-md transition-all duration-200`}
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

                    {/* Table Card matching Users page style */}
                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-12">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            {/* Left side (Title) */}
                            <h3 className="text-xl font-semibold">
                                Quiz Management
                            </h3>

                            {/* Right side (Search + Status Filter + Add Button) */}
                            <div className="flex items-center gap-3 ml-auto">
                                {/* Search */}
                                <form
                                    className="inline-block"
                                    onSubmit={(e) => e.preventDefault()}
                                >
                                    <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-lg transition text-sm bg-white">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by title..."
                                            className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px] focus:outline-none focus:ring-0"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </form>

                                {/* Status Filter */}
                                <select
                                    className="px-3 py-2 rounded-xl border border-gray-300 bg-white hover:shadow-lg transition text-sm font-medium focus:outline-none focus:ring-0"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>

                                {/* Add Quiz Button */}
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
                                                <td className="py-3 px-4 font-semibold">
                                                    {quiz.id}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-gray-900">{quiz.title}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(quiz.groups) && quiz.groups.length > 0
                                                            ? quiz.groups.map((group, i) => (
                                                                <span key={i} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
                                                                    {group}
                                                                </span>
                                                            ))
                                                            : <span className="text-gray-400 text-xs">—</span>
                                                        }
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {quiz.questions?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            quiz.status === "Published"
                                                                ? "bg-green-600 text-white"
                                                                : "bg-orange-400 text-white"
                                                        }`}
                                                    >
                                                        {quiz.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <div className="relative group">
                                                            <Link
                                                                href={route("quizzes.edit", quiz.id)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Link>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border">
                                                                Edit Quiz
                                                            </div>
                                                        </div>
                                                        <div className="relative group">
                                                            <button
                                                                onClick={() => openDeleteModal(quiz)}
                                                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-400 transition"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border">
                                                                Delete Quiz
                                                            </div>
                                                        </div>
                                                    </div>
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
                                    className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                    disabled={deleteProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-[10px] px-9 py-1 bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                                    disabled={deleteProcessing}
                                >
                                    {deleteProcessing ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </section>
        </AdminLayout>
    );
}