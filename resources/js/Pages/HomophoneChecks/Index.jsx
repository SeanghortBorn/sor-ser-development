import React, { useState, useEffect, useRef } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import Footer from "@/Components/Footer/Footer";
import GrammarCheckSection from "@/Components/GrammarChecks/GrammarCheckSection";
import GrammarCheckHeader from "@/Components/GrammarChecks/GrammarCheckHeader";
import SidebarCheckGrammar from "@/Components/GrammarChecks/SidebarCheckGrammar";
import axios from "axios";

export default function Index() {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;

    // State for modals
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

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

    // Audio management
    const audioRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(null);

    // Comparison result state
    const [comparisonResult, setComparisonResult] = useState(null);
    const [isChecking, setIsChecking] = useState(false); // Add loading state

    // Fetch history on mount
    const fetchHistory = () => {
        if (!userId) return; // Don't fetch if user is not authenticated
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
            .catch((err) => {
                // Silently handle 401 errors
                if (err.response?.status !== 401) {
                    console.error("Error fetching history:", err);
                }
                setPreviousDocuments([]);
            });
    };

    // Fetch articles on mount
    useEffect(() => {
        if (!userId) return; // Don't fetch if user is not authenticated
        axios
            .get("/api/articles", { headers: { Accept: "application/json" } })
            .then((res) => {
                setArticles(
                    Array.isArray(res.data) ? res.data : res.data.data || []
                );
            })
            .catch((err) => {
                // Silently handle 401 errors
                if (err.response?.status !== 401) {
                    console.error("Error fetching articles:", err);
                }
                setArticles([]);
            });
    }, [userId]); // Add userId as dependency

    useEffect(() => {
        fetchHistory();
    }, [userId]); // Add userId as dependency

    // Handle outside click for dropdown
    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    // Debounce auto-save
    const saveTimeout = useRef();

    // Khmer word segmentation
    const calculateWordCount = async (text) => {
        if (!text || !text.trim()) return 0;
        try {
            const res = await axios.post(
                "/api/khmer-segment",
                { text },
                { headers: { "Content-Type": "application/json" } }
            );
            return res.data && Array.isArray(res.data.tokens)
                ? res.data.tokens.length
                : text.trim().split(/\s+/).length;
        } catch (e) {
            console.error("Khmer segment API error:", e);
            return text.trim().split(/\s+/).length;
        }
    };

    const calculateReadingTime = (wordCount) =>
        Math.ceil((wordCount / 200) * 60);

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

    useEffect(() => {
        if (!userId || (!docTitle.trim() && !paragraph.trim())) return;
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

    // Show account modal for unauthenticated users
    useEffect(() => {
        setShowAccountModal(!auth.user);
    }, [auth.user]);

    // Get article audio URL
    const getArticleAudioUrl = (article) => {
        return article?.audio?.file_path || null;
    };

    // Select article
    const handleSelectArticle = async (article) => {
        setSelectedArticle(article);
        setDropdownOpen(false);
        setDocTitle(article ? article.title : "");
        setAudioError(null);

        if (!article) {
            setAudioUrl(null);
            return;
        }

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

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    };

    // Toggle audio playback
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

    // Compare with article
    const runCompare = async () => {
        if (!selectedArticle || !paragraph.trim()) return;
        setIsChecking(true); // Start loading
        try {
            setComparisonResult(null);
            const res = await axios.post("/api/compare", {
                article_id: selectedArticle.id,
                userInput: paragraph,
            });
            if (res.data && Array.isArray(res.data.comparison)) {
                setComparisonResult(res.data);
            } else {
                console.error("Invalid comparison result format:", res.data);
                setComparisonResult(null);
            }
        } catch (e) {
            console.error("Error in comparison:", e);
            setComparisonResult(null);
        } finally {
            setIsChecking(false); // Stop loading
        }
    };

    // Clear comparison result when textarea is cleared or article is deselected
    useEffect(() => {
        if (!paragraph.trim() || !selectedArticle) {
            setComparisonResult(null);
        }
    }, [paragraph, selectedArticle]);

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
                        {/* Left Side - Document Editor */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-[75vh]">
                            {/* Title and Article Dropdown */}
                            <div className="flex justify-between items-center mb-4">
                                {/* Conditionally render title input or audio player */}
                                {audioUrl ? (
                                    <div className="flex-1 mr-4">
                                        <audio
                                            ref={audioRef}
                                            src={audioUrl}
                                            className="w-full rounded-lg h-10"
                                            controls
                                        />
                                    </div>
                                ) : (
                                    <div className="w-64">
                                        <input
                                            type="text"
                                            value={docTitle}
                                            onChange={(e) => {
                                                setDocTitle(e.target.value);
                                                setSelectedArticle(null);
                                                setAudioUrl(null);
                                                setAudioError(null);
                                            }}
                                            className="w-full text-md font-medium text-gray-700 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                            placeholder="Untitled document"
                                        />
                                    </div>
                                )}

                                <div
                                    className="relative w-64"
                                    ref={dropdownRef}
                                >
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                    className={`w-full text-left px-4 py-2 text-sm rounded-xl transition ${
                                                        !selectedArticle
                                                            ? "bg-blue-100 text-blue-700 font-medium"
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
                                                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                                                            selectedArticle &&
                                                            selectedArticle.id ===
                                                                article.id
                                                                ? "bg-blue-100 text-blue-700 font-medium"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() =>
                                                            handleSelectArticle(
                                                                article
                                                            )
                                                        }
                                                    >
                                                        <span className="font-mono text-gray-500">
                                                            #{article.id}
                                                        </span>{" "}
                                                        {article.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Textarea */}
                            <div className="relative">
                                <textarea
                                    className={`w-full h-[54vh] text-lg bg-white border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 resize-none overflow-y-auto hide-scrollbar ${
                                        isZoomed ? "min-h-[50vh]" : ""
                                    }`}
                                    placeholder="Type your text here..."
                                    value={paragraph}
                                    onChange={(e) =>
                                        setParagraph(e.target.value)
                                    }
                                    onDoubleClick={() => setIsZoomed(!isZoomed)}
                                    // onCopy={handleBlock}
                                    // onPaste={handleBlock}
                                    // onCut={handleBlock}
                                />
                            </div>

                            {/* Compare Button and Word Count */}
                            <div className="flex justify-end items-center mt-2">
                                <button
                                    type="button"
                                    className="px-3 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    onClick={runCompare}
                                    disabled={
                                        !selectedArticle || !paragraph.trim() || isChecking
                                    }
                                >
                                    {isChecking && (
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    )}
                                    {isChecking ? "Checking..." : "Check Homophone"}
                                </button>
                            </div>
                        </div>

                        {/* Right Side - Sidebar */}
                        <SidebarCheckGrammar
                            text={paragraph}
                            onReplace={setParagraph}
                            checkerId={checkerId}
                            comparisonResult={comparisonResult}
                            setComparisonResult={setComparisonResult}
                        />
                    </div>
                </div>

                {/* Account Modal */}
                {showAccountModal && (
                    <div className="absolute inset-0 bg-opacity-20 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-xl mx-4">
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

            <GrammarCheckHeader />
            <Footer />
        </>
    );
}
