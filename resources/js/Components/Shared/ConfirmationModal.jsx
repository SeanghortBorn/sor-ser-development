import React from 'react';
import Modal from '@/Components/Modal';

/**
 * Reusable confirmation modal component
 * Replaces 5+ duplicate modal implementations
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Handler for closing the modal
 * @param {function} onConfirm - Handler for confirmation
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} confirmStyle - Style variant for confirm button ("danger", "success", "primary")
 * @param {boolean} processing - Whether action is processing
 */
export default function ConfirmationModal({
    show = false,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    confirmStyle = "danger",
    processing = false,
}) {
    const getConfirmButtonClass = () => {
        const baseClass = "rounded-[10px] px-9 py-1 font-semibold hover:opacity-90 transition";

        switch (confirmStyle) {
            case 'danger':
                return `${baseClass} bg-red-600 text-white`;
            case 'success':
                return `${baseClass} bg-green-600 text-white`;
            case 'primary':
                return `${baseClass} bg-blue-600 text-white`;
            default:
                return `${baseClass} bg-red-600 text-white`;
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {title}
                </h2>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={getConfirmButtonClass()}
                        disabled={processing}
                    >
                        {processing ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
