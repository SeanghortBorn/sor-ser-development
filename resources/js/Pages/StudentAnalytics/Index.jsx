import React, { useState, useRef, useEffect } from "react";
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
    const [khmerOpen, setKhmerOpen] = useState(false);
    const [eduOpen, setEduOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileType, setFileType] = useState("json");
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [exportScope, setExportScope] = useState("filtered"); // default

    const khmerRef = useRef(null);
    const eduRef = useRef(null);

    useEffect(() => {
        const onDoc = (e) => {
            if (khmerRef.current && !khmerRef.current.contains(e.target)) setKhmerOpen(false);
            if (eduRef.current && !eduRef.current.contains(e.target)) setEduOpen(false);
        };
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    const filtered = analytics.filter((u) => {
        const q = searchTerm.trim().toLowerCase();
        if (q) {
            const inName = String(u.name || "").toLowerCase().includes(q);
            const inEmail = String(u.email || "").toLowerCase().includes(q);
            if (!inName && !inEmail) return false;
        }
        if (selectedKhmer && String(u.experience || "") !== selectedKhmer) return false;
        if (selectedEducation && String(u.education || "") !== selectedEducation) return false;
        return true;
    });

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
        <accepts>${escapeXml(item.accepts)}</accepts>
        <dismiss>${escapeXml(item.dismiss)}</dismiss>
        <total_typings>${escapeXml(item.total_typings)}</total_typings>
        <incorrect_typings>${escapeXml(item.incorrect_typings)}</incorrect_typings>
        <homo_avg>${escapeXml(item.homo_avg)}</homo_avg>
        <avg_pause>${escapeXml(item.avg_pause)}</avg_pause>
    </Student>`).join("");

        return `<?xml version="1.0" encoding="UTF-8"?>\n<Students>${students}\n</Students>`;
    };

    const handleExport = () => {
        let items = [];

        if (exportScope === "selected" && selectedIds.length > 0) {
            items = analytics.filter(u => selectedIds.includes(u.id));
        } else {
            items = filtered;
        }

        if (items.length === 0) {
            alert("No data to export!");
            return;
        }

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
    };

    const exportSingle = (student) => {
        const safeName = (student.name || `student_${student.id}`).replace(/[^\w\-_. ]/g, "_");
        const filename = `${safeName}_${student.id}.${fileType === "json" ? "json" : "xml"}`;
        const content = fileType === "json"
            ? JSON.stringify(student, null, 2)
            : buildXml([student]);

        downloadFile(content, filename, fileType === "json" ? "application/json" : "application/xml");
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

    const headWeb = "Student Analytics";
    const linksBreadcrumb = [{ title: "Home", url: "/" }, { title: headWeb, url: "" }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-12">
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            <h3 className="text-xl font-semibold">{headWeb}</h3>
                            <div className="flex items-center gap-3 ml-auto">
                                {/* Experience Dropdown */}
                                <div className="relative" ref={khmerRef}>
                                    <button
                                        type="button"
                                        className="w-[180px] px-3 py-2 text-sm rounded-xl border bg-white shadow-sm flex justify-between items-center focus:outline-none"
                                        onClick={() => setKhmerOpen(!khmerOpen)}
                                    >
                                        {khmerOptions.find(o => o.value === selectedKhmer)?.label || "Select Experience Level"}
                                        <svg className={`w-4 h-4 ml-2 transition-transform ${khmerOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {khmerOpen && (
                                        <div className="absolute left-0 top-full mt-2 w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                                            <div className="px-2 py-2 space-y-1">
                                                {khmerOptions.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`w-full text-left px-4 py-2 text-[14px] rounded-lg transition ${selectedKhmer === opt.value ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-gray-100 text-gray-700"}`}
                                                        onClick={() => { setSelectedKhmer(opt.value); setKhmerOpen(false); }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Education Dropdown */}
                                <div className="relative" ref={eduRef}>
                                    <button
                                        type="button"
                                        className="w-[180px] px-3 py-2 text-sm rounded-xl border bg-white shadow-sm flex justify-between items-center focus:outline-none"
                                        onClick={() => setEduOpen(!eduOpen)}
                                    >
                                        {educationOptions.find(o => o.value === selectedEducation)?.label || "Select Education Level"}
                                        <svg className={`w-4 h-4 ml-2 transition-transform ${eduOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {eduOpen && (
                                        <div className="absolute left-0 top-full mt-2 w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                                            <div className="px-2 py-2 space-y-1">
                                                {educationOptions.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`w-full text-left px-4 py-2 text-[14px] rounded-lg transition ${selectedEducation === opt.value ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-gray-100 text-gray-700"}`}
                                                        onClick={() => { setSelectedEducation(opt.value); setEduOpen(false); }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Search */}
                                <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-lg transition text-sm bg-white">
                                    <Search className="w-4 h-4 text-gray-500" />
                                    <input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        type="text"
                                        placeholder="Search by name or email"
                                        className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px]"
                                    />
                                </div>

                                {/* Select Button */}
                                <button
                                    onClick={() => setShowCheckbox(!showCheckbox)}
                                    className="w-28 px-3 py-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition flex items-center justify-center gap-2"
                                >
                                    {showCheckbox ? (
                                        <>
                                            <CheckSquare className="w-4 h-4" />
                                            Unselect
                                        </>
                                    ) : (
                                        <>
                                            <Square className="w-4 h-4" />
                                            Select
                                        </>
                                    )}
                                </button>

                                {/* Export Button */}
                                <button
                                    onClick={() => {
                                        setExportScope(selectedIds.length > 0 ? "selected" : "filtered");
                                        setModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition"
                                >
                                    <FileUp className="w-4 h-4" /> Export
                                    {selectedIds.length > 0 && ` (${selectedIds.length})`}
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-max text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                    <tr>
                                        {showCheckbox && (
                                            <th className="py-3 px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllVisibleSelected}
                                                    onChange={selectAllVisible}
                                                    className="w-4 h-4 rounded border-gray-300"
                                                />
                                            </th>
                                        )}
                                        <th className="py-3 px-8">#ID</th>
                                        <th className="py-3 px-8">Name</th>
                                        <th className="py-3 px-8">Email</th>
                                        <th className="py-3 px-8">Role</th>
                                        <th className="py-3 px-8">Age</th>
                                        <th className="py-3 px-8">Education</th>
                                        <th className="py-3 px-8">Experience</th>
                                        <th className="py-3 px-8">Total Articles</th>
                                        <th className="py-3 px-8">Accepts</th>
                                        <th className="py-3 px-8">Dismiss</th>
                                        <th className="py-3 px-8">Total Typings</th>
                                        <th className="py-3 px-8">Incorrect Typings</th>
                                        <th className="py-3 px-8">Avg Accuracy (%)</th>
                                        <th className="py-3 px-8">Avg Pause (s)</th>
                                        <th className="py-3 px-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {pageItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={showCheckbox ? 16 : 15} className="py-12 text-center text-gray-500">
                                                No analytics data available.
                                            </td>
                                        </tr>
                                    ) : (
                                        pageItems.map(u => (
                                            <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                                                {showCheckbox && (
                                                    <td className="py-3 px-6">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(u.id)}
                                                            onChange={() => toggleSelect(u.id)}
                                                            className="w-4 h-4 rounded border-gray-300"
                                                        />
                                                    </td>
                                                )}
                                                <td className="py-3 px-8">{u.id}</td>
                                                <td className="py-3 px-8">{u.name}</td>
                                                <td className="py-3 px-8">{u.email}</td>
                                                <td className="py-3 px-8">{u.role}</td>
                                                <td className="py-3 px-8">{u.age || "-"}</td>
                                                <td className="py-3 px-8">{u.education || "-"}</td>
                                                <td className="py-3 px-8">{u.experience || "-"}</td>
                                                <td className="py-3 px-8">{u.total_articles}</td>
                                                <td className="py-3 px-8">{u.accepts}</td>
                                                <td className="py-3 px-8">{u.dismiss}</td>
                                                <td className="py-3 px-8">{u.total_typings}</td>
                                                <td className="py-3 px-8">{u.incorrect_typings}</td>
                                                <td className="py-3 px-8">{u.homo_avg || "-"}</td>
                                                <td className="py-3 px-8">{u.avg_pause || "-"}</td>
                                                <td className="py-3 px-8">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => exportSingle(u)} className="px-2 py-1 rounded-md text-sm border bg-white hover:bg-gray-50">JSON</button>
                                                        <button onClick={() => { setFileType("xml"); exportSingle(u); }} className="px-2 py-1 rounded-md text-sm border bg-white hover:bg-gray-50">XML</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 px-6 py-3 border-t border-gray-100">
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
                                    <span className="px-4 py-2">Page {page} of {totalPages}</span>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Export Modal */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Export Student Analytics Data</h3>
                    <div className="mb-3 text-sm text-gray-600">
                        Selected: <strong>{selectedIds.length}</strong> — Filtered: <strong>{filtered.length}</strong>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
                            <input
                                type="text"
                                value={fileName}
                                onChange={e => setFileName(e.target.value)}
                                placeholder="Enter file name"
                                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-40">
                            <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                            <select
                                value={fileType}
                                onChange={e => setFileType(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="json">JSON</option>
                                <option value="xml">XML</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Export scope:</p>
                        <div className="space-x-6">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={exportScope === "selected"}
                                    onChange={() => setExportScope("selected")}
                                    disabled={selectedIds.length === 0}
                                    className="mr-2"
                                />
                                <span>Selected ({selectedIds.length})</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={exportScope === "filtered"}
                                    onChange={() => setExportScope("filtered")}
                                    className="mr-2"
                                />
                                <span>All Filtered ({filtered.length})</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-1 border-2 border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-100 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-1 bg-green-600 text-white rounded-[10px] font-semibold hover:bg-green-700"
                        >
                            Export {exportScope === "selected" ? "Selected" : "All"}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}