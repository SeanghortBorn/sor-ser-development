import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Pencil, Trash2, Plus, Tags } from "lucide-react";
import TagModal from "./TagModal";
import axios from "axios";

export default function  TagsSection({ onTagUpdate })  { 
    const { auth } = usePage().props;
    const userId = auth?.user?.id;

    const tagColors = [
        "#EF4444", // Red - Urgent / Error
        "#F97316", // Orange - Warning / Highlight
        "#F59E0B", // Amber - Caution
        "#84CC16", // Lime - Growth / Success
        "#22C55E", // Green - Completed / Positive
        "#14B8A6", // Teal - Calm / Neutral
        "#06B6D4", // Cyan - Info / Tech
        "#3B82F6", // Blue - Primary / Study
        "#6366F1", // Indigo - Creative / Idea
        "#8B5CF6", // Violet - Advanced Topics
        "#EC4899", // Pink - Personal / Favorites
        "#F43F5E", // Rose - Special / Highlighted
    ];

    // Tag CRUD state
    const [tags, setTags] = useState([]);
    const [showTagModal, setShowTagModal] = useState(false);
    const [tagName, setTagName] = useState("");
    const [tagColor, setTagColor] = useState(tagColors[0]);
    const [editingTag, setEditingTag] = useState(null);
    const [saving, setSaving] = useState(false);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTag, setDeletingTag] = useState(null);

    // Fetch tags from backend (only tags created by this user)
    const fetchTags = () => {
        axios
            .get("/tags", { headers: { Accept: "application/json" } })
            .then((res) => {
                const allTags = res.data.data || [];
                const filteredTags = userId
                    ? allTags.filter((tag) => tag.user_id === userId)
                    : allTags;
                setTags(filteredTags);
            })
            .catch(() => setTags([]));
    };
    useEffect(() => {
        fetchTags();
    }, [userId]);

    // Open modal for create/edit
    const openTagModal = (tag = null) => {
        if (tag) {
            setEditingTag(tag);
            setTagName(tag.name);
            setTagColor(tag.color);
        } else {
            setEditingTag(null);
            setTagName("");
            setTagColor(tagColors[0]);
        }
        setShowTagModal(true);
    };

    // Modal close handler for tag modal
    const closeTagModal = () => {
        setShowTagModal(false);
        setEditingTag(null);
        setTagName("");
        setTagColor(tagColors[0]);
    };

    // Save tag (create or update)
    const saveTag = async (e) => {
        e.preventDefault();
        if (!tagName.trim()) return;
        setSaving(true);
        const payload = { name: tagName, color: tagColor, user_id: userId };
        try {
            if (editingTag) {
                await axios.patch(`/tags/${editingTag.id}`, payload);
                // Notify parent about tag edit
                if (onTagUpdate) {
                    onTagUpdate({
                        type: "edit",
                        tag: { ...editingTag, name: tagName, color: tagColor },
                    });
                }
            } else {
                await axios.post("/tags", payload);
            }
            setShowTagModal(false);
            fetchTags();
        } finally {
            setSaving(false);
        }
    };

    // Open delete confirmation modal
    const confirmDeleteTag = (tag) => {
        setDeletingTag(tag);
        setShowDeleteModal(true);
    };

    // Delete tag
    const handleDeleteTag = async (e) => {
        e.preventDefault();
        if (!deletingTag) return;
        await axios.delete(`/tags/${deletingTag.id}`);
        setShowDeleteModal(false);
        setDeletingTag(null);
        // Notify parent about tag delete
        if (onTagUpdate) {
            onTagUpdate({
                type: "delete",
                tagId: deletingTag.id,
            });
        }
        fetchTags();
    };

    return (
        <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[25px] text-blue-900 font-semibold">
                    Tags
                </h2>
                <button
                    className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-[10px] hover:bg-orange-600 transition"
                    onClick={() => openTagModal()}
                >
                    <Plus size={16} />
                    Create Tag
                </button>
            </div>
            <div className="tags-container">
                {tags.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {tags.map((tag) => (
                            <div
                                key={tag.id}
                                className="flex items-center px-4 py-3 mb-3 rounded-xl border-2 border-gray-200 shadow-sm"
                            >
                                <div
                                    className="w-6 h-6 rounded-md flex-shrink-0 transition-transform duration-300"
                                    style={{
                                        backgroundColor: tag.color,
                                    }}
                                ></div>
                                <p className="mx-3 mb-0 truncate font-medium">
                                    {tag.name}
                                </p>
                                <div className="flex-1"></div>
                                <button
                                    className="p-1 hover:bg-gray-100 rounded-md mr-1"
                                    onClick={() => openTagModal(tag)}
                                >
                                    <Pencil
                                        size={18}
                                        className="text-gray-500"
                                    />
                                </button>
                                <button
                                    className="p-1 hover:bg-gray-100 rounded-md"
                                    onClick={() => confirmDeleteTag(tag)}
                                >
                                    <Trash2
                                        size={18}
                                        className="text-red-500"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 text-center mb-9">
                        <Tags
                            size={32}
                            className="text-orange-500 mb-2 hover:text-orange-600 mx-auto"
                        />
                        <h3 className="text-[22px] font-semibold mb-2">
                            No tags yet
                        </h3>
                        <p className="text-gray-600">
                            Create tags to organize your flashcards and document
                        </p>
                        <button
                            className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-[10px] hover:bg-orange-400 transition"
                            onClick={() => openTagModal()}
                        >
                            <Plus size={16} />
                            Create First Tag
                        </button>
                    </div>
                )}
            </div>

            {/* Tag Create/Edit Modal */}
            {showTagModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeTagModal();
                    }}
                >
                    <form
                        onSubmit={saveTag}
                        className="bg-white rounded-2xl w-full max-w-md"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 pt-3 pb-2">
                            <h2 className="text-2xl font-semibold text-blue-900">
                                {editingTag ? "Edit Tag" : "Add Tag"}
                            </h2>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-1">
                            {/* Color Palette */}
                            <div className="w-full grid grid-cols-6 gap-3 mb-6">
                                {tagColors.map((color) => (
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        key={color}
                                        className={`w-9 h-9 rounded-md border-2 transition-all duration-150 focus:outline-none
                                    ${
                                        tagColor === color
                                            ? "border-blue-700 scale-110 shadow"
                                            : "border-gray-200"
                                    }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setTagColor(color)}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>

                            {/* Tag Name Input */}
                            <input
                                type="text"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                className="w-full rounded-xl border-none px-3 py-2.5 bg-blue-50 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 hover:bg-blue-100 focus:outline-none text-base mb-4"
                                placeholder="Tag Name"
                                required
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center px-6 pb-6">
                            <button
                                type="button"
                                onClick={closeTagModal}
                                disabled={saving}
                                className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !tagName.trim()}
                                className="rounded-[10px] px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                            >
                                {saving
                                    ? editingTag
                                        ? "Save..."
                                        : "Adding..."
                                    : editingTag
                                    ? "Save"
                                    : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget)
                            setShowDeleteModal(false);
                    }}
                >
                    <form
                        onSubmit={handleDeleteTag}
                        className="bg-white rounded-xl shadow-xl p-4 w-full max-w-xl"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-2xl font-semibold text-blue-900">
                                Delete this tag
                            </h2>
                        </div>
                        <p className="text-gray-500 mb-6 mt-2 text-base">
                            Are you sure you want to delete this tag? This
                            cannot be undone.
                        </p>

                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-[10px] px-9 py-1 bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60"
                            >
                                Delete
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}
