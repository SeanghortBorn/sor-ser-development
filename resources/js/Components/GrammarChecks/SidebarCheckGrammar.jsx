import React, { useState, useEffect } from "react";
import { Check, Trash, Info } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import Modal from "@/Components/Modal";

export default function SidebarCheckGrammar({
    text = "",
    onReplace,
    checkerId,
    comparisonResult,
    setComparisonResult,
    articleId,
    isChecking = false,
}) {
    const [dismissedItems, setDismissedItems] = useState([]);
    const [showExplainModal, setShowExplainModal] = useState(false);
    const [explainLoading, setExplainLoading] = useState(false);
    const [explainData, setExplainData] = useState(null);
    const [homophonesMap, setHomophonesMap] = useState(null);
    const [feedbackFor, setFeedbackFor] = useState(null);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackState, setFeedbackState] = useState("idle");
    const [feedbackError, setFeedbackError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [feedbackSent, setFeedbackSent] = useState([]);
    const [feedbackPrefix, setFeedbackPrefix] = useState("");
    const [lastSignature, setLastSignature] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [computedMetrics, setComputedMetrics] = useState(null);
    const [activityStats, setActivityStats] = useState(null);
    const [loadingActivityStats, setLoadingActivityStats] = useState(false);
    const MAX_RETRIES = 3;
    const page = usePage();
    const { auth } = page.props || {};

    const foundCorrections = [];

    const [canAccessLibrary, setCanAccessLibrary] = useState(() => {
        if (auth?.can?.["student"]) return true;
        if (
            typeof window !== "undefined" &&
            window.__canAccessLibrary !== undefined
        )
            return window.__canAccessLibrary;
        return null;
    });

    useEffect(() => {
        if (canAccessLibrary === true || !auth?.user) return;
        let cancelled = false;
        (async () => {
            try {
                const response = await fetch(
                    route("api.user.can-access-library"),
                    {
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                    }
                );
                const ok = response.ok;
                if (!cancelled) {
                    setCanAccessLibrary(ok);
                    if (typeof window !== "undefined")
                        window.__canAccessLibrary = ok;
                }
            } catch {
                if (!cancelled) {
                    setCanAccessLibrary(false);
                    if (typeof window !== "undefined")
                        window.__canAccessLibrary = false;
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [auth?.user, canAccessLibrary]);

    const handleCardClick = (idx) => {
        if (idx === 0 || !comparisonResult) return;
        const differences = comparisonResult.comparison.filter(
            (item) =>
                item.type === "missing" ||
                item.type === "replaced" ||
                item.type === "extra"
        );
        if (idx >= differences.length) return;
        const clicked = differences[idx];
        const reordered = [
            clicked,
            ...differences.slice(0, idx),
            ...differences.slice(idx + 1),
        ];
        const remaining = comparisonResult.comparison.filter(
            (it) =>
                it.type !== "missing" &&
                it.type !== "replaced" &&
                it.type !== "extra"
        );
        const newComparison = [...reordered, ...remaining];
        setComparisonResult({
            ...comparisonResult,
            comparison: newComparison,
        });
    };

    const submitFeedback = async (c) => {
        if (!feedbackText.trim() || feedbackState === "sending") return;
        const signature = `${checkerId || "none"}|${
            c.error
        }|${feedbackText.trim()}`;
        if (
            lastSignature === signature &&
            (feedbackState === "sent" || feedbackState === "sending")
        )
            return;

        setLastSignature(signature);
        setFeedbackState("sending");
        setFeedbackError(null);
        try {
            await axios.post(
                "/feedback",
                {
                    checker_id: checkerId || null,
                    error: c.error,
                    suggestion: c.suggestion,
                    message: feedbackText.trim(),
                },
                { headers: { Accept: "application/json" } }
            );
            setFeedbackSent((prev) =>
                prev.includes(c.error) ? prev : [...prev, c.error]
            );
            setFeedbackState("sent");
            setRetryCount(0);
            setFeedbackFor(null);
            setFeedbackText("");
            setFeedbackPrefix("");
            setTimeout(() => setFeedbackState("idle"), 50);
        } catch (e) {
            const serverMsg =
                e?.response?.data?.message || e?.message || "Unknown error";
            setFeedbackError(serverMsg);
            setFeedbackState("error");
        }
    };

    const manualRetry = (c) => {
        if (!feedbackText.trim()) return;
        setRetryCount((r) => (r < MAX_RETRIES ? r + 1 : r));
        submitFeedback(c);
    };

    const handleFeedbackChange = (e) => {
        let val = e.target.value;
        if (feedbackPrefix && !val.startsWith(feedbackPrefix)) {
            const after = val
                .slice(feedbackPrefix.length)
                .replace(/^[^]*?(?=)/, "");
            val = feedbackPrefix + after;
        }
        setFeedbackText(val);
    };

    const guardCaret = (el) => {
        if (!feedbackPrefix) return;
        if (el.selectionStart < feedbackPrefix.length) {
            el.setSelectionRange(feedbackPrefix.length, feedbackPrefix.length);
        }
    };

    const handleKeyDown = (e) => {
        if (!feedbackPrefix) return;
        const el = e.target;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const protect = () => {
            e.preventDefault();
            setTimeout(() => guardCaret(el), 0);
        };
        if (start < feedbackPrefix.length) {
            if (
                e.key.length === 1 ||
                e.key === "Backspace" ||
                e.key === "Delete" ||
                (e.key === "ArrowLeft" && start <= feedbackPrefix.length) ||
                e.key === "Home"
            ) {
                return protect();
            }
        }
        if (
            e.key === "Backspace" &&
            start === feedbackPrefix.length &&
            end === feedbackPrefix.length
        ) {
            return protect();
        }
    };

    const handleSelect = (e) => {
        guardCaret(e.target);
    };

    const handleComparisonAction = (item, action, skipUpdate = false) => {
        if (!item || !onReplace || !comparisonResult) return;

        axios
            .post("/api/track/comparison-action", {
                grammar_checker_id: checkerId,
                article_id: articleId ?? null,
                action,
                comparison_type: item.type,
                user_word: item.user_word?.user_word || "",
                article_word: item.article_word?.article_word || "",
                word_position:
                    item.user_word?.user_index ||
                    item.article_word?.article_index,
                session_id: sessionStorage.getItem("sessionId"),
            })
            .catch((err) =>
                console.error("Track comparison action error:", err)
            );

        let comparison = [...comparisonResult.comparison];
        let userWords = [...comparisonResult.user_words];
        const index = comparison.findIndex((comp) => comp === item);
        if (index === -1) return;

        if (action === "dismiss") {
            const itemId = `${item.type}-${
                item.user_word?.user_index || "none"
            }-${item.article_word?.article_index || "none"}`;
            setDismissedItems((prev) => [...prev, itemId]);
            comparison = comparison.filter((_, i) => i !== index);
        } else if (action === "accept") {
            if (item.type === "missing") {
                const position = item.article_word.article_index;
                userWords.splice(position, 0, item.actions.accept.result);
            } else if (item.type === "extra") {
                const position = item.user_word.user_index;
                if (typeof position === "number") {
                    userWords.splice(position, 1);
                }
            } else if (item.type === "replaced") {
                const userIdx = item.user_word.user_index;
                if (typeof userIdx === "number") {
                    userWords[userIdx] = item.actions.accept.result;
                }
            }
            comparison = comparison.filter((_, i) => i !== index);
        }

        const remainingDiffs = comparison.filter(
            (c) =>
                c.type === "missing" ||
                c.type === "replaced" ||
                c.type === "extra"
        );

        if (remainingDiffs.length === 0 && !skipUpdate) {
            // capture final metrics before clearing comparisonResult
            try {
                setComputedMetrics(
                    computeMetrics({
                        ...comparisonResult,
                        comparison,
                        user_words: userWords,
                    })
                );
            } catch (e) {
                // ignore metric compute errors
            }
            if (dismissedItems.length === 0) {
                userWords = [...comparisonResult.article_words];
            }
            setTimeout(() => {
                setComparisonResult(null);
                setDismissedItems([]);
            }, 500);
        } else {
            setComparisonResult({
                ...comparisonResult,
                comparison,
                user_words: userWords,
            });
        }

        if (!skipUpdate) {
            onReplace(userWords.join(" "));
        }
    };

    const handleAcceptAll = () => {
        if (!comparisonResult) return;

        // Determine the last non-missing index to avoid appending article-only tails
        const lastNonMissingIndex = Math.max(
            ...comparisonResult.comparison
                .filter(
                    (item) =>
                        item.type === "same" ||
                        item.type === "replaced" ||
                        item.type === "extra"
                )
                .map((item) => item.index_compared),
            -1
        );

        const finalWords = [];
        for (const comp of comparisonResult.comparison) {
            // Skip extras (user had extra words -> remove them)
            if (comp.type === "extra") {
                continue;
            }

            // For missing entries, only include those up to lastNonMissingIndex
            if (
                comp.type === "missing" &&
                comp.index_compared > lastNonMissingIndex
            ) {
                // skip article-only trailing words beyond meaningful diff window
                continue;
            }

            // For same / replaced / missing (within window), prefer the accepted result,
            // then fallback to article word, then user's word.
            const pushWord =
                (comp.actions &&
                    comp.actions.accept &&
                    comp.actions.accept.result) ||
                comp.article_word?.article_word ||
                comp.user_word?.user_word ||
                "";

            if (pushWord !== "") finalWords.push(pushWord);
        }

        // Apply merged result and clear UI
        onReplace(finalWords.join(" "));
        setComparisonResult(null);
        setDismissedItems([]);
    };

    // Normalize word: strip surrounding punctuation and lowercase
    const normalizeWord = (w) => {
        if (!w) return "";
        return String(w)
            .trim()
            .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "") // trim non-alnum at ends
            .toLowerCase();
    };

    // Fetch homophones JSON from backend endpoint and cache by normalized word
    const fetchHomophones = async () => {
        if (homophonesMap) return homophonesMap;
        setExplainLoading(true);

        // try public endpoints first so client can fetch without auth
        const tryUrls = [
            "/homophones.json",
            "/storage/homophones.json",
            "/homophones/json",
        ];

        let list = null;
        for (const url of tryUrls) {
            try {
                const res = await axios.get(url, {
                    headers: { Accept: "application/json" },
                });
                // support different shapes returned by endpoints
                list =
                    res.data?.homophones ??
                    res.data?.data ??
                    (Array.isArray(res.data) ? res.data : null);
                if (
                    !list &&
                    typeof res.data === "object" &&
                    Array.isArray(Object.values(res.data))
                ) {
                    list = Object.values(res.data);
                }
                if (Array.isArray(list)) break;
            } catch (err) {
                // ignore and try next
            }
        }

        const map = {};
        if (Array.isArray(list)) {
            list.forEach((entry) => {
                const key = normalizeWord(entry.word);
                if (key) map[key] = entry;
            });
        } else {
            console.warn(
                "fetchHomophones: no homophones list found at tried endpoints"
            );
        }

        setHomophonesMap(map);
        setExplainLoading(false);
        return map;
    };

    // Open explanation modal for a comparison item
    // For 'replaced' and 'missing' types prefer article_word when looking up JSON
    const openExplain = async (item) => {
        if (!item) return;
        setExplainData(null);
        setShowExplainModal(true);
        setExplainLoading(true);

        // Prefer article_word for replaced/missing, fallback to user_word
        const raw =
            (item.article_word && item.article_word.article_word) ||
            (item.user_word && item.user_word.user_word) ||
            "";
        const key = normalizeWord(raw);

        try {
            const map = await fetchHomophones();
            const found = key && map ? map[key] : null;
            if (found) {
                setExplainData(found);
            } else {
                setExplainData({ word: raw || key, notFound: true });
            }
        } catch (err) {
            setExplainData({ word: raw || key, notFound: true });
        } finally {
            setExplainLoading(false);
        }
    };

    const closeExplain = () => {
        setShowExplainModal(false);
        setExplainData(null);
    };

    const computeMetrics = (res) => {
        if (!res || !Array.isArray(res.comparison)) {
            return {
                replaced: 0,
                extra: 0,
                missing: 0,
                same: 0,
                total: 0,
                accuracy: null,
                avgPause: null,
            };
        }
        const comp = res.comparison;
        const replaced = comp.filter((c) => c.type === "replaced").length;
        const extra = comp.filter((c) => c.type === "extra").length;
        const missing = comp.filter((c) => c.type === "missing").length;
        const same = comp.filter((c) => c.type === "same").length;
        const total = Array.isArray(res.article_words)
            ? res.article_words.length
            : comp.length;
        const accuracy =
            total > 0 ? Math.round((same / total) * 10000) / 100 : null;
        // normalize and round avg pause to 2 decimals when available
        let rawAvg =
            res.metadata?.avg_pause_duration ?? res.metadata?.avgPause ?? null;
        const avgPause =
            rawAvg !== null &&
            rawAvg !== undefined &&
            !Number.isNaN(Number(rawAvg))
                ? Math.round(Number(rawAvg) * 100) / 100
                : null;
        return { replaced, extra, missing, same, total, accuracy, avgPause };
    };

    // helper to format numbers consistently (returns string or "—")
    const formatNumber = (v, decimals = 2) => {
        if (v === null || v === undefined || v === "") return "—";
        const n = Number(v);
        if (Number.isNaN(n)) return "—";
        return n.toFixed(decimals);
    };

    // keep computed metrics in state so they persist when comparisonResult is cleared
    useEffect(() => {
        if (comparisonResult) {
            setComputedMetrics(computeMetrics(comparisonResult));
        }
        // do not clear computedMetrics when comparisonResult becomes null so modal can show last metrics
    }, [comparisonResult]);

    // segmented text stats used for accurate Khmer word counts in modal/persistence
    const [segmentedTextStats, setSegmentedTextStats] = useState(null);
    const [loadingSegment, setLoadingSegment] = useState(false);

    // segmentation helper: try local "/segment" then fallback to known API paths
    async function segmentTokens(text) {
        if (!text || !text.trim()) return null;
        const tryUrls = ["/api/khmer-segment"];
        for (const url of tryUrls) {
            try {
                const res = await axios.post(
                    url,
                    { text },
                    { headers: { "Content-Type": "application/json" } }
                );
                const tokens =
                    res.data?.tokens ??
                    res.data?.data?.tokens ??
                    (Array.isArray(res.data) ? res.data : null);
                if (Array.isArray(tokens)) return tokens;
            } catch (err) {
                // try next
            }
        }
        return null;
    }

    // Fast synchronous stats for immediate UI rendering (fallback)
    const computeTextStatsSync = (input) => {
        const t = String(input || "").trim();
        const characters = t.length;
        const words = t ? t.split(/\s+/).filter(Boolean).length : 0;
        const sentences = t
            ? t
                  .split(/[.!?]+/)
                  .map((s) => s.trim())
                  .filter(Boolean).length
            : 0;
        const paragraphs = t
            ? t
                  .split(/\n+/)
                  .map((p) => p.trim())
                  .filter(Boolean).length
            : 0;
        const seconds = words > 0 ? Math.ceil((words / 200) * 60) : 0;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const readingTime = `${mins} m ${secs} s`;
        return {
            characters,
            words,
            sentences,
            paragraphs,
            readingTime,
            readingSeconds: seconds,
        };
    };

    // Async stats that attempts Khmer segmentation API, falls back to sync
    async function computeTextStatsAsync(input) {
        const t = String(input || "").trim();
        if (!t) return computeTextStatsSync(t);
        try {
            const tokens = await segmentTokens(t);
            const words = Array.isArray(tokens)
                ? tokens.length
                : t.split(/\s+/).filter(Boolean).length;
            const characters = t.length;
            const sentences = t
                ? t
                      .split(/[.!?]+/)
                      .map((s) => s.trim())
                      .filter(Boolean).length
                : 0;
            const paragraphs = t
                ? t
                      .split(/\n+/)
                      .map((p) => p.trim())
                      .filter(Boolean).length
                : 0;
            const seconds = words > 0 ? Math.ceil((words / 200) * 60) : 0;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const readingTime = `${mins} m ${secs} s`;
            return {
                characters,
                words,
                sentences,
                paragraphs,
                readingTime,
                readingSeconds: seconds,
            };
        } catch (e) {
            console.error("Khmer segmentation error:", e);
            return computeTextStatsSync(t);
        }
    }

    // Persist computed metrics to server (one record per user + grammar_checker)
    const [savingAccuracy, setSavingAccuracy] = useState(false);
    const saveTimeoutRef = React.useRef(null);

    const saveAccuracy = async (opts = {}) => {
        const metrics = computedMetrics ?? computeMetrics(comparisonResult);
        if (!metrics || metrics.total === 0) return null;
        // Require a grammar checker id to upsert properly
        if (!checkerId && !articleId) return null;

        // use Khmer-aware async stats for persisted counts (falls back to sync)
        const textStats = await computeTextStatsAsync(text);

        // Build payload matching AccuracyController::store validation
        const payload = {
            grammar_checker_id: checkerId ?? null,
            article_id: articleId ?? null,
            accuracy: metrics.accuracy ?? null,
            replaced_count: metrics.replaced ?? 0,
            extra_count: metrics.extra ?? 0,
            missing_count: metrics.missing ?? 0,
            avg_pause_duration:
                activityStats?.avg_pause_duration ?? metrics.avgPause ?? null,
            user_word_count: textStats.words ?? null,
            article_total_words: metrics.total ?? null,
            reading_time_seconds: textStats.readingSeconds ?? null,
        };

        // If avg_pause_duration is missing, try to fetch activity stats synchronously so we can include it
        if (payload.avg_pause_duration === null) {
            try {
                const fetched = await fetchActivityStats();
                if (fetched && typeof fetched.avg_pause_duration === "number") {
                    payload.avg_pause_duration = Number(
                        fetched.avg_pause_duration
                    );
                }
            } catch (err) {
                // ignore, proceed with null
            }
        }

        // Avoid concurrent saves
        if (savingAccuracy) return null;
        setSavingAccuracy(true);
        try {
            // Use web route so session cookie is available (authenticated user)
            await axios.post("/api/accuracy", payload, {
                headers: { Accept: "application/json" },
                withCredentials: true,
            });
            return true;
        } catch (e) {
            console.error("Save accuracy error:", e?.response?.data ?? e);
            return null;
        } finally {
            setSavingAccuracy(false);
        }
    };

    // Debounced wrapper to prevent many immediate POSTs
    const saveAccuracyDebounced = () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveAccuracy().catch(() => {});
        }, 700);
    };

    // AUTO-SAVE: trigger debounced save when metrics or relevant inputs change
    useEffect(() => {
        // Only auto-save when we have something meaningful to save and an upsert key
        const metrics = computedMetrics ?? computeMetrics(comparisonResult);
        if (!metrics || metrics.total === 0) return;
        if (!checkerId && !articleId) return;
        saveAccuracyDebounced();
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [computedMetrics, comparisonResult, text, checkerId, articleId]);

    // Fetch activity stats and compute segmented text stats when details modal opens
    useEffect(() => {
        if (!showDetailsModal) return;
        fetchActivityStats(checkerId).catch(() => {});
        let cancelled = false;
        setLoadingSegment(true);
        setSegmentedTextStats(null);
        computeTextStatsAsync(text)
            .then((s) => {
                if (!cancelled) setSegmentedTextStats(s);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingSegment(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDetailsModal, computedMetrics]);

    // NEW: fetch activity stats (best-effort) when requested
    async function fetchActivityStats(grammarCheckerId = null) {
        setLoadingActivityStats(true);
        setActivityStats(null);
        const tryUrls = [
            "/api/user-activity-stats",
            "/api/user-activities/stats",
            "/api/track/stats",
            "/user-activity-stats", // optional alternate paths
        ];
        // try to get session id from storage if available
        const sessionParam =
            typeof sessionStorage !== "undefined"
                ? sessionStorage.getItem("sessionId")
                : null;

        for (const url of tryUrls) {
            try {
                const params = {};
                if (sessionParam) params.session_id = sessionParam;
                if (grammarCheckerId)
                    params.grammar_checker_id = grammarCheckerId;
                if (articleId) params.article_id = articleId;

                const res = await axios.get(url, {
                    params,
                    headers: { Accept: "application/json" },
                });
                const data = res.data?.data ?? res.data ?? null;
                if (data && typeof data === "object") {
                    setActivityStats(data);
                    setLoadingActivityStats(false);
                    return data;
                }
            } catch (e) {
                // ignore and try next endpoint
            }
        }

        // no stats found
        setLoadingActivityStats(false);
        return null;
    }

    if (comparisonResult) {
        // computeMetrics still available as fallback; prefer computedMetrics state
        const metrics = computedMetrics ?? computeMetrics(comparisonResult);
        // use segmented stats if available (accurate Khmer count), otherwise fast sync stats for immediate UI
        const textStats = segmentedTextStats ?? computeTextStatsSync(text);

        // Filter differences to include only replaced, extra, and missing words up to the last same, replaced, or extra
        const differences = comparisonResult.comparison.filter(
            (item) =>
                item.type === "missing" ||
                item.type === "replaced" ||
                item.type === "extra"
        );

        // Find the last same, replaced, or extra word's index_compared
        const lastNonMissingIndex = Math.max(
            ...comparisonResult.comparison
                .filter(
                    (item) =>
                        item.type === "same" ||
                        item.type === "replaced" ||
                        item.type === "extra"
                )
                .map((item) => item.index_compared),
            -1
        );

        // Include missing words only up to lastNonMissingIndex
        const filteredDifferences = differences.filter(
            (item) =>
                item.type !== "missing" ||
                item.index_compared <= lastNonMissingIndex
        );

        return (
            <div className="w-96 rounded-xl border border-gray-200 bg-white h-[75vh] flex flex-col overflow-hidden shadow-sm">
                <div className="px-6 pt-4 pb-2 border-gray-200">
                    {/* Header */}
                    {isChecking ? (
                        <div className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm animate-pulse mb-3">
                            <div className="h-4 w-40 bg-slate-200 rounded"></div>
                            <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-gray-800 text-base font-semibold">
                                Comparison Results
                            </div>
                            {canAccessLibrary === true && (
                                <button
                                type="button"
                                onClick={() => setShowDetailsModal(true)}
                                className="inline-flex items-center px-3 py-1 border-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                            >
                                View details
                            </button>
                            )}
                        </div>
                    )}

                    {/* Filter Buttons */}
                    {isChecking ? (
                        <div className="flex items-center space-x-2 animate-pulse mb-1">
                            <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
                            <div className="h-8 w-28 bg-slate-200 rounded-lg"></div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <button className="text-sm text-blue-900 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                                All{" "}
                                <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                    {filteredDifferences.length}
                                </span>
                            </button>
                            <button className="text-sm text-green-600 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                                Differences{" "}
                                <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                    {filteredDifferences.length}
                                </span>
                            </button>
                        </div>
                    )}

                    <div className="border-b"></div>
                </div>

                <div className="space-y-2 px-4 py-0 mb-2 flex-1 overflow-y-auto hide-scrollbar">
                    {isChecking ? (
                        // 🟦 Skeleton Loader (replaces spinner)
                        <div className="space-y-4 animate-pulse">
                            {/* Header Skeleton */}
                            <div className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm">
                                <div className="h-4 w-40 bg-slate-200 rounded"></div>
                                <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                            </div>

                            {/* Repeated skeleton cards */}
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
                                >
                                    <div className="h-3 w-24 bg-slate-200 rounded mb-3"></div>
                                    <div className="flex space-x-2 mb-4">
                                        <div className="h-4 w-16 bg-slate-300 rounded"></div>
                                        <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                                        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Actual Comparison Results */}
                            {filteredDifferences.length > 0 && (
                                <div className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm">
                                    <span className="flex items-center">
                                        <span className="text-red-500 text-sm font-semibold">
                                            {filteredDifferences.length}{" "}
                                            differences
                                        </span>
                                        <span className="text-gray-600 text-sm ml-1">
                                            found
                                        </span>
                                    </span>
                                    <button
                                        className="border border-green-500 text-green-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-50 transition"
                                        onClick={handleAcceptAll}
                                    >
                                        Accept all
                                    </button>
                                </div>
                            )}

                            {/* Comparison Cards */}
                            {filteredDifferences.map((item, diffIndex) => (
                                <div
                                    key={`${item.index_compared}-${item.type}`}
                                    onClick={() => handleCardClick(diffIndex)}
                                    className={`bg-white rounded-xl p-3 border shadow-sm cursor-pointer transition ${
                                        diffIndex === 0
                                            ? "border-blue-500 border-2"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <p className="text-xs text-gray-500 font-medium mb-2">
                                        {item.type === "missing" &&
                                            "Missing Word"}
                                        {item.type === "replaced" &&
                                            "Replaced Word"}
                                        {item.type === "extra" && "Extra Word"}
                                    </p>

                                    <div className="mb-3">
                                        <span
                                            className={`line-through text-sm mr-2 ${
                                                diffIndex === 0
                                                    ? "text-red-500"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {typeof item.user_word
                                                ?.user_word === "string" &&
                                            item.user_word.user_word !== ""
                                                ? item.user_word.user_word
                                                : "<missing>"}
                                        </span>
                                        <span
                                            className={`text-sm font-semibold mr-2 ${
                                                diffIndex === 0
                                                    ? "text-green-600"
                                                    : "text-green-700"
                                            }`}
                                        >
                                            {item.article_word?.article_word ||
                                                "<missing>"}
                                        </span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full flex items-center text-xs font-medium transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleComparisonAction(
                                                    item,
                                                    "accept"
                                                );
                                            }}
                                        >
                                            <Check className="w-3.5 h-3.5 mr-1" />{" "}
                                            Accept
                                        </button>

                                        <button
                                            className="flex items-center text-gray-700 hover:text-red-600 px-3 rounded-full border-2 hover:bg-red-50 text-xs font-medium transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleComparisonAction(
                                                    item,
                                                    "dismiss"
                                                );
                                            }}
                                        >
                                            <Trash className="w-3.5 h-3.5 mr-1" />{" "}
                                            Ignore
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openExplain(item);
                                            }}
                                            className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-1 rounded-full border border-gray-300 hover:bg-blue-50 text-xs font-medium transition-colors duration-200 ease-in-out"
                                        >
                                            <Info className="w-4 h-4 mr-1" />{" "}
                                            Explain
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Perfect Match State */}
                            {filteredDifferences.length === 0 && (
                                <div className="text-center py-8">
                                    <Check className="mt-20 w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <h5 className="text-base font-semibold text-gray-700 mb-1">
                                        Perfect Match!
                                    </h5>
                                    <p className="text-sm text-gray-500">
                                        Your text matches the article exactly.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Explain Modal (use Modal component) */}
                <Modal
                    show={showExplainModal}
                    onClose={closeExplain}
                    maxWidth="xl"
                >
                    <div className="p-6">
                        <div className="mb-2">
                            {/* Header: Title + Close Button */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Explanation
                                </h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={closeExplain}
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {explainLoading ? (
                            <div className="py-8 text-center">Loading…</div>
                        ) : explainData ? (
                            explainData.notFound ? (
                                <div className="text-sm text-gray-700">
                                    No entry found for{" "}
                                    <span className="font-mono">
                                        {explainData.word}
                                    </span>
                                    .
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm text-gray-700">
                                    {/* General Introduction */}
                                    {explainData?.word && (
                                        <div className="text-sm text-gray-70">
                                            <p>
                                                <span className="font-semibold text-lg">
                                                    {explainData.word}
                                                </span>{" "}
                                                —{" "}
                                                {explainData.shortDescription ||
                                                    `This word is commonly used to describe or refer to ${explainData.word}.`}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">
                                                Part of Speech
                                            </div>
                                            <div className="text-sm">
                                                {explainData.pos || "—"}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">
                                                Pronunciation
                                            </div>
                                            <div className="text-sm">
                                                {explainData.pro ||
                                                    explainData.phoneme ||
                                                    "—"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">
                                                Homophones
                                            </div>
                                            <div className="text-sm">
                                                {Array.isArray(
                                                    explainData.homophone
                                                )
                                                    ? explainData.homophone.join(
                                                          ", "
                                                      )
                                                    : "—"}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">
                                                phoneme
                                            </div>
                                            <div className="text-sm">
                                                {typeof explainData.phoneme ===
                                                    "string" &&
                                                explainData.phoneme.trim() !==
                                                    ""
                                                    ? explainData.phoneme
                                                    : Array.isArray(
                                                          explainData.phoneme
                                                      ) &&
                                                      explainData.phoneme
                                                          .length > 0
                                                    ? explainData.phoneme.join(
                                                          ", "
                                                      )
                                                    : "—"}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-slate-500">
                                            Definition
                                        </div>
                                        <div className="text-sm">
                                            {explainData.definition || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-slate-500">
                                            Example
                                        </div>
                                        <div className="text-sm">
                                            {explainData.example || "—"}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="py-6 text-center text-sm text-gray-500">
                                No data available.
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeExplain}
                                className="rounded-[10px] border-2 border-gray-300 px-6 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Details Modal (metrics) */}
                <Modal
                    show={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    maxWidth="2xl"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Comparison Details
                            </h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowDetailsModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2 text-sm text-gray-700 max-h-[50vh] overflow-y-auto pr-2">
                            <div className="mt-1">
                                <div className="text-md text-slate-500 mb-2">
                                    Writing score
                                </div>

                                {loadingActivityStats ? (
                                    // Skeleton loader
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3 animate-pulse">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i}>
                                                <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                                                <div className="h-4 w-12 bg-slate-300 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activityStats ? (
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Accuracy
                                            </div>
                                            <div className="text-md font-semibold">
                                                {metrics.accuracy != null
                                                    ? `${metrics.accuracy}%`
                                                    : "0%"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Words/Article
                                            </div>
                                            <div className="text-md font-semibold">
                                                {textStats.words}/
                                                {metrics.total}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Incorrect Words
                                            </div>
                                            <div className="text-md font-semibold">
                                                {metrics.replaced}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Missing Words
                                            </div>
                                            <div className="text-md font-semibold">
                                                {metrics.missing}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Extra Words
                                            </div>
                                            <div className="text-md font-semibold">
                                                {metrics.extra}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Reading Time
                                            </div>
                                            <div className="text-md font-semibold">
                                                {textStats.readingTime}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 mt-2">
                                        No activity data available.
                                    </div>
                                )}
                            </div>

                            {/* User Activity */}
                            <div className="mt-3">
                                <div className="text-md text-slate-500 mb-2">
                                    User Activity
                                </div>
                                {loadingActivityStats ? (
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3 animate-pulse">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i}>
                                                <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                                                <div className="h-4 w-12 bg-slate-300 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activityStats ? (
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Pauses
                                            </div>
                                            <div className="text-md font-semibold">
                                                {activityStats.pause_count ??
                                                    "0"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Avg Pause (s)
                                            </div>
                                            <div className="text-md font-semibold">
                                                {activityStats?.avg_pause_duration !=
                                                null
                                                    ? formatNumber(
                                                          activityStats.avg_pause_duration,
                                                          2
                                                      )
                                                    : metrics?.avgPause != null
                                                    ? formatNumber(
                                                          metrics.avgPause,
                                                          2
                                                      )
                                                    : "0"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Accepts
                                            </div>
                                            <div className="text-md font-semibold">
                                                {activityStats.accepts ?? "0"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Dismisses
                                            </div>
                                            <div className="text-md font-semibold">
                                                {activityStats.dismisses ?? "0"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Incorrect
                                            </div>
                                            <div className="text-md font-semibold">
                                                {activityStats.replaced_count ??
                                                    "0"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Missing
                                            </div>
                                            <div className="text-md font-semibold">
                                                {activityStats.missing_count ??
                                                    "0"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-500">
                                                Extra
                                            </div>
                                            <div className="text-md font-semibold">
                                                {activityStats.extra_count ??
                                                    "0"}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 mt-2">
                                        No activity data available.
                                    </div>
                                )}
                            </div>

                            <div className="mt-3">
                                <div className="text-sm font-medium text-slate-500">
                                    Notes
                                </div>
                                <div className="text-sm text-gray-600">
                                    This summary is derived from the current
                                    comparison result and recent activity
                                    events. Accept/dismiss counts and pause
                                    metrics are fetched from server activity
                                    logs when available.
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="rounded-[10px] border-2 border-gray-300 px-6 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    return (
        <div className="w-96 rounded-xl border border-gray-200 bg-white h-[75vh] flex flex-col overflow-hidden shadow-sm">
            <div className="px-6 pt-4 pb-2 border-gray-200">
                {/* Header */}
                {isChecking ? (
                    <div className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm animate-pulse mb-3">
                        <div className="h-4 w-40 bg-slate-200 rounded"></div>
                        <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between mb-3">
                        {text.split(" ").filter((w) => w.trim()).length < 25
                            ? `Enter at least 25 words (${
                                  text.split(" ").filter((w) => w.trim()).length
                              }/25)`
                            : "Grammar Check Results"}
                    </div>
                )}

                {/* Filter Buttons */}
                {isChecking ? (
                    <div className="flex items-center space-x-2 animate-pulse mb-1">
                        <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
                        <div className="h-8 w-28 bg-slate-200 rounded-lg"></div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button className="text-sm text-blue-900 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                            All{" "}
                            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                0
                            </span>
                        </button>
                        <button className="text-sm text-green-600 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                            Grammar{" "}
                            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                0
                            </span>
                        </button>
                    </div>
                )}

                <div className="border-b"></div>
            </div>

            <div className="space-y-2 px-4 py-0 mb-2 flex-1 overflow-y-auto hide-scrollbar">
                {isChecking ? (
                    // 🟦 Skeleton Loader (replaces spinner)
                    <div className="space-y-4 animate-pulse">
                        {/* Header Skeleton */}
                        <div className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm">
                            <div className="h-4 w-40 bg-slate-200 rounded"></div>
                            <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                        </div>

                        {/* Repeated skeleton cards */}
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
                            >
                                <div className="h-3 w-24 bg-slate-200 rounded mb-3"></div>
                                <div className="flex space-x-2 mb-4">
                                    <div className="h-4 w-16 bg-slate-300 rounded"></div>
                                    <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                </div>
                                <div className="flex space-x-3">
                                    <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center flex flex-col items-center justify-center h-full">
                        <img
                            src="/images/binoculars-see.svg"
                            alt="Icon"
                            className="w-16 h-16"
                        />
                        <h5 className="text-base font-semibold text-gray-700">
                            Nothing to check yet!
                        </h5>
                        <p className="text-sm text-gray-500">
                            Get started by adding text to the editor
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
