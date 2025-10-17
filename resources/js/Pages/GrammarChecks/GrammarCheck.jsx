import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, usePage, Link } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import Footer from "@/Components/Footer/Footer";
import axios from "axios";
import GrammarCheckSection from "@/Components/GrammarChecks/GrammarCheckSection";
import GrammarCheckHeader from "@/Components/GrammarChecks/GrammarCheckHeader";
import React from "react";
import { Check, X, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";

export default function GrammarCheck() {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;

    // State for modals
    const [showAccountModal, setShowAccountModal] = useState(false); // Account modal inside section
    const [showBlockModal, setShowBlockModal] = useState(false); // Copy/Paste/Cut block modal

    // Document states
    const [docTitle, setDocTitle] = useState("");
    const [paragraph, setParagraph] = useState("");
    const [checkerId, setCheckerId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [previousDocuments, setPreviousDocuments] = useState([]);
    const [isZoomed, setIsZoomed] = useState(false);

    // Dropdown for articles
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Audio management for selected article
    const audioRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(null); // New: track audio fetch errors

    // Comparison result state
    const [comparisonResult, setComparisonResult] = useState(null);

    // Fetch history on mount
    const fetchHistory = () => {
        axios
            .get("/grammar-checkers", {
                headers: { Accept: "application/json" },
            })
            .then((res) => {
                const docs = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || [];
                setPreviousDocuments(docs);
            })
            .catch(() => setPreviousDocuments([]));
    };

    // Fetch articles on mount
    useEffect(() => {
        axios
            .get("/api/articles", { headers: { Accept: "application/json" } })
            .then((res) => {
                setArticles(
                    Array.isArray(res.data) ? res.data : res.data.data || []
                );
            })
            .catch(() => setArticles([]));
    }, []);

    useEffect(() => {
        fetchHistory();
    }, []);

    // Replace useClickAway with custom outside click handler
    useEffect(() => {
        if (!dropdownOpen) return;
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    // Debounce auto-save
    const saveTimeout = useRef();

    // Replace calculateWordCount with API-based Khmer word segmentation
    const calculateWordCount = async (text) => {
        if (!text || !text.trim()) return 0;
        try {
            const res = await axios.post(
                "/api/khmer-segment",
                { text },
                { headers: { "Content-Type": "application/json" } }
            );
            if (res.data && Array.isArray(res.data.tokens)) {
                return res.data.tokens.length;
            }
            return text.trim().split(/\s+/).length;
        } catch (e) {
            console.error("Khmer segment API error:", e);
            return text.trim().split(/\s+/).length;
        }
    };

    const calculateReadingTime = (wordCount) =>
        Math.ceil((wordCount / 200) * 60);

    // Update autoSave to use async word count
    const autoSave = async (newTitle, newParagraph) => {
        if (!userId) return;
        setSaving(true);

        const wordCount = await calculateWordCount(newParagraph);
        const payload = {
            user_id: userId,
            title: newTitle ?? "",
            paragraph: newParagraph ?? "",
            word_count: wordCount,
            incorrect_word_count: 0,
            reading_time: calculateReadingTime(wordCount),
        };

        if (checkerId) {
            axios
                .patch(`/grammar-checkers/${checkerId}`, payload, {
                    headers: { Accept: "application/json" },
                })
                .then((res) => {
                    setCheckerId(res.data.id);
                    fetchHistory();
                })
                .catch((err) =>
                    console.error("Save update error:", err.response?.data)
                )
                .finally(() => setSaving(false));
        } else {
            axios
                .post("/grammar-checkers", payload, {
                    headers: { Accept: "application/json" },
                })
                .then((res) => {
                    setCheckerId(res.data.id);
                    fetchHistory();
                })
                .catch((err) =>
                    console.error("Save Document error:", err.response?.data)
                )
                .finally(() => setSaving(false));
        }
    };

    // Auto-save on docTitle or paragraph change (update to async)
    useEffect(() => {
        if (!userId) return;
        if (!docTitle.trim() && !paragraph.trim()) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            autoSave(docTitle, paragraph);
        }, 700);

        return () => clearTimeout(saveTimeout.current);
    }, [docTitle, paragraph]);

    // Block copy/paste/cut
    const handleBlock = (e) => {
        e.preventDefault();
        setShowBlockModal(true);
    };

    useEffect(() => {
        if (!auth.user) {
            setShowAccountModal(true);
        } else {
            setShowAccountModal(false);
        }
    }, [auth.user]);

    // SidebarCheckGrammar component moved inline
    function SidebarCheckGrammar({ text = "", onReplace, checkerId }) {
        const corrections = [
            { error: "helo", suggestion: "hello" },
            { error: "wld", suggestion: "world" },
            { error: "teh", suggestion: "the" },
            { error: "recieve", suggestion: "receive" },
            { error: "adress", suggestion: "address" },
            { error: "definately", suggestion: "definitely" },
            { error: "occured", suggestion: "occurred" },
            { error: "seperate", suggestion: "separate" },
            { error: "untill", suggestion: "until" },
            { error: "wich", suggestion: "which" },
            { error: "becuase", suggestion: "because" },
            { error: "thier", suggestion: "their" },
        ];

        // New local states for dismiss + feedback
        const [dismissed, setDismissed] = useState([]); // array of error strings
        const [feedbackFor, setFeedbackFor] = useState(null); // error string currently giving feedback on
        const [feedbackText, setFeedbackText] = useState("");
        const [feedbackState, setFeedbackState] = useState("idle"); // idle | sending | sent | error
        const [feedbackError, setFeedbackError] = useState(null); // store server/client error
        const [retryCount, setRetryCount] = useState(0);
        const MAX_RETRIES = 3; // kept (only manual now)
        const [lastSignature, setLastSignature] = useState(null); // prevent duplicate sends
        // NEW: track which corrections already received feedback
        const [feedbackSent, setFeedbackSent] = useState([]); // array of error strings
        const [feedbackPrefix, setFeedbackPrefix] = useState(""); // NEW: locked prefix

        const foundCorrections = corrections
            .filter((c) => text.toLowerCase().includes(c.error))
            .filter((c) => !dismissed.includes(c.error));

        const handleDismiss = (error) => {
            setDismissed((prev) => [...prev, error]);
            if (feedbackFor === error) {
                setFeedbackFor(null);
                setFeedbackText("");
            }
        };

        const submitFeedback = async (c) => {
            if (!feedbackText.trim()) return;
            if (feedbackState === "sending") return;
            // Prevent duplicate identical submission when already sent
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
                // mark success for this specific correction
                setFeedbackSent((prev) =>
                    prev.includes(c.error) ? prev : [...prev, c.error]
                );
                setFeedbackState("sent");
                setRetryCount(0);
                // Close textarea immediately and clear input; maintain success indicator separately
                setFeedbackFor(null);
                setFeedbackText("");
                // reset generic state to idle so other corrections work independently
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
                // Enforce prefix
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
                el.setSelectionRange(
                    feedbackPrefix.length,
                    feedbackPrefix.length
                );
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
            // Block backspace/delete or typing inside prefix
            if (start < feedbackPrefix.length) {
                // Any character input
                if (e.key.length === 1) return protect();
                if (e.key === "Backspace") return protect();
                if (e.key === "Delete") return protect();
                if (e.key === "ArrowLeft" && start <= feedbackPrefix.length)
                    return protect();
                if (e.key === "Home") return protect();
            }
            // Block backspace exactly at prefix boundary (would delete last prefix char)
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

        // Add handlers for comparison result actions
        const handleComparisonAction = (item, action) => {
            if (!item || !onReplace || !comparisonResult) return;

            let comparison = [...comparisonResult.comparison];
            let userWords = [...comparisonResult.user_words];

            const index = comparison.findIndex(comp => comp === item);
            if (index === -1) return;

            // Accept logic for "missing" type
            if (item.type === "missing" && action === "accept") {
                const position = item.article_word.article_index;
                userWords.splice(position, 0, item.actions.accept.result);

                // If next item is "extra" and index == i+1, remove that word too
                // --- FIX: Do NOT auto-remove extra word here ---
                // (Remove the following block to prevent auto-accept of extra)
                // const next = comparison[index + 1];
                // if (next && next.type === "extra") {
                //     userWords.splice(position + 1, 1);
                //     comparison.splice(index + 1, 1);
                // }
            }
            // Accept logic for "extra" type
            else if (item.type === "extra" && action === "accept") {
                // Remove the extra word at the correct position
                const position = item.user_word.user_index;
                if (typeof position === "number") {
                    userWords.splice(position, 1);
                }
            }
            // Accept logic for "replaced" type
            else if (item.type === "replaced" && action === "accept") {
                const userIdx = item.user_word.user_index;
                if (typeof userIdx === "number") {
                    userWords[userIdx] = item.actions.accept.result;
                }
            }
            // Accept logic for "same"
            else if (item.type === "same" && action === "accept") {
                // Do nothing
            }
            // Accept logic for other types (fallback)
            else if (action === "accept") {
                let position = 0;
                for (let i = 0; i < index; i++) {
                    if (comparison[i].type !== "missing") position++;
                }
                if (item.article_word) userWords[position] = item.article_word;
            }
            // Dismiss logic
            else if (action === "dismiss") {
                // Do nothing
            }

            // Remove the current item from comparison
            comparison = comparison.filter((_, i) => i !== index);

            // --- FIX: Only sync userWords to articleWords if ALL types are resolved (including extra) ---
            const remainingDiffs = comparison.filter(
                c => c.type === "missing" || c.type === "replaced" || c.type === "extra"
            );
            if (remainingDiffs.length === 0) {
                userWords = [...comparisonResult.article_words];
                setTimeout(() => setComparisonResult(null), 500);
            }

            setComparisonResult({
                ...comparisonResult,
                comparison,
                user_words: userWords
            });

            // Update text
            onReplace(userWords.join(" "));
        };

        // If comparisonResult exists, show detailed comparison (missing, replaced, extra)
        if (comparisonResult) {
            return (
                <div className="w-80 flex flex-col h-full">
                    <div className="bg-gray-50 hover:bg-gray-100 border border-slate-200 h-full flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-white">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                Grammar Check
                            </h3>
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-sm text-slate-600 font-medium">
                                    Comparison Results
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 hide-scrollbar">
                            <ul className="space-y-4">
                                {comparisonResult.comparison
                                    .filter(item =>
                                        item.type === "missing" ||
                                        item.type === "replaced" ||
                                        item.type === "extra" // <-- show extra
                                    )
                                    .map((item, idx) => (
                                        <li key={idx}>
                                            <div className="group border border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm">
                                                <div className="mb-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {item.type === "missing" && (
                                                            <>
                                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                                <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                                                                    Missing Word
                                                                </span>
                                                            </>
                                                        )}
                                                        {item.type === "replaced" && (
                                                            <>
                                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                                                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                                                                    Replaced Word
                                                                </span>
                                                            </>
                                                        )}
                                                        {item.type === "extra" && (
                                                            <>
                                                                <AlertCircle className="w-4 h-4 text-blue-500" />
                                                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                                                    Extra Word
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-700 flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-md font-mono font-medium ${
                                                            item.type === "extra"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}>
                                                            {item.user_word && item.user_word.user_word !== undefined
                                                                ? item.user_word.user_word
                                                                : "<missing>"}
                                                        </span>
                                                        <span className="mx-2 text-slate-400">→</span>
                                                        <span className={`px-2 py-0.5 rounded-md font-mono font-medium ${
                                                            item.type === "extra"
                                                                ? "bg-gray-100 text-gray-400"
                                                                : "bg-emerald-100 text-emerald-700"
                                                        }`}>
                                                            {item.article_word && item.article_word.article_word !== undefined
                                                                ? item.article_word.article_word
                                                                : "<missing>"}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        className="flex items-center gap-1 flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                                        onClick={() => handleComparisonAction(item, "accept")}
                                                    >
                                                        <Check size={16} /> Accept
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                                        onClick={() => handleComparisonAction(item, "dismiss")}
                                                    >
                                                        <X size={16} /> Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                            {/* Show message if no differences or empty comparison */}
                            {(!comparisonResult.comparison.length ||
                              !comparisonResult.comparison.some(item =>
                                  item.type === "missing" ||
                                  item.type === "replaced" ||
                                  item.type === "extra"
                              )) && (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                    <h5 className="text-lg font-medium text-gray-700">Perfect Match!</h5>
                                    <p className="text-sm text-gray-500">Your text matches the article exactly.</p>
                                </div>
                            )}
                            <div className="mt-4 text-center">
                                <button 
                                    onClick={() => setComparisonResult(null)} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow-sm hover:bg-blue-700"
                                >
                                    Back to Grammar Check
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // If no corrections and no comparison result, show "no issues" message
        if (foundCorrections.length === 0 && !comparisonResult) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-1">
                        Great job!
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-4">
                        No grammar or spelling issues detected in
                        your text.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm shadow-md">
                        <RotateCcw size={16} /> Re-check Text
                    </button>
                </div>
            );
        }

        return (
            <div className="w-80 flex flex-col h-full">
                <div className="bg-gray-50 hover:bg-gray-100 border border-slate-200 h-full flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-slate-800">
                                Grammar Check
                            </h3>
                            <a
                                href={route("feedback.create")}
                                className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                New Feedback
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            {comparisonResult ? (
                                <>
                                    <span className="text-sm text-slate-600 font-medium">
                                        Comparison Results
                                    </span>
                                </>
                            ) : foundCorrections.length > 0 ? (
                                <>
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm text-slate-600 font-medium">
                                        {foundCorrections.length} issue
                                        {foundCorrections.length > 1
                                            ? "s"
                                            : ""}{" "}
                                        found
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm text-slate-600 font-medium">
                                        No issues detected
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 hide-scrollbar">
                        {comparisonResult ? (
                            // Show Comparison Results in sidebar
                            <>
                                <h4 className="font-medium text-gray-700 mb-2">
                                    Article Comparison
                                </h4>
                                <div className="mb-4 mt-2 px-3 py-2 bg-gray-50 border rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">
                                            {comparisonResult.stats.replaced}
                                        </span>{" "}
                                        replaced,
                                        <span className="font-medium ml-1">
                                            {comparisonResult.stats.missing}
                                        </span>{" "}
                                        missing words
                                    </p>
                                </div>
                                
                                {/* Only show differences (replaced/missing), hide "same" items */}
                                <ul className="space-y-4">
                                    {comparisonResult.comparison
                                        .filter(item => item.type === "replaced" || item.type === "missing")
                                        .map((item, idx) => (
                                            <li key={idx}>
                                                <div className="group border border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm">
                                                    <div className="mb-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {item.type === "missing" && (
                                                                <>
                                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                                                                        Missing Word
                                                                    </span>
                                                                </>
                                                            )}
                                                            {item.type === "replaced" && (
                                                                <>
                                                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                                                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                                                                        Replaced Word
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-700 flex items-center gap-2">
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-mono font-medium">
                                                                {item.user_word && item.user_word.user_word !== undefined
                                                                    ? item.user_word.user_word
                                                                    : "<missing>"}
                                                            </span>
                                                            <span className="mx-2 text-slate-400">→</span>
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-mono font-medium">
                                                                {item.article_word && item.article_word.article_word !== undefined
                                                                    ? item.article_word.article_word
                                                                    : "<missing>"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button
                                                            className="flex items-center gap-1 flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                                            onClick={() => handleComparisonAction(item, "accept")}
                                                        >
                                                            <Check size={16} /> Accept
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                                            onClick={() => handleComparisonAction(item, "dismiss")}
                                                        >
                                                            <X size={16} /> Dismiss
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                      ))}
                                </ul>
                                
                                {/* Show message if no differences or empty comparison */}
                                {(!comparisonResult.comparison.length || 
                                  !comparisonResult.comparison.filter(item => item.type === "replaced" || item.type === "missing").length) && (
                                    <div className="text-center py-8">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                        <h5 className="text-lg font-medium text-gray-700">Perfect Match!</h5>
                                        <p className="text-sm text-gray-500">Your text matches the article exactly.</p>
                                    </div>
                                )}
                                
                                <div className="mt-4 text-center">
                                    <button 
                                        onClick={() => setComparisonResult(null)} 
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow-sm hover:bg-blue-700"
                                    >
                                        Back to Grammar Check
                                    </button>
                                </div>
                            </>
                        ) : foundCorrections.length > 0 ? (
                            // Show grammar corrections
                            foundCorrections.map((c) => (
                                <div
                                    key={c.error}
                                    className="group border border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
                                >
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                                                Spelling Error
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700">
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-mono font-medium">
                                                {c.error}
                                            </span>
                                            <span className="mx-2 text-slate-400">
                                                →
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-mono font-medium">
                                                {c.suggestion}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            className="flex items-center gap-1 flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                            onClick={() => {
                                                if (onReplace) {
                                                    const newText =
                                                        text.replace(
                                                            new RegExp(
                                                                c.error,
                                                                "gi"
                                                            ),
                                                            c.suggestion
                                                        );
                                                    onReplace(newText);
                                                }
                                            }}
                                        >
                                            <Check size={16} /> Accept
                                        </button>
                                        <button
                                            className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                            onClick={() =>
                                                handleDismiss(c.error)
                                            }
                                        >
                                            <X size={16} /> Dismiss
                                        </button>
                                        <button
                                            disabled={feedbackSent.includes(
                                                c.error
                                            )}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                                                feedbackSent.includes(c.error)
                                                    ? "bg-emerald-100 text-emerald-700 cursor-default"
                                                    : feedbackFor === c.error
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            }`}
                                            onClick={() => {
                                                if (
                                                    feedbackSent.includes(
                                                        c.error
                                                    )
                                                )
                                                    return; // already sent
                                                if (feedbackFor === c.error) {
                                                    setFeedbackFor(null);
                                                    setFeedbackText("");
                                                    setFeedbackPrefix("");
                                                } else {
                                                    const prefix = `Issue with word "${c.error}" (suggested: "${c.suggestion}") - `;
                                                    setFeedbackFor(c.error);
                                                    setFeedbackPrefix(prefix);
                                                    setFeedbackText(prefix);
                                                    // place caret at end after render
                                                    setTimeout(() => {
                                                        const ta =
                                                            document.getElementById(
                                                                `fb-${c.error}`
                                                            );
                                                        if (ta)
                                                            ta.setSelectionRange(
                                                                prefix.length,
                                                                prefix.length
                                                            );
                                                    }, 0);
                                                }
                                            }}
                                        >
                                            {feedbackSent.includes(c.error) ? (
                                                <>
                                                    <CheckCircle2 size={16} />{" "}
                                                    Sent
                                                </>
                                            ) : (
                                                "Feedback"
                                            )}
                                        </button>
                                    </div>
                                    {feedbackFor === c.error &&
                                        !feedbackSent.includes(c.error) && (
                                            <div className="mt-3 space-y-2 animate-fade-in">
                                                <textarea
                                                    id={`fb-${c.error}`}
                                                    value={feedbackText}
                                                    onChange={
                                                        handleFeedbackChange
                                                    }
                                                    onKeyDown={handleKeyDown}
                                                    onClick={handleSelect}
                                                    onSelect={handleSelect}
                                                    placeholder="Tell us why this is wrong / helpful..."
                                                    className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px] resize-none"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-slate-400 max-w-[150px] break-words">
                                                        {feedbackState ===
                                                            "sending" && (
                                                            <span className="text-blue-600">
                                                                Sending...
                                                            </span>
                                                        )}
                                                        {feedbackState ===
                                                            "error" && (
                                                            <span className="text-red-600">
                                                                {retryCount >=
                                                                MAX_RETRIES - 1
                                                                    ? feedbackError
                                                                        ? `${feedbackError}`
                                                                        : "Error"
                                                                    : ""}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {feedbackState ===
                                                            "error" &&
                                                            retryCount >=
                                                                MAX_RETRIES -
                                                                    1 && (
                                                                <button
                                                                    onClick={() =>
                                                                        manualRetry(
                                                                            c
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg"
                                                                >
                                                                    Retry
                                                                </button>
                                                            )}
                                                        <button
                                                            disabled={
                                                                feedbackState ===
                                                                    "sending" ||
                                                                !feedbackText.trim()
                                                            }
                                                            onClick={() =>
                                                                submitFeedback(
                                                                    c
                                                                )
                                                            }
                                                            className="px-3 py-1.5 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white text-xs rounded-lg"
                                                        >
                                                            {feedbackState ===
                                                            "sending"
                                                                ? "Sending"
                                                                : "Send"}
                                                        </button>
                                                    </div>
                                                </div>
                                                {feedbackError &&
                                                    feedbackState === "error" &&
                                                    retryCount >=
                                                        MAX_RETRIES - 1 && (
                                                        <div className="text-[11px] text-red-500 italic">
                                                            Could not send
                                                            feedback. Please
                                                            check your
                                                            connection or try
                                                            again later.
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    {feedbackSent.includes(c.error) && (
                                        <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" />{" "}
                                            Feedback sent. Thank you!
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            // Show "no issues" message
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-1">
                                    Great job!
                                </h4>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-4">
                                    No grammar or spelling issues detected in
                                    your text.
                                </p>
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm shadow-md">
                                    <RotateCcw size={16} /> Re-check Text
                                </button>
                            </div>
                        )}
                    </div>

                    {foundCorrections.length > 0 && (
                        <div className="px-6 py-3 border-t border-slate-100 bg-white">
                            {/* ...existing code for footer... */}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Improved audio URL detection
    const getArticleAudioUrl = (article) => {
        if (!article) return null;
        if (article.audio && article.audio.file_path) {
            return article.audio.file_path;
        }
        return null;
    };

    // Updated handleSelectArticle to fetch audio URL and handle errors
    const handleSelectArticle = async (article) => {
        setSelectedArticle(article);
        setDropdownOpen(false);
        setDocTitle(article ? article.title : "");
        setAudioError(null);

        if (!article) {
            setAudioUrl(null);
            return;
        }

        // Get audio ID from the article
        const audioId = article.audios_id;

        if (!audioId) {
            setAudioUrl(null);
            return;
        }

        try {
            const res = await axios.get(`/api/audios/${audioId}`);
            const audioData = res.data?.data;

            if (audioData && audioData.file_path) {
                setAudioUrl(audioData.file_path);
            } else {
                setAudioUrl(null);
                setAudioError("Audio file not found");
            }
        } catch (e) {
            console.error("Failed to fetch audio:", e);
            setAudioError("Unable to load audio for this article.");
            setAudioUrl(null);
        }

        // Reset audio player
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    };

    // Updated togglePlay with error handling
    const togglePlay = () => {
        if (!audioUrl || !audioRef.current) {
            setAudioError("No audio available to play.");
            return;
        }
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch((e) => {
                    console.error("Playback failed:", e);
                    setAudioError("Failed to play audio. Please try again.");
                    setIsPlaying(false);
                });
        }
    };

    // Compare function
    const runCompare = async () => {
        if (!selectedArticle || !paragraph.trim()) return;
        try {
            // Clear any previous results
            setComparisonResult(null);
            
            const res = await axios.post("/api/compare", {
                article_id: selectedArticle.id,
                userInput: paragraph,
            });
            
            if (res.data && Array.isArray(res.data.comparison)) {
                console.log("Comparison result:", res.data);
                setComparisonResult(res.data);
                
                // Log differences for debugging
                const added = res.data.comparison.filter(item => item.type === "added");
                const deleted = res.data.comparison.filter(item => item.type === "deleted");
                console.log(`Found ${added.length} added and ${deleted.length} deleted words`);
            } else {
                console.error("Invalid comparison result format:", res.data);
                setComparisonResult(null);
            }
        } catch (e) {
            console.error("Error in comparison:", e);
            setComparisonResult(null);
        }
    };

    return (
        <>
            <Head title="Grammar Check" />
            <HeaderNavbar />
            <GrammarCheckSection />
            {/* Section with document editor */}
            <section className="relative">
                <div
                    className={`bg-white w-full max-w-7xl mx-auto min-h-screen flex flex-row transition-all duration-300 ${
                        showAccountModal ? "blur-sm" : ""
                    }`}
                >
                    {/* Left side - Document Editor */}
                    <div className="flex-1 flex flex-col bg-gray-50 hover:bg-gray-100 border border-slate-200 p-4">
                        {/* Document Title Input & Article Dropdown */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-white rounded-xl w-[200px] px-2 border border-slate-200">
                                <input
                                    type="text"
                                    value={docTitle}
                                    onChange={(e) => {
                                        setDocTitle(e.target.value);
                                        setSelectedArticle(null);
                                        setAudioUrl(null);
                                        setAudioError(null);
                                    }}
                                    className="w-full text-[16px] font-medium text-gray-700 bg-transparent border-none outline-none placeholder-gray-500 px-2 py-2 rounded-lg focus:ring-0"
                                    placeholder="Untitled document"
                                />
                            </div>

                            {audioUrl && (
                                <div className="flex items-center justify-center border rounded-3xl shadow-sm w-full max-w-md mx-auto">
                                    <audio
                                        ref={audioRef}
                                        src={audioUrl}
                                        className="w-full rounded-lg h-10 outline-none"
                                        controls
                                    />
                                </div>
                            )}
                            {audioError && (
                                <span className="text-sm text-red-500">
                                    {audioError}
                                </span>
                            )}
                            {!audioUrl && selectedArticle && (
                                <span className="text-sm text-gray-500">
                                    No audio available
                                </span>
                            )}

                            <div className="flex items-center gap-3">
                                {/* Article Dropdown */}
                                <div
                                    className="relative w-[200px]"
                                    ref={dropdownRef}
                                >
                                    <button
                                        type="button"
                                        className={`w-52 px-3 py-2 text-sm rounded-xl border bg-white shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-200 focus:border-blue-400`}
                                        onClick={() =>
                                            setDropdownOpen(!dropdownOpen)
                                        }
                                    >
                                        {selectedArticle
                                            ? selectedArticle.title
                                            : "Select an Article"}
                                        <svg
                                            className={`w-4 h-4 ml-2 transition-transform ${
                                                dropdownOpen
                                                    ? "rotate-180"
                                                    : "rotate-0"
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                <button
                                                    type="button"
                                                    className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                                                        !selectedArticle
                                                            ? "bg-blue-100 text-blue-700 font-bold"
                                                            : "hover:bg-gray-100 text-gray-700"
                                                    }`}
                                                    onClick={() =>
                                                        handleSelectArticle(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Select an Article
                                                </button>
                                                {articles.map((article) => (
                                                    <button
                                                        key={article.id}
                                                        type="button"
                                                        className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                                                            selectedArticle &&
                                                            selectedArticle.id ===
                                                                article.id
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() =>
                                                            handleSelectArticle(
                                                                article
                                                            )
                                                        }
                                                    >
                                                        {/* Show both ID and title */}
                                                        <span className="font-mono text-gray-500">
                                                            #{article.id}
                                                        </span>
                                                        <span>
                                                            {article.title}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Textarea */}
                        <div className="flex-1">
                            {/* Always show textarea for editing, and overlay the highlighted comparison if available */}
                            <div className="relative w-full h-full">
                                <textarea
                                    className={`w-full h-full text-[17.5px] bg-white border border-slate-200 outline-none p-4 placeholder:text-gray-700 resize-none overflow-y-auto transition-all duration-300 ease-in-out hide-scrollbar ${
                                        isZoomed ? "min-h-[90vh]" : "min-h-[85vh]"
                                    }`}
                                    style={{ boxShadow: "none" }}
                                    placeholder="Type your text here..."
                                    value={paragraph}
                                    onChange={(e) => setParagraph(e.target.value)}
                                    onDoubleClick={() => setIsZoomed(!isZoomed)}
                                />
                                
                            </div>
                            {/* Add Compare Button */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                                    onClick={runCompare}
                                    disabled={
                                        !selectedArticle || !paragraph.trim()
                                    }
                                >
                                    Compare with Article
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Grammar Check Sidebar (no gap) */}
                    <SidebarCheckGrammar
                        text={paragraph}
                        onReplace={setParagraph}
                        checkerId={checkerId}
                    />
                </div>

                {/* Account Modal inside section */}
                {showAccountModal && (
                    <div className="absolute inset-0 bg-opacity-20 flex items-center justify-center z-0 rounded-2xl">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-xl mx-2 relative">
                            <div className="text-center">
                                <h2 className="text-[24px] font-semibold text-gray-900 mb-2">
                                    Create an account to get started
                                </h2>
                                <p className="text-gray-600 text-md leading-relaxed font-sans">
                                    Create a free SorSer account to start
                                    Grammar Checker with AI
                                </p>
                                <div className="space-y-3">
                                    <a
                                        href={route("auth.google")}
                                        className="w-full flex items-center justify-center gap-3 px-3 py-3 border-[3px] border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="#4285f4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34a853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#fbbc05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#ea4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        <span className="text-gray-700 font-medium">
                                            Sign Up with Google
                                        </span>
                                    </a>

                                    <Link
                                        href={route("register")}
                                        className="w-full flex items-center justify-center gap-3 px-3 py-3 border-[3px] border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <svg
                                                className="w-12 h-12 text-gray-700"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-500">
                                            Sign Up by Email
                                        </span>
                                    </Link>
                                </div>

                                <div className="mt-6 text-md">
                                    <span className="text-gray-500">Or </span>
                                    <Link href={route("login")}>
                                        <span className="text-blue-500 font-medium">
                                            Sign In
                                        </span>
                                    </Link>{" "}
                                    to an existing account
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Copy/Paste/Cut block modal */}
            {showBlockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-xl shadow-lg p-6 min-w-[300px] flex flex-col items-center pointer-events-auto border border-blue-600">
                        <span className="text-lg font-semibold text-gray-800 mb-2">
                            Copy, Paste, and Cut are disabled!
                        </span>
                        <button
                            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                            onClick={() => setShowBlockModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            <GrammarCheckHeader />

            <Footer />
        </>
    );
}
