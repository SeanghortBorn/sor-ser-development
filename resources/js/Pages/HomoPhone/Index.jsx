import React, { useState, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Pagination from "@/Components/Pagination";
import { ClipboardPlus } from "lucide-react";
import Modal from "@/Components/Modal";
import * as XLSX from "xlsx";

export default function HomophonesPage({ homophones }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = homophones?.data || homophones || [];
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importProcessing, setImportProcessing] = useState(false);
    const [importError, setImportError] = useState("");
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearProcessing, setClearProcessing] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const fileInputRef = useRef();
    const dropdownRef = useRef(null);

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = (e) => {
        e?.preventDefault?.();
        if (!deleteTarget) return;
        setDeleteProcessing(true);
        router.delete(route("homophones.destroy", deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteProcessing(false);
                setShowDeleteModal(false);
                setDeleteTarget(null);
            },
        });
    };

    const handleImportFile = async (e) => {
        setImportError("");
        const file = e.target.files[0];
        if (!file) return;
        setImportProcessing(true);

        try {
            if (file.name.endsWith(".json")) {
                const formData = new FormData();
                formData.append("file", file);

                router.post(route("homophones.import"), formData, {
                    forceFormData: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onFinish: () => {
                        setImportProcessing(false);
                        setShowImportModal(false);
                        fileInputRef.current.value = "";
                    },
                    onError: () => {
                        setImportError("Import failed.");
                        setImportProcessing(false);
                    },
                });
            } else if (
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xls")
            ) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                let importedData = XLSX.utils.sheet_to_json(sheet, {
                    defval: "",
                });
                importedData = importedData.map((row) => ({
                    ...row,
                    homophone: Array.isArray(row.homophone)
                        ? row.homophone
                        : typeof row.homophone === "string"
                        ? row.homophone
                              .split(",")
                              .map((h) => h.trim())
                              .filter(Boolean)
                        : [],
                }));
                router.post(
                    route("homophones.import"),
                    { homophones: importedData },
                    {
                        onFinish: () => {
                            setImportProcessing(false);
                            setShowImportModal(false);
                            fileInputRef.current.value = "";
                        },
                        onError: (err) => {
                            setImportError("Import failed.");
                            setImportProcessing(false);
                        },
                    }
                );
            } else {
                setImportError(
                    "Unsupported file type. Please upload .json or .xlsx/.xls file."
                );
                setImportProcessing(false);
                return;
            }
        } catch (err) {
            setImportError("Failed to parse file.");
            setImportProcessing(false);
        }
    };

    const handleClearAll = () => {
        setClearProcessing(true);
        router.post(
            route("homophones.clear"),
            {},
            {
                onFinish: () => {
                    setClearProcessing(false);
                    setShowClearModal(false);
                },
                onError: () => {
                    setClearProcessing(false);
                },
            }
        );
    };

    const headWeb = "Homophones List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    // Close dropdown when clicking outside
    React.useEffect(() => {
        if (!dropdownOpen) return;
        const handleClick = (e) => {
            // If click is outside the dropdown/filter button, close it
            if (!e.target.closest(".filter-dropdown-parent")) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [dropdownOpen]);

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-12">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                Homophones
                            </h3>
                            <div className="relative flex gap-2 filter-dropdown-parent">
                                <div className="relative" ref={dropdownRef}>
                                    {/* Dropdown Button */}
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition focus:outline-none focus:ring-1 focus:ring-gray-400"
                                        onClick={() =>
                                            setDropdownOpen((open) => !open)
                                        }
                                    >
                                        <span>Filter</span>
                                        <i
                                            className={`fas fa-chevron-down ml-1 transition-transform duration-200 ${
                                                dropdownOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
                                            <div className="py-2 px-2">
                                                {can["homophone-create"] && (
                                                    <button
                                                        type="button"
                                                        className="flex items-center rounded-lg gap-2 w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 transition"
                                                        onClick={() => {
                                                            setShowImportModal(
                                                                true
                                                            );
                                                            setDropdownOpen(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        <i className="fas fa-file-import w-4 h-4" />
                                                        Import
                                                    </button>
                                                )}
                                                {can["homophone-delete"] && (
                                                    <button
                                                        type="button"
                                                        className="flex items-center rounded-lg gap-2 w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-700 transition"
                                                        onClick={() => {
                                                            setShowClearModal(
                                                                true
                                                            );
                                                            setDropdownOpen(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        <i className="fas fa-trash w-4 h-4" />
                                                        Clear All
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {can["homophone-create"] &&
                                    can["homophone-list"] && (
                                        <Link
                                            href={route("homophones.create")}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition"
                                        >
                                            <ClipboardPlus className="w-4 h-4" />
                                            Add New
                                        </Link>
                                    )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-blue-600 text-white text-sm">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Word</th>
                                        <th className="px-4 py-3">POS</th>
                                        <th className="px-4 py-3">
                                            Pronunciation
                                        </th>
                                        <th className="px-4 py-3">
                                            Definition
                                        </th>
                                        <th className="px-4 py-3">Example</th>
                                        <th className="px-4 py-3">Phoneme</th>
                                        <th className="px-4 py-3">
                                            Homophones
                                        </th>
                                        <th className="px-4 py-3">Actions</th>
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
                                                    {item.word}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.pos}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.pro}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.definition}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.example}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.phoneme}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {Array.isArray(
                                                        item.homophone
                                                    )
                                                        ? item.homophone.join(
                                                              ", "
                                                          )
                                                        : ""}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={route(
                                                                "homophones.edit",
                                                                item.id
                                                            )}
                                                            className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </Link>
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
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="text-center py-6 text-gray-500"
                                            >
                                                No homophones found.
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
                                    Delete Homophone
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to delete "
                                    {deleteTarget?.word}"?
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

                        {/* Import Modal */}
                        <Modal
                            show={showImportModal}
                            onClose={() => {
                                setShowImportModal(false);
                                setImportError("");
                                setImportProcessing(false);
                                if (fileInputRef.current)
                                    fileInputRef.current.value = "";
                            }}
                            maxWidth="lg"
                        >
                            <form className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Import Homophones
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Upload a <b>.json</b> or <b>.xlsx/.xls</b>{" "}
                                    file with homophone data.
                                </p>
                                <input
                                    type="file"
                                    accept=".json,.xlsx,.xls"
                                    ref={fileInputRef}
                                    onChange={handleImportFile}
                                    disabled={importProcessing}
                                    className="mb-4"
                                />
                                {importError && (
                                    <div className="text-red-600 mb-2">
                                        {importError}
                                    </div>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportError("");
                                            setImportProcessing(false);
                                            if (fileInputRef.current)
                                                fileInputRef.current.value = "";
                                        }}
                                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={importProcessing}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {importProcessing && (
                                    <div className="mt-2 text-blue-600">
                                        Importing...
                                    </div>
                                )}
                            </form>
                        </Modal>

                        {/* Clear All confirmation modal */}
                        <Modal
                            show={showClearModal}
                            onClose={() => {
                                setShowClearModal(false);
                                setClearProcessing(false);
                            }}
                            maxWidth="lg"
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleClearAll();
                                }}
                                className="p-6"
                            >
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Clear All Homophones
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to{" "}
                                    <b>delete all homophones</b>? This action
                                    cannot be undone.
                                </p>
                                <div className="flex justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowClearModal(false);
                                            setClearProcessing(false);
                                        }}
                                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={clearProcessing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-[10px] px-9 py-1 text-white font-semibold transition bg-red-600 hover:bg-red-700"
                                        disabled={clearProcessing}
                                    >
                                        {clearProcessing
                                            ? "Clearing..."
                                            : "Clear All"}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* Pagination */}
                        {homophones.total > 10 && (
                            <div className="px-6 py-3 border-t flex justify-center">
                                <Pagination
                                    links={homophones.links}
                                    currentPage={homophones.current_page}
                                    perPage={homophones.per_page}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
