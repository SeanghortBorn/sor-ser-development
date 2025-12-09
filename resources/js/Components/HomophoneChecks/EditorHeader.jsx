import React, { memo } from 'react';
import { Save, Clock, FileText, Check } from 'lucide-react';

/**
 * EditorHeader Component
 *
 * Displays article title, word count, save status, and metadata.
 */
const EditorHeader = memo(({
    title,
    wordCount = 0,
    targetWordCount = 0,
    isSaving = false,
    lastSavedAt = null,
    readingTime = 0,
    onTitleChange,
    readOnly = false,
}) => {
    const formatLastSaved = (timestamp) => {
        if (!timestamp) return 'Not saved';

        const diff = Date.now() - new Date(timestamp).getTime();
        const seconds = Math.floor(diff / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const progress = targetWordCount > 0
        ? Math.min((wordCount / targetWordCount) * 100, 100)
        : 0;

    return (
        <div className="bg-white border-b border-gray-200 p-4">
            {/* Title */}
            <div className="mb-3">
                {readOnly ? (
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                ) : (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange?.(e.target.value)}
                        placeholder="Enter article title..."
                        className="text-2xl font-bold text-gray-900 w-full border-0 focus:ring-0 p-0"
                    />
                )}
            </div>

            {/* Metadata Row */}
            <div className="flex items-center justify-between text-sm">
                {/* Left side - Stats */}
                <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                        <FileText size={16} />
                        <span>
                            {wordCount} {wordCount === 1 ? 'word' : 'words'}
                        </span>
                        {targetWordCount > 0 && (
                            <span className="text-gray-400">
                                / {targetWordCount}
                            </span>
                        )}
                    </div>

                    {readingTime > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>~{readingTime} min read</span>
                        </div>
                    )}

                    {targetWordCount > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${
                                        progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs">{Math.round(progress)}%</span>
                        </div>
                    )}
                </div>

                {/* Right side - Save status */}
                <div className="flex items-center gap-2">
                    {isSaving ? (
                        <div className="flex items-center gap-1 text-blue-600">
                            <Save size={16} className="animate-pulse" />
                            <span>Saving...</span>
                        </div>
                    ) : lastSavedAt ? (
                        <div className="flex items-center gap-1 text-green-600">
                            <Check size={16} />
                            <span>{formatLastSaved(lastSavedAt)}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                            <Save size={16} />
                            <span>Not saved</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

EditorHeader.displayName = 'EditorHeader';

export default EditorHeader;
