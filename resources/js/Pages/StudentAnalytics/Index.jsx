import React, { useState, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import { Search, UserPlus } from "lucide-react";

export default function IndexPage() {
    const { auth, analytics = [] } = usePage().props;

    const headWeb = "Student Analytics";
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
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            {/* Left side (Title) */}
                            <h3 className="text-xl font-semibold">
                                Student Analytics
                            </h3>

                            {/* Right side (Search + Add User) */}
                            <div className="flex items-center gap-3 ml-auto">
                                <form className="inline-block">
                                    <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-lg transition text-sm bg-white">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email"
                                            className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px] focus:outline-none focus:ring-0"
                                        />
                                    </div>
                                </form>
                                <a className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition">
                                    <UserPlus className="w-4 h-4" />
                                    Add User
                                </a>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-max text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                    <tr>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            #ID
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Name
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Email
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Role
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Age
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Education
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Experience
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Total Articles
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Accepts
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Dismiss
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Total Typings
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Incorrect Typings
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Avg Accuracy (%)
                                        </th>
                                        <th className="py-2 px-16 whitespace-nowrap">
                                            Avg Pause (s)
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="text-gray-700">
                                    {analytics.length === 0 ? (
                                        <tr className="border-t">
                                            <td colSpan={14} className="py-4 px-6 text-center text-sm text-gray-500">
                                                No analytics data available.
                                            </td>
                                        </tr>
                                    ) : (
                                        analytics.map((u) => (
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
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
