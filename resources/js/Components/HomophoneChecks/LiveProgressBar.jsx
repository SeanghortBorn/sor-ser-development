import React from 'react';

export default function LiveProgressBar({
    currentAccuracy,
    minRequired,
    bestAccuracy,
    isVisible
}) {
    if (!isVisible) return null;

    const progressPercentage = Math.min(100, (currentAccuracy / minRequired) * 100);
    const willUnlock = currentAccuracy >= minRequired;
    const remaining = Math.max(0, minRequired - currentAccuracy);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                    Current Progress
                </h3>
                <div className="flex gap-3 text-xs">
                    <span className="text-gray-600">
                        Current: <span className="font-semibold text-blue-600">{currentAccuracy.toFixed(1)}%</span>
                    </span>
                    {bestAccuracy > 0 && (
                        <span className="text-gray-600">
                            Best: <span className="font-semibold text-green-600">{bestAccuracy.toFixed(1)}%</span>
                        </span>
                    )}
                    <span className="text-gray-600">
                        Required: <span className="font-semibold text-purple-600">{minRequired}%</span>
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                {/* Current Progress Fill */}
                <div
                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                        willUnlock
                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                            : 'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                />

                {/* Required Threshold Line */}
                <div
                    className="absolute top-0 h-full w-0.5 bg-purple-600 z-10"
                    style={{ left: '100%' }}
                >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-600 rounded-full" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-600 rounded-full" />
                </div>

                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
                        {currentAccuracy.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Status Message */}
            <div className="mt-2 text-center">
                {willUnlock ? (
                    <p className="text-xs font-medium text-green-600">
                        Great! You've reached the required accuracy to unlock the next article!
                    </p>
                ) : (
                    <p className="text-xs text-gray-600">
                        {remaining.toFixed(1)}% more needed to unlock the next article
                    </p>
                )}
            </div>
        </div>
    );
}
