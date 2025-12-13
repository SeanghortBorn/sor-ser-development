import React from "react";
import Modal from "@/Components/Modal";
import StatsDisplay from "./StatsDisplay";

/**
 * Modal showing detailed statistics for current document
 */
export default function DetailsModal({
    show,
    onClose,
    docTitle,
    paragraph,
    lastSavedAt,
    statsData,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6 flex flex-col" style={{ maxHeight: "80vh" }}>
                {/* Header */}
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Article Name: {docTitle || "Untitled document"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Date:{" "}
                    {lastSavedAt ? new Date(lastSavedAt).toLocaleDateString() : "—"}
                </p>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Article content */}
                    <div className="grid grid-cols-1 gap-4 mb-4 text-sm text-gray-700">
                        <div>
                            <div className="font-medium text-slate-500">Your Article</div>
                            <div className="mt-1 bg-slate-50 p-3 rounded text-sm leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-auto">
                                {paragraph || ""}
                            </div>
                        </div>
                    </div>

                    {/* Stats Display */}
                    <StatsDisplay {...statsData} />
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="rounded-xl border-2 border-gray-300 px-6 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
