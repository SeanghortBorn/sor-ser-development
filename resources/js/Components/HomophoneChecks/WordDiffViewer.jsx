import React, { memo } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

/**
 * WordDiffViewer Component
 *
 * Displays word-by-word comparison between original and user text.
 */
const WordDiffViewer = memo(({
    originalWords = [],
    userWords = [],
    differences = [],
    onWordClick,
}) => {
    const getWordStatus = (index) => {
        const diff = differences.find(d => d.index === index);
        if (!diff) return 'same';
        return diff.type; // 'same', 'different', 'missing', 'extra'
    };

    const getWordClass = (status) => {
        switch (status) {
            case 'same':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'different':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'missing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'extra':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'same':
                return <Check size={14} className="inline" />;
            case 'different':
                return <X size={14} className="inline" />;
            case 'missing':
            case 'extra':
                return <AlertCircle size={14} className="inline" />;
            default:
                return null;
        }
    };

    const maxLength = Math.max(originalWords.length, userWords.length);

    return (
        <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                    <span className="text-gray-700">Correct</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                    <span className="text-gray-700">Incorrect</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
                    <span className="text-gray-700">Missing</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
                    <span className="text-gray-700">Extra</span>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Original Text */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Original Text
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                        <div className="flex flex-wrap gap-2">
                            {originalWords.map((word, index) => {
                                const status = getWordStatus(index);
                                return (
                                    <span
                                        key={index}
                                        className={`
                                            px-2 py-1 rounded border text-sm font-mono
                                            ${getWordClass(status)}
                                            ${onWordClick ? 'cursor-pointer hover:opacity-75' : ''}
                                        `}
                                        onClick={() => onWordClick?.(index, 'original')}
                                        title={`Word ${index + 1}: ${word}`}
                                    >
                                        {word}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* User Text */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                        Your Text
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                        <div className="flex flex-wrap gap-2">
                            {userWords.map((word, index) => {
                                const status = getWordStatus(index);
                                return (
                                    <span
                                        key={index}
                                        className={`
                                            px-2 py-1 rounded border text-sm font-mono
                                            ${getWordClass(status)}
                                            ${onWordClick ? 'cursor-pointer hover:opacity-75' : ''}
                                        `}
                                        onClick={() => onWordClick?.(index, 'user')}
                                        title={`Word ${index + 1}: ${word}`}
                                    >
                                        {word}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Differences List */}
            {differences.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                        Differences ({differences.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        {differences.map((diff, idx) => (
                            <div
                                key={idx}
                                className={`p-2 rounded border text-sm ${getWordClass(diff.type)}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(diff.type)}
                                        <span className="font-medium">Position {diff.index + 1}</span>
                                    </div>
                                    <div className="text-xs opacity-75">
                                        {diff.type}
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs">
                                    <span className="font-mono">
                                        Expected: <strong>{diff.expected || '(none)'}</strong>
                                    </span>
                                    <span>→</span>
                                    <span className="font-mono">
                                        Got: <strong>{diff.actual || '(none)'}</strong>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

WordDiffViewer.displayName = 'WordDiffViewer';

export default WordDiffViewer;
