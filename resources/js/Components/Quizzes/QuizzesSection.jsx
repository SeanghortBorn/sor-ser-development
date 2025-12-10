import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, TrendingUp, Target, Brain, Zap, Rocket } from "lucide-react";
import { usePage, Link } from "@inertiajs/react";
// TODO: Migrate to recharts
// import Chart from "react-apexcharts";

export default function QuizzesSection() {
    const { auth, quizSummary, quizDaily, recentQuizzes: recentFromProps, quizChange = [] } = usePage().props;

    const [canAccessLibrary, setCanAccessLibrary] = useState(() => {
        if (auth?.can?.["student"]) return true;
        if (typeof window !== "undefined" && window.__canAccessLibrary !== undefined)
            return window.__canAccessLibrary;
        return null;
    });

    useEffect(() => {
        if (canAccessLibrary !== null || !auth?.user) return;

        let cancelled = false;

        (async () => {
            try {
                const useAxios = typeof window !== "undefined" && window.axios;
                const res = useAxios
                    ? await window.axios.get("/library", {
                          headers: { "X-Requested-With": "XMLHttpRequest" },
                          validateStatus: () => true,
                      })
                    : await fetch("/library", {
                          credentials: "same-origin",
                          headers: { "X-Requested-With": "XMLHttpRequest" },
                      });

                const ok = useAxios ? res.status === 200 : res.ok;

                if (!cancelled) {
                    setCanAccessLibrary(ok);
                    if (typeof window !== "undefined") {
                        window.__canAccessLibrary = ok;
                    }
                }
            } catch {
                if (!cancelled) {
                    setCanAccessLibrary(false);
                    if (typeof window !== "undefined") {
                        window.__canAccessLibrary = false;
                    }
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [auth?.user?.id, canAccessLibrary]);

    // Dynamic daily data with fallback
    const rawData = useMemo(() => {
        const d = Array.isArray(quizDaily) ? quizDaily : [
            { day: "Monday", inProgress: 80, completed: 90 },
            { day: "Tuesday", inProgress: 60, completed: 45 },
            { day: "Wednesday", inProgress: 70, completed: 60 },
            { day: "Thursday", inProgress: 40, completed: 40 },
            { day: "Friday", inProgress: 65, completed: 80 },
            { day: "Saturday", inProgress: 45, completed: 65 },
            { day: "Sunday", inProgress: 50, completed: 70 },
        ];
        // Normalize keys for chart usage
        return d.map((x) => ({
            day: x.day,
            accepts: Number(x.completed ?? x.accepts ?? 0),
            ignores: Number(x.inProgress ?? x.ignores ?? 0),
            avgScore: Number(x.avgScore ?? 0),
        }));
    }, [quizDaily]);

    const { options, series } = useMemo(() => {
        const categories = rawData.map((d) => d.day);

        return {
            options: {
                chart: {
                    type: "line",
                    toolbar: { show: false },
                    fontFamily: "Inter, sans-serif",
                },
                stroke: {
                    curve: "smooth",
                    width: [3, 3, 2],
                },
                colors: ["#3B82F6", "#10B981"],
                dataLabels: { enabled: false },
                grid: {
                    borderColor: "#E5E7EB",
                    strokeDashArray: 3,
                },
                xaxis: {
                    categories,
                    labels: {
                        style: { colors: "#6B7280", fontSize: "12px" },
                    },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                },
                yaxis: [
                    {
                        title: { text: "Attempts" },
                        labels: {
                            formatter: (val) => `${Math.round(val)}`,
                            style: { colors: "#9CA3AF", fontSize: "12px" },
                        },
                    },
                    {
                        opposite: true,
                        title: { text: "Avg Score (%)" },
                        labels: {
                            formatter: (val) => `${Math.round(val)}%`,
                            style: { colors: "#9CA3AF", fontSize: "12px" },
                        },
                    },
                ],
                legend: { show: true },
                tooltip: {
                    theme: "light",
                    y: [
                        { formatter: (val) => `${Math.round(val)}` },
                        { formatter: (val) => `${Math.round(val)}` },
                        { formatter: (val) => `${Math.round(val)}%` },
                    ],
                },
            },
            series: [
                {
                    name: "Attempts (Completed)",
                    data: rawData.map((d) => d.accepts),
                },
                {
                    name: "Avg Score (%)",
                    data: rawData.map((d) => d.avgScore ?? 0),
                },
            ],
        };
    }, [rawData]);

    const recentQuizzes = useMemo(() => {
        if (Array.isArray(recentFromProps) && recentFromProps.length) return recentFromProps;
        return [
            { id: "#DF429", date: "April 28, 2016", status: "Complete", color: "green" },
            { id: "#HTY274", date: "October 30, 2017", status: "Complete", color: "green" },
            { id: "#LKE600", date: "May 29, 2017", status: "In Progress", color: "yellow" },
            { id: "#HRP447", date: "May 20, 2015", status: "Cancelled", color: "red" },
            { id: "#HRP448", date: "May 20, 2015", status: "Cancelled", color: "red" },
        ];
    }, [recentFromProps]);

    const statusColors = {
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-yellow-700",
        red: "bg-red-100 text-red-700",
    };

    // Stats configuration matching QuizList page style
    const stats = [
        { 
            title: "My Quizzes", 
            subtitle: "Total quizzes", 
            value: Number(quizSummary?.total ?? 0),
            icon: CheckCircle2,
            color: "text-blue-500",
            borderColor: "border-blue-100",
            bgColor: "bg-blue-50"
        },
        { 
            title: "Quizzes Completed", 
            subtitle: "Completed total quizzes", 
            value: Number(quizSummary?.completed ?? 0),
            icon: Target,
            color: "text-green-500",
            borderColor: "border-green-100",
            bgColor: "bg-green-50"
        },
        { 
            title: "Avg Score (7d)", 
            subtitle: "Average score over last 7 days", 
            value: `${Math.round(Number(quizSummary?.avgScore7d ?? 0))}%`,
            icon: TrendingUp,
            color: "text-orange-500",
            borderColor: "border-orange-100",
            bgColor: "bg-orange-50"
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-2 mb-12">
            {auth.user ? (
                <div className="relative">
                    {/* Header */}
                    <div className="space-y-3 mb-9">
                        <h1 className="text-xl font-semibold text-gray-600 text-start">
                            Quiz Practices for Students
                        </h1>
                        <p className="text-gray-600 text-md text-start">
                            SorSer's Quiz Maker offers students ready-made quizzes designed for
                            exams, lessons, and daily practice.
                        </p>
                    </div>

                    {/* Main Content - Blurred if no access */}
                    <section className={`${canAccessLibrary === false ? "blur-sm pointer-events-none" : ""}`}>
                        {/* Stats Cards - Updated with QuizList style */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {stats.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={i}
                                        className={`bg-white px-3 pb-2 pt-3 border-l-4 ${stat.borderColor} shadow-sm rounded-xl flex flex-col hover:shadow-md transition-all duration-200`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-800 text-base font-semibold">
                                                {stat.title}
                                            </p>
                                            <div className={stat.color}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <div className="">
                                            <h2 className="text-lg font-bold text-gray-900">
                                                {stat.value}
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {stat.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts + Recent Quizzes */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Chart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Completed Quiz Analysis
                                        </h2>
                                        <p className="text-sm text-gray-500">Tracking total quizzes by Daily</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                                        <span className="text-sm text-gray-600">Completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-200"></span>
                                        <span className="text-sm text-gray-600">In Progress</span>
                                    </div>
                                </div>

                                <div className="h-[280px]">
                                    <Chart options={options} series={series} type="line" height={280} />
                                </div>
                            </div>

                            {/* Recent Quizzes Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-800">Recent Quizzes</h2>
                                    <p className="text-sm text-gray-500">Your latest quiz history</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                                    Serial No.
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                                    Score
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentQuizzes.map((quiz) => (
                                                <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                        {quiz.id}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">{quiz.date}</td>
                                                    <td className="px-4 py-3 text-gray-700">{quiz.score ?? '-'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                                                statusColors[quiz.color]
                                                            }`}
                                                            title={`Score: ${quiz.score ?? '-'}%`}
                                                        >
                                                            {quiz.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Per-Quiz Day-over-Day Change */}
                            {/* <div className="mt-5 border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-800">Per-Quiz Day-over-Day Change</h3>
                                    <span className="text-xs text-gray-500">Today vs Yesterday</span>
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {(quizChange || []).slice(0,5).map((q) => (
                                        <li key={q.quiz_id} className="py-2 flex items-center justify-between" title={`Today: ${q.today} • Yesterday: ${q.yesterday}`}>
                                            <span className="text-sm text-gray-700 truncate pr-3">{q.title}</span>
                                            <span className={`text-sm font-medium ${q.changePercent7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {q.changePercent7d >= 0 ? '+' : ''}{q.changePercent7d}%
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div> */}
                        </div>
                    </section>

                    {/* Access Denied Modal Overlay */}
                    {canAccessLibrary === false && (
                        <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center z-10 rounded-2xl">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-xl mx-4">
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                        Upgrade to Access Quiz Practices
                                    </h2>
                                    <p className="text-gray-600 text-base leading-relaxed mb-6">
                                        You need the Student permission to access Quiz Practices. Contact your
                                        administrator or upgrade your account.
                                    </p>

                                    <div className="space-y-3">
                                        <Link
                                            href={route("profile.edit")}
                                            className="block w-full px-4 py-3 border-2 border-blue-500 rounded-2xl text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                                        >
                                            Go to Profile
                                        </Link>
                                        <Link
                                            href={route("contacts")}
                                            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Contact Support
                                        </Link>
                                    </div>

                                    <div className="mt-6">
                                        <Link method="post" href={route("logout")} as="button">
                                            <span className="text-red-500 font-medium hover:underline">
                                                Sign Out
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Guest View */
                <>
                    <div className="text-center mb-12">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-600">
                            Triple your productivity with the{" "}
                            <span className="text-blue-500 font-semibold">Quiz Practices</span>
                        </h1>
                        <p className="text-gray-600 mt-3 max-w-4xl mx-auto leading-relaxed">
                            SorSer's Quiz Maker offers students ready-made quizzes designed for exams,
                            lessons, and daily practice. Each quiz is customized based on the student's
                            role and subject to make learning more effective.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
                        {/* Left Feature */}
                        <div className="bg-gray-100 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Brain className="text-pink-500" size={28} />
                                <h2 className="text-xl font-semibold text-gray-600">
                                    Website at Every Step
                                </h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                SorSer's application helps students at every step by providing quizzes
                                made by Teachers. Students can take quizzes, check results, and get
                                instant feedback.
                            </p>

                            <div className="bg-white border rounded-xl p-4">
                                <p className="text-gray-500 text-sm font-medium mb-2">Quiz Example:</p>
                                <div className="p-3 rounded-xl border border-gray-200">
                                    <p className="font-medium text-gray-800 mb-2">
                                        What key difference distinguishes isotopes?
                                    </p>
                                    <ul className="text-sm text-gray-700 space-y-2">
                                        <li>
                                            <span className="underline decoration-red-500 decoration-2 underline-offset-4">
                                                Different electrons
                                            </span>
                                        </li>
                                        <li>
                                            <span className="underline decoration-green-500 decoration-2 underline-offset-4">
                                                <strong>Different neutrons</strong>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Right Features */}
                        <div className="space-y-9">
                            <div className="bg-gray-100 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Zap className="text-orange-500" size={28} />
                                    <h2 className="text-xl font-semibold text-gray-600">
                                        Lightning Fast
                                    </h2>
                                </div>
                                <p className="text-gray-600">
                                    Access quizzes in seconds. No setup needed — just log in and start
                                    practicing instantly.
                                </p>
                            </div>

                            <div className="bg-gray-100 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Rocket className="text-pink-500" size={28} />
                                    <h2 className="text-xl font-semibold text-gray-600">
                                        Features for Everyone
                                    </h2>
                                </div>
                                <p className="text-gray-600">
                                    Teachers can{" "}
                                    <Link href="/quizzes" className="text-blue-600 hover:underline">
                                        create and manage quizzes
                                    </Link>
                                    , while students review answers and track progress — all in one
                                    platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}