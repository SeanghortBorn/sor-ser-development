import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Pagination from "@/Components/Pagination";
import { ClipboardPlus, Search } from "lucide-react";
import Modal from "@/Components/Modal";

export default function ArticlesPage({ articles, search = "" }) {
    const canViewArticle = (auth) => {
        // Check if user has admin or instructor role
        const hasRequiredRole = auth.user.roles?.some(role => 
            ['Admin', 'Instructor'].includes(role.name)
        );
        
        // Or check specific permission
        const hasPermission = auth.user.permissions?.some(perm => 
            perm.name === 'articles-view'
        );
        
        return hasRequiredRole || hasPermission;
    };
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = articles?.data || [];
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewTarget, setViewTarget] = useState(null);
    const [fileTextPreview, setFileTextPreview] = useState("");
    const [fileLoading, setFileLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState(search);

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = (e) => {
        e?.preventDefault?.();
        if (!deleteTarget) return;
        setDeleteProcessing(true);
        router.delete(route("articles.destroy", deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteProcessing(false);
                setShowDeleteModal(false);
                setDeleteTarget(null);
            },
        });
    };

    // Search handler
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        router.get(
            route("articles.index"),
            { search: value },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // FIXED: Helper to resolve file/audio URL
    const resolveUrl = (media, bucket) => {
        if (!media) return null;
        
        // If it's already a full URL, return it
        if (typeof media === "string") {
            if (media.startsWith("http://") || media.startsWith("https://")) {
                return media;
            }
            if (media.startsWith("/storage/")) {
                return media;
            }
            // Otherwise treat it as just a filename
            return `/storage/uploads/${bucket}/${media}`;
        }

        // Handle object with file_path
        if (media.file_path) {
            const filePath = String(media.file_path);
            
            // If it starts with http, return as is
            if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
                return filePath;
            }
            
            // If it already has /storage/, return as is
            if (filePath.startsWith("/storage/")) {
                return filePath;
            }
            
            // If it starts with storage/, add leading slash
            if (filePath.startsWith("storage/")) {
                return `/${filePath}`;
            }
            
            // If it starts with uploads/, prepend /storage/
            if (filePath.startsWith("uploads/")) {
                return `/storage/${filePath}`;
            }
            
            // If it starts with public/, convert to /storage/
            if (filePath.startsWith("public/")) {
                return `/storage/${filePath.replace(/^public\//, "")}`;
            }
            
            // Default: assume it's just a filename
            return `/storage/uploads/${bucket}/${filePath}`;
        }

        // Fallback to other properties
        if (media.url) return media.url;
        if (media.path) {
            const p = media.path.replace(/^public\//, "");
            return media.path.startsWith("http") || media.path.startsWith("/")
                ? media.path
                : `/storage/${p}`;
        }
        if (media.filename) return `/storage/uploads/${bucket}/${media.filename}`;
        if (media.name) return `/storage/uploads/${bucket}/${media.name}`;
        
        return null;
    };

    // Helper to get file extension
    const getFileExt = (filename) => {
        if (!filename) return "";
        return filename.split(".").pop().toLowerCase();
    };

    // Open view modal and fetch file text if .txt
    const openViewModal = async (item) => {
        setViewTarget(item);
        setFileTextPreview("");
        setShowViewModal(true);
        setFileLoading(true);

        // Get file extension from title for display
        const fileTitle = item.file?.title || item.file?.filename || "";
        const fileExt = getFileExt(fileTitle);

        // Get the resolved URL for preview
        const fileUrl = resolveUrl(item.file, "files");

        if (fileUrl && fileExt === "txt") {
            try {
                const res = await fetch(fileUrl);
                const text = await res.text();
                setFileTextPreview(text);
            } catch {
                setFileTextPreview("Failed to load file content.");
            }
        }
        setFileLoading(false);
    };

    const headWeb = "Articles List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-12">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold">Articles</h3>
                            <div className="flex gap-2 items-center">
                                {/* Search input */}
                                <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-lg transition text-sm bg-white">
                                    <Search className="w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        className="px-2 w-[250px] py-2 rounded-[10px] border-none border-gray-300 text-sm  focus:outline-none focus:ring-0"
                                        placeholder="Search Title or File"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                                {can["article-create"] && can["article-list"] && (
                                    <Link
                                        href={route("articles.create")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition"
                                    >
                                        <ClipboardPlus className="w-4 h-4" />
                                        Add Article
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-blue-600 text-white text-sm">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">File</th>
                                        <th className="px-4 py-3">Audio</th>
                                        <th className="px-4 py-3">
                                            Created At
                                        </th>
                                        <th className="px-4 py-3 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-200">
                                    {datasList.length > 0 ? (
                                        datasList.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                <td className="px-4 py-3">
                                                    {item.id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.title}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.file ? (
                                                        item.file.title
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            NULL
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.audio ? (
                                                        item.audio.title
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            NULL
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.created_at
                                                        ? item.created_at.slice(
                                                              0,
                                                              10
                                                          )
                                                        : ""}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        {can[
                                                            "article-list"
                                                        ] && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openViewModal(
                                                                        item
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                                                            >
                                                                View
                                                            </button>
                                                        )}
                                                        {can["article-edit"] &&
                                                            can[
                                                                "article-list"
                                                            ] && (
                                                                <Link
                                                                    href={route(
                                                                        "articles.edit",
                                                                        item.id
                                                                    )}
                                                                    className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            )}
                                                        {can[
                                                            "article-delete"
                                                        ] &&
                                                            can[
                                                                "article-list"
                                                            ] && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openDeleteModal(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}

                                                        {canViewArticle(auth) && (
                                                            <button
                                                                onClick={() => window.location.href = route('articles.show', article.id)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                View Article
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-center py-6 text-gray-500"
                                            >
                                                No articles found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Delete confirmation modal */}
                        <Modal
                            show={showDeleteModal}
                            onClose={() => {
                                setShowDeleteModal(false);
                                setDeleteTarget(null);
                                setDeleteProcessing(false);
                            }}
                            maxWidth="lg"
                        >
                            <form onSubmit={confirmDelete} className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Delete Article
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to delete "
                                    {deleteTarget?.title}"?
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
                                        className="rounded-[10px] px-9 py-1 text-white font-semibold transition bg-red-600 hover:bg-red-700"
                                        disabled={deleteProcessing}
                                    >
                                        {deleteProcessing
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* View Modal */}
                        <Modal
                            show={showViewModal}
                            onClose={() => {
                                setShowViewModal(false);
                                setViewTarget(null);
                                setFileTextPreview("");
                            }}
                            maxWidth="2xl"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Article Name:
                                    <span className="ml-1 text-blue-600">
                                        {viewTarget?.title ?? ""}
                                    </span>
                                </h2>

                                {viewTarget && (
                                    <>
                                        <div className="mb-4">
                                            <div className="font-bold text-gray-700 mb-1">
                                                File Name:{" "}
                                                <span className="text-gray-600">
                                                    {viewTarget.file?.title ||
                                                        viewTarget.file
                                                            ?.filename ||
                                                        "File"}
                                                </span>
                                            </div>
                                            {viewTarget.file ? (
                                                (() => {
                                                    const fileUrl = resolveUrl(
                                                        viewTarget.file,
                                                        "files"
                                                    );
                                                    const fileName =
                                                        viewTarget.file.title ||
                                                        viewTarget.file
                                                            .filename ||
                                                        "File";
                                                    const fileExt =
                                                        getFileExt(fileName);
                                                    if (fileExt === "txt") {
                                                        return (
                                                            <div className="border rounded-lg bg-gray-50 p-3 max-h-64 overflow-auto text-sm">
                                                                {fileLoading
                                                                    ? "Loading..."
                                                                    : fileTextPreview ||
                                                                      "No content."}
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                        >
                                                            Download {fileName}
                                                        </a>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-gray-400">
                                                    No file
                                                </span>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <div className="font-bold text-gray-700 mb-1">
                                                Audio Name:{" "}
                                                <span className="text-gray-600">
                                                    {viewTarget.audio?.title ||
                                                        viewTarget.audio
                                                            ?.filename ||
                                                        "Audio"}
                                                </span>
                                            </div>
                                            {viewTarget.audio ? (
                                                (() => {
                                                    const audioUrl = resolveUrl(
                                                        viewTarget.audio,
                                                        "audios"
                                                    );
                                                    console.log("Audio URL:", audioUrl); // Debug log
                                                    return (
                                                        <audio
                                                            key={audioUrl}
                                                            src={audioUrl}
                                                            controls
                                                            preload="metadata"
                                                            className="w-full rounded-lg"
                                                        />
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-gray-400">
                                                    No audio
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowViewModal(false)}
                                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        {/* Pagination */}
                        {articles.total > 10 && (
                            <div className="px-6 py-3 border-t flex justify-center">
                                <Pagination
                                    links={articles.links.map((link) => ({
                                        ...link,
                                        url: link.url
                                            ? link.url +
                                              (searchTerm
                                                  ? (link.url.includes("?")
                                                        ? "&"
                                                        : "?") +
                                                    "search=" +
                                                    encodeURIComponent(
                                                        searchTerm
                                                    )
                                                  : "")
                                            : null,
                                    }))}
                                    currentPage={articles.current_page}
                                    perPage={articles.per_page}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}