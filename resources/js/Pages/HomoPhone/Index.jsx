import React, { useState, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Pagination from "@/Components/Pagination";
import { ClipboardPlus, Search } from "lucide-react";
import Modal from "@/Components/Modal";
import ExcelJS from "exceljs";

export default function HomophonesPage({ homophones, search = "" }) {
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
    const [searchTerm, setSearchTerm] = useState(search);
    const [selectedImportFile, setSelectedImportFile] = useState(null);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState([]);
    const [duplicateResolutions, setDuplicateResolutions] = useState({});
    const [parsedData, setParsedData] = useState(null);
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

    // Change: only store file on input, do not import yet
    const handleFileInputChange = (e) => {
        setImportError("");
        const file = e.target.files[0];
        setSelectedImportFile(file || null);
    };

    // Scan for duplicates first
    const scanForDuplicates = async (data) => {
        try {
            const response = await axios.post(
                route("homophones.import") + "?scan=true",
                data,
                {
                    headers: data instanceof FormData
                        ? { "Content-Type": "multipart/form-data" }
                        : { "Content-Type": "application/json" },
                }
            );

            if (response.data.has_duplicates) {
                setDuplicates(response.data.duplicates);
                setShowDuplicateModal(true);
                setImportProcessing(false);
                return true; // Has duplicates
            }
            return false; // No duplicates
        } catch (error) {
            console.error("Duplicate scan error:", error);
            setImportError("Failed to scan for duplicates.");
            setImportProcessing(false);
            return false;
        }
    };

    // Import when user clicks Import button
    const handleImportClick = async (e) => {
        e.preventDefault();
        setImportError("");
        if (!selectedImportFile) return;
        setImportProcessing(true);

        try {
            const file = selectedImportFile;
            let dataToScan = null;
            let homophonesData = null;

            if (file.name.endsWith(".json")) {
                const formData = new FormData();
                formData.append("file", file);
                dataToScan = formData;
            } else if (
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xls")
            ) {
                const data = await file.arrayBuffer();
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(data);
                const worksheet = workbook.worksheets[0];
                let importedData = [];
                worksheet.eachRow({ includeEmpty: false }, (row) => {
                    importedData.push(row.values.slice(1)); // drop 0 index
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
                homophonesData = importedData;
                dataToScan = { homophones: importedData };
            } else {
                setImportError(
                    "Unsupported file type. Please upload .json or .xlsx/.xls file."
                );
                setImportProcessing(false);
                return;
            }

            // Store parsed data for later use
            setParsedData({ dataToScan, homophonesData, file });

            // Scan for duplicates
            const hasDuplicates = await scanForDuplicates(dataToScan);
            if (!hasDuplicates) {
                // No duplicates, proceed with import
                performImport(dataToScan, homophonesData, file);
            }
        } catch (err) {
            console.error("Import error:", err);
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

    // Perform the actual import
    const performImport = (dataToScan, homophonesData, file) => {
        const importData = homophonesData
            ? { homophones: homophonesData, duplicate_resolutions: duplicateResolutions }
            : dataToScan;

        // Add duplicate_resolutions to FormData if needed
        if (dataToScan instanceof FormData && Object.keys(duplicateResolutions).length > 0) {
            dataToScan.append('duplicate_resolutions', JSON.stringify(duplicateResolutions));
        }

        const requestData = homophonesData ? importData : dataToScan;

        router.post(route("homophones.import"), requestData, {
            forceFormData: requestData instanceof FormData,
            headers: requestData instanceof FormData
                ? { "Content-Type": "multipart/form-data" }
                : undefined,
            onFinish: () => {
                setImportProcessing(false);
                setShowImportModal(false);
                setShowDuplicateModal(false);
                setSelectedImportFile(null);
                setDuplicateResolutions({});
                setParsedData(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            onError: () => {
                setImportError("Import failed.");
                setImportProcessing(false);
            },
        });
    };

    // Handle duplicate resolution
    const handleDuplicateResolution = (key, resolution) => {
        setDuplicateResolutions(prev => ({
            ...prev,
            [key]: resolution
        }));
    };

    // Set all duplicates to replace
    const handleReplaceAll = () => {
        const allResolutions = {};
        duplicates.forEach(dup => {
            allResolutions[dup.key] = 'replace';
        });
        setDuplicateResolutions(allResolutions);
    };

    // Set all duplicates to skip
    const handleSkipAll = () => {
        const allResolutions = {};
        duplicates.forEach(dup => {
            allResolutions[dup.key] = 'skip';
        });
        setDuplicateResolutions(allResolutions);
    };

    // Proceed with import after resolving duplicates
    const proceedWithImport = () => {
        setImportProcessing(true);
        const { dataToScan, homophonesData, file } = parsedData;
        performImport(dataToScan, homophonesData, file);
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

    // Search handler
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        router.get(
            route("homophones.index"),
            { search: value },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                Homophones
                            </h3>
                            <div className="flex gap-2 items-center space-x-2">
                                {/* Search input */}
                                <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-sm transition text-sm bg-white">
                                    <Search className="w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        className="px-2 w-[250px] py-2 rounded-xl border-none border-gray-300 text-sm  focus:outline-none focus:ring-0"
                                        placeholder="Search Word, POS, Pronunciation"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                                <div className="relative flex gap-2 filter-dropdown-parent">
                                    <div className="relative" ref={dropdownRef}>
                                        {/* Dropdown Button */}
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 hover:scale-105 hover:shadow-sm text-white transition focus:outline-none focus:ring-1 focus:ring-gray-400"
                                            onClick={() =>
                                                setDropdownOpen((open) => !open)
                                            }
                                        >
                                            <span>Filter</span>
                                            <i
                                                className={`fas fa-chevron-down ml-1 transition-transform duration-200 ${
                                                    dropdownOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {dropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-32 bg-white border-gray-200 rounded-xl shadow-sm z-50 animate-fade-in">
                                                <div className="py-2 px-2">
                                                    {can[
                                                        "homophone-create"
                                                    ] && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center rounded-xl gap-2 w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
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
                                                    {can[
                                                        "homophone-delete"
                                                    ] && (
                                                        <button
                                                            type="button"
                                                            className="flex items-center rounded-xl gap-2 w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
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
                                                href={route(
                                                    "homophones.create"
                                                )}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                            >
                                                <ClipboardPlus className="w-4 h-4" />
                                                Add New
                                            </Link>
                                        )}
                                </div>
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
                                                className="hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
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
                                                            className="px-3 py-1 rounded-xl bg-blue-500 text-white text-xs hover:bg-blue-600 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
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
                                                            className="px-3 py-1 rounded-xl bg-red-500 text-white text-xs hover:bg-red-600 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
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
                                        className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={deleteProcessing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl px-9 py-1 text-white font-semibold transition bg-red-600 hover:bg-red-700"
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
                                setSelectedImportFile(null);
                                if (fileInputRef.current)
                                    fileInputRef.current.value = "";
                            }}
                            maxWidth="lg"
                        >
                            <form className="p-6" onSubmit={handleImportClick}>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Import Homophones
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Upload a <b>.json</b> or <b>.xlsx/.xls</b>{" "}
                                    file with homophone data.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Select File <span> </span>
                                    </label>
                                    <div
                                        className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer relative bg-gray-50 hover:bg-blue-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                        onClick={() => {
                                            if (fileInputRef.current)
                                                fileInputRef.current.click();
                                        }}
                                        style={{ minHeight: 100 }}
                                    >
                                        <input
                                            type="file"
                                            accept=".json,.xlsx,.xls"
                                            ref={fileInputRef}
                                            onChange={handleFileInputChange}
                                            disabled={importProcessing}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            tabIndex={-1}
                                            style={{ pointerEvents: "auto" }}
                                            onClick={(e) => e.stopPropagation()} // Prevent parent click
                                        />
                                        <div className="text-center space-y-2 pointer-events-none">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="mx-auto h-8 w-8 text-gray-400 pointer-events-none"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 16a1 1 0 0 1-1-1V9.414L8.707 11.707a1 1 0 1 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L13 9.414V15a1 1 0 0 1-1 1z" />
                                                <path d="M4 18a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1z" />
                                            </svg>
                                            <div className="text-sm text-gray-500 pointer-events-none">
                                                {selectedImportFile
                                                    ? selectedImportFile.name
                                                    : "Select a file or drag here"}
                                            </div>
                                            <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition pointer-events-none">
                                                {selectedImportFile
                                                    ? "Change file"
                                                    : "Select a file"}
                                            </div>
                                            
                                        </div>
                                    </div>
                                    {importError && (
                                        <div className="text-red-600 mt-2 text-sm">
                                            {importError}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportError("");
                                            setImportProcessing(false);
                                            setSelectedImportFile(null);
                                            if (fileInputRef.current)
                                                fileInputRef.current.value = "";
                                        }}
                                        className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={importProcessing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl px-8 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                        disabled={
                                            importProcessing ||
                                            !selectedImportFile
                                        }
                                    >
                                        {importProcessing
                                            ? "Importing..."
                                            : "Import"}
                                    </button>
                                </div>
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
                                        className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={clearProcessing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl px-9 py-1 text-white font-semibold transition bg-red-600 hover:bg-red-700"
                                        disabled={clearProcessing}
                                    >
                                        {clearProcessing
                                            ? "Clearing..."
                                            : "Clear All"}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* Duplicate Resolution Modal */}
                        <Modal
                            show={showDuplicateModal}
                            onClose={() => {
                                setShowDuplicateModal(false);
                                setDuplicates([]);
                                setDuplicateResolutions({});
                                setImportProcessing(false);
                            }}
                            maxWidth="4xl"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Duplicate Homophones Found
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Found {duplicates.length} duplicate(s). Choose whether to replace the existing entries or skip importing them.
                                </p>

                                {/* Bulk Actions */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={handleReplaceAll}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    >
                                        Replace All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSkipAll}
                                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-xl hover:bg-gray-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    >
                                        Skip All
                                    </button>
                                </div>

                                {/* Duplicates List */}
                                <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                                    {duplicates.map((dup, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                                        >
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                {/* Existing */}
                                                <div>
                                                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                                                        Existing in Database
                                                    </h4>
                                                    <div className="bg-white p-3 rounded-xl border">
                                                        <div className="text-sm">
                                                            <strong>Word:</strong> {dup.existing.word}
                                                        </div>
                                                        <div className="text-sm">
                                                            <strong>Pronunciation:</strong> {dup.existing.pronunciation || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            <strong>Definition:</strong> {dup.existing.definition}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* New */}
                                                <div>
                                                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                                                        New from Import
                                                    </h4>
                                                    <div className="bg-white p-3 rounded-xl border border-blue-300">
                                                        <div className="text-sm">
                                                            <strong>Word:</strong> {dup.new.word}
                                                        </div>
                                                        <div className="text-sm">
                                                            <strong>Pronunciation:</strong> {dup.new.pronunciation || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            <strong>Definition:</strong> {dup.new.definition}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicateResolution(dup.key, 'replace')}
                                                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                                                        duplicateResolutions[dup.key] === 'replace'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                                                    }`}
                                                >
                                                    Replace
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicateResolution(dup.key, 'skip')}
                                                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                                                        duplicateResolutions[dup.key] === 'skip'
                                                            ? 'bg-gray-600 text-white'
                                                            : 'bg-white text-gray-600 border border-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Skip
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Modal Actions */}
                                <div className="flex justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDuplicateModal(false);
                                            setShowImportModal(true);
                                            setDuplicates([]);
                                            setDuplicateResolutions({});
                                        }}
                                        className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={importProcessing}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={proceedWithImport}
                                        className="rounded-xl px-8 py-1 bg-green-600 text-white font-semibold hover:bg-green-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                        disabled={importProcessing || Object.keys(duplicateResolutions).length === 0}
                                    >
                                        {importProcessing ? "Importing..." : "Proceed with Import"}
                                    </button>
                                </div>
                            </div>
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
        </AdminLayout>
    );
}
