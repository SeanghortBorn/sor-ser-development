import React, { memo, useState } from 'react';
import ComparisonResults from './ComparisonResults';
import WordDiffViewer from './WordDiffViewer';
import { Eye, List, X } from 'lucide-react';

/**
 * ComparisonSection Component
 *
 * Displays comparison results with word-by-word diff viewer.
 */
const ComparisonSection = memo(({
    comparisonData,
    onAccept,
    onDismiss,
    onClose,
    isProcessing = false,
}) => {
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'

    if (!comparisonData) {
        return null;
    }

    const {
        accuracy = 0,
        stats = {},
        article_words = [],
        user_words = [],
        differences = [],
    } = comparisonData;

    const totalWords = article_words.length;
    const correctWords = stats.same || 0;
    const incorrectWords = stats.different || 0;
    const missingWords = stats.missing || 0;
    const extraWords = stats.extra || 0;

    const canAccept = accuracy >= 70;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-sm max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Comparison Results
                    </h2>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('summary')}
                                className={`
                                    px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 ease-in-out
                                    flex items-center gap-1
                                    ${viewMode === 'summary'
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'text-gray-600 '
                                    }
                                `}
                            >
                                <Eye size={16} />
                                Summary
                            </button>
                            <button
                                onClick={() => setViewMode('detailed')}
                                className={`
                                    px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 ease-in-out
                                    flex items-center gap-1
                                    ${viewMode === 'detailed'
                                        ? 'bg-white text-gray-900 shadow'
                                        : 'text-gray-600 '
                                    }
                                `}
                            >
                                <List size={16} />
                                Detailed
                            </button>
                        </div>

                        {/* Close Button */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400  rounded-xl hover:bg-gray-100 transition-all duration-200 ease-in-out"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {viewMode === 'summary' ? (
                        <ComparisonResults
                            accuracy={accuracy}
                            totalWords={totalWords}
                            correctWords={correctWords}
                            incorrectWords={incorrectWords}
                            missingWords={missingWords}
                            extraWords={extraWords}
                            onAccept={onAccept}
                            onDismiss={onDismiss}
                            canAccept={canAccept}
                            isProcessing={isProcessing}
                        />
                    ) : (
                        <WordDiffViewer
                            originalWords={article_words}
                            userWords={user_words}
                            differences={differences}
                            onWordClick={(index, type) => {
                                console.log('Word clicked:', { index, type });
                                // Could implement highlighting or tooltips here
                            }}
                        />
                    )}
                </div>

                {/* Footer - Show action buttons in detailed view too */}
                {viewMode === 'detailed' && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-600">
                                Overall Accuracy: <strong className={`
                                    ${accuracy >= 90 ? 'text-green-600' :
                                      accuracy >= 80 ? 'text-blue-600' :
                                      accuracy >= 70 ? 'text-yellow-600' :
                                      'text-red-600'}
                                `}>
                                    {accuracy.toFixed(1)}%
                                </strong>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onAccept}
                                disabled={!canAccept || isProcessing}
                                className={`
                                    flex-1 py-3 px-4 rounded-xl font-medium text-white
                                    transition-all duration-200 ease-in-out flex items-center justify-center gap-2
                                    ${canAccept && !isProcessing
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-300 cursor-not-allowed'
                                    }
                                `}
                            >
                                {isProcessing ? 'Processing...' : 'Accept & Continue'}
                            </button>

                            <button
                                onClick={onDismiss}
                                disabled={isProcessing}
                                className={`
                                    flex-1 py-3 px-4 rounded-xl font-medium
                                    transition-all duration-200 ease-in-out
                                    ${isProcessing
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                Dismiss
                            </button>
                        </div>

                        {!canAccept && (
                            <p className="mt-3 text-xs text-center text-yellow-700 bg-yellow-50 p-2 rounded">
                                Need {(70 - accuracy).toFixed(1)}% more to unlock next article
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

ComparisonSection.displayName = 'ComparisonSection';

export default ComparisonSection;
