import React from "react";
import Modal from "@/Components/Modal";

/**
 * Modal showing list of previous homophone checks
 */
export default function HistoryModal({
    show,
    onClose,
    historyItems = [],
    loading = false,
    onViewItem,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="py-6">
                <div className="flex justify-between items-center mb-4 px-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Homophone History
                    </h3>
                    <button
                        className="text-gray-500  text-lg mr-2"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="text-gray-500">Loading history...</div>
                    </div>
                ) : historyItems.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="text-gray-500">No Homophone found.</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                        No
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Words
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Reading Time
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {historyItems.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-all duration-200 ease-in-out"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-600">
                                            {idx + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {item.title || "Untitled document"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700">
                                            {item.word_count ?? "0"}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700">
                                            {item.reading_time ?? "0"}s
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                className="rounded-xl border-2 border-blue-500 px-3 py-1 text-blue-700 hover:bg-blue-500  transition font-medium"
                                                onClick={() => onViewItem(item)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex justify-end px-6">
                    <button
                        onClick={onClose}
                        className="rounded-xl border-2 border-gray-500 px-4 py-1 text-gray-600 hover:bg-gray-500  transition font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
