import React, { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import InputError from "@/Components/InputError";

export default function EditArticle({ datas, isEdit }) {
    const title = isEdit ? "Edit Article" : "Create Article";
    const { data, setData, post, reset, errors } = useForm({
        title: "",
        file: null,
        audio: null,
    });

    const [previewFile, setPreviewFile] = useState(null);
    const [previewAudio, setPreviewAudio] = useState(null);

    // Resolve URL from possible shapes: string or object
    const resolveUrl = (media, bucket) => {
        if (!media) return null;
        if (typeof media === "string") {
            if (media.startsWith("http") || media.startsWith("/")) return media;
            return `/storage/uploads/${bucket}/${media}`;
        }
        // object cases
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

    useEffect(() => {
        if (datas) {
            setData({
                title: datas.title || "",
                file: null,
                audio: null,
            });

            setPreviewFile(resolveUrl(datas.file, "files"));
            setPreviewAudio(resolveUrl(datas.audio, "audios"));
        }
    }, [datas]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData("file", file || null);
        if (file) setPreviewFile(URL.createObjectURL(file));
    };

    const handleAudioChange = (e) => {
        const audio = e.target.files[0];
        setData("audio", audio || null);

        // Revoke old blob URL if any to avoid stale refs
        setPreviewAudio((prev) => {
            if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
                try {
                    URL.revokeObjectURL(prev);
                } catch {}
            }
            return audio ? URL.createObjectURL(audio) : null;
        });
    };

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (previewAudio && previewAudio.startsWith("blob:")) {
                try {
                    URL.revokeObjectURL(previewAudio);
                } catch {}
            }
        };
    }, [previewAudio]);

    const submit = (e) => {
        e.preventDefault();

        if (isEdit) {
            // Use POST + method override and let Inertia build FormData
            router.post(
                route("articles.update", datas.id),
                { ...data, _method: "PATCH" },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        console.log("✅ Article updated successfully!");
                    },
                    onError: (error) => {
                        console.error("❌ Update failed:", error);
                    },
                }
            );
        } else {
            // Create with POST; rely on form state
            router.post(
                route("articles.store"),
                data,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        reset();
                        setPreviewFile(null);
                        setPreviewAudio(null);
                        console.log("✅ Article created successfully!");
                    },
                }
            );
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
                        <h2 className="text-2xl font-semibold mb-4">
                            {isEdit ? "Edit Article" : "Add New Article"}
                        </h2>

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
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                    className="w-full border rounded-md px-3 py-2"
                                    placeholder="Enter article title"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Upload File
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileChange}
                                />
                                {previewFile && (
                                    <>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {data.file
                                                ? `Selected: ${data.file.name}`
                                                : `Current file: ${
                                                      resolveName(
                                                          datas?.file
                                                      ) || "Download"
                                                  }`}
                                        </p>
                                        {!data.file && (
                                            <a
                                                href={previewFile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline text-sm"
                                            >
                                                View current file
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Upload Audio
                                </label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                />
                                {previewAudio && (
                                    <audio
                                        key={previewAudio} // force reload when src changes
                                        src={previewAudio}
                                        controls
                                        preload="metadata"
                                        className="mt-2 border rounded-md"
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                {isEdit ? "Update Article" : "Create Article"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

