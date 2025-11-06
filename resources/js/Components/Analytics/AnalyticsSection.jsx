import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Chart from "react-apexcharts";
import { TrendingUp, BookOpen, Radar, BarChart3 } from "lucide-react";
import HomophonePieCharts from "./HomophonePieCharts";
import RecentArticles from "./RecentArticles";
import { ResponsivePie } from "@nivo/pie";
import axios from "axios";

export default function AnalyticsSection() {
    const { auth, quizAnalysis } = usePage().props;
    const user = auth?.user;
    const userId = user?.id;
    const [averageAccuracy, setAverageAccuracy] = useState(null);
    const [accuracyCount, setAccuracyCount] = useState(0);
    const [accuracyLoaded, setAccuracyLoaded] = useState(false);
    const [averageScore, setAverageScore] = useState(null);
    const [quizAttemptCount, setQuizAttemptCount] = useState(0);
    const [scoreLoaded, setScoreLoaded] = useState(false);
    const [performanceGrowth, setPerformanceGrowth] = useState(null);
    const [performanceGrowthRecords, setPerformanceGrowthRecords] = useState(0);
    const [performanceGrowthPrevAvg, setPerformanceGrowthPrevAvg] = useState(null);
    const [growthLoaded, setGrowthLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [accuracyData, setAccuracyData] = useState([]);
    const [quizData, setQuizData] = useState([]);

    useEffect(() => {
        let cancelled = false;
        axios
            .get("/api/user-homophone-accuracies", {
                headers: { Accept: "application/json" },
                withCredentials: true,
            })
            .then((res) => {
                const items = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data ?? [];
                setAccuracyData(items); // <-- ADD THIS LINE
                const validAccuracies = items
                    .map((item) => {
                        if (
                            item.accuracy === null ||
                            item.accuracy === undefined ||
                            item.accuracy === ""
                        ) {
                            return null;
                        }
                        return typeof item.accuracy === "number"
                            ? item.accuracy
                            : parseFloat(item.accuracy);
                    })
                    .filter((v) => v !== null && !isNaN(v));
                setAccuracyCount(validAccuracies.length);
                if (validAccuracies.length > 0) {
                    const avg =
                        validAccuracies.reduce((a, b) => a + b, 0) /
                        validAccuracies.length;
                    setAverageAccuracy(avg);
                } else {
                    setAverageAccuracy(null);
                }
            })
            .catch(() => {
                setAverageAccuracy(null);
                setAccuracyCount(0);
                setAccuracyData([]); // <-- ADD THIS LINE
            })
            .finally(() => setAccuracyLoaded(true));
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        axios
            .get("/api/quiz-attempts", {
                headers: { Accept: "application/json" },
                withCredentials: true,
            })
            .then((res) => {
                const items = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data ?? [];
                setQuizData(items); // <-- ADD THIS LINE
                setQuizAttemptCount(items.length);
                const validScores = items
                    .map((item) => {
                        const score =
                            typeof item.score === "number"
                                ? item.score
                                : parseInt(item.score);
                        let totalQuestions = 1;
                        try {
                            const answers = JSON.parse(item.answers);
                            if (Array.isArray(answers))
                                totalQuestions = answers.length;
                        } catch {}
                        if (totalQuestions > 0 && !isNaN(score)) {
                            return (score / totalQuestions) * 100;
                        }
                        return null;
                    })
                    .filter((v) => v !== null && !isNaN(v));
                if (validScores.length > 0) {
                    const avg =
                        validScores.reduce((a, b) => a + b, 0) /
                        validScores.length;
                    setAverageScore(avg);
                } else {
                    setAverageScore(null);
                }
            })
            .catch(() => {
                setAverageScore(null);
                setQuizAttemptCount(0);
                setQuizData([]); // <-- ADD THIS LINE
            })
            .finally(() => setScoreLoaded(true));
    }, []);

    useEffect(() => {
        axios
            .get("/api/user-homophone-accuracies", {
                headers: { Accept: "application/json" },
                withCredentials: true,
            })
            .then((res) => {
                const items = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data ?? [];
                const validItems = items.filter(
                    (item) =>
                        item.accuracy !== null &&
                        item.accuracy !== undefined &&
                        item.accuracy !== "" &&
                        item.created_at
                );
                setPerformanceGrowthRecords(validItems.length);
                validItems.sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
                let prevAvg = null;
                let lastAccuracy = null;
                if (validItems.length > 1) {
                    const prevAccuracies = validItems
                        .slice(0, -1)
                        .map((v) =>
                            typeof v.accuracy === "number"
                                ? v.accuracy
                                : parseFloat(v.accuracy)
                        )
                        .filter((v) => !isNaN(v));
                    prevAvg =
                        prevAccuracies.length > 0
                            ? prevAccuracies.reduce((a, b) => a + b, 0) /
                              prevAccuracies.length
                            : null;
                    lastAccuracy =
                        typeof validItems[validItems.length - 1].accuracy ===
                        "number"
                            ? validItems[validItems.length - 1].accuracy
                            : parseFloat(
                                  validItems[validItems.length - 1].accuracy
                              );
                } else if (validItems.length === 1) {
                    prevAvg = null;
                    lastAccuracy =
                        typeof validItems[0].accuracy === "number"
                            ? validItems[0].accuracy
                            : parseFloat(validItems[0].accuracy);
                }
                let growth = null;
                if (
                    prevAvg !== null &&
                    lastAccuracy !== null &&
                    prevAvg !== 0
                ) {
                    growth =
                        ((lastAccuracy - prevAvg) / Math.abs(prevAvg)) * 100;
                } else if (lastAccuracy !== null && prevAvg === null) {
                    growth = lastAccuracy;
                } else if (lastAccuracy !== null && prevAvg === 0) {
                    growth = lastAccuracy === 0 ? 0 : 100;
                } else {
                    growth = null;
                }
                setPerformanceGrowth(growth);
                setPerformanceGrowthPrevAvg(prevAvg);
            })
            .catch(() => {
                setPerformanceGrowth(null);
                setPerformanceGrowthRecords(0);
                setPerformanceGrowthPrevAvg(null);
            })
            .finally(() => setGrowthLoaded(true));
    }, []);

    useEffect(() => {
        if (accuracyLoaded && scoreLoaded && growthLoaded) {
            setIsLoading(false);
        }
    }, [accuracyLoaded, scoreLoaded, growthLoaded]);

    // Group data by day from API responses
    const buildDailyData = () => {
        const dayMap = {};

        // Initialize all 7 days
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        days.forEach((day) => {
            dayMap[day] = { articles: 0, quizzes: 0 };
        });

        // Helper to get day abbreviation from date
        const getDayAbbr = (dateString) => {
            const date = new Date(dateString);
            const dayIndex = date.getDay();
            const dayAbbrMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return dayAbbrMap[dayIndex];
        };

        // Group grammar checker records by day (filtered by user_id)
        if (Array.isArray(accuracyData)) {
            accuracyData
                .filter((record) => !userId || record.user_id === userId)
                .forEach((record) => {
                    const day = getDayAbbr(record.created_at);
                    if (dayMap[day]) {
                        dayMap[day].articles += 1;
                    }
                });
        }

        // Group quiz attempts by day (filtered by user_id)
        if (Array.isArray(quizData)) {
            quizData
                .filter((record) => !userId || record.user_id === userId)
                .forEach((record) => {
                    const day = getDayAbbr(record.created_at);
                    if (dayMap[day]) {
                        dayMap[day].quizzes += 1;
                    }
                });
        }

        return days.map((day) => ({
            day,
            articles: dayMap[day].articles,
            quizzes: dayMap[day].quizzes,
        }));
    };

    const data = buildDailyData();

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
        colors: ["#3B82F6", "#BFDBFE"],
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
                formatter: (val) => `${val}`,
                style: { colors: "#9CA3AF", fontSize: "12px" },
            },
        },
        legend: { show: false },
        tooltip: {
            theme: "light",
            y: {
                formatter: (val) => `${val}`,
            },
        },
    };

    const series = [
        {
            name: "Articles",
            data: data.map((d) => d.articles),
        },
        {
            name: "Quizzes",
            data: data.map((d) => d.quizzes),
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
                {isLoading ? (
                    // 🟦 Skeleton Loader - Matches card layout 1:1
                    [...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl px-3 py-3 border-l-4 border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 animate-pulse"
                        >
                            {/* Header: Title + Icon */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                <div className="h-7 w-7 bg-slate-300 rounded-lg"></div>
                            </div>

                            {/* Value */}
                            <div className="h-6 w-20 bg-slate-300 rounded mb-2"></div>

                            {/* Subtitle */}
                            <div className="h-4 w-40 bg-slate-200 rounded"></div>
                        </div>
                    ))
                ) : (
                    <>
                        {/* Accuracy all homophone*/}
                        <div className="bg-white px-3 pt-3 border-l-4 border-sky-100 shadow-sm rounded-xl flex flex-col hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-800 text-base font-semibold">
                                    Homophone Accuracy
                                </p>
                                <div className="text-blue-500">
                                    <Radar className="w-7 h-7" />
                                </div>
                            </div>
                            <div>
                                <h2
                                    className={`text-lg font-bold ${
                                        averageAccuracy !== null
                                            ? averageAccuracy < 50
                                                ? "text-red-600"
                                                : "text-green-600"
                                            : "text-blue-700"
                                    }`}
                                >
                                    {averageAccuracy !== null
                                        ? averageAccuracy.toFixed(2)
                                        : "00.00"}
                                    {" %"}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {accuracyCount > 0
                                        ? `Average of total articles`
                                        : "No accuracy data"}
                                </p>
                            </div>
                        </div>

                        {/* Average Score (%) */}
                        <div className="bg-white px-3 pt-3 border-l-4 border-amber-100 shadow-sm rounded-xl flex flex-col hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-800 text-base font-semibold">
                                    Average Score
                                </p>
                                <div className="text-blue-500">
                                    <BarChart3 className="w-7 h-7" />
                                </div>
                            </div>
                            <div>
                                <h2
                                    className={`text-lg font-bold ${
                                        averageScore !== null
                                            ? averageScore < 50
                                                ? "text-red-600"
                                                : "text-green-600"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {averageScore !== null
                                        ? averageScore.toFixed(2)
                                        : "00.00"}
                                    {" %"}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {quizAttemptCount > 0
                                        ? `Average of all completed quizzes`
                                        : "No quiz attempts"}
                                </p>
                            </div>
                        </div>

                        {/* Performance Growth */}
                        <div className="bg-white px-3 pt-3 border-l-4 border-emerald-100 shadow-sm rounded-xl flex flex-col hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-800 text-base font-semibold">
                                    Performance Growth
                                </p>
                                <div className="text-blue-500">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                            </div>
                            <div>
                                <h2
                                    className={`text-lg font-bold ${
                                        performanceGrowth !== null
                                            ? performanceGrowth >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {performanceGrowth !== null
                                        ? performanceGrowth.toFixed(2)
                                        : "00.00"}
                                    {" %"}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Updated Daily
                                </p>
                            </div>
                        </div>

                        {/* Study session*/}
                        <div className="bg-white px-3 pt-3 border-l-4 border-indigo-300 shadow-sm rounded-xl flex flex-col hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-800 text-base font-semibold">
                                    Study Sessions
                                </p>
                                <div className="text-blue-500">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-green-600">
                                    {accuracyCount + quizAttemptCount}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Total Articles & Quizzes
                                </p>
                            </div>
                        </div>
                    </>
                )}
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

                {/* Donut Chart */}
                <div className="mt-6 mb-4 bg-white rounded-2xl shadow-sm border w-full border-gray-100 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Overall Homophone Pair
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
                                innerRadius={0.5}
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
                                        itemTextColor: "#4B5563",
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

            <RecentArticles />
        </div>
    );
}
