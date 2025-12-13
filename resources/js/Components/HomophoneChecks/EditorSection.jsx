import React, { memo, useState, useEffect } from 'react';
import EditorHeader from './EditorHeader';
import TextEditor from './TextEditor';
import LiveProgressBar from './LiveProgressBar';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

/**
 * EditorSection Component
 *
 * Complete editing section with header, editor, and progress tracking.
 */
const EditorSection = memo(({
    article,
    title,
    userText,
    onTitleChange,
    onTextChange,
    onSave,
    isSaving = false,
    lastSavedAt = null,
    isZoomed = false,
    onToggleZoom,
    onCheckText,
    isChecking = false,
    canCheck = true,
    showProgress = true,
    progress = {
        currentAccuracy: 0,
        minRequired: 70,
        bestAccuracy: 0,
        comparisonAccuracy: 0,
        currentTypingSpeed: 0,
    },
    autoSave = true,
    selectedArticle = null,
}) => {
    const [wordCount, setWordCount] = useState(0);
    const [readingTime, setReadingTime] = useState(0);

    // Calculate word count and reading time
    useEffect(() => {
        const words = userText.trim() ? userText.trim().split(/\s+/).length : 0;
        setWordCount(words);

        // Estimate reading time (average 200 words per minute)
        const minutes = Math.ceil(words / 200);
        setReadingTime(minutes);
    }, [userText]);

    const targetWordCount = article?.word_count || 0;
    const originalText = article?.content || '';

    const handleCheck = () => {
        if (canCheck && onCheckText && !isChecking) {
            onCheckText();
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset? This will clear all your text.')) {
            onTextChange('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Editor Header */}
            <EditorHeader
                title={title}
                wordCount={wordCount}
                targetWordCount={targetWordCount}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
                readingTime={readingTime}
                onTitleChange={onTitleChange}
                readOnly={!article}
            />

            {/* Live Progress Bar */}
            {showProgress && article && (
                <LiveProgressBar
                    currentAccuracy={progress.currentAccuracy}
                    minRequired={progress.minRequired}
                    bestAccuracy={progress.bestAccuracy}
                    comparisonAccuracy={progress.comparisonAccuracy}
                    currentTypingSpeed={progress.currentTypingSpeed}
                    selectedArticle={selectedArticle}
                    isVisible={true}
                    className="border-b border-gray-200"
                />
            )}

            {/* Text Editor */}
            <div className="flex-1 overflow-hidden">
                {article ? (
                    <TextEditor
                        value={userText}
                        onChange={onTextChange}
                        placeholder={`Start typing the article: "${article.title}"...\n\nOriginal text has ${targetWordCount} words.`}
                        disabled={isChecking}
                        autoSave={autoSave}
                        onSave={onSave}
                        isZoomed={isZoomed}
                        onToggleZoom={onToggleZoom}
                        minHeight="400px"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <Play size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Select an article to start typing</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            {article && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between gap-4">
                        {/* Info */}
                        <div className="text-sm text-gray-600">
                            {wordCount > 0 ? (
                                <span>
                                    Progress: {wordCount} / {targetWordCount} words
                                    {targetWordCount > 0 && (
                                        <span className="ml-2">
                                            ({Math.min(Math.round((wordCount / targetWordCount) * 100), 100)}%)
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span>Start typing to begin...</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {/* Reset Button */}
                            <button
                                onClick={handleReset}
                                disabled={!userText || isChecking}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center gap-2"
                                type="button"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>

                            {/* Check Button */}
                            <button
                                onClick={handleCheck}
                                disabled={!canCheck || isChecking || !userText.trim()}
                                className={`
                                    px-6 py-2 text-sm font-medium rounded-xl
                                    transition-all duration-200 ease-in-out flex items-center gap-2
                                    ${canCheck && !isChecking && userText.trim()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                                type="button"
                            >
                                {isChecking ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Check Text
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Hints */}
                    {!userText && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-xs text-blue-700">
                                💡 <strong>Tip:</strong> Type the article text as accurately as possible.
                                Your accuracy will be compared with the original text when you click "Check Text".
                            </p>
                        </div>
                    )}

                    {userText && wordCount < targetWordCount * 0.8 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-xs text-yellow-700">
                                ⚠️ <strong>Notice:</strong> You've typed {wordCount} words, but the article has {targetWordCount} words.
                                Try to type the complete article for best results.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

EditorSection.displayName = 'EditorSection';

export default EditorSection;
