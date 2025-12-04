import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getDistributionData, getComparisonCount, getAudioActivityCount } from "@/utils/homophoneUtils";

/**
 * Reusable component for displaying homophone statistics
 */
export default function StatsDisplay({
    comparisonActivities = [],
    accuracyStats = null,
    activityStats = null,
    audioActivities = [],
    loadingAccuracyStats = false,
    loadingActivityStats = false,
    loadingAudioActivities = false,
}) {
    const chartData = getDistributionData(comparisonActivities);

    return (
        <div className="mb-4">
            {/* Distribution Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Distribution Actions</h2>
                    <p className="text-gray-600 text-sm mt-1">Share of action by group</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value}`, name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Comparison Stats */}
            <div className="grid grid-cols-4 gap-4 text-sm text-slate-600 mt-4">
                <div>
                    Replaced:{" "}
                    <span className="font-medium text-green-700">
                        {getComparisonCount(comparisonActivities, "replaced", "accept")}
                    </span>
                    <span className="text-gray-400"> (a) / </span>
                    <span className="font-medium text-red-700">
                        {getComparisonCount(comparisonActivities, "replaced", "dismiss")}
                    </span>
                    <span className="text-gray-400"> (d)</span>
                </div>

                <div>
                    Missing:{" "}
                    <span className="font-medium text-green-700">
                        {getComparisonCount(comparisonActivities, "missing", "accept")}
                    </span>
                    <span className="text-gray-400"> (a) / </span>
                    <span className="font-medium text-red-700">
                        {getComparisonCount(comparisonActivities, "missing", "dismiss")}
                    </span>
                    <span className="text-gray-400"> (d)</span>
                </div>

                <div>
                    Extra:{" "}
                    <span className="font-medium text-green-700">
                        {getComparisonCount(comparisonActivities, "extra", "accept")}
                    </span>
                    <span className="text-gray-400"> (a) / </span>
                    <span className="font-medium text-red-700">
                        {getComparisonCount(comparisonActivities, "extra", "dismiss")}
                    </span>
                    <span className="text-gray-400"> (d)</span>
                </div>

                <div>
                    Accuracy:{" "}
                    <span className="font-medium text-gray-800">
                        {loadingAccuracyStats
                            ? "…"
                            : accuracyStats?.accuracy != null
                                ? `${Number(accuracyStats.accuracy).toFixed(2)}%`
                                : "0%"}
                    </span>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-4 gap-4 text-sm text-slate-600 mt-4">
                <div>
                    Avg Pause (s):{" "}
                    <span className="font-medium text-gray-800">
                        {loadingActivityStats
                            ? "…"
                            : activityStats?.avg_pause_duration != null
                                ? Number(activityStats.avg_pause_duration).toFixed(2)
                                : "0"}
                    </span>
                </div>

                <div>
                    Audio Plays:{" "}
                    <span className="font-medium text-blue-700">
                        {loadingAudioActivities
                            ? "…"
                            : getAudioActivityCount(audioActivities, "audio_play") || "0"}
                    </span>
                </div>

                <div>
                    Audio Pauses:{" "}
                    <span className="font-medium text-orange-700">
                        {loadingAudioActivities
                            ? "…"
                            : getAudioActivityCount(audioActivities, "audio_pause") || "0"}
                    </span>
                </div>

                <div>
                    Reading Time (s):{" "}
                    <span className="font-medium text-gray-800">
                        {accuracyStats?.reading_time_seconds ?? "0"}
                    </span>
                </div>
            </div>
        </div>
    );
}
