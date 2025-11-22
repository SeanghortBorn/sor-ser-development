import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";

export default function HomophoneCreateEdit({ homophone }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    homophone = homophone || {
        id: null,
        word: "",
        pos: "",
        pro: "",
        definition: "",
        example: "",
        phoneme: "",
        homophone: [],
    };

    const [form, setForm] = useState({
        word: homophone.word ?? "",
        pos: homophone.pos ?? "",
        pro: homophone.pro ?? "",
        definition: homophone.definition ?? "",
        example: homophone.example ?? "",
        phoneme: homophone.phoneme ?? "",
        homophone: Array.isArray(homophone.homophone)
            ? homophone.homophone.join(", ")
            : "",
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const payload = {
            ...form,
            homophone: form.homophone
                .split(",")
                .map((h) => h.trim())
                .filter(Boolean),
        };
        const finish = () => setProcessing(false);
        if (!homophone.id) {
            router.post(route("homophones.store"), payload, {
                onFinish: finish,
            });
        } else {
            router.patch(route("homophones.update", homophone.id), payload, {
                onFinish: finish,
            });
        }
    };

    const headWeb = homophone.id ? "Edit Homophone" : "Create Homophone";
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
                    <div className="bg-white shadow-md rounded-[10px] overflow-hidden border border-gray-200 mb-12">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {homophone?.id
                                            ? "Edit Homophone"
                                            : "Create Homophone"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {homophone?.id
                                            ? "Update the details of this homophone below."
                                            : "Fill out the form below to create a new homophone."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Word
                                    </label>
                                    <input
                                        name="word"
                                        value={form.word}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 rounded-[10px] border border-gray-300 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-1"
                                        placeholder="Enter word"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        POS
                                    </label>
                                    <input
                                        name="pos"
                                        value={form.pos}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 rounded-[10px] border border-gray-300 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-1"
                                        placeholder="Enter part of speech"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pronunciation
                                    </label>
                                    <input
                                        name="pro"
                                        value={form.pro}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 rounded-[10px] border border-gray-300 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-1"
                                        placeholder="Enter pronunciation"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Definition
                                    </label>
                                    <input
                                        name="definition"
                                        value={form.definition}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 rounded-[10px] border border-gray-300 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-1"
                                        placeholder="Enter definition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Homophones (comma separated)
                                    </label>
                                    <input
                                        name="homophone"
                                        value={form.homophone}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 rounded-[10px] border border-gray-300 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-1"
                                        placeholder="Enter homophones separated by commas"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phoneme
                                    </label>
                                    <input
                                        name="phoneme"
                                        value={form.phoneme}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 rounded-[10px] border border-gray-300 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-1"
                                        placeholder="Enter phoneme"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Example
                                    </label>
                                    <textarea
                                        name="example"
                                        value={form.example}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 rounded-[10px] border border-gray-300 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-1 resize-none overflow-hidden"
                                        rows="3"
                                        onInput={(e) => {
                                            e.target.style.height = "auto";
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                        onPaste={(e) => e.preventDefault()}
                                        onCopy={(e) => e.preventDefault()}
                                        onCut={(e) => e.preventDefault()}
                                        onContextMenu={(e) => e.preventDefault()}
                                        onDrop={(e) => e.preventDefault()}
                                        onKeyDown={(e) => {
                                            if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) e.preventDefault();
                                            if (e.shiftKey && e.key === 'Insert') e.preventDefault();
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                                <Link
                                    href={route("homophones.index")}
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-[10px] text-gray-600 border-2 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition duration-200"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium rounded-[10px] text-white bg-gradient-to-r from-blue-500 to-blue-500 transition duration-200 hover:1rom-blue-500 hover:to-blue-600"
                                    disabled={processing}
                                >
                                    {processing
                                        ? homophone.id
                                            ? "Updating..."
                                            : "Saving..."
                                        : homophone.id
                                        ? "Update"
                                        : "Save"}
                                </button>
                            </div>
                        </form>

                        {/* Example: Delete modal if you want to support delete from edit page */}
                        <Modal
                            show={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            maxWidth="lg"
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.delete(
                                        route(
                                            "homophones.destroy",
                                            homophone.id
                                        ),
                                        {
                                            onFinish: () =>
                                                setShowDeleteModal(false),
                                        }
                                    );
                                }}
                                className="p-6"
                            >
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    Delete Homophone
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to delete "{form.word}
                                    "?
                                </p>
                                <div className="flex justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-[10px] px-9 py-1 text-white font-semibold transition bg-red-600 hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
