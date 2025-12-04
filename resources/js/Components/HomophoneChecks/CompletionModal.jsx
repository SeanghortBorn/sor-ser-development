import React from "react";

/**
 * Modal displayed when user completes an article
 */
export default function CompletionModal({ show, completionData, onClose }) {
    if (!show || !completionData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
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
                            {completionData.accuracy}%
                        </div>
                        <div className="text-gray-600 text-sm">Accuracy Score</div>
                    </div>

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
                            if (completionData.redirect_url) {
                                window.location.href = completionData.redirect_url;
                            }
                        }}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
