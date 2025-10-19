import React, { useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Search, Edit2, Trash2, Plus, BookOpen, HelpCircle } from "lucide-react";
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

    // Stats cards for overview
    const stats = [
        { label: "Total Quizzes", value: quizData.total || 0, icon: HelpCircle, color: "bg-blue-100 text-blue-600" },
        { label: "Published", value: quizzes.filter(q => q.status === "Published").length || 0, icon: BookOpen, color: "bg-green-100 text-green-600" },
        { label: "Draft", value: quizzes.filter(q => q.status === "Draft").length || 0, icon: Edit2, color: "bg-orange-100 text-orange-600" },
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content bg-gray-50 min-h-screen p-6">
                <div className="container-fluid">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
                        <p className="text-gray-600 mt-2">Create, edit, and manage your homophone quizzes</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-200">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                                        </div>
                                        <div className={`p-3 rounded-lg ${stat.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        {/* Header with Search and Filters */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-lg font-bold text-gray-900">All Quizzes</h2>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {/* Search */}
                                    <div className="flex-1 md:flex-none inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:shadow-md transition">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by title..."
                                            className="outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <select
                                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
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
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:from-green-600 hover:to-green-700 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Add Quiz</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold">
                                    <tr>
                                        <th className="py-4 px-6">#ID</th>
                                        <th className="py-4 px-6">Title</th>
                                        <th className="py-4 px-6">Groups</th>
                                        <th className="py-4 px-6">Questions</th>
                                        <th className="py-4 px-6">Status</th>
                                        <th className="py-4 px-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {filteredQuizzes.length > 0 ? (
                                        filteredQuizzes.map((quiz, idx) => (
                                            <tr
                                                key={quiz.id}
                                                className={`border-t hover:bg-blue-50 transition ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                                            >
                                                <td className="py-4 px-6 font-semibold text-gray-900">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                                                        #{quiz.id}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="font-medium text-gray-900">{quiz.title}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(quiz.groups) && quiz.groups.length > 0
                                                            ? quiz.groups.map((group, i) => (
                                                                <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                                                    {group}
                                                                </span>
                                                            ))
                                                            : <span className="text-gray-400 text-xs">—</span>
                                                        }
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                        {quiz.questions?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            quiz.status === "Published"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {quiz.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Link
                                                            href={route("quizzes.edit", quiz.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-xs font-medium hover:shadow-md"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">Edit</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(quiz)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-xs font-medium hover:shadow-md"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
                                                    <p className="font-medium">No quizzes found</p>
                                                    <p className="text-xs mt-1">Create your first quiz to get started</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {quizData.total > 10 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-center">
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
                        maxWidth="md"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Quiz</h2>
                            <p className="text-gray-700 text-center mb-6">
                                Are you sure you want to delete <span className="font-semibold">"{deleteTarget?.title}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteTarget(null);
                                        setDeleteProcessing(false);
                                    }}
                                    className="rounded-lg border-2 border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100 transition font-semibold text-sm"
                                    disabled={deleteProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="rounded-lg px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition text-sm disabled:opacity-50"
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