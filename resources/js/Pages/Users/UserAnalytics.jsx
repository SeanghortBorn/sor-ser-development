import React, { useState, useRef, useEffect, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import { Search, FileUp, CheckSquare, Square } from "lucide-react";
import Modal from "@/Components/Modal";

export default function IndexPage() {
    const { analytics = [] } = usePage().props;

    const khmerOptions = [
        { value: "", label: "All Experience" },
        { value: "None", label: "None" },
        { value: "Beginner", label: "Beginner" },
        { value: "Intermediate", label: "Intermediate" },
        { value: "Advanced", label: "Advanced" },
        { value: "Expert", label: "Expert" },
    ];

    const educationOptions = [
        { value: "", label: "All Education" },
        { value: "Primary", label: "Primary" },
        { value: "Secondary", label: "Secondary" },
        { value: "High School", label: "High School" },
        { value: "Bachelor", label: "Bachelor" },
        { value: "Master", label: "Master" },
        { value: "Doctorate", label: "Doctorate" },
        { value: "Other", label: "Other" },
    ];

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedKhmer, setSelectedKhmer] = useState("");
    const [selectedEducation, setSelectedEducation] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [expDropdownOpen, setExpDropdownOpen] = useState(false);
    const [eduDropdownOpen, setEduDropdownOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileType, setFileType] = useState("json");
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [exportScope, setExportScope] = useState("filtered"); // default
    const [isExporting, setIsExporting] = useState(false);
    const [exportMode, setExportMode] = useState("filtered"); // filtered, all, role, or specific
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedPersonId, setSelectedPersonId] = useState("");

    const filterRef = useRef(null);

    useEffect(() => {
        const onDoc = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    const filtered = useMemo(() => analytics.filter((u) => {
        const q = searchTerm.trim().toLowerCase();
        if (q) {
            const inName = String(u.name || "").toLowerCase().includes(q);
            const inEmail = String(u.email || "").toLowerCase().includes(q);
            if (!inName && !inEmail) return false;
        }
        if (selectedKhmer && String(u.experience || "") !== selectedKhmer) return false;
        if (selectedEducation && String(u.education || "") !== selectedEducation) return false;
        return true;
    }), [analytics, searchTerm, selectedKhmer, selectedEducation]);

    const perPage = 15;
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [searchTerm, selectedKhmer, selectedEducation]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

    // Keep selection valid
    useEffect(() => {
        setSelectedIds(prev => prev.filter(id => filtered.some(f => f.id === id)));
    }, [filtered]);

    const downloadFile = (content, fileName, mime) => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const escapeXml = (str) => String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const buildXml = (items) => {
        const students = items.map(item => `   
            <Student>
                <id>${escapeXml(item.id)}</id>
                <name>${escapeXml(item.name)}</name>
                <email>${escapeXml(item.email)}</email>
                <role>${escapeXml(item.role)}</role>
                <age>${escapeXml(item.age)}</age>
                <education>${escapeXml(item.education)}</education>
                <experience>${escapeXml(item.experience)}</experience>
                <total_articles>${escapeXml(item.total_articles)}</total_articles>
                <total_quizzes>${escapeXml(item.total_quizzes)}</total_quizzes>
                <total_questions>${escapeXml(item.total_questions)}</total_questions>
                <incorrect_questions>${escapeXml(item.incorrect_questions)}</incorrect_questions>
                <accepts>${escapeXml(item.accepts)}</accepts>
                <dismiss>${escapeXml(item.dismiss)}</dismiss>
                <total_typings>${escapeXml(item.total_typings)}</total_typings>
                <incorrect_typings>${escapeXml(item.incorrect_typings)}</incorrect_typings>
                <homo_avg>${escapeXml(item.homo_avg)}</homo_avg>
                <avg_score>${escapeXml(item.avg_score || 'N/A')}</avg_score>
                <avg_pause>${escapeXml(item.avg_pause)}</avg_pause>
            </Student>`).join("\n");
        return `<?xml version="1.0" encoding="UTF-8"?>\n<Students>\n${students}\n</Students>`;
    };

    const handleExport = async () => {
        let items = [];

        // Determine items based on export mode
        if (exportMode === "selected" && selectedIds.length > 0) {
            items = analytics.filter(u => selectedIds.includes(u.id));
        } else if (exportMode === "role" && selectedRole) {
            items = analytics.filter(u => u.role === selectedRole);
        } else if (exportMode === "specific" && selectedPersonId) {
            items = analytics.filter(u => u.id === parseInt(selectedPersonId));
        } else if (exportMode === "all") {
            items = analytics;
        } else {
            items = filtered;
        }

        if (items.length === 0) {
            alert("No data to export! Please select a valid export option.");
            return;
        }

        setIsExporting(true);

        // Fetch detailed data for each user from the API
        try {
            const userIds = items.map(u => u.id);
            console.log('Attempting to export users:', userIds);
            const response = await window.axios.post('/api/user-analytics/export', { user_ids: userIds });
            console.log('Export successful:', response);
            const detailedData = response.data;

            const timestamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
            let modeLabel = "";
            if (exportMode === "selected") modeLabel = `selected_${items.length}`;
            else if (exportMode === "role") modeLabel = `role_${selectedRole}_${items.length}`;
            else if (exportMode === "specific") modeLabel = `user_${selectedPersonId}`;
            else if (exportMode === "all") modeLabel = `all_users_${items.length}`;
            else modeLabel = `filtered_${items.length}`;

            const defaultName = `${modeLabel}_users_detailed_${timestamp}`;

            const finalName = fileName.trim() || defaultName;
            const filename = `${finalName}.${fileType === "json" ? "json" : "xml"}`;

            const content = fileType === "json"
                ? JSON.stringify(detailedData, null, 2)
                : buildXml(detailedData);

            downloadFile(
                content,
                filename,
                fileType === "json" ? "application/json;charset=utf-8" : "application/xml;charset=utf-8"
            );

            setModalOpen(false);
            setFileName("");
            setIsExporting(false);
        } catch (error) {
            console.error('Export error:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
                console.error('Full response:', JSON.stringify(error.response.data, null, 2));
            }
            console.warn('Using fallback basic export due to API error');
            alert('Note: Exporting basic data. Detailed export failed with server error. Check console for details.');
            
            // Fallback to basic export
            const timestamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
            const defaultName = exportScope === "selected"
                ? `selected_${items.length}_students_${timestamp}`
                : `all_filtered_${items.length}_students_${timestamp}`;

            const finalName = fileName.trim() || defaultName;
            const filename = `${finalName}.${fileType === "json" ? "json" : "xml"}`;

            const content = fileType === "json"
                ? JSON.stringify(items, null, 2)
                : buildXml(items);

            downloadFile(
                content,
                filename,
                fileType === "json" ? "application/json;charset=utf-8" : "application/xml;charset=utf-8"
            );

            setModalOpen(false);
            setFileName("");
            setIsExporting(false);
        }
    };

    const exportSingle = async (student) => {
        setIsExporting(true);
        
        try {
            // Fetch detailed data for single user
            const response = await window.axios.post('/api/user-analytics/export', { user_ids: [student.id] });
            const detailedData = response.data;
            
            const safeName = (student.name || `student_${student.id}`).replace(/[^\w\-_. ]/g, "_");
            const timestamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
            const filename = `${safeName}_${student.id}_detailed_${timestamp}.${fileType === "json" ? "json" : "xml"}`;
            
            const content = fileType === "json"
                ? JSON.stringify(detailedData[0], null, 2)
                : buildXml(detailedData);

            downloadFile(content, filename, fileType === "json" ? "application/json" : "application/xml");
            setIsExporting(false);
        } catch (error) {
            console.error('Single export error:', error);
            alert('Failed to export detailed data. Exporting basic data instead.');
            
            // Fallback to basic export
            const safeName = (student.name || `student_${student.id}`).replace(/[^\w\-_. ]/g, "_");
            const filename = `${safeName}_${student.id}.${fileType === "json" ? "json" : "xml"}`;
            const content = fileType === "json"
                ? JSON.stringify(student, null, 2)
                : buildXml([student]);

            downloadFile(content, filename, fileType === "json" ? "application/json" : "application/xml");
            setIsExporting(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllVisible = () => {
        const pageIds = pageItems.map(u => u.id);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
        }
    };

    const isAllVisibleSelected = pageItems.length > 0 && pageItems.every(u => selectedIds.includes(u.id));

    const headWeb = "User Analytics";
    const linksBreadcrumb = [{ title: "Home", url: "/" }, { title: headWeb, url: "" }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100 mb-12">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <div className="flex flex-row items-center justify-between gap-3 flex-nowrap">
                                {/* Left side: Search and Filter */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {/* Search */}
                                    <div className="inline-flex items-center gap-2 px-3 rounded-xl border border-gray-300 hover:border-gray-400 hover:shadow-sm transition text-sm bg-white">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            type="text"
                                            placeholder="Search by name or email"
                                            className="px-2 w-[220px] py-2 rounded-xl border-none text-sm focus:outline-none focus:ring-0"
                                        />
                                    </div>

                                    {/* Filter button with sub-dropdowns */}
                                    <div className="relative filter-dropdown-parent" ref={filterRef}>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95"
                                            onClick={() => setFilterOpen((open) => !open)}
                                        >
                                            <i className="fas fa-filter w-4 h-4" />
                                            <span>Filter</span>
                                            <i className={`fas fa-chevron-down transition-transform duration-300 ${filterOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {filterOpen && (
                                            <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in">
                                                <div className="p-4 space-y-4">
                                                    {/* Experience Level Dropdown */}
                                                    <div className="relative">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Experience Level
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpDropdownOpen(!expDropdownOpen)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium text-gray-700 transition-all duration-200 hover:border-purple-400 flex items-center justify-between"
                                                        >
                                                            <span>
                                                                {khmerOptions.find(o => o.value === selectedKhmer)?.label || "All Experience"}
                                                            </span>
                                                            <i className={`fas fa-chevron-down transition-transform duration-200 ${expDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {expDropdownOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-fade-in">
                                                                {khmerOptions.map(opt => (
                                                                    <div
                                                                        key={opt.value}
                                                                        onClick={() => {
                                                                            setSelectedKhmer(opt.value);
                                                                            setExpDropdownOpen(false);
                                                                        }}
                                                                        className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-150 ${
                                                                            selectedKhmer === opt.value
                                                                                ? "bg-purple-50 text-purple-700"
                                                                                : "text-gray-700 hover:bg-purple-50"
                                                                        }`}
                                                                    >
                                                                        {opt.label}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Education Level Dropdown */}
                                                    <div className="relative">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Education Level
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEduDropdownOpen(!eduDropdownOpen)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium text-gray-700 transition-all duration-200 hover:border-purple-400 flex items-center justify-between"
                                                        >
                                                            <span>
                                                                {educationOptions.find(o => o.value === selectedEducation)?.label || "All Education"}
                                                            </span>
                                                            <i className={`fas fa-chevron-down transition-transform duration-200 ${eduDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {eduDropdownOpen && (
                                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-fade-in">
                                                                {educationOptions.map(opt => (
                                                                    <div
                                                                        key={opt.value}
                                                                        onClick={() => {
                                                                            setSelectedEducation(opt.value);
                                                                            setEduDropdownOpen(false);
                                                                        }}
                                                                        className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-150 ${
                                                                            selectedEducation === opt.value
                                                                                ? "bg-purple-50 text-purple-700"
                                                                                : "text-gray-700 hover:bg-purple-50"
                                                                        }`}
                                                                    >
                                                                        {opt.label}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Clear Filters Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedKhmer("");
                                                            setSelectedEducation("");
                                                            setFilterOpen(false);
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

                                {/* Right side: Select and Export buttons */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                <button
                                    onClick={() => setShowCheckbox(!showCheckbox)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95"
                                >
                                    {showCheckbox ? (
                                        <>
                                            <Square className="w-4 h-4" />
                                            Unselect
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="w-4 h-4" />
                                            Select
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        setExportScope(selectedIds.length > 0 ? "selected" : "filtered");
                                        setModalOpen(true);
                                    }}
                                    disabled={isExporting}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-200 ease-in-out ${
                                        isExporting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-500 hover:scale-105 hover:shadow-lg active:scale-95'
                                    }`}
                                >
                                    {isExporting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <FileUp className="w-4 h-4" /> Export
                                            {selectedIds.length > 0 && ` (${selectedIds.length})`}
                                        </>
                                    )}
                                </button>
                            </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border border-gray-100">
                            <table className="min-w-full table-auto text-left">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm">
                                    <tr>
                                        {showCheckbox && (
                                            <th className="py-3 px-5 font-semibold">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllVisibleSelected}
                                                    onChange={selectAllVisible}
                                                    className="w-4 h-4 rounded-2xl border-gray-300 transition-all duration-200"
                                                />
                                            </th>
                                        )}
                                        <th className="py-3 px-6 font-semibold">#ID</th>
                                        <th className="py-3 px-6 font-semibold">Name</th>
                                        <th className="py-3 px-6 font-semibold">Email</th>
                                        <th className="py-3 px-6 font-semibold">Role</th>
                                        <th className="py-3 px-6 font-semibold">Age</th>
                                        <th className="py-3 px-6 font-semibold">Education</th>
                                        <th className="py-3 px-6 font-semibold">Experience</th>
                                        <th className="py-3 px-6 font-semibold">Total Articles</th>
                                        <th className="py-3 px-6 font-semibold">Total Quizzes</th>
                                        <th className="py-3 px-6 font-semibold">Total Questions</th>
                                        <th className="py-3 px-6 font-semibold">Incorrect Questions</th>
                                        <th className="py-3 px-6 font-semibold">Accepts</th>
                                        <th className="py-3 px-6 font-semibold">Dismiss</th>
                                        <th className="py-3 px-6 font-semibold">Total Typings</th>
                                        <th className="py-3 px-6 font-semibold">Incorrect Typings</th>
                                        <th className="py-3 px-6 font-semibold">Avg Accuracy (%)</th>
                                        <th className="py-3 px-6 font-semibold">Avg Score (%)</th>
                                        <th className="py-3 px-6 font-semibold">Avg Pause (s)</th>
                                        <th className="py-3 px-6 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm bg-white">
                                    {pageItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={showCheckbox ? 20 : 19} className="py-12 text-center text-gray-500">
                                                No analytics data available.
                                            </td>
                                        </tr>
                                    ) : (
                                        pageItems.map(u => (
                                            <tr key={u.id} className="border-t border-gray-100 hover:bg-blue-50 transition-all duration-200">
                                                {showCheckbox && (
                                                    <td className="py-3 px-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(u.id)}
                                                            onChange={() => toggleSelect(u.id)}
                                                            className="w-4 h-4 rounded-2xl border-gray-300 transition-all duration-200"
                                                        />
                                                    </td>
                                                )}
                                                <td className="py-3 px-6 font-medium text-gray-900">{u.id}</td>
                                                <td className="py-3 px-6 font-medium text-gray-900">{u.name}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.email}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.role}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.age || "N/A"}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.education || "N/A"}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.experience || "N/A"}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.total_articles}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.total_quizzes ?? "N/A"}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.total_questions ?? "N/A"}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.incorrect_questions ?? "N/A"}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.accepts}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.dismiss}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.total_typings}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.incorrect_typings}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.homo_avg || "N/A"}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.avg_score}</td>
                                                <td className="py-3 px-6 text-gray-700">{u.avg_pause || "N/A"}</td>
                                                <td className="py-3 px-6">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => exportSingle(u)} className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-green-600 hover:bg-green-500 text-white transition-all duration-200 ease-in-out hover:shadow-sm active:scale-95">JSON</button>
                                                        <button onClick={() => { setFileType("xml"); exportSingle(u); }} className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-green-600 hover:bg-green-500 text-white transition-all duration-200 ease-in-out hover:shadow-sm active:scale-95">XML</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 mb-6">
                                <nav className="flex items-center justify-center gap-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className={`px-4 py-2 font-medium text-sm transition-all duration-200 ease-in-out rounded-2xl ${
                                            page === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                                        }`}
                                    >
                                        ← Previous
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`px-4 py-2 font-medium text-sm transition-all duration-200 ease-in-out rounded-2xl ${
                                                pageNum === page
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    {/* Next Button */}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className={`px-4 py-2 font-medium text-sm transition-all duration-200 ease-in-out rounded-2xl ${
                                            page === totalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Export Modal */}
            <Modal show={modalOpen} onClose={() => !isExporting && setModalOpen(false)} closeable={!isExporting}>
                <div className="p-6 max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold mb-4">Export User Analytics Data</h3>
                    
                    {/* Export Mode Selection */}
                    <div className="mb-6 space-y-3">
                        <p className="text-sm font-medium text-gray-700">What would you like to export?</p>
                        
                        {/* All Users */}
                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                            <input
                                type="radio"
                                name="exportMode"
                                checked={exportMode === "all"}
                                onChange={() => {
                                    setExportMode("all");
                                    setSelectedRole("");
                                    setSelectedPersonId("");
                                }}
                                className="mt-1"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">All Users</p>
                                <p className="text-xs text-gray-500">Export all {analytics.length} users in the system</p>
                            </div>
                        </label>

                        {/* By Role/Group */}
                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                            <input
                                type="radio"
                                name="exportMode"
                                checked={exportMode === "role"}
                                onChange={() => setExportMode("role")}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">By Role/Group</p>
                                <p className="text-xs text-gray-500 mb-2">Export users with a specific role</p>
                                {exportMode === "role" && (
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                                    >
                                        <option value="">Select a role...</option>
                                        {[...new Set(analytics.map(u => u.role))].map(role => (
                                            <option key={role} value={role}>
                                                {role} ({analytics.filter(u => u.role === role).length})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </label>

                        {/* Specific Person */}
                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                            <input
                                type="radio"
                                name="exportMode"
                                checked={exportMode === "specific"}
                                onChange={() => setExportMode("specific")}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Specific Person</p>
                                <p className="text-xs text-gray-500 mb-2">Export data for a specific user</p>
                                {exportMode === "specific" && (
                                    <select
                                        value={selectedPersonId}
                                        onChange={(e) => setSelectedPersonId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                                    >
                                        <option value="">Select a person...</option>
                                        {analytics.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </label>

                        {/* Filtered Results */}
                        {selectedIds.length > 0 && (
                            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                                <input
                                    type="radio"
                                    name="exportMode"
                                    checked={exportMode === "selected"}
                                    onChange={() => {
                                        setExportMode("selected");
                                        setSelectedRole("");
                                        setSelectedPersonId("");
                                    }}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Selected Users</p>
                                    <p className="text-xs text-gray-500">Export {selectedIds.length} selected users</p>
                                </div>
                            </label>
                        )}

                        {/* Current Filters */}
                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                            <input
                                type="radio"
                                name="exportMode"
                                checked={exportMode === "filtered"}
                                onChange={() => {
                                    setExportMode("filtered");
                                    setSelectedRole("");
                                    setSelectedPersonId("");
                                }}
                                className="mt-1"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Current Filters</p>
                                <p className="text-xs text-gray-500">Export {filtered.length} users matching current filters</p>
                            </div>
                        </label>
                    </div>

                    {/* File Settings */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={e => setFileName(e.target.value)}
                                    placeholder="Leave empty for auto-generated name"
                                    className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File Format</label>
                                <select
                                    value={fileType}
                                    onChange={e => setFileType(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-xl transition-all duration-200"
                                >
                                    <option value="json">JSON</option>
                                    <option value="xml">XML</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600">All user-related data will be included (typing activities, deleted characters, comparison activities, pause counts, etc.)</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setModalOpen(false)}
                            disabled={isExporting}
                            className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 ease-in-out hover:shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ease-in-out flex items-center gap-2 ${
                                isExporting
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 hover:shadow-sm active:scale-95'
                            }`}
                        >
                            {isExporting && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isExporting ? 'Exporting...' : 'Export Data'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}