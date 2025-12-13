import React, { memo } from 'react';
import MetricCard from './MetricCard';
import { Target, TrendingUp, Clock, Award } from 'lucide-react';

/**
 * StatisticsPanel Component
 *
 * Displays session statistics and user performance metrics.
 */
const StatisticsPanel = memo(({
    currentAccuracy = 0,
    bestAccuracy = 0,
    totalWords = 0,
    correctWords = 0,
    incorrectWords = 0,
    timeSpent = 0,
    minRequired = 70,
    showTarget = true,
}) => {
    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 90) return 'green';
        if (accuracy >= 80) return 'blue';
        if (accuracy >= 70) return 'yellow';
        return 'red';
    };

    const meetsRequirement = currentAccuracy >= minRequired;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Session Statistics
                </h3>
                {showTarget && (
                    <div className="text-sm text-gray-600">
                        Target: {minRequired}%
                    </div>
                )}
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard
                    label="Current Accuracy"
                    value={currentAccuracy.toFixed(1)}
                    suffix="%"
                    color={getAccuracyColor(currentAccuracy)}
                    icon={<Target />}
                    size="lg"
                />

                <MetricCard
                    label="Best Accuracy"
                    value={bestAccuracy.toFixed(1)}
                    suffix="%"
                    color="green"
                    icon={<Award />}
                    size="lg"
                    trend={currentAccuracy > bestAccuracy ? 'up' : null}
                />
            </div>

            {/* Word Count Metrics */}
            <div className="grid grid-cols-3 gap-3">
                <MetricCard
                    label="Total Words"
                    value={totalWords}
                    color="gray"
                    size="sm"
                />

                <MetricCard
                    label="Correct"
                    value={correctWords}
                    color="green"
                    size="sm"
                />

                <MetricCard
                    label="Incorrect"
                    value={incorrectWords}
                    color="red"
                    size="sm"
                />
            </div>

            {/* Time Spent */}
            <MetricCard
                label="Time Spent"
                value={formatTime(timeSpent)}
                color="blue"
                icon={<Clock />}
                size="md"
            />

            {/* Requirement Status */}
            {showTarget && (
                <div className={`p-4 rounded-xl border-2 ${
                    meetsRequirement
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {meetsRequirement ? (
                            <>
                                <Award className="text-green-600" size={20} />
                                <span className="text-sm font-medium text-green-700">
                                    ✓ Meets minimum requirement ({minRequired}%)
                                </span>
                            </>
                        ) : (
                            <>
                                <TrendingUp className="text-yellow-600" size={20} />
                                <span className="text-sm font-medium text-yellow-700">
                                    Need {(minRequired - currentAccuracy).toFixed(1)}% more to unlock next article
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Progress Breakdown */}
            {totalWords > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                        Progress Breakdown
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                        <div
                            className="bg-green-500 transition-all"
                            style={{ width: `${(correctWords / totalWords) * 100}%` }}
                            title={`${correctWords} correct words`}
                        />
                        <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${(incorrectWords / totalWords) * 100}%` }}
                            title={`${incorrectWords} incorrect words`}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>{correctWords} correct</span>
                        <span>{incorrectWords} incorrect</span>
                    </div>
                </div>
            )}
        </div>
    );
});

StatisticsPanel.displayName = 'StatisticsPanel';

export default StatisticsPanel;
