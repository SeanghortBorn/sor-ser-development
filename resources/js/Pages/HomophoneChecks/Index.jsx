import React, { useState, useEffect, useRef } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import axios from "axios";
import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import Footer from "@/Components/Footer/Footer";
import GrammarCheckSection from "@/Components/GrammarChecks/GrammarCheckSection";
import GrammarCheckHeader from "@/Components/GrammarChecks/GrammarCheckHeader";
import SidebarCheckGrammar from "@/Components/GrammarChecks/SidebarCheckGrammar";
import Modal from "@/Components/Modal";
import ErrorBoundary from "@/Components/ErrorBoundary";
import { ComponentLoader } from "@/Components/LoadingFallback";
import { lazyLoad } from "@/utils/lazyLoad";
import { useHomophoneStore, useNotificationStore, useAuthStore } from "@/stores";
import homophoneApi from "@/services/homophoneApi";
import { useHomophoneStats } from "@/hooks/useHomophoneStats";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { calculateWordCount, calculateReadingTime } from "@/utils/homophoneUtils";

// Lazy load modals for better performance
const DetailsModal = lazyLoad(
    () => import("@/Components/HomophoneChecks/DetailsModal"),
    { fallback: <ComponentLoader type="spinner" /> }
);

const HistoryModal = lazyLoad(
    () => import("@/Components/HomophoneChecks/HistoryModal"),
    { fallback: <ComponentLoader type="spinner" /> }
);

const HistoryDetailModal = lazyLoad(
    () => import("@/Components/HomophoneChecks/HistoryDetailModal"),
    { fallback: <ComponentLoader type="spinner" /> }
);

const CompletionModal = lazyLoad(
    () => import("@/Components/HomophoneChecks/CompletionModal"),
    { fallback: <ComponentLoader type="spinner" /> }
);

export default function Index({ articles: initialArticles = [], userRole }) {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;

    // Zustand stores
    const { setUser, can: canPermission } = useAuthStore();
    const { success, error: showError } = useNotificationStore();
    const {
        articleId: storeArticleId,
        userText: storeUserText,
        comparisonResults: storeComparisonResults,
        metrics: storeMetrics,
        setUserText: setStoreUserText,
        initializeSession,
        setComparisonResults: setStoreComparisonResults,
        calculateAccuracy,
        resetSession,
    } = useHomophoneStore();

    // Initialize auth store
    useEffect(() => {
        if (auth?.user) {
            setUser(auth.user);
        }
    }, [auth?.user, setUser]);

    // State
    const [articles] = useState(initialArticles);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [docTitle, setDocTitle] = useState("");
    const [paragraph, setParagraph] = useState("");
    const [checkerId, setCheckerId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    // Live progress state
    const [liveProgress, setLiveProgress] = useState({
        currentAccuracy: 0,
        minRequired: 70,
        bestAccuracy: 0,
        comparisonAccuracy: 0,
        currentTypingSpeed: 0,
    });

    // Typing speed tracking
    const [typingStartTime, setTypingStartTime] = useState(null);
    const [totalTypingTime, setTotalTypingTime] = useState(0);

    // Deleted character tracking
    const [deletedCharsCount, setDeletedCharsCount] = useState(0);
    const [deletedCharsDetail, setDeletedCharsDetail] = useState([]);

    // Modals
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showHistoryDetailModal, setShowHistoryDetailModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionData, setCompletionData] = useState(null);

    // History
    const [historyItems, setHistoryItems] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    // Permissions
    const [canAccessLibrary, setCanAccessLibrary] = useState(() => {
        if (auth?.can?.student === true) return true;
        if (auth?.can?.student === false) return false;
        if (typeof window !== "undefined" && window.__canAccessLibrary !== undefined) {
            return window.__canAccessLibrary;
        }
        return null;
    });

    // Dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Refs
    const creatingNewRef = useRef(false);
    const saveTimeout = useRef();
    const lastTypedValueRef = useRef("");

    // Custom hooks - Current session stats
    const currentStats = useHomophoneStats();

    // Custom hooks - History detail stats
    const historyDetailStats = useHomophoneStats();

    // Custom hook - Audio player
    const audioPlayer = useAudioPlayer(userId, selectedArticle, checkerId, sessionId);

    // Calculate current accuracy from comparison result
    const getCurrentAccuracy = () => {
        if (!comparisonResult?.stats || !comparisonResult?.article_words) return 0;
        const correctWords = comparisonResult.stats.same || 0;
        const totalWords = comparisonResult.article_words.length || 0;
        return totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
    };

    // Generate session ID on mount
    useEffect(() => {
        const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(id);
        try {
            sessionStorage.setItem("sessionId", id);
        } catch (e) {
            // ignore storage errors
        }
    }, []);

    // Check library access permission
    useEffect(() => {
        if (canAccessLibrary !== null || !auth?.user) return;

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(route("api.user.can-access-library"), {
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                });
                const allowed = res.ok;
                if (!cancelled) {
                    setCanAccessLibrary(allowed);
                    if (typeof window !== "undefined") {
                        window.__canAccessLibrary = allowed;
                    }
                }
            } catch (err) {
                if (!cancelled) setCanAccessLibrary(false);
            }
        })();

        return () => (cancelled = true);
    }, [auth?.user, canAccessLibrary]);

    // Show account modal for unauthenticated users
    useEffect(() => {
        setShowAccountModal(!auth.user);
    }, [auth.user]);

    // Handle outside click for dropdown
    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    // Reset typing timer and deleted characters tracking when article changes
    useEffect(() => {
        setTypingStartTime(null);
        setTotalTypingTime(0);
        setDeletedCharsCount(0);
        setDeletedCharsDetail([]);
    }, [selectedArticle?.id]);

    // Sync with Zustand store when article changes
    useEffect(() => {
        if (selectedArticle) {
            initializeSession(selectedArticle.id, selectedArticle.content);
        } else {
            resetSession();
        }
    }, [selectedArticle, initializeSession, resetSession]);

    // Format time utility
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Clear comparison result when textarea is cleared or article is deselected
    useEffect(() => {
        if (!paragraph.trim() || !selectedArticle) {
            setComparisonResult(null);
            setLiveProgress({
                currentAccuracy: 0,
                minRequired: 70,
                bestAccuracy: 0,
                comparisonAccuracy: 0,
                currentTypingSpeed: 0,
            });
        }
    }, [paragraph, selectedArticle]);

    // Update live progress when paragraph or article changes
    useEffect(() => {
        if (!selectedArticle) {
            setLiveProgress({
                currentAccuracy: 0,
                minRequired: 70,
                bestAccuracy: 0,
                comparisonAccuracy: 0,
                currentTypingSpeed: 0,
            });
            return;
        }

        const updateProgress = async () => {
            let typedWordCount = 0;
            let articleWordCount = 0;

            if (comparisonResult?.user_words && comparisonResult?.article_words) {
                typedWordCount = comparisonResult.user_words.length;
                articleWordCount = comparisonResult.article_words.length;
            } else {
                typedWordCount = await calculateWordCount(paragraph);
            }

            const currentAccuracy = articleWordCount > 0
                ? Math.min(100, (typedWordCount / articleWordCount) * 100)
                : 0;

            // Use min_typed_words_percentage as the default minimum (for typing percentage)
            const minRequired = selectedArticle.min_typed_words_percentage || 70;
            const bestAccuracy = selectedArticle.best_accuracy || 0;

            // Calculate comparison accuracy (from comparison results)
            const comparisonAccuracy = comparisonResult?.accuracy || 0;

            // Calculate current typing speed
            let currentTypingSpeed = 0;
            if (typingStartTime && paragraph.trim()) {
                const elapsedTimeMs = Date.now() - typingStartTime;
                const elapsedTimeMinutes = elapsedTimeMs / (1000 * 60);
                const wordCount = paragraph.trim().split(/\s+/).length;
                currentTypingSpeed = elapsedTimeMinutes > 0 ? Math.round(wordCount / elapsedTimeMinutes) : 0;
            }

            setLiveProgress({
                currentAccuracy,
                minRequired,
                bestAccuracy,
                comparisonAccuracy,
                currentTypingSpeed,
            });
        };

        updateProgress();
    }, [paragraph, selectedArticle, comparisonResult]);

    // Fetch history
    const fetchHistory = async () => {
        if (!userId) return [];
        try {
            const res = await axios.get("/grammar-checkers", {
                headers: { Accept: "application/json" },
            });
            const docs = Array.isArray(res.data) ? res.data : res.data.data || [];
            return docs;
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error("Error fetching history:", err);
                showError("Failed to fetch history");
            }
            return [];
        }
    };

    // Load history items for modal
    const loadHistoryItems = async () => {
        setHistoryLoading(true);
        const docs = await fetchHistory();
        setHistoryItems(docs);
        setHistoryLoading(false);
    };

    // Compare with article using API service
    const runCompare = async () => {
        if (!selectedArticle || !paragraph.trim()) return;
        setIsChecking(true);
        try {
            const result = await homophoneApi.checkText({
                originalText: selectedArticle.content,
                userText: paragraph,
                articleId: selectedArticle.id,
                userId: userId,
                sessionId: sessionId,
            });

            if (result && Array.isArray(result.comparison)) {
                setComparisonResult(result);
                setStoreComparisonResults(result);
                calculateAccuracy();
                success("Text comparison complete!");
            } else {
                console.error("Invalid comparison result format:", result);
                setComparisonResult(null);
                showError("Invalid comparison result");
            }
        } catch (e) {
            console.error("Error in comparison:", e);
            setComparisonResult(null);
            showError("Failed to compare text. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

    // Auto-save
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
            article_id: selectedArticle ? selectedArticle.id : null,
        };

        if (!checkerId) {
            if (creatingNewRef.current) {
                setSaving(false);
                return;
            }
            creatingNewRef.current = true;
            try {
                const res = await axios.post("/grammar-checkers", payload, {
                    headers: { Accept: "application/json" },
                });
                const newId = res.data?.id ?? res.data?.data?.id ?? null;
                if (newId) {
                    setCheckerId(newId);
                    success("Document created and saved");
                }
                setLastSavedAt(Date.now());
                if (selectedArticle && newParagraph.trim()) {
                    runCompare();
                }
            } catch (err) {
                console.error("Save Document error:", err.response?.data ?? err);
                showError("Failed to save document");
            } finally {
                creatingNewRef.current = false;
                setSaving(false);
            }
        } else {
            try {
                const res = await axios.patch(`/grammar-checkers/${checkerId}`, payload, {
                    headers: { Accept: "application/json" },
                });
                const updatedId = res.data?.id ?? res.data?.data?.id ?? checkerId;
                setCheckerId(updatedId);
                setLastSavedAt(Date.now());
                if (selectedArticle && newParagraph.trim()) {
                    runCompare();
                }
            } catch (err) {
                console.error("Save update error:", err.response?.data ?? err);
                showError("Failed to update document");
            } finally {
                setSaving(false);
            }
        }
    };

    // Debounced auto-save
    useEffect(() => {
        if (!userId || (!docTitle.trim() && !paragraph.trim())) return;
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            autoSave(docTitle, paragraph);
        }, 700);
        return () => clearTimeout(saveTimeout.current);
    }, [docTitle, paragraph]);

    // Typing tracker
    const handleTypingTrack = (e) => {
        const newValue = e.target.value;

        // Start typing timer on first keystroke
        if (!typingStartTime && newValue.length > 0) {
            setTypingStartTime(Date.now());
        }

        // Update Zustand store
        setStoreUserText(newValue);

        if (!userId || !checkerId) return;

        const prevValue = lastTypedValueRef.current;
        const prevLen = prevValue.length;
        const currLen = newValue.length;

        if (currLen > prevLen) {
            const addedChars = newValue.slice(prevLen);
            setTimeout(() => {
                addedChars.split('').forEach(char => {
                    axios.post("/api/track/typing", {
                        grammar_checker_id: Number(checkerId),
                        user_id: Number(userId),
                        character: char,
                        status: 1,
                    }).catch(() => {});
                });
            }, 80);
        } else if (currLen < prevLen) {
            const deletedCount = prevLen - currLen;
            const deletedChars = prevValue.slice(-deletedCount);

            // Update local deleted characters tracking
            setDeletedCharsCount(prev => prev + deletedCount);
            setDeletedCharsDetail(prev => [
                ...prev,
                {
                    timestamp: Date.now(),
                    characters: deletedChars,
                    count: deletedCount,
                    position: currLen
                }
            ]);

            setTimeout(() => {
                deletedChars.split('').forEach(char => {
                    axios.post("/api/track/typing", {
                        grammar_checker_id: Number(checkerId),
                        user_id: Number(userId),
                        character: char,
                        status: 0,
                    }).catch(() => {});
                });
            }, 80);
        }

        lastTypedValueRef.current = newValue;
    };

    // Select article
    const handleSelectArticle = async (article) => {
        setSelectedArticle(article);
        setDropdownOpen(false);
        setDocTitle(article ? article.title : "");

        if (!article) {
            audioPlayer.resetAudio();
            audioPlayer.setAudioError(null);
            return;
        }

        const audioId = article.audios_id;
        if (audioId) {
            await audioPlayer.loadAudio(audioId);
        } else {
            audioPlayer.resetAudio();
        }

        if (checkerId) {
            autoSave(docTitle, paragraph);
        }
    };

    // Handle save button click
    const handleSaveClick = async () => {
        if (canAccessLibrary === null) {
            showError("Permission check still in progress, please try again");
            return;
        }

        if (!checkerId) {
            setSaving(true);
            try {
                await autoSave(docTitle, paragraph);

                // Calculate accuracy and save completion
                if (comparisonResult?.stats && selectedArticle) {
                    const stats = comparisonResult.stats;
                    const totalWords = comparisonResult.article_words?.length || 0;
                    const correctWords = stats.same || 0;
                    const accuracyPercentage = totalWords > 0
                        ? (correctWords / totalWords) * 100
                        : 0;

                    await handleSaveCompletion(accuracyPercentage);
                }

                if (canAccessLibrary === true) {
                    setShowDetailsModal(true);
                    setTimeout(() => {
                        if (checkerId) {
                            currentStats.fetchAllStats(checkerId);
                        }
                    }, 0);
                } else {
                    setShowHistoryModal(true);
                    await loadHistoryItems();
                }
            } catch (err) {
                console.error("Error during save:", err);
                showError("Failed to save");
                setSaving(false);
            }
        } else {
            // Calculate and save completion for existing checker
            if (comparisonResult?.stats && selectedArticle) {
                const stats = comparisonResult.stats;
                const totalWords = comparisonResult.article_words?.length || 0;
                const correctWords = stats.same || 0;
                const accuracyPercentage = totalWords > 0
                    ? (correctWords / totalWords) * 100
                    : 0;

                await handleSaveCompletion(accuracyPercentage);
            }

            if (canAccessLibrary === true) {
                setShowDetailsModal(true);
                await currentStats.fetchAllStats(checkerId);
            } else {
                setShowHistoryModal(true);
                await loadHistoryItems();
            }
        }
    };

    // Handle save completion using API service
    const handleSaveCompletion = async (accuracyPercentage) => {
        if (!selectedArticle?.id) {
            console.warn("No article selected for completion");
            return;
        }

        try {
            // Calculate typing speed (WPM)
            let typingSpeed = null;
            if (typingStartTime && paragraph.trim()) {
                const elapsedTimeMs = Date.now() - typingStartTime;
                const elapsedTimeMinutes = elapsedTimeMs / (1000 * 60);
                const wordCount = paragraph.trim().split(/\s+/).length;
                typingSpeed = elapsedTimeMinutes > 0 ? Math.round(wordCount / elapsedTimeMinutes) : 0;
            }

            const result = await homophoneApi.acceptComparison({
                userId,
                articleId: selectedArticle.id,
                sessionId: sessionId,
                accuracy: accuracyPercentage,
                typingSpeed,
                timeSpent: typingStartTime ? Math.round((Date.now() - typingStartTime) / 1000) : 0,
                grammarCheckerId: checkerId,
                metadata: {
                    ...storeMetrics,
                    accuracy: accuracyPercentage,
                },
            });

            if (result.success) {
                // Add additional metrics to completion data
                const enhancedCompletionData = {
                    ...result.completion,
                    totalTimeSpent: typingStartTime ? Math.round((Date.now() - typingStartTime) / 1000) : 0,
                    deletedCharsCount: deletedCharsCount,
                    deletedCharsDetail: deletedCharsDetail,
                };
                setCompletionData(enhancedCompletionData);
                setShowCompletionModal(true);
                success("Completion saved successfully!");

                // Update live progress with new best accuracy
                setLiveProgress(prev => ({
                    ...prev,
                    bestAccuracy: result.completion.best_accuracy || prev.bestAccuracy,
                }));

                // Don't auto-reload - let user close modal manually
            } else {
                showError("Failed to save completion");
            }
        } catch (error) {
            console.error("Save completion error:", error);
            showError("Failed to save completion. Please try again.");
        }
    };

    // Handle history item view
    const handleHistoryItemView = async (item) => {
        setSelectedHistoryItem(item);
        setShowHistoryDetailModal(true);
        await historyDetailStats.fetchAllStats(item.id);
    };

    // Block copy/paste/cut
    const handleBlock = (e) => {
        e.preventDefault();
        setShowBlockModal(true);
    };

    return (
        <>
            <Head title="Homophone Check" />
            <HeaderNavbar />
            <GrammarCheckSection />

            <section className="relative py-4">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div
                        className={`flex flex-row gap-4 transition-all duration-300 ${
                            showAccountModal ? "blur-sm" : ""
                        }`}
                    >
                        {/* Left Side - Document Editor - Wrapped in Error Boundary */}
                        <ErrorBoundary
                            fallback={
                                <div className="flex-1 bg-white rounded-xl border border-red-200 shadow-sm p-6 h-[75vh] flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-red-600 mb-2">Editor Error</p>
                                        <p className="text-sm text-gray-600">Failed to load editor. Please refresh the page.</p>
                                    </div>
                                </div>
                            }
                        >
                            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-[75vh]">
                                {/* Title and Article Dropdown */}
                                <div className="flex justify-between items-center mb-4">
                                    {/* Audio Player */}
                                    {(selectedArticle?.audios_id || audioPlayer.audioUrl) ? (
                                        <div className="flex-1 mr-4">
                                            <audio
                                                ref={audioPlayer.audioRef}
                                                src={audioPlayer.audioUrl}
                                                onTimeUpdate={audioPlayer.handleTimeUpdate}
                                                onLoadedMetadata={audioPlayer.handleLoadedMetadata}
                                                onEnded={audioPlayer.handleAudioEnded}
                                                className="hidden"
                                            />
                                            <div className="bg-white border border-gray-300 rounded-xl px-3 py-1 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={audioPlayer.togglePlay}
                                                        disabled={!audioPlayer.audioUrl}
                                                        className={`w-6 h-6 flex items-center justify-center text-white rounded-full transition ${
                                                            audioPlayer.audioUrl
                                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                                : 'bg-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {audioPlayer.isPlaying ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <div className="flex space-x-0">
                                                        <button
                                                            onClick={audioPlayer.skipBackward}
                                                            disabled={!audioPlayer.audioUrl}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                                                                audioPlayer.audioUrl ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
                                                            }`}
                                                            title="Back 10s"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                                <path d="M3 3v5h5" />
                                                                <text x="12" y="16" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={audioPlayer.skipForward}
                                                            disabled={!audioPlayer.audioUrl}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
                                                                audioPlayer.audioUrl ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
                                                            }`}
                                                            title="Forward 10s"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                                                <path d="M21 3v5h-5" />
                                                                <text x="12" y="16" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="flex-1 flex items-center gap-2">
                                                        {audioPlayer.audioUrl ? (
                                                            <>
                                                                <span className="text-xs text-gray-600 font-medium min-w-[35px]">{formatTime(audioPlayer.currentTime)}</span>
                                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative" onClick={audioPlayer.handleSeek}>
                                                                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(audioPlayer.currentTime / audioPlayer.duration) * 100 || 0}%` }} />
                                                                </div>
                                                                <span className="text-xs text-gray-600 font-medium min-w-[35px]">{formatTime(audioPlayer.duration)}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 italic">Loading audio...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}

                                    {/* Article Dropdown */}
                                    <div className="relative w-64" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            {selectedArticle ? selectedArticle.title : "Select an Article"}
                                            <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {dropdownOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                                <div className="px-2 py-2 space-y-1">
                                                    <button
                                                        type="button"
                                                        className={`w-full text-left px-4 py-2 text-sm rounded-xl transition ${!selectedArticle ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"}`}
                                                        onClick={() => handleSelectArticle(null)}
                                                    >
                                                        Select an Article
                                                    </button>
                                                    {articles.map((article, idx) => (
                                                        <button
                                                            key={article.id}
                                                            type="button"
                                                            disabled={!article.can_access}
                                                            className={`w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                                                                selectedArticle && selectedArticle.id === article.id
                                                                    ? "bg-blue-100 text-blue-700 font-medium"
                                                                    : article.can_access
                                                                    ? "hover:bg-gray-100 text-gray-700"
                                                                    : "opacity-40 cursor-not-allowed text-gray-400"
                                                            }`}
                                                            onClick={() => article.can_access && handleSelectArticle(article)}
                                                            title={!article.can_access ? article.lock_message : ""}
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    {!article.can_access && <span className="text-sm">🔒</span>}
                                                                    <span className="font-mono text-gray-500">{idx + 1}</span>
                                                                    {". "}
                                                                    <span>{article.title}</span>
                                                                </div>
                                                                {article.is_completed && (
                                                                    <div className="ml-8 flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                                                                            Completed
                                                                        </span>
                                                                        {article.best_accuracy && (
                                                                            <span className="text-xs text-gray-600">
                                                                                Best: {article.best_accuracy}%
                                                                                {article.typing_speed && ` • ${article.typing_speed} WPM`}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Textarea */}
                                <div className="relative mt-4">
                                    <textarea
                                        className={`w-full h-[54vh] text-md bg-white border border-gray-200 rounded-xl py-3 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 resize-none overflow-y-auto hide-scrollbar ${
                                            isZoomed ? "min-h-[50vh]" : ""
                                        }`}
                                        placeholder="Type your text here..."
                                        value={paragraph}
                                        onChange={(e) => {
                                            setParagraph(e.target.value);
                                            handleTypingTrack(e);
                                        }}
                                        onInput={handleTypingTrack}
                                        onDoubleClick={() => setIsZoomed(!isZoomed)}
                                        disabled={!selectedArticle}
                                        onCopy={handleBlock}
                                        onPaste={handleBlock}
                                        onCut={handleBlock}
                                    />
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end items-center mt-1">
                                    <button
                                        type="button"
                                        onClick={handleSaveClick}
                                        disabled={
                                            saving ||
                                            isChecking ||
                                            !paragraph.trim() ||
                                            canAccessLibrary === null
                                        }
                                        className={`px-6 py-1 rounded-xl font-medium transition ${
                                            saving ||
                                            isChecking ||
                                            !paragraph.trim() ||
                                            canAccessLibrary === null
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        {saving || isChecking ? "Checking..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </ErrorBoundary>

                        {/* Right Side - Sidebar - Wrapped in Error Boundary */}
                        <ErrorBoundary
                            fallback={
                                <div className="w-80 bg-white rounded-xl border border-red-200 shadow-sm p-6 flex items-center justify-center">
                                    <p className="text-sm text-red-600">Sidebar unavailable</p>
                                </div>
                            }
                        >
                            <SidebarCheckGrammar
                                text={paragraph}
                                onReplace={setParagraph}
                                checkerId={checkerId}
                                comparisonResult={comparisonResult}
                                setComparisonResult={setComparisonResult}
                                articleId={selectedArticle?.id}
                                isChecking={isChecking}
                                liveProgress={liveProgress}
                                selectedArticle={selectedArticle}
                                currentAccuracy={getCurrentAccuracy()}
                            />
                        </ErrorBoundary>
                    </div>
                </div>
            </section>

            {/* Modals - Wrapped in Error Boundaries */}
            <ErrorBoundary fallback={null}>
                <DetailsModal
                    show={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    docTitle={docTitle}
                    paragraph={paragraph}
                    lastSavedAt={lastSavedAt}
                    statsData={{
                        comparisonActivities: currentStats.comparisonActivities,
                        accuracyStats: currentStats.accuracyStats,
                        activityStats: currentStats.activityStats,
                        audioActivities: currentStats.audioActivities,
                        loadingAccuracyStats: currentStats.loadingAccuracyStats,
                        loadingActivityStats: currentStats.loadingActivityStats,
                        loadingAudioActivities: currentStats.loadingAudioActivities,
                    }}
                />
            </ErrorBoundary>

            <ErrorBoundary fallback={null}>
                <HistoryModal
                    show={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    historyItems={historyItems}
                    loading={historyLoading}
                    onViewItem={handleHistoryItemView}
                />
            </ErrorBoundary>

            <ErrorBoundary fallback={null}>
                <HistoryDetailModal
                    show={showHistoryDetailModal}
                    onClose={() => {
                        setShowHistoryDetailModal(false);
                        setSelectedHistoryItem(null);
                    }}
                    historyItem={selectedHistoryItem}
                    statsData={{
                        comparisonActivities: historyDetailStats.comparisonActivities,
                        accuracyStats: historyDetailStats.accuracyStats,
                        activityStats: historyDetailStats.activityStats,
                        audioActivities: historyDetailStats.audioActivities,
                        loadingAccuracyStats: historyDetailStats.loadingAccuracyStats,
                        loadingActivityStats: historyDetailStats.loadingActivityStats,
                        loadingAudioActivities: historyDetailStats.loadingAudioActivities,
                    }}
                />
            </ErrorBoundary>

            <ErrorBoundary fallback={null}>
                <CompletionModal
                    show={showCompletionModal}
                    completionData={completionData}
                    onClose={() => {
                        setShowCompletionModal(false);
                        // Don't reload here - let the modal handle redirect/reload
                    }}
                />
            </ErrorBoundary>

            {/* Account Modal */}
            {showAccountModal && (
                <div className="absolute inset-0 bg-opacity-20 flex items-center justify-center z-10">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-xl mx-4">
                        <div className="text-center">
                            <h2 className="text-[24px] font-semibold text-gray-900 mb-2">
                                Create an account to get started
                            </h2>
                            <p className="text-gray-600 text-md leading-relaxed font-sans">
                                Create a free SorSer account to start Grammar Checker with AI
                            </p>
                            <div className="space-y-3">
                                <a
                                    href={route("auth.google")}
                                    className="w-full flex items-center justify-center gap-3 px-3 py-3 border-[3px] border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                                    <span className="text-blue-500 font-medium">Sign In</span>
                                </Link>{" "}
                                to an existing account
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Modal */}
            <Modal show={showBlockModal} onClose={() => setShowBlockModal(false)} maxWidth="xl">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setShowBlockModal(false);
                    }}
                    className="p-6 space-y-3"
                >
                    <h2 className="text-lg font-semibold text-gray-800">Action Not Allowed</h2>
                    <p className="text-sm text-gray-600">
                        Copy, paste, and cut actions are disabled while typing in this field.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded">
                            Please type manually.
                        </span>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                        <button
                            type="button"
                            onClick={() => setShowBlockModal(false)}
                            className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </form>
            </Modal>

            <GrammarCheckHeader />
            <Footer />
        </>
    );
}
