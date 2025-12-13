import React from "react";

/**
 * Modal displayed when user completes an article
 */
export default function CompletionModal({ show, completionData, onClose }) {
    if (!show || !completionData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg
                            className="h-10 w-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Article Completed!
                    </h3>

                    <div className="my-6">
                        <div className="text-6xl font-bold text-blue-600 mb-2">
                            {typeof completionData.accuracy === 'number'
                                ? completionData.accuracy.toFixed(1)
                                : completionData.accuracy}%
                        </div>
                        <div className="text-gray-600 text-sm">Accuracy Score</div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Total Time */}
                        <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-2xl font-bold text-gray-800">
                                {completionData.totalTimeSpent
                                    ? `${Math.floor(completionData.totalTimeSpent / 60)}:${(completionData.totalTimeSpent % 60).toString().padStart(2, '0')}`
                                    : '0:00'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Total Time</div>
                        </div>

                        {/* Deleted Characters */}
                        <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-2xl font-bold text-gray-800">
                                {completionData.deletedCharsCount || 0}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Deleted Chars</div>
                        </div>
                    </div>

                    {/* Deleted Characters Detail */}
                    {completionData.deletedCharsDetail && completionData.deletedCharsDetail.length > 0 && (
                        <details className="mb-6 text-left">
                            <summary className="cursor-pointer text-sm text-gray-700 font-medium ">
                                View Deleted Characters Detail ({completionData.deletedCharsDetail.length} deletions)
                            </summary>
                            <div className="mt-3 max-h-32 overflow-y-auto bg-gray-50 rounded-xl p-3 space-y-2">
                                {completionData.deletedCharsDetail.map((deletion, idx) => (
                                    <div key={idx} className="text-xs text-gray-600 border-b border-gray-200 pb-2 last:border-0">
                                        <span className="font-mono bg-red-100 text-red-700 px-1 rounded">
                                            "{deletion.characters}"
                                        </span>
                                        <span className="ml-2 text-gray-500">
                                            ({deletion.count} chars at position {deletion.position})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}

                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                        {completionData.message}
                    </p>

                    {completionData.unlocked_next && completionData.next_article && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                            <div className="text-sm text-blue-900 font-semibold mb-1">
                                🎉 New Article Unlocked!
                            </div>
                            <div className="text-blue-800 font-medium">
                                {completionData.next_article.title}
                            </div>
                        </div>
                    )}

                    {!completionData.unlocked_next && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                            <div className="text-sm text-yellow-900">
                                You need <strong>{completionData.min_required}%</strong> to
                                unlock the next article.
                                <br />
                                Keep practicing to improve your score!
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            onClose();
                            // Redirect or reload after a small delay to allow modal to close gracefully
                            setTimeout(() => {
                                if (completionData.redirect_url) {
                                    window.location.href = completionData.redirect_url;
                                } else {
                                    window.location.reload();
                                }
                            }, 300);
                        }}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all duration-200 ease-in-out"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
