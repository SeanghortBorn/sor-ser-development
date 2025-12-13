import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Pagination from "@/Components/Pagination";
import { ClipboardPlus, Pencil, Eye, Trash2, BarChart2 } from "lucide-react";
import Modal from "@/Components/Modal";

// Import our new shared components, hooks, and utilities
import SearchBar from "@/Components/Shared/SearchBar";
import ActionButton from "@/Components/Shared/ActionButton";
import ConfirmationModal from "@/Components/Shared/ConfirmationModal";
import { useSearch } from "@/Hooks/useSearch";
import { useDeleteModal } from "@/Hooks/useDeleteModal";
import { resolveFileUrl, getFileExtension, isTextFile } from "@/Utils/fileHelpers";

export default function ArticlesPage({ articles, search = "" }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = articles?.data || [];

    // Use our custom hooks
    const { searchTerm, handleSearch } = useSearch("articles.index", search);
    const deleteModal = useDeleteModal("articles.destroy");

    // View modal state
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewTarget, setViewTarget] = useState(null);
    const [fileTextPreview, setFileTextPreview] = useState("");
    const [fileLoading, setFileLoading] = useState(false);

    // Open view modal and fetch file text if .txt
    const openViewModal = async (item) => {
        setViewTarget(item);
        setFileTextPreview("");
        setShowViewModal(true);
        setFileLoading(true);

        const fileTitle = item.file?.title || item.file?.filename || "";
        const fileUrl = resolveFileUrl(item.file, "files");

        if (isTextFile(fileTitle) && fileUrl) {
            try {
                const response = await fetch(fileUrl);
                if (response.ok) {
                    const text = await response.text();
                    setFileTextPreview(text);
                }
            } catch (error) {
                console.error("Failed to load file:", error);
            }
        }
        setFileLoading(false);
    };

    const headWeb = "Articles List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    // Permission check helper
    const canViewArticle = (auth) => {
        const hasRequiredRole = auth.user.roles?.some(role =>
            ['Admin', 'Instructor'].includes(role.name)
        );
        const hasPermission = auth.user.permissions?.some(perm =>
            perm.name === 'articles-view'
        );
        return hasRequiredRole || hasPermission;
    };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        {/* Header with Search and Add Button */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Articles</h2>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Bar - Using our new SearchBar component */}
                                <SearchBar
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search articles..."
                                />

                                {/* Add Article Button */}
                                {can["article-create"] && can["article-list"] && (
                                    <Link
                                        href={route("articles.create")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    >
                                        <ClipboardPlus className="w-4 h-4" />
                                        Add Article
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-blue-600 text-white text-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">ID</th>
                                        <th className="px-4 py-3 text-left font-semibold">Title</th>
                                        <th className="px-4 py-3 text-left font-semibold">File</th>
                                        <th className="px-4 py-3 text-left font-semibold">Audio</th>
                                        <th className="px-4 py-3 text-left font-semibold">Created</th>
                                        <th className="px-4 py-3 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-200">
                                    {datasList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                No articles found
                                            </td>
                                        </tr>
                                    ) : (
                                        datasList.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95">
                                                <td className="px-4 py-3">{item.id}</td>
                                                <td className="px-4 py-3 font-medium">{item.title}</td>
                                                <td className="px-4 py-3">
                                                    {item.file ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-gray-700 text-xs truncate max-w-[150px]">
                                                                {item.file.title}
                                                            </span>
                                                            <span className="text-gray-500 text-xs">
                                                                {item.file.word_count > 0
                                                                    ? `${item.file.word_count} words`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No file</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.audio ? (
                                                        <div className="flex items-center gap-2">
                                                            <audio
                                                                controls
                                                                className="h-8"
                                                                src={resolveFileUrl(item.audio, "audios")}
                                                            >
                                                                Your browser does not support audio.
                                                            </audio>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No audio</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {can["article-list"] && (
                                                            <ActionButton
                                                                onClick={() => openViewModal(item)}
                                                                icon={Eye}
                                                                tooltip="View Article"
                                                                variant="blue"
                                                            />
                                                        )}
                                                        {canViewArticle(auth) && (
                                                            <Link href={route("articles.completion-stats", item.id)}>
                                                                <ActionButton
                                                                    icon={BarChart2}
                                                                    tooltip="View Statistics"
                                                                    variant="green"
                                                                />
                                                            </Link>
                                                        )}
                                                        {can["article-edit"] && (
                                                            <Link href={route("articles.edit", item.id)}>
                                                                <ActionButton
                                                                    icon={Pencil}
                                                                    tooltip="Edit Article"
                                                                    variant="yellow"
                                                                />
                                                            </Link>
                                                        )}
                                                        {can["article-delete"] && (
                                                            <ActionButton
                                                                onClick={() => deleteModal.openModal(item)}
                                                                icon={Trash2}
                                                                tooltip="Delete Article"
                                                                variant="red"
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6">
                            <Pagination links={articles.links} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Delete Modal - Using our new ConfirmationModal */}
            <ConfirmationModal
                show={deleteModal.showModal}
                onClose={deleteModal.closeModal}
                onConfirm={deleteModal.confirmDelete}
                title="Delete Article"
                message={`Are you sure you want to delete "${deleteModal.target?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmStyle="danger"
                processing={deleteModal.processing}
            />

            {/* View Modal - Keep as is (custom content) */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="4xl">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {viewTarget?.title}
                    </h2>

                    {/* File Preview */}
                    {viewTarget?.file && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-2">File</h3>
                            <div className="border rounded-xl p-4 bg-gray-50">
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Filename:</strong> {viewTarget.file.title}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Word Count:</strong> {viewTarget.file.word_count || "N/A"}
                                </p>

                                {fileLoading ? (
                                    <p className="text-gray-500 text-sm">Loading file preview...</p>
                                ) : isTextFile(viewTarget.file.title) && fileTextPreview ? (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Preview:</h4>
                                        <pre className="bg-white border rounded p-3 text-xs max-h-64 overflow-auto">
                                            {fileTextPreview}
                                        </pre>
                                    </div>
                                ) : (
                                    <a
                                        href={resolveFileUrl(viewTarget.file, "files")}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                                    >
                                        Download File
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Audio Preview */}
                    {viewTarget?.audio && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-2">Audio</h3>
                            <div className="border rounded-xl p-4 bg-gray-50">
                                <p className="text-sm text-gray-600 mb-3">
                                    <strong>Filename:</strong> {viewTarget.audio.title}
                                </p>
                                <audio
                                    controls
                                    className="w-full"
                                    src={resolveFileUrl(viewTarget.audio, "audios")}
                                >
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowViewModal(false)}
                            className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
