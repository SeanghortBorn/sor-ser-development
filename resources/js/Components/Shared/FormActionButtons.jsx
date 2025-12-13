import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Reusable form action buttons (Cancel + Submit)
 * Replaces duplicate Cancel + Submit button pairs in CreateEdit pages
 *
 * @param {string} cancelRoute - Route name for cancel button
 * @param {function} onCancel - Optional cancel handler (if not using Link)
 * @param {string} submitText - Text for submit button (default: "Save")
 * @param {boolean} processing - Whether form is processing
 * @param {string} className - Additional CSS classes
 */
export default function FormActionButtons({
    cancelRoute,
    onCancel,
    submitText = "Save",
    processing = false,
    className = "",
}) {
    return (
        <div className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-6 border-t border-gray-200 ${className}`}>
            {cancelRoute ? (
                <Link
                    href={route(cancelRoute)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-gray-600 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                >
                    Cancel
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-gray-600 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                >
                    Cancel
                </button>
            )}
            <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition shadow-sm"
                disabled={processing}
            >
                {processing ? "Saving..." : submitText}
            </button>
        </div>
    );
}
