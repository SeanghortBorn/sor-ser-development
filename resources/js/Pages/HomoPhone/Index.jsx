import React, { useState, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Pagination from "@/Components/Pagination";
import { ClipboardPlus, Search, CheckCircle } from "lucide-react";
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
    const [importProgress, setImportProgress] = useState(0);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [scanningForDuplicates, setScanningForDuplicates] = useState(false);
    const [duplicateMessage, setDuplicateMessage] = useState("");
    const [scanProgress, setScanProgress] = useState(0);
    const [activeFilters, setActiveFilters] = useState({
        pos: "",
        hasHomophones: "",
        sortBy: "id",
        sortDir: "asc"
    });
        const [sortByDropdownOpen, setSortByDropdownOpen] = useState(false);
        const [sortDirDropdownOpen, setSortDirDropdownOpen] = useState(false);
        const [hasHomophonesDropdownOpen, setHasHomophonesDropdownOpen] = useState(false);
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
            setScanningForDuplicates(true);
            setScanProgress(0);
            
            // Start simulated progress
            const progressInterval = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + 5;
                });
            }, 300);
            
            const response = await axios.post(
                route("homophones.import") + "?scan=true",
                data,
                {
                    headers: data instanceof FormData
                        ? { "Content-Type": "multipart/form-data" }
                        : { "Content-Type": "application/json" },
                }
            );

            clearInterval(progressInterval);
            setScanProgress(100);
            
            setTimeout(() => {
                setScanningForDuplicates(false);
                setScanProgress(0);
            }, 500);
            
            if (response.data.has_duplicates) {
                setDuplicates(response.data.duplicates);
                setDuplicateMessage(response.data.message || "");
                setShowDuplicateModal(true);
                setImportProcessing(false);
                return true; // Has duplicates
            }
            return false; // No duplicates
        } catch (error) {
            console.error("Duplicate scan error:", error);
            setScanningForDuplicates(false);
            setScanProgress(0);
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
        
        // Start progress animation
        setImportProgress(0);
        const progressInterval = setInterval(() => {
            setImportProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 200);

        router.post(route("homophones.import"), requestData, {
            forceFormData: requestData instanceof FormData,
            headers: requestData instanceof FormData
                ? { "Content-Type": "multipart/form-data" }
                : undefined,
            onFinish: () => {
                clearInterval(progressInterval);
                setImportProgress(100);
                
                // Show success message
                setTimeout(() => {
                    setImportProcessing(false);
                    setShowImportModal(false);
                    setShowDuplicateModal(false);
                    setShowSuccessMessage(true);
                    setSelectedImportFile(null);
                    setDuplicateResolutions({});
                    setParsedData(null);
                    setImportProgress(0);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    
                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                    }, 3000);
                }, 500);
            },
            onError: () => {
                clearInterval(progressInterval);
                setImportError("Import failed.");
                setImportProcessing(false);
                setImportProgress(0);
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
        applyFilters({ search: value });
    };

    // Apply filters function
    const applyFilters = (overrides = {}) => {
        const filters = { ...activeFilters, ...overrides };
        
        const params = {};
        if (searchTerm || overrides.search !== undefined) {
            params.search = overrides.search !== undefined ? overrides.search : searchTerm;
        }
        if (filters.pos) params.pos = filters.pos;
        if (filters.hasHomophones) params.hasHomophones = filters.hasHomophones;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (filters.sortDir) params.sortDir = filters.sortDir;
        
        router.get(
            route("homophones.index"),
            params,
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        const newFilters = { ...activeFilters, [key]: value };
        setActiveFilters(newFilters);
        applyFilters(newFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        setActiveFilters({
            pos: "",
            hasHomophones: "",
            sortBy: "id",
            sortDir: "asc"
        });
        setSearchTerm("");
        router.get(route("homophones.index"), {}, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex gap-3 items-center flex-1">
                                {/* Search input - moved to left */}
                                <div className="inline-flex items-center gap-2 px-3 rounded-xl border border-gray-300 hover:border-gray-400 hover:shadow-sm transition text-sm bg-white">
                                    <Search className="w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        className="px-2 w-[250px] py-2 rounded-xl border-none text-sm focus:outline-none focus:ring-0"
                                        placeholder="Search Word, POS, Pronunciation"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                                
                                <div className="relative flex gap-2 filter-dropdown-parent">
                                    <div className="relative" ref={dropdownRef}>
                                        {/* Filter Dropdown Button */}
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none"
                                            onClick={() =>
                                                setDropdownOpen((open) => !open)
                                            }
                                        >
                                            <i className="fas fa-filter w-4 h-4" />
                                            <span>Filter</span>
                                            <i
                                                className={`fas fa-chevron-down transition-transform duration-300 ${
                                                    dropdownOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {dropdownOpen && (
                                            <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
                                                <div className="p-4 space-y-4">
                                                    {/* Sort By */}
                                                    <div className="relative">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Sort By
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSortByDropdownOpen(!sortByDropdownOpen)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium text-gray-700 transition-all duration-200 hover:border-purple-400 flex items-center justify-between"
                                                        >
                                                            <span>
                                                                {activeFilters.sortBy === "id" && "Order Added"}
                                                                {activeFilters.sortBy === "word" && "Alphabetically"}
                                                                {activeFilters.sortBy === "created_at" && "Date Created"}
                                                            </span>
                                                            <i className={`fas fa-chevron-down transition-transform duration-200 ${sortByDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {sortByDropdownOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("sortBy", "id");
                                                                        setSortByDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    Order Added
                                                                </div>
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("sortBy", "word");
                                                                        setSortByDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    Alphabetically
                                                                </div>
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("sortBy", "created_at");
                                                                        setSortByDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    Date Created
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Sort Direction */}
                                                    <div className="relative">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Direction
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSortDirDropdownOpen(!sortDirDropdownOpen)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium text-gray-700 transition-all duration-200 hover:border-purple-400 flex items-center justify-between"
                                                        >
                                                            <span>
                                                                {activeFilters.sortDir === "asc" && "Ascending"}
                                                                {activeFilters.sortDir === "desc" && "Descending"}
                                                            </span>
                                                            <i className={`fas fa-chevron-down transition-transform duration-200 ${sortDirDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {sortDirDropdownOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("sortDir", "asc");
                                                                        setSortDirDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    Ascending
                                                                </div>
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("sortDir", "desc");
                                                                        setSortDirDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    Descending
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Has Homophones Filter */}
                                                    <div className="relative">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Has Homophones
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setHasHomophonesDropdownOpen(!hasHomophonesDropdownOpen)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium text-gray-700 transition-all duration-200 hover:border-purple-400 flex items-center justify-between"
                                                        >
                                                            <span>
                                                                {activeFilters.hasHomophones === "" && "All"}
                                                                {activeFilters.hasHomophones === "yes" && "With Homophones"}
                                                                {activeFilters.hasHomophones === "no" && "Without Homophones"}
                                                            </span>
                                                            <i className={`fas fa-chevron-down transition-transform duration-200 ${hasHomophonesDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {hasHomophonesDropdownOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("hasHomophones", "");
                                                                        setHasHomophonesDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    All
                                                                </div>
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("hasHomophones", "yes");
                                                                        setHasHomophonesDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    With Homophones
                                                                </div>
                                                                <div
                                                                    onClick={() => {
                                                                        handleFilterChange("hasHomophones", "no");
                                                                        setHasHomophonesDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                                                                >
                                                                    Without Homophones
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Clear Filters */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            clearFilters();
                                                            setDropdownOpen(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <i className="fas fa-times-circle" />
                                                        Clear Filters
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 items-center">
                                {/* Clear All Button */}
                                {can["homophone-delete"] && (
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                        onClick={() => setShowClearModal(true)}
                                    >
                                        <i className="fas fa-trash w-4 h-4" />
                                        Clear All
                                    </button>
                                )}
                                
                                {/* Import Button */}
                                {can["homophone-create"] && (
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                        onClick={() => setShowImportModal(true)}
                                    >
                                        <i className="fas fa-file-import w-4 h-4" />
                                        Import
                                    </button>
                                )}
                                
                                {/* Add New Button */}
                                {can["homophone-create"] && can["homophone-list"] && (
                                    <Link
                                        href={route("homophones.create")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    >
                                        <ClipboardPlus className="w-4 h-4" />
                                        Add New
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto border border-gray-200">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm">
                                    <tr>
                                        <th className="px-4 py-4 font-semibold w-16">No.</th>
                                        <th className="px-4 py-4 font-semibold w-32">Word</th>
                                        <th className="px-4 py-4 font-semibold w-20">POS</th>
                                        <th className="px-4 py-4 font-semibold w-32">
                                            Pronunciation
                                        </th>
                                        <th className="px-4 py-4 font-semibold w-64">
                                            Definition
                                        </th>
                                        <th className="px-4 py-4 font-semibold w-48">Example</th>
                                        <th className="px-4 py-4 font-semibold w-24">Phoneme</th>
                                        <th className="px-4 py-4 font-semibold w-32">
                                            Homophones
                                        </th>
                                        <th className="px-4 py-4 font-semibold w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-200 bg-white">
                                    {datasList.length > 0 ? (
                                        datasList.map((item, index) => {
                                            const currentPage = homophones?.current_page || 1;
                                            const perPage = homophones?.per_page || 10;
                                            const orderNumber = (currentPage - 1) * perPage + index + 1;
                                            return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-blue-50 transition-all duration-200">
                                                <td className="px-4 py-4 font-medium text-gray-900 text-center">
                                                    {orderNumber}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {item.word}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 text-center">
                                                    {item.pos}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {item.pro}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {item.definition}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {item.example}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 text-center">
                                                    {item.phoneme}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {Array.isArray(
                                                        item.homophone
                                                    )
                                                        ? item.homophone.join(
                                                              ", "
                                                          )
                                                        : ""}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2 justify-center">
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
                                            );
                                        })
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
                        {showDeleteModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop with blur */}
                                <div 
                                    className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                                    onClick={() => {
                                        if (!deleteProcessing) {
                                            setShowDeleteModal(false);
                                            setDeleteTarget(null);
                                            setDeleteProcessing(false);
                                        }
                                    }}
                                />
                                
                                {/* Modal Content */}
                                <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 z-10 animate-fade-in">
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
                                                className="rounded-2xl border-2 border-gray-300 px-8 py-2 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                                disabled={deleteProcessing}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="rounded-2xl px-9 py-2 text-white font-semibold transition bg-red-600 hover:bg-red-700"
                                                disabled={deleteProcessing}
                                            >
                                                {deleteProcessing
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Import Modal with backdrop blur */}
                        {showImportModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop with blur */}
                                <div 
                                    className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                                    onClick={() => {
                                        if (!importProcessing) {
                                            setShowImportModal(false);
                                            setImportError("");
                                            setSelectedImportFile(null);
                                            if (fileInputRef.current)
                                                fileInputRef.current.value = "";
                                        }
                                    }}
                                />
                                
                                {/* Modal Content */}
                                <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 z-10 animate-fade-in">
                                    <form className="p-6" onSubmit={handleImportClick}>
                                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                            Import Homophones
                                        </h2>
                                        <p className="text-gray-600 mb-4 text-sm">
                                            Upload a <b>.json</b>, <b>.csv</b>, <b>.xlsx</b> or <b>.xls</b>{" "}
                                            file with homophone data.
                                        </p>
                                        
                                        {importProcessing || scanningForDuplicates ? (
                                            /* Progress Animation */
                                            <div className="py-8">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                                    <p className="text-gray-700 font-medium">
                                                        {scanningForDuplicates ? "Scanning for duplicates..." : "Importing homophones..."}
                                                    </p>
                                                    {importProcessing && (
                                                        <>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                                                                    style={{ width: `${importProgress}%` }}
                                                                ></div>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{importProgress}%</p>
                                                        </>
                                                    )}
                                                    {scanningForDuplicates && (
                                                        <>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                                                                    style={{ width: `${scanProgress}%` }}
                                                                ></div>
                                                            </div>
                                                            <p className="text-sm text-gray-500">Scanning: {scanProgress}%</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select File
                                                </label>
                                                <div
                                                    className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer relative bg-gray-50 hover:bg-blue-50 transition-all duration-200"
                                                    onClick={() => {
                                                        if (fileInputRef.current)
                                                            fileInputRef.current.click();
                                                    }}
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".json,.csv,.xlsx,.xls"
                                                        ref={fileInputRef}
                                                        onChange={handleFileInputChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="text-center space-y-2 pointer-events-none">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="mx-auto h-8 w-8 text-gray-400"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 16a1 1 0 0 1-1-1V9.414L8.707 11.707a1 1 0 1 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L13 9.414V15a1 1 0 0 1-1 1z" />
                                                            <path d="M4 18a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1z" />
                                                        </svg>
                                                        <div className="text-sm text-gray-600">
                                                            {selectedImportFile
                                                                ? selectedImportFile.name
                                                                : "Click to select a file"}
                                                        </div>
                                                        <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-xl text-xs">
                                                            {selectedImportFile
                                                                ? "Change file"
                                                                : "Browse"}
                                                        </div>
                                                    </div>
                                                </div>
                                                {importError && (
                                                    <div className="text-red-600 mt-2 text-sm">
                                                        {importError}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {!importProcessing && !scanningForDuplicates && (
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowImportModal(false);
                                                        setImportError("");
                                                        setSelectedImportFile(null);
                                                        if (fileInputRef.current)
                                                            fileInputRef.current.value = "";
                                                    }}
                                                    className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={!selectedImportFile}
                                                >
                                                    Import
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Clear All confirmation modal */}
                        {showClearModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop with blur */}
                                <div 
                                    className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                                    onClick={() => {
                                        if (!clearProcessing) {
                                            setShowClearModal(false);
                                            setClearProcessing(false);
                                        }
                                    }}
                                />
                                
                                {/* Modal Content */}
                                <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 z-10 animate-fade-in">
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
                                                className="rounded-2xl border-2 border-gray-300 px-8 py-2 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                                disabled={clearProcessing}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="rounded-2xl px-9 py-2 text-white font-semibold transition bg-red-600 hover:bg-red-700"
                                                disabled={clearProcessing}
                                            >
                                                {clearProcessing
                                                    ? "Clearing..."
                                                    : "Clear All"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Duplicate Resolution Modal */}
                        {showDuplicateModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Backdrop - clicking it should NOT close modal during important operations */}
                                <div 
                                    className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                                />
                                
                                {/* Modal Content - make it scrollable */}
                                <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Duplicate Homophones Found
                                </h2>
                                <p className="text-gray-700 mb-2">
                                    Found {duplicates.length} duplicate(s). Choose whether to replace the existing entries or skip importing them.
                                </p>
                                {duplicateMessage && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 mb-4">
                                        <p className="text-sm text-yellow-800">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            {duplicateMessage}
                                        </p>
                                    </div>
                                )}

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
                                        className="rounded-2xl border-2 border-gray-300 px-8 py-2 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={importProcessing}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={proceedWithImport}
                                        className="rounded-2xl px-8 py-2 bg-green-600 text-white font-semibold hover:bg-green-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                        disabled={importProcessing || Object.keys(duplicateResolutions).length === 0}
                                    >
                                        {importProcessing ? "Importing..." : "Proceed with Import"}
                                    </button>
                                </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {homophones.total > 10 && (
                            <div className="mt-6 mb-6">
                                <Pagination 
                                    links={homophones.links}
                                    currentPage={homophones.current_page}
                                    total={homophones.total}
                                    perPage={homophones.per_page}
                                />
                            </div>
                        )}
                </div>
                
            {/* Success Message */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <div>
                            <p className="font-semibold">Import Complete!</p>
                            <p className="text-sm text-green-100">Homophones have been successfully imported</p>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
