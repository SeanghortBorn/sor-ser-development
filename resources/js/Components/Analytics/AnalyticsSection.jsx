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
    const [performanceGrowthPrevAvg, setPerformanceGrowthPrevAvg] =
        useState(null);
    const [growthLoaded, setGrowthLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [accuracyData, setAccuracyData] = useState([]);
    const [quizData, setQuizData] = useState([]);
    const [comparisonActivities, setComparisonActivities] = useState([]);

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
                setAccuracyData(items);

                // Filter to current month only
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const currentMonthItems = items.filter((item) => {
                    const itemDate = new Date(item.created_at);
                    return (
                        itemDate.getMonth() === currentMonth &&
                        itemDate.getFullYear() === currentYear
                    );
                });

                const validAccuracies = currentMonthItems
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
                setAccuracyData([]);
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
                setQuizData(items);

                // Filter to current month only
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const currentMonthItems = items
                    .filter((item) => !userId || item.user_id === userId)
                    .filter((item) => {
                        const itemDate = new Date(item.created_at);
                        return (
                            itemDate.getMonth() === currentMonth &&
                            itemDate.getFullYear() === currentYear
                        );
                    });

                setQuizAttemptCount(currentMonthItems.length);
                const validScores = currentMonthItems
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
                setQuizData([]);
            })
            .finally(() => setScoreLoaded(true));
    }, [userId]);

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

                // Filter to current month only
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const currentMonthItems = items.filter((item) => {
                    const itemDate = new Date(item.created_at);
                    return (
                        itemDate.getMonth() === currentMonth &&
                        itemDate.getFullYear() === currentYear
                    );
                });

                const validItems = currentMonthItems.filter(
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
            const dayAbbrMap = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
            ];
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

    // Fetch comparison activities for the current user (current month only)
    useEffect(() => {
        axios
            .get("/api/user-comparison-activities", {
                headers: { Accept: "application/json" },
                withCredentials: true,
            })
            .then((res) => {
                const items = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data ?? [];

                // Filter by current user ID and current month
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const userActivities = (
                    userId
                        ? items.filter((item) => item.user_id === userId)
                        : items
                ).filter((item) => {
                    const itemDate = new Date(item.created_at);
                    return (
                        itemDate.getMonth() === currentMonth &&
                        itemDate.getFullYear() === currentYear
                    );
                });

                setComparisonActivities(userActivities);
            })
            .catch(() => {
                setComparisonActivities([]);
            });
    }, [userId]);

    // Build dynamic lineData from comparison activities
    const buildDynamicLineData = () => {
        const counts = {
            incorrect: 0,
            missing: 0,
            correct: 0,
            extra: 0,
        };

        // Count by comparison_type
        comparisonActivities.forEach((activity) => {
            if (activity.comparison_type === "replaced") {
                counts.incorrect += 1;
            } else if (activity.comparison_type === "missing") {
                counts.missing += 1;
            } else if (activity.comparison_type === "extra") {
                counts.extra += 1;
            }
        });

        // Assume "correct" is total comparisons minus errors
        const totalComparisons = comparisonActivities.length;
        counts.correct = Math.max(
            0,
            totalComparisons -
                (counts.incorrect + counts.missing + counts.extra)
        );

        return [
            {
                id: "incorrect",
                label: "Incorrect",
                value: counts.incorrect,
                color: "hsl(232, 70%, 50%)",
            },
            {
                id: "missing",
                label: "Missing",
                value: counts.missing,
                color: "hsl(121, 70%, 50%)",
            },
            {
                id: "correct",
                label: "Correct",
                value: counts.correct,
                color: "hsl(245, 70%, 50%)",
            },
            {
                id: "extra",
                label: "Extra",
                value: counts.extra,
                color: "hsl(314, 70%, 50%)",
            },
        ];
    };

    const lineData = buildDynamicLineData();

    // Calculate overall accuracy percentage
    const calculateAccuracyPercentage = () => {
        const totalComparisons = comparisonActivities.length;
        if (totalComparisons === 0) return "0";

        const correctCount = comparisonActivities.filter((activity) => {
            return (
                activity.comparison_type !== "replaced" &&
                activity.comparison_type !== "missing" &&
                activity.comparison_type !== "extra"
            );
        }).length;

        const accuracy = (correctCount / totalComparisons) * 100;
        return accuracy.toFixed(1);
    };

    const hasData = comparisonActivities.length > 0;

    return (
        <div className="mb-8 mt-4">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-6 w-24 bg-slate-300 rounded"></div>
                                <div className="h-6 w-40 bg-slate-200 rounded mb-3"></div>
                            </div>
                        ) : (
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
                        )}
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
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-6 w-24 bg-slate-300 rounded"></div>
                                <div className="h-6 w-40 bg-slate-200 rounded mb-3"></div>
                            </div>
                        ) : (
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
                                        ? `${quizAttemptCount} quiz${
                                              quizAttemptCount !== 1
                                                  ? "zes"
                                                  : ""
                                          } completed`
                                        : "No quiz attempts"}
                                </p>
                            </div>
                        )}
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
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-6 w-24 bg-slate-300 rounded"></div>
                                <div className="h-6 w-40 bg-slate-200 rounded mb-3"></div>
                            </div>
                        ) : (
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
                        )}
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
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-6 w-24 bg-slate-300 rounded"></div>
                                <div className="h-6 w-40 bg-slate-200 rounded mb-3"></div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-lg font-bold text-green-600">
                                    {accuracyCount + quizAttemptCount}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Total Articles & Quizzes
                                </p>
                            </div>
                        )}
                    </div>
                </>
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
                                Comparison Accuracy Breakdown
                            </h2>
                            <p className="text-sm text-gray-500">
                                Distribution of comparison types (this month)
                            </p>
                        </div>
                    </div>
                    {hasData ? (
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
                    ) : (
                        <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <svg
                                className="w-12 h-12 text-gray-400 mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            <p className="text-gray-500 text-sm font-medium">
                                No comparison data available
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                Complete some grammar checks to see accuracy
                                breakdown
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <RecentArticles />
        </div>
    );
}
