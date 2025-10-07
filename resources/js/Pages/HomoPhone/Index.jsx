import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Pagination from "@/Components/Pagination";
import { ClipboardPlus } from "lucide-react";
import Modal from "@/Components/Modal";

export default function HomophonesPage({ homophones }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = homophones?.data || homophones || [];
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

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

    const headWeb = "Homophones List";
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
                            <h3 className="text-xl font-semibold">Homophones</h3>
                            {can["homophone-create"] && can["homophone-list"] && (
                                <Link
                                    href={route("homophones.create")}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition"
                                >
                                    <ClipboardPlus className="w-4 h-4" />
                                    Add New
                                </Link>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-blue-600 text-white text-sm">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Word</th>
                                        <th className="px-4 py-3">POS</th>
                                        <th className="px-4 py-3">Pronunciation</th>
                                        <th className="px-4 py-3">Definition</th>
                                        <th className="px-4 py-3">Example</th>
                                        <th className="px-4 py-3">Phoneme</th>
                                        <th className="px-4 py-3">Homophones</th>
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
                                                <td className="px-4 py-3">{item.id}</td>
                                                <td className="px-4 py-3">{item.word}</td>
                                                <td className="px-4 py-3">{item.pos}</td>
                                                <td className="px-4 py-3">{item.pro}</td>
                                                <td className="px-4 py-3">{item.definition}</td>
                                                <td className="px-4 py-3">{item.example}</td>
                                                <td className="px-4 py-3">{item.phoneme}</td>
                                                <td className="px-4 py-3">
                                                    {Array.isArray(item.homophone)
                                                        ? item.homophone.join(", ")
                                                        : ""}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={route("homophones.edit", item.id)}
                                                            className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteModal(item)}
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
