import React, { useState } from "react";
import { Check, Trash, Info } from "lucide-react";
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
    const MAX_RETRIES = 3;

    const foundCorrections = [];

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
        const signature = `${checkerId || "none"}|${c.error}|${feedbackText.trim()}`;
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

        axios.post('/api/track/comparison-action', {
            grammar_checker_id: checkerId,
            article_id: articleId ?? null,
            action,
            comparison_type: item.type,
            user_word: item.user_word?.user_word || '',
            article_word: item.article_word?.article_word || '',
            word_position: item.user_word?.user_index || item.article_word?.article_index,
            session_id: sessionStorage.getItem('sessionId'),
        }).catch(err => console.error('Track comparison action error:', err));

        let comparison = [...comparisonResult.comparison];
        let userWords = [...comparisonResult.user_words];
        const index = comparison.findIndex((comp) => comp === item);
        if (index === -1) return;

        if (action === "dismiss") {
            const itemId = `${item.type}-${item.user_word?.user_index || "none"}-${item.article_word?.article_index || "none"}`;
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
            (c) => c.type === "missing" || c.type === "replaced" || c.type === "extra"
        );

        if (remainingDiffs.length === 0 && !skipUpdate) {
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
                .filter((item) => item.type === "same" || item.type === "replaced" || item.type === "extra")
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
            if (comp.type === "missing" && comp.index_compared > lastNonMissingIndex) {
                // skip article-only trailing words beyond meaningful diff window
                continue;
            }

            // For same / replaced / missing (within window), prefer the accepted result,
            // then fallback to article word, then user's word.
            const pushWord =
                (comp.actions && comp.actions.accept && comp.actions.accept.result) ||
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
            "/homophones.json",            // public route we added
            "/storage/homophones.json",    // possible public storage path
            "/homophones/json",            // existing authenticated route (fallback)
        ];

        let list = null;
        for (const url of tryUrls) {
            try {
                const res = await axios.get(url, { headers: { Accept: "application/json" } });
                // support different shapes returned by endpoints
                list = res.data?.homophones ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : null);
                if (!list && typeof res.data === "object" && Array.isArray(Object.values(res.data))) {
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
            console.warn("fetchHomophones: no homophones list found at tried endpoints");
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
        const raw = (item.article_word && item.article_word.article_word)
            || (item.user_word && item.user_word.user_word)
            || "";
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

    if (comparisonResult) {
        // Filter differences to include only replaced, extra, and missing words up to the last same, replaced, or extra
        const differences = comparisonResult.comparison.filter(
            (item) => item.type === "missing" || item.type === "replaced" || item.type === "extra"
        );

        // Find the last same, replaced, or extra word's index_compared
        const lastNonMissingIndex = Math.max(
            ...comparisonResult.comparison
                .filter((item) => item.type === "same" || item.type === "replaced" || item.type === "extra")
                .map((item) => item.index_compared),
            -1
        );

        // Include missing words only up to lastNonMissingIndex
        const filteredDifferences = differences.filter(
            (item) =>
                item.type !== "missing" || item.index_compared <= lastNonMissingIndex
        );

        return (
            <div className="w-96 rounded-xl border border-gray-200 bg-white h-[75vh] flex flex-col overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-gray-200">
                    <div className="text-gray-800 text-base font-semibold mb-3">
                        Comparison Results
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="text-sm text-blue-900 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                            All{" "}
                            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                {isChecking ? "..." : filteredDifferences.length}
                            </span>
                        </button>
                        <button className="text-sm text-green-600 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                            Differences{" "}
                            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                {isChecking ? "..." : filteredDifferences.length}
                            </span>
                        </button>
                    </div>
                    <div className="border-b"></div>
                </div>
                <div className="space-y-2 px-4 py-0 flex-1 overflow-y-auto hide-scrollbar">
                    {isChecking ? (
                        <div className="mt-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                            <h5 className="text-base font-semibold text-gray-700 mb-2">
                                Checking...
                            </h5>
                            <p className="text-sm text-gray-500">
                                Comparing your text with the article
                            </p>
                        </div>
                    ) : (
                        <>
                            {filteredDifferences.length > 0 && (
                                <div className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm">
                                    <span className="flex items-center">
                                        <span className="text-red-500 text-sm font-semibold">
                                            {filteredDifferences.length} differences
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
                            {filteredDifferences.map((item, diffIndex) => (
                                <div
                                    key={`${item.index_compared}-${item.type}`}
                                    onClick={() => handleCardClick(diffIndex)}
                                    className={`bg-white rounded-xl p-3 border shadow-sm cursor-pointer transition ${
                                        diffIndex === 0 ? "border-blue-500 border-2" : "border-gray-200"
                                    }`}
                                >
                                    <p className="text-xs text-gray-500 font-medium mb-2">
                                        {item.type === "missing" && `Missing Word`}
                                        {item.type === "replaced" && `Replaced Word`}
                                        {item.type === "extra" && `Extra Word`}
                                    </p>
                                    <div className="mb-3">
                                        <span
                                            className={`line-through text-sm mr-2 ${
                                                diffIndex === 0 ? "text-red-500" : "text-gray-500"
                                            }`}
                                        >
                                            {typeof item.user_word?.user_word === "string" && item.user_word.user_word !== "" 
                                                ? item.user_word.user_word 
                                                : "<missing>"}
                                        </span>
                                        <span
                                            className={`text-sm font-semibold mr-2 ${
                                                diffIndex === 0 ? "text-green-600" : "text-green-700"
                                            }`}
                                        >
                                            {item.article_word?.article_word || "<missing>"}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full flex items-center text-xs font-medium transition"
                                            onClick={(e) => { e.stopPropagation(); handleComparisonAction(item, "accept"); }}
                                        >
                                            <Check className="w-3.5 h-3.5 mr-1" /> Accept
                                        </button>
                                        <button
                                            className="flex items-center text-gray-700 hover:text-red-600 px-3 rounded-full border-2 hover:bg-red-50 text-xs font-medium transition"
                                            onClick={(e) => { e.stopPropagation(); handleComparisonAction(item, "dismiss"); }}
                                        >
                                            <Trash className="w-3.5 h-3.5 mr-1" /> Ignore
                                        </button>

                                        {/* Explanation Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openExplain(item);
                                            }}
                                            className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-1 rounded-full border border-gray-300 hover:bg-blue-50 text-xs font-medium transition-colors duration-200 ease-in-out"
                                        >
                                            <Info className="w-4 h-4 mr-1" />
                                            Explain
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                <Modal show={showExplainModal} onClose={closeExplain} maxWidth="xl">
                    <div className="p-6">
                        <div className="mb-2">
                            {/* Header: Title + Close Button */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">Explanation</h3>
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
                                    <span className="font-mono">{explainData.word}</span>.
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm text-gray-700">
                                    {/* General Introduction */}
                                    {explainData?.word && (
                                        <div className="text-sm text-gray-70">
                                            <p>
                                            <span className="font-semibold text-lg">{explainData.word}</span> —{" "}
                                            {explainData.shortDescription ||
                                                `This word is commonly used to describe or refer to ${explainData.word}.`}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">Part of Speech</div>
                                            <div className="text-sm">{explainData.pos || "—"}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">Pronunciation</div>
                                            <div className="text-sm">{explainData.pro || explainData.phoneme || "—"}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">Homophones</div>
                                        <div className="text-sm">{Array.isArray(explainData.homophone) ? explainData.homophone.join(", ") : "—"}</div>
                                    </div>
                                        <div className="flex-1">
                                            <div className="text-base font-medium text-slate-500">phoneme</div>
                                            <div className="text-sm">
                                            {typeof explainData.phoneme === "string" && explainData.phoneme.trim() !== ""
                                                ? explainData.phoneme
                                                : Array.isArray(explainData.phoneme) && explainData.phoneme.length > 0
                                                    ? explainData.phoneme.join(", ")
                                                    : "—"}
                                        </div></div>
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-slate-500">Definition</div>
                                        <div className="text-sm">{explainData.definition || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-slate-500">Example</div>
                                        <div className="text-sm">{explainData.example || "—"}</div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="py-6 text-center text-sm text-gray-500">No data available.</div>
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

                <div className="flex px-6 py-3 mt-2 border-t border-gray-200 bg-gray-50 items-center justify-center"></div>
            </div>
        );
    }

    return (
        <div className="w-96 rounded-xl border border-gray-200 bg-white h-[75vh] flex flex-col overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-gray-200">
                <div className="text-gray-800 text-base font-semibold mb-3">
                    {text.split(" ").filter((w) => w.trim()).length < 25
                        ? `Enter at least 25 words (${text.split(" ").filter((w) => w.trim()).length}/25)`
                        : "Grammar Check Results"}
                </div>
                <div className="flex items-center space-x-2">
                    <button className="text-sm text-blue-900 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                        All <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">0</span>
                    </button>
                    <button className="text-sm text-green-600 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                        Grammar <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">0</span>
                    </button>
                </div>
                <div className="border-b"></div>
            </div>
            <div className="space-y-3 px-4 py-8 flex-1 overflow-y-auto hide-scrollbar">
                {isChecking ? (
                    <div className="mt-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                        <h5 className="text-base font-semibold text-gray-700 mb-2">Checking...</h5>
                        <p className="text-sm text-gray-500">Comparing your text with the article</p>
                    </div>
                ) : (
                    <div className="mt-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                        <Check className="w-16 h-16 text-green-500 mb-3" />
                        <h5 className="text-base font-semibold text-gray-700 mb-2">Great Job!</h5>
                        <p className="text-sm text-gray-500">No grammar or spelling issues detected in your text.</p>
                    </div>
                )}
            </div>
            <div className="flex px-6 py-3 mt-2 border-t border-gray-200 bg-gray-50 items-center justify-center"></div>
        </div>
    );
}