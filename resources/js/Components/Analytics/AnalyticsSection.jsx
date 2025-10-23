import { useState } from "react";
import { usePage } from "@inertiajs/react";

const monthlyData = [
    { month: "Jan", shipment: 80, delivery: 90 },
    { month: "Feb", shipment: 60, delivery: 45 },
    { month: "Mar", shipment: 70, delivery: 60 },
    { month: "Apr", shipment: 40, delivery: 40 },
    { month: "May", shipment: 65, delivery: 80 },
    { month: "Jun", shipment: 45, delivery: 65 },
    { month: "Jul", shipment: 50, delivery: 70 },
    { month: "Aug", shipment: 60, delivery: 90 },
    { month: "Sep", shipment: 55, delivery: 25 },
    { month: "Oct", shipment: 65, delivery: 70 },
    { month: "Nov", shipment: 70, delivery: 90 },
    { month: "Dec", shipment: 75, delivery: 95 },
];

export default function AnalyticsSection() {
    const { auth, quizAnalysis } = usePage().props; // quizAnalysis = array of user's attempts
    const user = auth?.user;
    const [activeTab, setActiveTab] = useState("Quarterly");

    // Calculate quiz performance
    const userAttempts = quizAnalysis?.filter(a => a.user_id === user?.id) || [];
    const totalCorrect = userAttempts.reduce((sum, a) => sum + a.correct, 0);
    const totalIncorrect = userAttempts.reduce((sum, a) => sum + a.incorrect, 0);
    const totalQuestions = totalCorrect + totalIncorrect;
    const percentCorrect = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return (
        <div className="mb-8 mt-3">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Quiz Performance Card */}
                {/* <div className="bg-white px-3 py-3 shadow-sm rounded-xl border border-gray-100 flex flex-col gap-2">
                    <p className="text-gray-700 text-base font-medium">
                        Quiz Performance
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">{percentCorrect}%</h2>
                        <div className="flex flex-col text-right">
                            <span className="text-gray-500 text-sm">{user?.name}</span>
                            <span className="text-gray-400 text-xs">
                                Correct: {totalCorrect} | Incorrect: {totalIncorrect}
                            </span>
                        </div>
                    </div>
                </div> */}
                {/* Grammar Accuracy */}
                <div className="bg-white px-3 py-3 shadow-sm rounded-xl border border-gray-100 flex flex-col gap-2">
                    <p className="text-gray-700 text-base font-medium">
                        Grammar Accuracy
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">78%</h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-md font-medium bg-red-100 text-red-600">
                                -3%
                            </span>
                            <span className="text-gray-400 text-xs">
                                Vs last month
                            </span>
                        </div>
                    </div>
                </div>

                {/* Common Grammar Mistakes */}
                <div className="bg-white px-3 py-3 shadow-sm rounded-xl border border-gray-100 flex flex-col gap-2">
                    <p className="text-gray-700 text-base font-medium">
                        Grammar Mistakes
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">12</h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-600">
                                +2
                            </span>
                            <span className="text-gray-400 text-xs">
                                Vs last month
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visit Duration */}
                <div className="bg-white px-3 py-3 shadow-sm rounded-xl border border-gray-100 flex flex-col gap-2">
                    <p className="text-gray-700 text-base font-medium">
                        Visit Duration
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">40h</h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-600">
                                +7%
                            </span>
                            <span className="text-gray-400 text-xs">
                                Vs last month
                            </span>
                        </div>
                    </div>
                </div>

                {/* Total Feedbacks */}
                <div className="bg-white px-3 py-3 shadow-sm rounded-xl border border-gray-100 flex flex-col gap-2">
                    <p className="text-gray-700 text-base font-medium">
                        Feedbacks
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">20</h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-600">
                                +2
                            </span>
                            <span className="text-gray-400 text-xs">
                                Vs last month
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grammar Checker Statistics Card */}
            <div className="mt-6 mb-4 bg-white rounded-2xl shadow-sm border w-full h-[55vh] border-gray-100 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Grammar Checker Statistics
                        </h2>
                        <p className="text-sm text-gray-500">
                            Total number of deliveries 70.5K
                        </p>
                    </div>
                    <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                        Monthly
                    </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-200"></span>
                        <span className="text-sm text-gray-600">Ignores</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-600"></span>
                        <span className="text-sm text-gray-600">Accepts</span>
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
                                                height: `${data.shipment * 1.6}px`,
                                            }}
                                            title={`Shipment: ${data.shipment}%`}
                                        ></div>
                                        <div
                                            className="w-3 rounded-t-xl bg-blue-600 transition-all duration-300 hover:opacity-80"
                                            style={{
                                                height: `${data.delivery * 1.6}px`,
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
        </div>
    );
}
