import React, { useState, useRef, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";

export default function ArticlesCreateEdit({ datas, isEdit }) {
    const title = isEdit ? "Edit Article" : "Create Article";
    const [form, setForm] = useState({
        title: datas?.title ?? "",
        file: null,
        audio: null,
    });
    const [previewFile, setPreviewFile] = useState(null);
    const [previewAudio, setPreviewAudio] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    const audioInputRef = useRef(null);

    useEffect(() => {
        if (datas) {
            setForm({
                title: datas.title || "",
                file: null, // <-- always null on edit
                audio: null, // <-- always null on edit
            });
            setPreviewFile(datas.file ? resolveUrl(datas.file, "files") : null);
            setPreviewAudio(
                datas.audio ? resolveUrl(datas.audio, "audios") : null
            );
        }
    }, [datas]);

    const resolveUrl = (media, bucket) => {
        if (!media) return null;
        if (typeof media === "string") {
            if (media.startsWith("http") || media.startsWith("/")) return media;
            return `/storage/uploads/${bucket}/${media}`;
        }
        if (media.url) return media.url;
        if (media.path) {
            const p = media.path.replace(/^public\//, "");
            return media.path.startsWith("http") || media.path.startsWith("/")
                ? media.path
                : `/storage/${p}`;
        }
        if (media.file_path) {
            const fp = String(media.file_path);
            if (fp.startsWith("http") || fp.startsWith("/")) return fp;
            if (fp.startsWith("public/"))
                return `/storage/${fp.replace(/^public\//, "")}`;
            return `/storage/${fp}`;
        }
        if (media.filename)
            return `/storage/uploads/${bucket}/${media.filename}`;
        if (media.name) return `/storage/uploads/${bucket}/${media.name}`;
        return null;
    };

    const resolveName = (media) => {
        if (!media) return null;
        if (typeof media === "string") return media.split("/").pop();
        return media.title || media.filename || media.name || null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, file: file || null });
        setPreviewFile(file ? URL.createObjectURL(file) : null);
    };

    const handleAudioChange = (e) => {
        const audio = e.target.files[0];
        setForm({ ...form, audio: audio || null });
        setPreviewAudio(audio ? URL.createObjectURL(audio) : null);
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        const payload = { ...form };
        // Use FormData for file uploads
        const fd = new FormData();
        fd.append("title", payload.title ?? "");
        if (payload.file) fd.append("file", payload.file);
        if (payload.audio) fd.append("audio", payload.audio);

        const finish = () => setProcessing(false);

        if (!isEdit) {
            router.post(route("articles.store"), fd, {
                forceFormData: true,
                onFinish: finish,
                onError: (err) => {
                    setErrors(err || {});
                    finish();
                },
            });
        } else {
            fd.append("_method", "PATCH");
            router.post(route("articles.update", datas.id), fd, {
                forceFormData: true,
                onFinish: finish,
                onError: (err) => {
                    setErrors(err || {});
                    finish();
                },
            });
        }
    };

    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={title} links={linksBreadcrumb} />}
        >
            <Head title={title} />
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 mb-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="border-b mb-3">
                            <h2 className="text-2xl font-semibold mb-2">
                                {isEdit ? "Edit Article" : "Create New Article"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {isEdit
                                    ? "Update the details of this article below."
                                    : "Fill out the form below to create a new article."}
                            </p>
                        </div>
                        <form
                            onSubmit={submit}
                            className="space-y-4"
                            encType="multipart/form-data"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Title
                                </label>
                                <input
                                    name="title"
                                    type="text"
                                    value={form.title}
                                    onChange={handleChange}
                                    className={`w-full border rounded-md px-3 py-2 ${
                                        errors.title ? "border-red-500" : ""
                                    }`}
                                    placeholder="Enter article title"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Select File <span> </span>
                                </label>
                                <div
                                    className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer relative bg-gray-50 hover:bg-blue-50 transition"
                                    onClick={() => {
                                        if (fileInputRef.current)
                                            fileInputRef.current.click();
                                    }}
                                    style={{ minHeight: 100 }}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        tabIndex={-1}
                                        style={{ pointerEvents: "auto" }}
                                        onClick={(e) => e.stopPropagation()}
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
                                            Select a file or drag here
                                        </div>
                                        <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition pointer-events-none">
                                            {form.file
                                                ? "Change file"
                                                : "Select a file"}
                                        </div>
                                    </div>
                                </div>
                                {errors.file && (
                                    <div className="text-red-600 mt-2 text-sm">
                                        {errors.file}
                                    </div>
                                )}
                                {previewFile && (
                                    <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-3 mt-3 hover:bg-gray-100 transition">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-green-100 p-2 rounded-lg flex items-center justify-center text-green-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-file-json2-icon lucide-file-json-2"
                                                >
                                                    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
                                                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                                    <path d="M4 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
                                                    <path d="M8 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
                                                </svg>
                                            </div>
                                            <div className="flex items-center mt-2 space-x-2 justify-center">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {form.file
                                                        ? form.file.name
                                                        : resolveName(
                                                              datas?.file
                                                          ) || "Download"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setPreviewFile(null)}
                                            className="ml-4 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Upload Audio <span></span>
                                </label>
                                <div
                                    className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 cursor-pointer relative bg-gray-50 hover:bg-blue-50 transition"
                                    onClick={() => {
                                        if (audioInputRef.current)
                                            audioInputRef.current.click();
                                    }}
                                    style={{ minHeight: 100 }}
                                >
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        ref={audioInputRef}
                                        onChange={handleAudioChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        tabIndex={-1}
                                        style={{ pointerEvents: "auto" }}
                                        onClick={(e) => e.stopPropagation()}
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
                                            Select an audio file or drag here
                                        </div>
                                        <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition pointer-events-none">
                                            {form.audio
                                                ? "Change Audio"
                                                : "Select Audio"}
                                        </div>
                                    </div>
                                </div>
                                {errors.audio && (
                                    <div className="text-red-600 mt-2 text-sm">
                                        {errors.audio}
                                    </div>
                                )}
                                {previewAudio && (
                                    <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-3 mt-3 hover:bg-gray-100 transition">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-2 rounded-lg flex items-center justify-center text-blue-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M9 18V5l12-2v13" />
                                                    <circle
                                                        cx="6"
                                                        cy="18"
                                                        r="3"
                                                    />
                                                    <circle
                                                        cx="18"
                                                        cy="16"
                                                        r="3"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex items-center justify-between w-full space-x-4 mt-2">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {form.audio?.name ||
                                                        resolveName(
                                                            datas?.audio
                                                        ) ||
                                                        "Play Audio"}
                                                </p>
                                                <audio
                                                    key={previewAudio}
                                                    src={previewAudio}
                                                    controls
                                                    preload="metadata"
                                                    className="w-96 border rounded-3xl"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setPreviewAudio(null)
                                            }
                                            className="ml-4 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                                <Link
                                    href={route("articles.index")}
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-[10px] text-gray-600 border-2 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition duration-200"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium rounded-[10px] text-white bg-gradient-to-r from-blue-500 to-blue-500 transition duration-200 hover:from-blue-500 hover:to-blue-600"
                                    disabled={processing}
                                >
                                    {processing
                                        ? isEdit
                                            ? "Updating..."
                                            : "Saving..."
                                        : isEdit
                                        ? "Update Article"
                                        : "Create Article"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
