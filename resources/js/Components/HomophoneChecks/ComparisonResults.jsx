import React, { memo } from 'react';
import { CheckCircle, XCircle, TrendingUp, Award } from 'lucide-react';
import MetricCard from './MetricCard';

/**
 * ComparisonResults Component
 *
 * Displays comparison results summary with accuracy metrics.
 */
const ComparisonResults = memo(({
    accuracy = 0,
    totalWords = 0,
    correctWords = 0,
    incorrectWords = 0,
    missingWords = 0,
    extraWords = 0,
    onAccept,
    onDismiss,
    canAccept = true,
    isProcessing = false,
}) => {
    const getAccuracyLevel = () => {
        if (accuracy >= 90) return { label: 'Excellent', color: 'green', icon: <Award /> };
        if (accuracy >= 80) return { label: 'Good', color: 'blue', icon: <TrendingUp /> };
        if (accuracy >= 70) return { label: 'Fair', color: 'yellow', icon: <CheckCircle /> };
        return { label: 'Needs Improvement', color: 'red', icon: <XCircle /> };
    };

    const level = getAccuracyLevel();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Comparison Results
                </h2>
                <p className="text-gray-600">
                    Your typing has been compared with the original text
                </p>
            </div>

            {/* Overall Accuracy */}
            <div className="flex justify-center">
                <div className={`
                    inline-flex flex-col items-center justify-center
                    w-40 h-40 rounded-full border-8
                    ${level.color === 'green' ? 'border-green-500 bg-green-50' :
                      level.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                      level.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                      'border-red-500 bg-red-50'}
                `}>
                    <div className="text-4xl mb-1">{level.icon}</div>
                    <div className={`text-4xl font-bold ${
                        level.color === 'green' ? 'text-green-700' :
                        level.color === 'blue' ? 'text-blue-700' :
                        level.color === 'yellow' ? 'text-yellow-700' :
                        'text-red-700'
                    }`}>
                        {accuracy.toFixed(1)}%
                    </div>
                    <div className={`text-sm font-medium ${
                        level.color === 'green' ? 'text-green-600' :
                        level.color === 'blue' ? 'text-blue-600' :
                        level.color === 'yellow' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                        {level.label}
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard
                    label="Total Words"
                    value={totalWords}
                    color="gray"
                    size="md"
                />

                <MetricCard
                    label="Correct Words"
                    value={correctWords}
                    color="green"
                    icon={<CheckCircle />}
                    size="md"
                />

                <MetricCard
                    label="Incorrect Words"
                    value={incorrectWords}
                    color="red"
                    icon={<XCircle />}
                    size="md"
                />

                <MetricCard
                    label="Missing Words"
                    value={missingWords}
                    color="yellow"
                    size="md"
                />
            </div>

            {extraWords > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-700">
                        <span className="text-sm font-medium">
                            You typed {extraWords} extra word{extraWords !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onAccept}
                    disabled={!canAccept || isProcessing}
                    className={`
                        flex-1 py-3 px-4 rounded-xl font-medium text-white
                        transition-all duration-200 ease-in-out flex items-center justify-center gap-2
                        ${canAccept && !isProcessing
                            ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                            : 'bg-gray-300 cursor-not-allowed'
                        }
                    `}
                >
                    <CheckCircle size={20} />
                    <span>
                        {isProcessing ? 'Processing...' : 'Accept & Continue'}
                    </span>
                </button>

                <button
                    onClick={onDismiss}
                    disabled={isProcessing}
                    className={`
                        flex-1 py-3 px-4 rounded-xl font-medium
                        transition-all duration-200 ease-in-out flex items-center justify-center gap-2
                        ${isProcessing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                    `}
                >
                    <XCircle size={20} />
                    <span>Dismiss</span>
                </button>
            </div>

            {/* Requirement Message */}
            {accuracy < 70 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 text-center">
                        <strong>Note:</strong> You need at least 70% accuracy to unlock the next article.
                        {' '}You're {(70 - accuracy).toFixed(1)}% away from the goal.
                    </p>
                </div>
            )}

            {accuracy >= 70 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800 text-center">
                        <strong>Great job!</strong> You've met the minimum requirement.
                        {accuracy >= 90 && ' You achieved excellent accuracy!'}
                    </p>
                </div>
            )}
        </div>
    );
});

ComparisonResults.displayName = 'ComparisonResults';

export default ComparisonResults;
