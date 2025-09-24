import React from "react";

export default function TagModal({
    show,
    onClose,
    onSubmit,
    tagColors,
    tagColor,
    setTagColor,
    tagName,
    setTagName,
    saving,
    editingTag,
}) {
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <form
                onSubmit={onSubmit}
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
                        onClick={onClose}
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
    );
}
