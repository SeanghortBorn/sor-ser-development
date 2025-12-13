import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function LiveProgressBar({
    currentAccuracy,
    minRequired,
    bestAccuracy,
    isVisible,
    selectedArticle,
    comparisonAccuracy = 0,
    currentTypingSpeed = 0
}) {
    if (!isVisible) return null;

    // Get individual requirements from article settings
    const minTypedWords = selectedArticle?.min_typed_words_percentage || minRequired || 70;
    const minAccuracyRequired = selectedArticle?.min_completion_percentage;
    const minTypingSpeedRequired = selectedArticle?.min_typing_speed;

    // Check each condition
    const typingWordsMet = currentAccuracy >= minTypedWords;
    const accuracyMet = minAccuracyRequired ? comparisonAccuracy >= minAccuracyRequired : true;
    const typingSpeedMet = minTypingSpeedRequired ? currentTypingSpeed >= minTypingSpeedRequired : true;
    const allCriteriaMet = typingWordsMet && accuracyMet && typingSpeedMet;

    const progressPercentage = Math.min(100, (currentAccuracy / minTypedWords) * 100);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            {/* Compact Header with Status */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Progress to Unlock</h3>
                <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    allCriteriaMet ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {allCriteriaMet ? '✓ Ready' : 'In Progress'}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-200 mb-2">
                <div
                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                        typingMet ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
                        Typed: {currentAccuracy.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Inline Criteria */}
            <div className="space-y-1 text-xs">
                {/* Typed Words % - Always shown */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {typingWordsMet ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span className="text-gray-700">Typing</span>
                    </div>
                    <span className={typingWordsMet ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                        {currentAccuracy.toFixed(1)}% / {minTypedWords}%
                    </span>
                </div>

                {/* Accuracy % - Only shown if set */}
                {minAccuracyRequired && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            {accuracyMet ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            {/* <span className="text-gray-700">Accuracy</span> */}
                        </div>
                        <span className={accuracyMet ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                            {comparisonAccuracy.toFixed(1)}% / {minAccuracyRequired}%
                        </span>
                    </div>
                )}

                {/* Typing Speed - Only shown if set */}
                {minTypingSpeedRequired && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            {typingSpeedMet ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span className="text-gray-700">Typing Speed</span>
                        </div>
                        <span className={typingSpeedMet ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                            {currentTypingSpeed} / {minTypingSpeedRequired} WPM
                        </span>
                    </div>
                )}
            </div>

            {/* Compact Status Message */}
            <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-center text-gray-600">
                    {allCriteriaMet ? (
                        <span className="text-green-600 font-medium">Click "Save" to unlock next article!</span>
                    ) : (
                        <span>Complete all requirements above to unlock next article</span>
                    )}
                </p>
            </div>
        </div>
    );
}
