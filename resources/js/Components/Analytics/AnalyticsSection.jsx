import { useState } from "react";
import { usePage } from "@inertiajs/react";
import Chart from "react-apexcharts";
import { ArrowUpRight, FileText, CheckCircle2, Clock } from "lucide-react";
import HomophonePieCharts from "./HomophonePieCharts";
import RecentArticles from "./RecentArticles";
import { ResponsivePie } from "@nivo/pie";

export default function AnalyticsSection() {
    const { auth, quizAnalysis } = usePage().props; // quizAnalysis = array of user's attempts
    const user = auth?.user;

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
            name: "Articles",
            data: data.map((d) => d.accepts),
        },
        {
            name: "Quizzes",
            data: data.map((d) => d.ignores),
        },
    ];

    const lineData = [
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
                <div className="mt-6 mb-4 bg-white rounded-2xl shadow-sm border w-full border-gray-100 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Statistics Analytics
                            </h2>
                            <p className="text-sm text-gray-500">
                                Tracking total performance by Daily
                            </p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-600"></span>
                            <span className="text-sm text-gray-600">
                                Articles
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-200"></span>
                            <span className="text-sm text-gray-600">
                                Quizzes
                            </span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="w-full h-[370px] relative">
                        <div className="absolute inset-x-0 -left-4 -right-4">
                            <Chart
                                options={options}
                                series={series}
                                type="line"
                                height={370}
                            />
                        </div>
                    </div>
                </div>

                {/* === Donut Chart === */}
                <div className="mt-6 mb-4 bg-white rounded-2xl shadow-sm border w-full border-gray-100 p-6">
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
                    <div className="flex flex-col items-center justify-center flex-1">
                        <div className="w-full h-[400px]">
                            <ResponsivePie
                                data={lineData}
                                margin={{
                                    top: 30,
                                    right: 80,
                                    bottom: 80,
                                    left: 80,
                                }}
                                innerRadius={0.5} // donut shape
                                padAngle={0.6}
                                cornerRadius={3}
                                activeOuterRadiusOffset={8}
                                arcLinkLabelsSkipAngle={10}
                                arcLinkLabelsTextColor="#333333"
                                arcLinkLabelsThickness={2}
                                arcLinkLabelsColor="#93c5fd"
                                arcLabelsSkipAngle={10}
                                arcLabelsTextColor={{
                                    from: "color",
                                    modifiers: [["darker", 2]],
                                }}
                                legends={[
                                    {
                                        anchor: "bottom",
                                        direction: "row",
                                        justify: false,
                                        translateX: 0,
                                        translateY: 56,
                                        itemsSpacing: 10,
                                        itemWidth: 90,
                                        itemHeight: 18,
                                        itemTextColor: "#4B5563", // gray-700
                                        symbolSize: 18,
                                        symbolShape: "circle",
                                    },
                                ]}
                            />
                        </div>
                        {/* Center label */}
                        <div className="absolute flex -mt-12 flex-col items-center justify-center pointer-events-none">
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
            {/* <HomophonePieCharts /> */}

            <RecentArticles />
        </div>
    );
}
