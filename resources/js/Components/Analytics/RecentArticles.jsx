import { usePage } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";

export default function AnalyticsSection() {
    // read props with common fallbacks (snake_case or camelCase)
    const props = usePage().props || {};
    // prefer Inertia 'checkers' paginator, then older prop names
    const providedCheckers =
        props.checkers?.data ??
        props.checkers ??
        props.grammar_checkers ??
        props.grammarCheckers ??
        [];
    const user_homophone_accuracies =
        props.user_homophone_accuracies ?? props.userHomophoneAccuracies ?? [];
    const userId = props.auth?.user?.id ?? props.auth?.id ?? null;
    const serverPagination = !!props.checkers?.links; // true when backend sent a paginator

    // NEW: initialize state from server props when available
    const [grammarCheckersState, setGrammarCheckersState] = useState(
        Array.isArray(providedCheckers) ? providedCheckers : []
    );
    const [accuraciesState, setAccuraciesState] = useState(
        user_homophone_accuracies
    );
    const [loading, setLoading] = useState(false);

    // Modal state to show full article details
    const [showModal, setShowModal] = useState(false);
    const [modalItem, setModalItem] = useState(null);

    // New: recent comparison events for modal
    const [comparisonActivities, setComparisonActivities] = useState([]);
    const [loadingComparisonActivities, setLoadingComparisonActivities] =
        useState(false);
    // New: activity stats (avg pause etc.) for modal
    const [activityStats, setActivityStats] = useState(null);
    const [loadingActivityStats, setLoadingActivityStats] = useState(false);
    // New: audio activities for modal
    const [audioActivities, setAudioActivities] = useState([]);
    const [loadingAudioActivities, setLoadingAudioActivities] = useState(false);

    // fetch recent comparison events for a grammar_checker / article (best-effort)
    async function fetchComparisonActivities(
        grammarCheckerId = null,
        articleId = null
    ) {
        setLoadingComparisonActivities(true);
        setComparisonActivities([]);
        const sessionParam =
            typeof sessionStorage !== "undefined"
                ? sessionStorage.getItem("sessionId")
                : null;
        try {
            // correct endpoint: list of comparison events (user_comparison_activities)
            const res = await axios.get("/api/user-comparison-activities", {
                params: {
                    session_id: sessionParam || undefined,
                    grammar_checker_id: grammarCheckerId || undefined,
                    article_id: articleId || undefined,
                    limit: 200,
                },
                headers: { Accept: "application/json" },
                withCredentials: true,
            });
            const items = Array.isArray(res.data)
                ? res.data
                : res.data?.data ?? [];
            setComparisonActivities(Array.isArray(items) ? items : []);
        } catch (e) {
            setComparisonActivities([]);
        } finally {
            setLoadingComparisonActivities(false);
        }
    }

    // NEW: fetch activity stats (uses UserActivityController::getStats)
    async function fetchActivityStats(
        grammarCheckerId = null,
        articleId = null
    ) {
        setLoadingActivityStats(true);
        setActivityStats(null);
        const sessionParam =
            typeof sessionStorage !== "undefined"
                ? sessionStorage.getItem("sessionId")
                : null;
        const tryUrls = [
            "/api/user-activity-stats",
            "/api/user-activities/stats",
            "/api/track/stats",
            "/user-activity-stats",
        ];
        for (const url of tryUrls) {
            try {
                const res = await axios.get(url, {
                    params: {
                        session_id: sessionParam || undefined,
                        grammar_checker_id: grammarCheckerId || undefined,
                        article_id: articleId || undefined,
                    },
                    headers: { Accept: "application/json" },
                    withCredentials: true,
                });
                const data = res.data?.data ?? res.data ?? null;
                if (data && typeof data === "object") {
                    setActivityStats(data);
                    setLoadingActivityStats(false);
                    return data;
                }
            } catch (e) {
                // try next endpoint
            }
        }
        setLoadingActivityStats(false);
        return null;
    }

    // fetch audio activities for a grammar_checker (best-effort)
    async function fetchAudioActivities(grammarCheckerId = null) {
        setLoadingAudioActivities(true);
        setAudioActivities([]);
        try {
            const res = await axios.get("/api/user-audio-activities", {
                params: {
                    grammar_checker_id: grammarCheckerId || undefined,
                },
                headers: { Accept: "application/json" },
                withCredentials: true,
            });
            const items = Array.isArray(res.data)
                ? res.data
                : res.data?.data ?? [];
            setAudioActivities(Array.isArray(items) ? items : []);
        } catch (e) {
            setAudioActivities([]);
        } finally {
            setLoadingAudioActivities(false);
        }
    }

    // fetch comparison events when modal opens for the selected item
    useEffect(() => {
        if (!showModal || !modalItem) return;
        const grammarId = modalItem.raw?.id ?? modalItem.id;
        const articleId =
            modalItem.raw?.article_id ?? modalItem.raw?.articleId ?? null;
        // fetch both comparison events and activity stats
        fetchComparisonActivities(grammarId, articleId).catch(() => {});
        fetchActivityStats(grammarId, articleId).catch(() => {});
        fetchAudioActivities(grammarId).catch(() => {}); // NEW
    }, [showModal, modalItem]);

    // Fallback: try a single, non-API endpoint if server didn't provide data
    useEffect(() => {
        const hasProvided =
            Array.isArray(providedCheckers) && providedCheckers.length > 0;
        if (hasProvided) {
            // props provided -> ensure state reflects them
            setGrammarCheckersState(
                Array.isArray(providedCheckers) ? providedCheckers : []
            );
            setAccuraciesState(user_homophone_accuracies);
            return;
        }

        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const res = await axios.get("/grammar-checkers", {
                    headers: { Accept: "application/json" },
                    withCredentials: true,
                });
                if (cancelled) return;
                const data = res.data;
                const items = Array.isArray(data) ? data : data.data ?? [];
                if (Array.isArray(items)) setGrammarCheckersState(items);
            } catch (err) {
                // don't spam console on common 404/401; log unexpected errors once
                if (
                    err?.response &&
                    [401, 403, 404].includes(err.response.status)
                ) {
                    // expected when route isn't available as JSON — silent
                } else {
                    console.warn(
                        "Failed to fetch /grammar-checkers fallback:",
                        err?.message ?? err
                    );
                }
            }

            // NEW: fetch user accuracy records from the new endpoint if not provided
            try {
                const ares = await axios.get("/api/user-homophone-accuracies", {
                    headers: { Accept: "application/json" },
                    withCredentials: true,
                });
                const adata = ares.data;
                const aitems = Array.isArray(adata) ? adata : adata.data ?? [];
                if (Array.isArray(aitems) && aitems.length > 0) {
                    setAccuraciesState(aitems);
                }
            } catch (aerr) {
                // ignore 401/404; other errors logged once
                if (
                    aerr?.response &&
                    [401, 403, 404].includes(aerr.response.status)
                ) {
                    // silent
                } else {
                    console.warn(
                        "Failed to fetch accuracies:",
                        aerr?.message ?? aerr
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // include grammar_checkers that belong to the current user OR match the current article_id (if provided)
    const currentArticleId = props.article_id ?? props.articleId ?? null;
    const sorted = [...(grammarCheckersState || [])]
        .filter((g) => {
            // always keep items when no authenticated user (guest view)
            if (!userId) return true;
            // show items belonging to the current user only
            if (Number(g.user_id) === Number(userId)) return true;
            return false;
        })
        .sort((a, b) => {
            // Sort by ID in descending order (highest ID first = newest first)
            return Number(b.id) - Number(a.id);
        });

    const recentArticles = sorted.map((g) => {
        // find accuracy record for this user + grammar_checker (if any)
        const acc = userId
            ? (accuraciesState || []).find(
                  (r) =>
                      Number(r.grammar_checker_id) === Number(g.id) &&
                      Number(r.user_id) === Number(userId)
              )
            : null;

        const rawAccuracy = acc?.accuracy ?? null;
        const avgPauseRaw =
            acc?.avg_pause_duration ??
            acc?.reading_time_seconds ??
            g.reading_time ??
            null;

        // format date safely from created_at or updated_at
        let formattedDate = "0";
        const dateSource = g.created_at ?? g.updated_at ?? g.date;
        if (dateSource) {
            try {
                formattedDate = new Date(dateSource).toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }
                );
            } catch (e) {
                formattedDate = String(dateSource);
            }
        }

        return {
            id: g.id, // use numeric id as key
            title: g.title ?? `Article ${g.id}`,
            date: formattedDate,
            accuracy:
                rawAccuracy !== null && rawAccuracy !== undefined
                    ? `${Number(rawAccuracy).toFixed(2)}%`
                    : "0%",
            averagePause:
                avgPauseRaw !== null && avgPauseRaw !== undefined
                    ? `${avgPauseRaw}s`
                    : "0s",
            raw: g, // keep original record for modal detail
            _acc: acc ?? null, // keep matched accuracy for quick access
        };
    });

    // Pagination setup
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.max(
        1,
        Math.ceil(recentArticles.length / itemsPerPage)
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = recentArticles.slice(
        startIndex,
        startIndex + itemsPerPage
    );
    const itemsToRender = currentItems;

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    return (
        <div className="mb-8 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Recent Grammar Checks
                        </h2>
                        <p className="text-sm text-gray-500">
                            Your latest homophone checker history
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                        No.
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Words
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-6 text-center text-gray-500"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : itemsToRender.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-6 text-center text-gray-500"
                                        >
                                            No grammar checks found.
                                        </td>
                                    </tr>
                                ) : (
                                    itemsToRender.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-all duration-200 ease-in-out"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {recentArticles.length - (startIndex + index)}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {item.title ||
                                                    "Untitled document"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {item.date}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700">
                                                {item.raw?.word_count ?? 0}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setModalItem(item);
                                                        setShowModal(true);
                                                    }}
                                                    className="rounded-xl border-2 border-blue-500 px-3 py-1 text-blue-700 hover:bg-blue-500  transition font-medium"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && modalItem && (
                <Modal
                    show={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setModalItem(null);
                    }}
                    maxWidth="2xl"
                >
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                           Article Name: {modalItem.title}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Date: {modalItem.date}
                        </p>

                        {/* Article details from raw record */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4 text-sm text-gray-700">
                            <div>
                                <div className="font-medium text-slate-500">
                                    Paragraph
                                </div>
                                {/* Constrain long paragraphs and allow scrolling; preserve newlines */}
                                <div className="mt-1 bg-slate-50 p-3 rounded text-sm leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-auto">
                                    {modalItem.raw?.paragraph ?? "—"}
                                </div>
                            </div>
                        </div>

                        {/* Matched accuracy record details if available */}
                        <div className="mb-4">
                            <div className="font-medium text-slate-500 mb-2">
                                Recent Events
                            </div>
                            <div className="w-full bg-white border rounded-xl">
                                {loadingComparisonActivities ? (
                                    <div className="p-3 text-sm text-gray-500">
                                        Loading recent events…
                                    </div>
                                ) : comparisonActivities.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500">
                                        No recent events.
                                    </div>
                                ) : (
                                    <div className="max-h-40 overflow-y-auto hide-scrollbar">
                                        <table className="w-full text-sm divide-y">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-3 py-2 text-xs text-gray-500">
                                                        Type
                                                    </th>
                                                    <th className="text-left px-3 py-2 text-xs text-gray-500">
                                                        Action
                                                    </th>
                                                    <th className="text-left px-3 py-2 text-xs text-gray-500">
                                                        User word
                                                    </th>
                                                    <th className="text-left px-3 py-2 text-xs text-gray-500">
                                                        Article word
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comparisonActivities.map(
                                                    (act) => (
                                                        <tr
                                                            key={act.id}
                                                            className="odd:bg-white even:bg-gray-50"
                                                        >
                                                            <td className="px-3 py-2 text-xs text-gray-600">
                                                                {act.comparison_type ??
                                                                    " "}
                                                            </td>
                                                            <td className="px-3 py-2 text-xs">
                                                                <span
                                                                    className={`px-2 py-0.5 rounded-full text-xs ${
                                                                        act.action ===
                                                                        "accept"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-red-100 text-red-800"
                                                                    }`}
                                                                >
                                                                    {act.action ??
                                                                        " "}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-gray-700">
                                                                {act.user_word ??
                                                                    " "}
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-gray-700">
                                                                {act.article_word ??
                                                                    " "}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Stats Row - showing accuracy data with calculated counts */}
                            <div className="grid grid-cols-4 gap-4 text-sm text-slate-600 mt-4">
                                {/* Replaced Count - show accepted/dismissed */}
                                <div>
                                    Replaced:{" "}
                                    <span className="font-medium text-green-700">
                                        {comparisonActivities.filter(
                                            (act) => act.comparison_type === "replaced" && act.action === "accept"
                                        ).length}
                                    </span>
                                    <span className="text-gray-400"> (a) / </span>
                                    <span className="font-medium text-red-700">
                                        {comparisonActivities.filter(
                                            (act) => act.comparison_type === "replaced" && act.action === "dismiss"
                                        ).length}
                                    </span>
                                    <span className="text-gray-400"> (d) </span>
                                </div>

                                {/* Missing Count - show accepted/dismissed */}
                                <div>
                                    Missing:{" "}
                                    <span className="font-medium text-green-700">
                                        {comparisonActivities.filter(
                                            (act) => act.comparison_type === "missing" && act.action === "accept"
                                        ).length}
                                    </span>
                                    <span className="text-gray-400"> (a) / </span>
                                    <span className="font-medium text-red-700">
                                        {comparisonActivities.filter(
                                            (act) => act.comparison_type === "missing" && act.action === "dismiss"
                                        ).length}
                                    </span>
                                    <span className="text-gray-400"> (d) </span>
                                </div>

                                {/* Extra Count - show accepted/dismissed */}
                                <div>
                                    Extra:{" "}
                                    <span className="font-medium text-green-700">
                                        {comparisonActivities.filter(
                                            (act) => act.comparison_type === "extra" && act.action === "accept"
                                        ).length}
                                    </span>
                                    <span className="text-gray-400"> (a) / </span>
                                    <span className="font-medium text-red-700">
                                        {comparisonActivities.filter(
                                            (act) => act.comparison_type === "extra" && act.action === "dismiss"
                                        ).length}
                                    </span>
                                    <span className="text-gray-400"> (d) </span>
                                </div>

                                {/* Accuracy from user_homophone_accuracies table */}
                                <div>
                                    Accuracy:{" "}
                                    <span className="font-medium text-gray-800">
                                        {modalItem._acc?.accuracy != null
                                            ? `${Number(modalItem._acc.accuracy).toFixed(2)}%`
                                            : "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Additional Stats Row */}
                            <div className="grid grid-cols-4 gap-4 text-sm text-slate-600 mt-4">
                                {/* Avg Pause */}
                                <div>
                                    Avg Pause (s):{" "}
                                    <span className="font-medium text-gray-800">
                                        {loadingActivityStats
                                            ? "…"
                                            : activityStats?.avg_pause_duration !=
                                              null
                                            ? Number(
                                                  activityStats.avg_pause_duration
                                              ).toFixed(2)
                                            : modalItem._acc
                                                  ?.avg_pause_duration != null
                                            ? Number(
                                                  modalItem._acc
                                                      .avg_pause_duration
                                              ).toFixed(2)
                                            : "—"}
                                    </span>
                                </div>

                                {/* Audio Play Count */}
                                <div>
                                    Audio Plays:{" "}
                                    <span className="font-medium text-blue-700">
                                        {loadingAudioActivities
                                            ? "…"
                                            : audioActivities.filter(
                                                  (act) => act.activity_type === "audio_play"
                                              ).length || "0"}
                                    </span>
                                </div>

                                {/* Audio Pause Count */}
                                <div>
                                    Audio Pauses:{" "}
                                    <span className="font-medium text-orange-700">
                                        {loadingAudioActivities
                                            ? "…"
                                            : audioActivities.filter(
                                                  (act) => act.activity_type === "audio_pause"
                                              ).length || "0"}
                                    </span>
                                </div>

                                {/* Reading Time */}
                                <div>
                                    Reading Time (s):{" "}
                                    <span className="font-medium text-gray-800">
                                        {modalItem.raw?.reading_time ?? "0"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setModalItem(null);
                                }}
                                className="rounded-xl border-2 border-gray-300 px-6 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Pagination - simplified for debugging */}
            <div className="mt-4 px-6 py-4 border-t border-gray-100">
                {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            className="px-3 py-1.5 rounded-xl border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    className={`px-3 py-1.5 rounded-xl border transition ${
                                        page === currentPage
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="px-3 py-1.5 rounded-xl border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
