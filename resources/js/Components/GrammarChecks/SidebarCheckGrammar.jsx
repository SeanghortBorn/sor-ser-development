import React, { useState } from "react";
import { Check, Trash } from "lucide-react";
import axios from "axios";

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
                                            className="flex items-center text-gray-700 hover:text-red-600 px-2 py-1.5 text-xs font-medium transition"
                                            onClick={(e) => { e.stopPropagation(); handleComparisonAction(item, "dismiss"); }}
                                        >
                                            <Trash className="w-3.5 h-3.5 mr-1" /> Ignore
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