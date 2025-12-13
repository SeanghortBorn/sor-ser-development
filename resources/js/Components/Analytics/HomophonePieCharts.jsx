import React, { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Ensure React is available globally for recharts
if (typeof window !== 'undefined' && !window.React) {
    window.React = React;
}

const HomophoneCharts = () => {
    const [tooltip, setTooltip] = useState({
        show: false,
        text: "",
        x: 0,
        y: 0,
    });

    const metrics = [
        { name: "Accuracy", value: 82 },
        { name: "Incorrect", value: 75 },
        { name: "Missing", value: 68 },
        { name: "Pause Count", value: 74 },
        { name: "Avg Time", value: 80 },
    ];

    // Nivo Radar expects array of objects for each "series".
    const radarData = metrics.map((metric) => ({
        metric: metric.name,
        "Current Week": metric.value,
    }));

    const data = [
        {
            id: "incorrect",
            label: "Incorrect",
            value: 544,
            color: "hsl(232, 70%, 50%)",
        },
        {
            id: "missing",
            label: "Missing",
            value: 167,
            color: "hsl(121, 70%, 50%)",
        },
        {
            id: "correct",
            label: "Correct",
            value: 289,
            color: "hsl(245, 70%, 50%)",
        },
        {
            id: "extra",
            label: "Extra",
            value: 345,
            color: "hsl(314, 70%, 50%)",
        },
    ];

    const hideTooltip = () => setTooltip({ ...tooltip, show: false });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* === Radar Chart === */}
            <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 w-full h-[65vh] p-6 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Homophone Performance Radar
                        </h2>
                        <p className="text-sm text-gray-500">
                            Comparison across accuracy metrics
                        </p>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#E5E7EB" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                            <Radar
                                name="Current Week"
                                dataKey="Current Week"
                                stroke="#93c5fd"
                                fill="#93c5fd"
                                fillOpacity={0.6}
                                strokeWidth={2}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                            />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* === Donut Chart === */}
            <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 w-full h-[65vh] p-6 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Overall Articles Accuracy
                        </h2>
                        <p className="text-sm text-gray-500">
                            Comparison of detected mistake types
                        </p>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="flex flex-col items-center justify-center flex-1 relative">
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ label, value }) => `${label}: ${value}`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Center label */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-gray-800">
                            100%
                        </span>
                        <span className="text-xs text-gray-500 font-medium tracking-wide">
                            Overall Accuracy
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomophoneCharts;
