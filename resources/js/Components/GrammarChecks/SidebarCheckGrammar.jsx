import React, { useState } from "react";
import { Check, Trash } from "lucide-react";
import axios from "axios";

export default function SidebarCheckGrammar({
    text = "",
    onReplace,
    checkerId,
    comparisonResult,
    setComparisonResult,
    articleId, // <-- add this prop
}) {
    // State management - add dismissed items tracking
    const [dismissedItems, setDismissedItems] = useState([]); // Track dismissed comparison items
    const [feedbackFor, setFeedbackFor] = useState(null);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackState, setFeedbackState] = useState("idle");
    const [feedbackError, setFeedbackError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [feedbackSent, setFeedbackSent] = useState([]);
    const [feedbackPrefix, setFeedbackPrefix] = useState("");
    const [lastSignature, setLastSignature] = useState(null);
    const MAX_RETRIES = 3;

    // No corrections to filter since static list is removed
    const foundCorrections = [];

    // Swap clicked correction to the top
    const handleCardClick = (idx) => {
        if (idx === 0 || !comparisonResult) return;
        const differences = comparisonResult.comparison.filter(
            (item) =>
                item.type === "missing" ||
                item.type === "replaced" ||
                item.type === "extra"
        );
        if (idx >= differences.length) return;

        const newDifferences = [...differences];
        [newDifferences[0], newDifferences[idx]] = [
            newDifferences[idx],
            newDifferences[0],
        ];
    };

    // Submit feedback
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

    // Manual retry
    const manualRetry = (c) => {
        if (!feedbackText.trim()) return;
        setRetryCount((r) => (r < MAX_RETRIES ? r + 1 : r));
        submitFeedback(c);
    };

    // Handle feedback text change with prefix enforcement
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

    // Handle comparison actions
    const handleComparisonAction = (item, action, skipUpdate = false) => {
        if (!item || !onReplace || !comparisonResult) return;

        // Track the action
        axios.post('/api/track/comparison-action', {
            grammar_checker_id: checkerId,
            article_id: articleId ?? null,
            action: action,
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
            // Track the dismissed item by creating a unique identifier
            const itemId = `${item.type}-${
                item.user_word?.user_index || "none"
            }-${item.article_word?.article_index || "none"}`;
            setDismissedItems((prev) => [...prev, itemId]);

            // Just remove the item from comparison without changing text
            comparison = comparison.filter((_, i) => i !== index);

            setComparisonResult({
                ...comparisonResult,
                comparison,
                user_words: userWords,
            });
            return; // Early return to avoid updating text
        }

        // For accept actions, apply the change
        if (item.type === "missing" && action === "accept") {
            const position = item.article_word.article_index;
            userWords.splice(position, 0, item.actions.accept.result);
        } else if (item.type === "extra" && action === "accept") {
            const position = item.user_word.user_index;
            if (typeof position === "number") {
                userWords.splice(position, 1);
            }
        } else if (item.type === "replaced" && action === "accept") {
            const userIdx = item.user_word.user_index;
            if (typeof userIdx === "number") {
                userWords[userIdx] = item.actions.accept.result;
            }
        }

        // Remove the current item from comparison
        comparison = comparison.filter((_, i) => i !== index);

        // Check if all differences are resolved
        const remainingDiffs = comparison.filter(
            (c) =>
                c.type === "missing" ||
                c.type === "replaced" ||
                c.type === "extra"
        );

        if (remainingDiffs.length === 0 && !skipUpdate) {
            // Only sync to article words if NO items were dismissed
            if (dismissedItems.length === 0) {
                userWords = [...comparisonResult.article_words];
            }
            // Clear dismissed items when closing comparison
            setTimeout(() => {
                setComparisonResult(null);
                setDismissedItems([]);
            }, 500);
        } else {
            // Update the comparison state
            setComparisonResult({
                ...comparisonResult,
                comparison,
                user_words: userWords,
            });
        }

        // Update the text in the editor
        if (!skipUpdate) {
            onReplace(userWords.join(" "));
        }

        return { comparison, userWords };
    };

    // Handle accept all
    const handleAcceptAll = () => {
        if (!comparisonResult) return;

        const differences = comparisonResult.comparison.filter(
            (item) =>
                item.type === "missing" ||
                item.type === "replaced" ||
                item.type === "extra"
        );

        let userWords = [...comparisonResult.user_words];

        // Process all differences in order
        differences.forEach((item) => {
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
        });

        // If no dismissals, use article words
        if (dismissedItems.length === 0) {
            userWords = [...comparisonResult.article_words];
        }

        // Update text
        onReplace(userWords.join(" "));

        // Clear comparison
        setTimeout(() => {
            setComparisonResult(null);
            setDismissedItems([]);
        }, 300);
    };

    // Render comparison results
    if (comparisonResult) {
        const differences = comparisonResult.comparison.filter(
            (item) =>
                item.type === "missing" ||
                item.type === "replaced" ||
                item.type === "extra"
        );

        return (
            <div className="w-96 rounded-xl border border-gray-200 bg-white h-[75vh] flex flex-col overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-gray-200">
                    {/* Header Message */}
                    <div className="text-gray-800 text-base font-semibold mb-3">
                        Comparison Results
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex items-center space-x-2">
                        <button className="text-sm text-blue-900 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                            All{" "}
                            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                {differences.length}
                            </span>
                        </button>
                        <button className="text-sm text-green-600 px-3 py-1.5 font-medium flex items-center hover:bg-gray-100 rounded-lg transition">
                            Differences{" "}
                            <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                                {differences.length}
                            </span>
                        </button>
                    </div>
                    <div className="border-b"></div>
                </div>

                {/* Scrollable List */}
                <div className="space-y-2 px-4 py-0 flex-1 overflow-y-auto hide-scrollbar">
                    {/* Summary Card */}
                    {differences.length > 0 && (
                        <div className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm">
                            <span className="flex items-center">
                                <span className="text-red-500 text-sm font-semibold">
                                    {differences.length} differences
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

                    {/* Difference Cards */}
                    {differences.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleCardClick(idx)}
                            className={`bg-white rounded-xl p-3 border shadow-sm cursor-pointer transition ${
                                idx === 0
                                    ? "border-blue-500 border-2"
                                    : "border-gray-200"
                            }`}
                        >
                            <p className="text-xs text-gray-500 font-medium mb-2">
                                {item.type === "missing" && "Missing Word"}
                                {item.type === "replaced" && "Replaced Word"}
                                {item.type === "extra" && "Extra Word"}
                            </p>
                            <div className="mb-3">
                                <span
                                    className={`line-through text-sm mr-2 ${
                                        idx === 0
                                            ? "text-red-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {item.user_word &&
                                    item.user_word.user_word !== undefined
                                        ? item.user_word.user_word
                                        : "<missing>"}
                                </span>
                                <span
                                    className={`text-sm font-semibold mr-2 ${
                                        idx === 0
                                            ? "text-green-600"
                                            : "text-green-700"
                                    }`}
                                >
                                    {item.article_word &&
                                    item.article_word.article_word !== undefined
                                        ? item.article_word.article_word
                                        : "<missing>"}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full flex items-center text-xs font-medium transition"
                                    onClick={() =>
                                        handleComparisonAction(item, "accept")
                                    }
                                >
                                    <Check className="w-3.5 h-3.5 mr-1" />{" "}
                                    Accept
                                </button>
                                <button
                                    className="flex items-center text-gray-700 hover:text-red-600 px-2 py-1.5 text-xs font-medium transition"
                                    onClick={() =>
                                        handleComparisonAction(item, "dismiss")
                                    }
                                >
                                    <Trash className="w-3.5 h-3.5 mr-1" />{" "}
                                    Ignore
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* No Differences Message */}
                    {differences.length === 0 && (
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
                </div>

                <div className="flex px-6 py-3 mt-2 border-t border-gray-200 bg-gray-50 items-center justify-center">
                </div>
            </div>
        );
    }

    // Render grammar check
    return (
        <div className="w-96 rounded-xl border border-gray-200 bg-white h-[75vh] flex flex-col overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-gray-200">
                {/* Header Message */}
                <div className="text-gray-800 text-base font-semibold mb-3">
                    {text.split(" ").filter((w) => w.trim()).length < 25
                        ? `Enter at least 25 words (${
                              text.split(" ").filter((w) => w.trim()).length
                          }/25)`
                        : "Grammar Check Results"}
                </div>
                {/* Filter Buttons */}
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
                <div className="border-b"></div>
            </div>

            {/* Scrollable List */}
            <div className="space-y-3 px-4 py-8 flex-1 overflow-y-auto hide-scrollbar">
                {/* Show "no issues" message */}
                <div className="mt-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                    <Check className="w-16 h-16 text-green-500 mb-3" />
                    <h5 className="text-base font-semibold text-gray-700 mb-2">
                        Great Job!
                    </h5>
                    <p className="text-sm text-gray-500">
                        No grammar or spelling issues detected in your text.
                    </p>
                </div>
            </div>
            
            <div className="flex px-6 py-3 mt-2 border-t border-gray-200 bg-gray-50 items-center justify-center">
            </div>
        </div>
    );
}
