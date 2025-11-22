import React, { useState, useRef, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import { Search, UserPlus } from "lucide-react";

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
        if (selectedKhmer && String(u.experience || "") !== String(selectedKhmer)) return false;
        if (selectedEducation && String(u.education || "") !== String(selectedEducation)) return false;
        return true;
    });

    const perPage = 15;
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [searchTerm, selectedKhmer, selectedEducation]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

    const headWeb = "Student Analytics";

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={[{ title: "Home", url: "/" }, { title: headWeb, url: "" }]} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-12">
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            {/* Title */}
                            <h3 className="text-xl font-semibold">{headWeb}</h3>
                            <div className="flex items-center gap-3 ml-auto">
                                {/* Khmer Experience Dropdown */}
                                <div className="relative" ref={khmerRef}>
                                    <button
                                        type="button"
                                        className="w-[180px] px-3 py-2 text-sm rounded-xl border bg-white shadow-sm flex justify-between items-center focus:outline-none"
                                        onClick={() => setKhmerOpen(!khmerOpen)}
                                    >
                                        {khmerOptions.find((opt) => opt.value === selectedKhmer)?.label || "Select Experience Level"}
                                        <svg className={`w-4 h-4 ml-2 transition-transform ${khmerOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {khmerOpen && (
                                        <div className="absolute left-0 top-full mt-2 w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                {khmerOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`flex w-full text-left px-4 py-2 text-[14px] rounded-lg transition ${
                                                            selectedKhmer === opt.value
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedKhmer(opt.value);
                                                            setKhmerOpen(false);
                                                        }}
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
                                        {educationOptions.find((opt) => opt.value === selectedEducation)?.label || "Select Education Level"}
                                        <svg className={`w-4 h-4 ml-2 transition-transform ${eduOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {eduOpen && (
                                        <div className="absolute left-0 top-full mt-2 w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                {educationOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`flex w-full text-left px-4 py-2 text-[14px] rounded-lg transition ${
                                                            selectedEducation === opt.value
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedEducation(opt.value);
                                                            setEduOpen(false);
                                                        }}
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
                                        className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px] focus:outline-none focus:ring-0"
                                    />
                                </div>

                                {/* Add User */}
                                <a className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition">
                                    <UserPlus className="w-4 h-4" /> Add User
                                </a>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-max text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                    <tr>
                                        <th className="py-2 px-16">#ID</th>
                                        <th className="py-2 px-16">Name</th>
                                        <th className="py-2 px-16">Email</th>
                                        <th className="py-2 px-16">Role</th>
                                        <th className="py-2 px-16">Age</th>
                                        <th className="py-2 px-16">Education</th>
                                        <th className="py-2 px-16">Experience</th>
                                        <th className="py-2 px-16">Total Articles</th>
                                        <th className="py-2 px-16">Accepts</th>
                                        <th className="py-2 px-16">Dismiss</th>
                                        <th className="py-2 px-16">Total Typings</th>
                                        <th className="py-2 px-16">Incorrect Typings</th>
                                        <th className="py-2 px-16">Avg Accuracy (%)</th>
                                        <th className="py-2 px-16">Avg Pause (s)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {pageItems.length === 0 ? (
                                        <tr className="border-t"><td colSpan={14} className="py-12 px-6 text-center text-sm text-gray-500">No analytics data available.</td></tr>
                                    ) : (
                                        pageItems.map((u) => (
                                            <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                                                <td className="py-3 px-16">{u.id}</td>
                                                <td className="py-3 px-16">{u.name}</td>
                                                <td className="py-3 px-16">{u.email}</td>
                                                <td className="py-3 px-16">{u.role}</td>
                                                <td className="py-3 px-16">{u.age}</td>
                                                <td className="py-3 px-16">{u.education}</td>
                                                <td className="py-3 px-16">{u.experience}</td>
                                                <td className="py-3 px-16">{u.total_articles}</td>
                                                <td className="py-3 px-16">{u.accepts}</td>
                                                <td className="py-3 px-16">{u.dismiss}</td>
                                                <td className="py-3 px-16">{u.total_typings}</td>
                                                <td className="py-3 px-16">{u.incorrect_typings}</td>
                                                <td className="py-3 px-16">{u.homo_avg}</td>
                                                <td className="py-3 px-16">{u.avg_pause}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination - simplified UI */}
                        <div className="mt-4 px-6 py-3 border-t border-gray-100">
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center space-x-2">
                                    <button
                                        className="px-3 py-1 rounded-md border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pn) => (
                                            <button
                                                key={pn}
                                                className={`px-3 py-1 rounded-md border transition ${pn === page ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                                onClick={() => setPage(pn)}
                                            >
                                                {pn}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="px-3 py-1 rounded-md border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
