import { useState } from "react";
import { usePage } from "@inertiajs/react";
import Chart from "react-apexcharts";
import { ArrowUpRight, FileText, CheckCircle2, Clock } from "lucide-react";
import HomophonePieCharts from "./HomophonePieCharts";
import RecentArticles from "./RecentArticles";

const monthlyData = [
    { month: "Monday", shipment: 80, delivery: 90 },
    { month: "Tuesday", shipment: 60, delivery: 45 },
    { month: "Wednesday", shipment: 70, delivery: 60 },
    { month: "Thursday", shipment: 40, delivery: 40 },
    { month: "Friday", shipment: 65, delivery: 80 },
    { month: "Saturday", shipment: 45, delivery: 65 },
    { month: "Sunday", shipment: 50, delivery: 70 },
];

export default function AnalyticsSection() {
    const { auth, quizAnalysis } = usePage().props; // quizAnalysis = array of user's attempts
    const user = auth?.user;

    // Calculate quiz performance
    const userAttempts =
        quizAnalysis?.filter((a) => a.user_id === user?.id) || [];
    const totalCorrect = userAttempts.reduce((sum, a) => sum + a.correct, 0);
    const totalIncorrect = userAttempts.reduce(
        (sum, a) => sum + a.incorrect,
        0
    );
    const totalQuestions = totalCorrect + totalIncorrect;
    const percentCorrect = totalQuestions
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    const data = [
        { day: "Monday", ignores: 80, accepts: 90 },
        { day: "Tuesday", ignores: 60, accepts: 45 },
        { day: "Wednesday", ignores: 70, accepts: 60 },
        { day: "Thursday", ignores: 40, accepts: 40 },
        { day: "Friday", ignores: 65, accepts: 80 },
        { day: "Saturday", ignores: 45, accepts: 65 },
        { day: "Sunday", ignores: 50, accepts: 70 },
    ];

    const options = {
        chart: {
            type: "line",
            toolbar: { show: false },
            fontFamily: "Inter, sans-serif",
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        colors: ["#3B82F6", "#BFDBFE"], // Blue-600 and Blue-200
        dataLabels: { enabled: false },
        grid: {
            borderColor: "#E5E7EB",
            strokeDashArray: 3,
        },
        xaxis: {
            categories: data.map((d) => d.day),
            labels: {
                style: { colors: "#6B7280", fontSize: "12px" },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (val) => `${val}%`,
                style: { colors: "#9CA3AF", fontSize: "12px" },
            },
        },
        legend: { show: false },
        tooltip: {
            theme: "light",
            y: {
                formatter: (val) => `${val}%`,
            },
        },
    };

    const series = [
        {
            name: "Accepts",
            data: data.map((d) => d.accepts),
        },
        {
            name: "Ignores",
            data: data.map((d) => d.ignores),
        },
    ];

    return (
        <div className="mb-8 mt-4">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Total Articles */}
                <div className="bg-white px-4 py-3 shadow-sm rounded-2xl border border-gray-100 flex flex-col hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-800 text-base font-semibold">
                            Articles
                        </p>
                        <FileText className="text-blue-500 w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">12</h2>
                        <span className="text-gray-400 text-xs">
                            Update Daily
                        </span>
                    </div>
                </div>

                {/* Accuracy */}
                <div className="bg-white px-4 py-3 shadow-sm rounded-2xl border border-gray-100 flex flex-col hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-800 text-base font-semibold">
                            Accuracy
                        </p>
                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">85%</h2>
                        <span className="text-gray-400 text-xs">
                            vs last week
                        </span>
                    </div>
                </div>

                {/* Improvement */}
                <div className="bg-white px-4 py-3 shadow-sm rounded-2xl border border-gray-100 flex flex-col hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-800 text-base font-semibold">
                            Improvement
                        </p>
                        <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Weekly
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">40%</h2>
                        <div className="flex items-center gap-1">
                            <ArrowUpRight className="text-green-500 w-4 h-4" />
                            <span className="text-gray-500 text-sm">
                                vs last week
                            </span>
                        </div>
                    </div>
                </div>

                {/* Feedbacks */}
                <div className="bg-white px-4 py-3 shadow-sm rounded-2xl border border-gray-100 flex flex-col hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-800 text-base font-semibold">
                            Practice Time
                        </p>
                        <Clock className="text-red-500 w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            3h:30mn
                        </h2>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            vs last month
                        </span>
                    </div>
                </div>
            </div>

            {/* Grammar Checker Statistics Card */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="mt-6 mb-4 bg-white rounded-2xl shadow-sm border w-full h-[55vh] border-gray-100 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Homophone Statistics
                            </h2>
                            <p className="text-sm text-gray-500">
                                Tracking total comparisons by Daily
                            </p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-600"></span>
                            <span className="text-sm text-gray-600">
                                Accepts
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-200"></span>
                            <span className="text-sm text-gray-600">
                                Ignores
                            </span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="flex h-60">
                        {/* Y-axis */}
                        <div className="w-10 h-full flex flex-col justify-between text-xs text-gray-400">
                            {[100, 75, 50, 25, 0].map((val) => (
                                <span key={val} className="leading-none">
                                    {val}%
                                </span>
                            ))}
                        </div>

                        {/* Chart Bars + Labels */}
                        <div className="flex-1 relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="border-t border-gray-200"
                                    ></div>
                                ))}
                            </div>

                            {/* Bars */}
                            <div className="relative flex items-end justify-between h-full px-2 z-10">
                                {monthlyData.map((data) => (
                                    <div
                                        key={data.month}
                                        className="flex flex-col items-center flex-1"
                                    >
                                        {/* Bars stacked side by side */}
                                        <div className="flex items-end gap-1 h-48">
                                            <div
                                                className="w-3 rounded-t-xl bg-blue-200 transition-all duration-300 hover:opacity-80"
                                                style={{
                                                    height: `${
                                                        data.shipment * 1.6
                                                    }px`,
                                                }}
                                                title={`Shipment: ${data.shipment}%`}
                                            ></div>
                                            <div
                                                className="w-3 rounded-t-xl bg-blue-600 transition-all duration-300 hover:opacity-80"
                                                style={{
                                                    height: `${
                                                        data.delivery * 1.6
                                                    }px`,
                                                }}
                                                title={`Delivery: ${data.delivery}%`}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* X-axis labels (fixed under bars) */}
                            <div className="flex justify-between mt-2 px-2">
                                {monthlyData.map((data) => (
                                    <span
                                        key={data.month}
                                        className="text-xs text-gray-500 flex-1 text-center"
                                    >
                                        {data.month}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 mb-4 bg-white rounded-2xl shadow-sm border w-full border-gray-100 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Graph Comparison Statistics
                            </h2>
                            <p className="text-sm text-gray-500">
                                Tracking total comparisons by Daily
                            </p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-600"></span>
                            <span className="text-sm text-gray-600">
                                Accepts
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-200"></span>
                            <span className="text-sm text-gray-600">
                                Ignores
                            </span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="w-full h-[280px] relative">
                        <div className="absolute inset-x-0 -left-4 -right-4">
                            <Chart
                                options={options}
                                series={series}
                                type="line"
                                height={280}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <HomophonePieCharts />

            <RecentArticles />
        </div>
    );
}
