import React, { useState, useEffect, useRef } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import Footer from "@/Components/Footer/Footer";
import GrammarCheckSection from "@/Components/GrammarChecks/GrammarCheckSection";
import GrammarCheckHeader from "@/Components/GrammarChecks/GrammarCheckHeader";
import SidebarCheckGrammar from "@/Components/GrammarChecks/SidebarCheckGrammar";
import Modal from "@/Components/Modal";
import axios from "axios";

export default function Index() {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;

    // State for modals
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyItems, setHistoryItems] = useState([]);
    const [showHistoryDetailModal, setShowHistoryDetailModal] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [
        historyDetailComparisonActivities,
        setHistoryDetailComparisonActivities,
    ] = useState([]);
    const [loadingHistoryDetailActivities, setLoadingHistoryDetailActivities] =
        useState(false);
    const [historyDetailAudioActivities, setHistoryDetailAudioActivities] =
        useState([]);
    const [loadingHistoryDetailAudio, setLoadingHistoryDetailAudio] =
        useState(false);
    const [historyDetailStats, setHistoryDetailStats] = useState(null);
    const [loadingHistoryDetailStats, setLoadingHistoryDetailStats] =
        useState(false);
    const [historyDetailAccuracy, setHistoryDetailAccuracy] = useState(null);
    const [loadingHistoryDetailAccuracy, setLoadingHistoryDetailAccuracy] =
        useState(false);
    const [activityStats, setActivityStats] = useState(null);
    const [loadingActivityStats, setLoadingActivityStats] = useState(false);
    const [accuracyStats, setAccuracyStats] = useState(null);
    const [loadingAccuracyStats, setLoadingAccuracyStats] = useState(false);
    const [comparisonActivities, setComparisonActivities] = useState([]);
    const [loadingComparisonActivities, setLoadingComparisonActivities] =
        useState(false);

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
    const [isChecking, setIsChecking] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Add session tracking
    const [sessionId, setSessionId] = useState(null);
    // Add pause tracking
    const [pauseStartTime, setPauseStartTime] = useState(null);

    // Prevent duplicate concurrent "create" requests
    const creatingNewRef = useRef(false);

    // Track last saved time for minimal UI feedback
    const [lastSavedAt, setLastSavedAt] = useState(null);

    // Best possible initial value
    const [canAccessLibrary, setCanAccessLibrary] = useState(() => {
        // 1. If Laravel already gave us the permission → use it
        if (auth?.can?.student === true) return true;
        if (auth?.can?.student === false) return false;

        // 2. If we have it cached from previous session
        if (
            typeof window !== "undefined" &&
            window.__canAccessLibrary !== undefined
        ) {
            return window.__canAccessLibrary;
        }

        // 3. Default = null (still loading)
        return null;
    });

    // Only call API when we really don't know yet
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

    useEffect(() => {
        // Generate session ID on mount
        const id = `session-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        setSessionId(id);
        try {
            sessionStorage.setItem("sessionId", id); // <-- persist for other components
        } catch (e) {
            // ignore storage errors
        }
    }, []);

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

    // NEW: fetch activity stats
    async function fetchActivityStatsForModal(grammarCheckerId = null) {
        if (!grammarCheckerId) return;
        setLoadingActivityStats(true);
        try {
            const endpoints = [
                `/api/user-activities/stats`,
                `/api/user-activity-stats`,
                `/api/stats/user-activities`,
            ];

            for (const endpoint of endpoints) {
                try {
                    const res = await axios.get(endpoint, {
                        params: { grammar_checker_id: grammarCheckerId },
                        headers: { Accept: "application/json" },
                    });
                    const data = res.data?.data ?? res.data ?? null;
                    if (data && typeof data === "object") {
                        // console.log(
                        //     "Activity stats loaded from",
                        //     endpoint,
                        //     data
                        // );
                        setActivityStats(data);
                        setLoadingActivityStats(false);
                        return;
                    }
                } catch (e) {
                    // Try next endpoint
                    continue;
                }
            }
            setActivityStats(null);
        } catch (err) {
            console.error("Error fetching activity stats:", err);
            setActivityStats(null);
        } finally {
            setLoadingActivityStats(false);
        }
    }

    // NEW: fetch accuracy stats for modal
    async function fetchAccuracyStatsForModal(grammarCheckerId = null) {
        if (!grammarCheckerId) return;
        setLoadingAccuracyStats(true);
        try {
            const endpoints = [
                `/api/user-homophone-accuracies?grammar_checker_id=${grammarCheckerId}`,
                `/api/homophone-accuracies?grammar_checker_id=${grammarCheckerId}`,
                `/api/accuracies?grammar_checker_id=${grammarCheckerId}`,
            ];

            for (const endpoint of endpoints) {
                try {
                    const res = await axios.get(endpoint, {
                        headers: { Accept: "application/json" },
                    });
                    const data = res.data?.data ?? res.data ?? null;
                    if (data) {
                        // Handle both single object and array responses
                        const accuracy = Array.isArray(data) ? data[0] : data;
                        if (accuracy) {
                            // console.log(
                            //     "Accuracy stats loaded from",
                            //     endpoint,
                            //     accuracy
                            // );
                            setAccuracyStats(accuracy);
                            setLoadingAccuracyStats(false);
                            return;
                        }
                    }
                } catch (e) {
                    // Try next endpoint
                    continue;
                }
            }
            setAccuracyStats(null);
        } catch (err) {
            console.error("Error fetching accuracy stats:", err);
            setAccuracyStats(null);
        } finally {
            setLoadingAccuracyStats(false);
        }
    }
    async function fetchComparisonActivitiesForModal(grammarCheckerId = null) {
        if (!grammarCheckerId) return;
        setLoadingComparisonActivities(true);
        try {
            const res = await axios.get(`/api/user-comparison-activities`, {
                params: {
                    grammar_checker_id: grammarCheckerId,
                    limit: 50,
                },
                headers: { Accept: "application/json" },
            });
            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.data ?? [];
            setComparisonActivities(data);
        } catch (err) {
            console.error("Error fetching comparison activities:", err);
            setComparisonActivities([]);
        } finally {
            setLoadingComparisonActivities(false);
        }
    }

    // Handle save button click - shows appropriate modal based on permissions
    const handleSaveClick = async () => {
        // If permission check is still pending (null), don't proceed
        if (canAccessLibrary === null) {
            console.warn(
                "Permission check still in progress, please try again"
            );
            return;
        }

        // Ensure document is saved first
        if (!checkerId) {
            // Document not yet created, trigger save
            setSaving(true);
            try {
                await autoSave(docTitle, paragraph);
                // After auto-save creates the document, show modal
                if (canAccessLibrary === true) {
                    // Student with library access: show details modal
                    setShowDetailsModal(true);
                    // Fetch stats with the newly created checkerId
                    setTimeout(async () => {
                        if (checkerId) {
                            await Promise.all([
                                fetchActivityStatsForModal(checkerId),
                                fetchComparisonActivitiesForModal(checkerId),
                                fetchAccuracyStatsForModal(checkerId),
                            ]);
                        }
                    }, 0);
                } else {
                    // No student permission: show history modal
                    setShowHistoryModal(true);
                    await loadHistoryItems();
                }
            } catch (err) {
                console.error("Error during save:", err);
                setSaving(false);
            }
        } else {
            // Document already saved, just show modal
            if (canAccessLibrary === true) {
                // Student with library access: show details modal
                setShowDetailsModal(true);
                await Promise.all([
                    fetchActivityStatsForModal(checkerId),
                    fetchComparisonActivitiesForModal(checkerId),
                    fetchAccuracyStatsForModal(checkerId),
                ]);
            } else {
                // No student permission: show history modal
                setShowHistoryModal(true);
                await loadHistoryItems();
            }
        }
    };

    // Load history items for history modal
    const loadHistoryItems = async () => {
        setHistoryLoading(true);
        try {
            const res = await axios.get("/grammar-checkers", {
                headers: { Accept: "application/json" },
            });
            const docs = Array.isArray(res.data)
                ? res.data
                : res.data.data || [];
            setHistoryItems(docs);
        } catch (err) {
            console.error("Error fetching history:", err);
            setHistoryItems([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Helper to format numbers
    const formatNumber = (v, decimals = 2) => {
        if (v == null || isNaN(v)) return "—";
        return Number(v).toFixed(decimals);
    };

    // Fetch comparison activities for history detail modal
    async function fetchHistoryDetailComparisonActivities(
        grammarCheckerId = null
    ) {
        if (!grammarCheckerId) return;
        setLoadingHistoryDetailActivities(true);
        try {
            const res = await axios.get(`/api/user-comparison-activities`, {
                params: { grammar_checker_id: grammarCheckerId, limit: 50 },
                headers: { Accept: "application/json" },
            });
            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.data ?? [];
            setHistoryDetailComparisonActivities(data);
        } catch (err) {
            console.error("Error fetching history comparison activities:", err);
            setHistoryDetailComparisonActivities([]);
        } finally {
            setLoadingHistoryDetailActivities(false);
        }
    }

    // Fetch audio activities for history detail modal
    async function fetchHistoryDetailAudioActivities(grammarCheckerId = null) {
        if (!grammarCheckerId) return;
        setLoadingHistoryDetailAudio(true);
        try {
            const endpoints = [
                `/api/user-audio-activities`,
                `/api/audio-activities`,
            ];

            for (const endpoint of endpoints) {
                try {
                    const res = await axios.get(endpoint, {
                        params: { grammar_checker_id: grammarCheckerId },
                        headers: { Accept: "application/json" },
                        validateStatus: (status) => status < 500, // Don't throw on 4xx
                    });
                    const data = Array.isArray(res.data)
                        ? res.data
                        : res.data?.data ?? [];
                    if (res.status === 200) {
                        // console.log("Audio activities loaded:", data);
                        setHistoryDetailAudioActivities(data);
                        return;
                    }
                } catch (err) {
                    continue;
                }
            }
            setHistoryDetailAudioActivities([]);
        } catch (err) {
            console.error("Error fetching history audio activities:", err);
            setHistoryDetailAudioActivities([]);
        } finally {
            setLoadingHistoryDetailAudio(false);
        }
    }

    // Fetch accuracy data for history detail modal
    async function fetchHistoryDetailAccuracy(grammarCheckerId = null) {
        if (!grammarCheckerId || !userId) return;
        setLoadingHistoryDetailAccuracy(true);
        try {
            // Try multiple endpoints to find accuracy
            const endpoints = [
                `/api/user-homophone-accuracies?grammar_checker_id=${grammarCheckerId}&user_id=${userId}`,
                `/api/homophone-accuracies?grammar_checker_id=${grammarCheckerId}`,
                `/api/accuracies?grammar_checker_id=${grammarCheckerId}`,
            ];

            for (const endpoint of endpoints) {
                try {
                    const res = await axios.get(endpoint, {
                        headers: { Accept: "application/json" },
                    });
                    const data = res.data?.data ?? res.data ?? null;
                    if (data) {
                        // Handle both single object and array responses
                        const accuracy = Array.isArray(data) ? data[0] : data;
                        if (accuracy && accuracy.accuracy != null) {
                            // console.log("Accuracy loaded:", accuracy);
                            setHistoryDetailAccuracy(accuracy);
                            return;
                        }
                    }
                } catch (e) {
                    // Try next endpoint
                    continue;
                }
            }
            setHistoryDetailAccuracy(null);
        } catch (err) {
            console.error("Error fetching history detail accuracy:", err);
            setHistoryDetailAccuracy(null);
        } finally {
            setLoadingHistoryDetailAccuracy(false);
        }
    }

    // Fetch activity stats for history detail modal
    async function fetchHistoryDetailStats(grammarCheckerId = null) {
        if (!grammarCheckerId) return;
        setLoadingHistoryDetailStats(true);
        try {
            // Try multiple endpoints to find stats
            const endpoints = [
                `/api/user-activities/stats`,
                `/api/user-activity-stats`,
                `/api/stats/user-activities`,
            ];

            for (const endpoint of endpoints) {
                try {
                    const res = await axios.get(endpoint, {
                        params: { grammar_checker_id: grammarCheckerId },
                        headers: { Accept: "application/json" },
                    });
                    const data = res.data?.data ?? res.data ?? null;
                    if (data && typeof data === "object") {
                        // console.log("Activity stats loaded:", data);
                        setHistoryDetailStats(data);
                        return;
                    }
                } catch (e) {
                    // Try next endpoint
                    continue;
                }
            }
            setHistoryDetailStats(null);
        } catch (err) {
            console.error("Error fetching history detail stats:", err);
            setHistoryDetailStats(null);
        } finally {
            setLoadingHistoryDetailStats(false);
        }
    }

    // Handle history item view
    const handleHistoryItemView = async (item) => {
        setSelectedHistoryItem(item);
        setShowHistoryDetailModal(true);
        await Promise.all([
            fetchHistoryDetailComparisonActivities(item.id),
            fetchHistoryDetailAudioActivities(item.id),
            fetchHistoryDetailStats(item.id),
            fetchHistoryDetailAccuracy(item.id),
        ]);
    };
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

    // Compare with article
    const runCompare = async () => {
        if (!selectedArticle || !paragraph.trim()) return;
        // DON'T clear comparisonResult here - keep old data during check
        setIsChecking(true); // Start loading
        try {
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
            article_id: selectedArticle ? selectedArticle.id : null, // <-- ADD THIS LINE
        };

        // If no checkerId, ensure only one create request is in-flight
        if (!checkerId) {
            if (creatingNewRef.current) {
                // another create is in progress; skip this create to avoid duplicates
                setSaving(false);
                return;
            }
            creatingNewRef.current = true;
            try {
                const res = await axios.post("/grammar-checkers", payload, {
                    headers: { Accept: "application/json" },
                });
                // Prefer res.data.id or res.data.data.id if API nests it
                const newId = res.data?.id ?? res.data?.data?.id ?? null;
                if (newId) {
                    setCheckerId(newId);
                }
                fetchHistory();
                setLastSavedAt(Date.now());
                // Trigger real-time compare after successful save
                if (selectedArticle && newParagraph.trim()) {
                    runCompare();
                }
            } catch (err) {
                console.error(
                    "Save Document error:",
                    err.response?.data ?? err
                );
            } finally {
                creatingNewRef.current = false;
                setSaving(false);
            }
        } else {
            // Update existing
            try {
                const res = await axios.patch(
                    `/grammar-checkers/${checkerId}`,
                    payload,
                    {
                        headers: { Accept: "application/json" },
                    }
                );
                const updatedId =
                    res.data?.id ?? res.data?.data?.id ?? checkerId;
                setCheckerId(updatedId);
                fetchHistory();
                setLastSavedAt(Date.now());
                // Trigger real-time compare after successful update
                if (selectedArticle && newParagraph.trim()) {
                    runCompare();
                }
            } catch (err) {
                console.error("Save update error:", err.response?.data ?? err);
            } finally {
                setSaving(false);
            }
        }
        // console.log(payload);
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

        // Trigger auto-save to update article_id if checkerId exists
        if (checkerId) {
            autoSave(docTitle, paragraph);
        }
    };

    // Toggle audio playback
    const togglePlay = () => {
        if (!audioUrl || !audioRef.current) {
            setAudioError("No audio available to play.");
            return;
        }
        if (isPlaying) {
            // Pausing audio
            const pauseTime = Date.now();
            setPauseStartTime(pauseTime);
            audioRef.current.pause();
            setIsPlaying(false);

            // Track pause with current playback position
            if (userId && selectedArticle?.audios_id) {
                axios
                    .post("/api/track/audio-activity", {
                        audio_id: selectedArticle.audios_id,
                        article_id: selectedArticle.id,
                        grammar_checker_id: checkerId ?? null, // <-- include checker id
                        activity_type: "audio_pause",
                        playback_position: audioRef.current.currentTime,
                        pause_duration: 0, // Will be calculated on resume
                        session_id: sessionId,
                    })
                    .catch((err) =>
                        console.error("Track audio pause error:", err)
                    );
            }
        } else {
            // Resuming audio
            let pauseDuration = 0;
            if (pauseStartTime) {
                pauseDuration = (Date.now() - pauseStartTime) / 1000; // Convert to seconds
                setPauseStartTime(null);
            }

            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true);
                    // Track play with pause duration
                    if (userId && selectedArticle?.audios_id) {
                        axios
                            .post("/api/track/audio-activity", {
                                audio_id: selectedArticle.audios_id,
                                article_id: selectedArticle.id,
                                grammar_checker_id: checkerId ?? null, // <-- include checker id
                                activity_type: "audio_play",
                                playback_position: audioRef.current.currentTime,
                                pause_duration: pauseDuration,
                                session_id: sessionId,
                            })
                            .catch((err) =>
                                console.error("Track audio play error:", err)
                            );
                    }
                })
                .catch((e) => {
                    console.error("Playback failed:", e);
                    setAudioError("Failed to play audio. Please try again.");
                    setIsPlaying(false);
                });
        }
    };

    // Skip forward 10 seconds
    const skipForward = () => {
        if (audioRef.current) {
            const oldPosition = audioRef.current.currentTime;
            audioRef.current.currentTime = Math.min(
                audioRef.current.currentTime + 10,
                audioRef.current.duration
            );
            // Track forward
            if (userId && selectedArticle?.audios_id) {
                axios
                    .post("/api/track/audio-activity", {
                        audio_id: selectedArticle.audios_id,
                        article_id: selectedArticle.id,
                        grammar_checker_id: checkerId ?? null, // <-- include checker id
                        activity_type: "audio_forward",
                        playback_position: audioRef.current.currentTime,
                        session_id: sessionId,
                    })
                    .catch((err) =>
                        console.error("Track audio forward error:", err)
                    );
            }
        }
    };

    // Skip backward 10 seconds
    const skipBackward = () => {
        if (audioRef.current) {
            const oldPosition = audioRef.current.currentTime;
            audioRef.current.currentTime = Math.max(
                audioRef.current.currentTime - 10,
                0
            );
            // Track rewind
            if (userId && selectedArticle?.audios_id) {
                axios
                    .post("/api/track/audio-activity", {
                        audio_id: selectedArticle.audios_id,
                        article_id: selectedArticle.id,
                        grammar_checker_id: checkerId ?? null, // <-- include checker id
                        activity_type: "audio_rewind",
                        playback_position: audioRef.current.currentTime,
                        session_id: sessionId,
                    })
                    .catch((err) =>
                        console.error("Track audio rewind error:", err)
                    );
            }
        }
    };

    // Handle time update
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    // Handle metadata loaded
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    // Handle audio ended
    const handleAudioEnded = () => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    // Seek to position
    const handleSeek = (e) => {
        if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = pos * audioRef.current.duration;
        }
    };

    // Format time (seconds to mm:ss)
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
                                            onTimeUpdate={handleTimeUpdate}
                                            onLoadedMetadata={
                                                handleLoadedMetadata
                                            }
                                            onEnded={handleAudioEnded}
                                            className="hidden"
                                        />
                                        <div className="bg-white border border-gray-300 rounded-xl px-3 py-1 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                {/* Play/Pause Button */}
                                                <button
                                                    onClick={togglePlay}
                                                    className="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
                                                >
                                                    {isPlaying ? (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <div className="flex space-x-0">
                                                    {/* Skip Backward 10s */}
                                                    <button
                                                        onClick={skipBackward}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
                                                        title="Back 10s"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-gray-700"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                            <path d="M3 3v5h5" />
                                                            <text
                                                                x="12"
                                                                y="16"
                                                                fontSize="8"
                                                                fill="currentColor"
                                                                textAnchor="middle"
                                                                fontWeight="bold"
                                                            >
                                                                10
                                                            </text>
                                                        </svg>
                                                    </button>

                                                    {/* Skip Forward 10s */}
                                                    <button
                                                        onClick={skipForward}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
                                                        title="Forward 10s"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-gray-700"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                                            <path d="M21 3v5h-5" />
                                                            <text
                                                                x="12"
                                                                y="16"
                                                                fontSize="8"
                                                                fill="currentColor"
                                                                textAnchor="middle"
                                                                fontWeight="bold"
                                                            >
                                                                10
                                                            </text>
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="flex-1 flex items-center gap-2">
                                                    <span className="text-xs text-gray-600 font-medium min-w-[35px]">
                                                        {formatTime(
                                                            currentTime
                                                        )}
                                                    </span>
                                                    <div
                                                        className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
                                                        onClick={handleSeek}
                                                    >
                                                        <div
                                                            className="h-full bg-blue-600 rounded-full transition-all"
                                                            style={{
                                                                width: `${
                                                                    (currentTime /
                                                                        duration) *
                                                                        100 || 0
                                                                }%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-600 font-medium min-w-[35px]">
                                                        {formatTime(duration)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // <div className="w-64">
                                    // 	<input
                                    // 		type="text"
                                    // 		value={docTitle}
                                    // 		onChange={(e) => {
                                    // 			setDocTitle(e.target.value);
                                    // 			setSelectedArticle(null);
                                    // 			setAudioUrl(null);
                                    // 			setAudioError(null);
                                    // 		}}
                                    // 		className="w-full text-md font-medium text-gray-700 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                    // 		placeholder="Untitled document"
                                    // 	/>
                                    // </div>
                                    <div></div>
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
                                                {articles.map(
                                                    (article, idx) => (
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
                                                                {idx + 1}
                                                            </span>
                                                            {". "}
                                                            {article.title}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Textarea */}
                            <div className="relative">
                                <textarea
                                    className={`w-full h-[54vh] text-md bg-white border border-gray-200 rounded-xl py-3 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500 resize-none overflow-y-auto hide-scrollbar ${
                                        isZoomed ? "min-h-[50vh]" : ""
                                    }`}
                                    placeholder="Type your text here..."
                                    value={paragraph}
                                    onChange={(e) =>
                                        setParagraph(e.target.value)
                                    }
                                    onDoubleClick={() => setIsZoomed(!isZoomed)}
                                    disabled={!selectedArticle} // <-- disable until article is selected
                                    // onCopy={handleBlock}
                                    // onPaste={handleBlock}
                                    // onCut={handleBlock}
                                />
                            </div>

                            {/* Auto-check status (manual button removed) */}
                            <div className="flex justify-end items-center mt-2">
                                <button
                                    type="button"
                                    onClick={handleSaveClick}
                                    disabled={
                                        saving ||
                                        isChecking ||
                                        !paragraph.trim() ||
                                        canAccessLibrary === null
                                    }
                                    className={`px-6 py-2 rounded-xl font-medium transition ${
                                        saving ||
                                        isChecking ||
                                        !paragraph.trim() ||
                                        canAccessLibrary === null
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {saving || isChecking
                                        ? "Checking..."
                                        : "Save"}
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
                            articleId={selectedArticle?.id}
                            isChecking={isChecking} // <-- ADD THIS LINE
                        />
                    </div>
                </div>

                {/* Details Modal - For Student Users */}
                <Modal
                    show={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    maxWidth="2xl"
                >
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Article Name: {docTitle || "Untitled document"}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Date:{" "}
                            {lastSavedAt
                                ? new Date(lastSavedAt).toLocaleDateString()
                                : "—"}
                        </p>

                        {/* Article details from raw record */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4 text-sm text-gray-700">
                            <div>
                                <div className="font-medium text-slate-500">
                                    Paragraph
                                </div>
                                {/* Constrain long paragraphs and allow scrolling; preserve newlines */}
                                <div className="mt-1 bg-slate-50 p-3 rounded text-sm leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-auto">
                                    {paragraph ?? "—"}
                                </div>
                            </div>
                        </div>

                        {/* Matched accuracy record details if available */}
                        <div className="mb-4">
                            <div className="font-medium text-slate-500 mb-2">
                                Recent Events
                            </div>
                            <div className="w-full bg-white border rounded-lg">
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
                                        {
                                            comparisonActivities.filter(
                                                (act) =>
                                                    act.comparison_type ===
                                                        "replaced" &&
                                                    act.action === "accept"
                                            ).length
                                        }
                                    </span>
                                    <span className="text-gray-400">
                                        {" "}
                                        (a) /{" "}
                                    </span>
                                    <span className="font-medium text-red-700">
                                        {
                                            comparisonActivities.filter(
                                                (act) =>
                                                    act.comparison_type ===
                                                        "replaced" &&
                                                    act.action === "dismiss"
                                            ).length
                                        }
                                    </span>
                                    <span className="text-gray-400"> (d) </span>
                                </div>

                                {/* Missing Count - show accepted/dismissed */}
                                <div>
                                    Missing:{" "}
                                    <span className="font-medium text-green-700">
                                        {
                                            comparisonActivities.filter(
                                                (act) =>
                                                    act.comparison_type ===
                                                        "missing" &&
                                                    act.action === "accept"
                                            ).length
                                        }
                                    </span>
                                    <span className="text-gray-400">
                                        {" "}
                                        (a) /{" "}
                                    </span>
                                    <span className="font-medium text-red-700">
                                        {
                                            comparisonActivities.filter(
                                                (act) =>
                                                    act.comparison_type ===
                                                        "missing" &&
                                                    act.action === "dismiss"
                                            ).length
                                        }
                                    </span>
                                    <span className="text-gray-400"> (d) </span>
                                </div>

                                {/* Extra Count - show accepted/dismissed */}
                                <div>
                                    Extra:{" "}
                                    <span className="font-medium text-green-700">
                                        {
                                            comparisonActivities.filter(
                                                (act) =>
                                                    act.comparison_type ===
                                                        "extra" &&
                                                    act.action === "accept"
                                            ).length
                                        }
                                    </span>
                                    <span className="text-gray-400">
                                        {" "}
                                        (a) /{" "}
                                    </span>
                                    <span className="font-medium text-red-700">
                                        {
                                            comparisonActivities.filter(
                                                (act) =>
                                                    act.comparison_type ===
                                                        "extra" &&
                                                    act.action === "dismiss"
                                            ).length
                                        }
                                    </span>
                                    <span className="text-gray-400"> (d) </span>
                                </div>

                                {/* Accuracy from user_homophone_accuracies table */}
                                <div>
                                    Accuracy:{" "}
                                    <span className="font-medium text-gray-800">
                                        {loadingAccuracyStats
                                            ? "…"
                                            : accuracyStats?.accuracy != null
                                            ? `${Number(
                                                  accuracyStats.accuracy
                                              ).toFixed(2)}%`
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
                                            : "—"}
                                    </span>
                                </div>

                                {/* Audio Play Count */}
                                <div>
                                    Audio Plays:{" "}
                                    <span className="font-medium text-blue-700">
                                        0
                                    </span>
                                </div>

                                {/* Audio Pause Count */}
                                <div>
                                    Audio Pauses:{" "}
                                    <span className="font-medium text-orange-700">
                                        0
                                    </span>
                                </div>

                                {/* Reading Time */}
                                <div>
                                    Reading Time (s):{" "}
                                    <span className="font-medium text-gray-800">
                                        {accuracyStats?.reading_time_seconds ??
                                            "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="rounded-[10px] border-2 border-gray-300 px-6 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* History Modal - For Non-Student Users */}
                <Modal
                    show={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    maxWidth="2xl"
                >
                    <div className="py-6">
                        <div className="flex justify-between items-center mb-4 px-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Homophone History
                            </h3>
                            <button
                                className="text-gray-500 hover:text-gray-700 text-lg mr-2"
                                onClick={() => setShowHistoryModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {historyLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="text-gray-500">
                                    Loading history...
                                </div>
                            </div>
                        ) : historyItems.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <div className="text-gray-500">
                                    No Homophone found.
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                                No
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
                                                Reading Time
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {historyItems.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-medium text-gray-600">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {item.title ||
                                                        "Untitled document"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {new Date(
                                                        item.created_at
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-700">
                                                    {item.word_count ?? "0"}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-700">
                                                    {item.reading_time ?? "0"}s
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        className="rounded-[10px] border-2 border-blue-500 px-3 py-1 text-blue-700 hover:bg-blue-500 hover:text-white transition font-medium"
                                                        onClick={() =>
                                                            handleHistoryItemView(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end px-6">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="rounded-[10px] border-2 border-gray-500 px-4 py-1 text-gray-600 hover:bg-gray-500 hover:text-white transition font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* History Detail Modal - Shows full details of selected grammar check */}
                {showHistoryDetailModal && selectedHistoryItem && (
                    <Modal
                        show={showHistoryDetailModal}
                        onClose={() => {
                            setShowHistoryDetailModal(false);
                            setSelectedHistoryItem(null);
                        }}
                        maxWidth="2xl"
                    >
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                {selectedHistoryItem?.title ||
                                    "Untitled document"}
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                {selectedHistoryItem?.created_at
                                    ? new Date(
                                          selectedHistoryItem.created_at
                                      ).toLocaleDateString()
                                    : "—"}
                            </p>

                            {/* Article details from raw record */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4 text-sm text-gray-700">
                                <div>
                                    <div className="font-medium text-slate-500">
                                        Paragraph
                                    </div>
                                    {/* Constrain long paragraphs and allow scrolling; preserve newlines */}
                                    <div className="mt-1 bg-slate-50 p-3 rounded text-sm leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-auto">
                                        {selectedHistoryItem?.paragraph ?? "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Matched accuracy record details if available */}
                            <div className="mb-4">
                                <div className="font-medium text-slate-500 mb-2">
                                    Recent Events
                                </div>
                                <div className="w-full bg-white border rounded-lg">
                                    {loadingHistoryDetailActivities ? (
                                        <div className="p-3 text-sm text-gray-500">
                                            Loading recent events…
                                        </div>
                                    ) : historyDetailComparisonActivities.length ===
                                      0 ? (
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
                                                    {historyDetailComparisonActivities.map(
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
                                            {
                                                historyDetailComparisonActivities.filter(
                                                    (act) =>
                                                        act.comparison_type ===
                                                            "replaced" &&
                                                        act.action === "accept"
                                                ).length
                                            }
                                        </span>
                                        <span className="text-gray-400">
                                            {" "}
                                            (a) /{" "}
                                        </span>
                                        <span className="font-medium text-red-700">
                                            {
                                                historyDetailComparisonActivities.filter(
                                                    (act) =>
                                                        act.comparison_type ===
                                                            "replaced" &&
                                                        act.action === "dismiss"
                                                ).length
                                            }
                                        </span>
                                        <span className="text-gray-400">
                                            {" "}
                                            (d){" "}
                                        </span>
                                    </div>

                                    {/* Missing Count - show accepted/dismissed */}
                                    <div>
                                        Missing:{" "}
                                        <span className="font-medium text-green-700">
                                            {
                                                historyDetailComparisonActivities.filter(
                                                    (act) =>
                                                        act.comparison_type ===
                                                            "missing" &&
                                                        act.action === "accept"
                                                ).length
                                            }
                                        </span>
                                        <span className="text-gray-400">
                                            {" "}
                                            (a) /{" "}
                                        </span>
                                        <span className="font-medium text-red-700">
                                            {
                                                historyDetailComparisonActivities.filter(
                                                    (act) =>
                                                        act.comparison_type ===
                                                            "missing" &&
                                                        act.action === "dismiss"
                                                ).length
                                            }
                                        </span>
                                        <span className="text-gray-400">
                                            {" "}
                                            (d){" "}
                                        </span>
                                    </div>

                                    {/* Extra Count - show accepted/dismissed */}
                                    <div>
                                        Extra:{" "}
                                        <span className="font-medium text-green-700">
                                            {
                                                historyDetailComparisonActivities.filter(
                                                    (act) =>
                                                        act.comparison_type ===
                                                            "extra" &&
                                                        act.action === "accept"
                                                ).length
                                            }
                                        </span>
                                        <span className="text-gray-400">
                                            {" "}
                                            (a) /{" "}
                                        </span>
                                        <span className="font-medium text-red-700">
                                            {
                                                historyDetailComparisonActivities.filter(
                                                    (act) =>
                                                        act.comparison_type ===
                                                            "extra" &&
                                                        act.action === "dismiss"
                                                ).length
                                            }
                                        </span>
                                        <span className="text-gray-400">
                                            {" "}
                                            (d){" "}
                                        </span>
                                    </div>

                                    {/* Accuracy from user_homophone_accuracies table */}
                                    <div>
                                        Accuracy:{" "}
                                        <span className="font-medium text-gray-800">
                                            {loadingHistoryDetailAccuracy
                                                ? "…"
                                                : historyDetailAccuracy?.accuracy !=
                                                  null
                                                ? `${Number(
                                                      historyDetailAccuracy.accuracy
                                                  ).toFixed(2)}%`
                                                : selectedHistoryItem?._acc
                                                      ?.accuracy != null
                                                ? `${Number(
                                                      selectedHistoryItem._acc
                                                          .accuracy
                                                  ).toFixed(2)}%`
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
                                            {loadingHistoryDetailStats
                                                ? "…"
                                                : historyDetailStats?.avg_pause_duration !=
                                                  null
                                                ? Number(
                                                      historyDetailStats.avg_pause_duration
                                                  ).toFixed(2)
                                                : selectedHistoryItem?._acc
                                                      ?.avg_pause_duration !=
                                                  null
                                                ? Number(
                                                      selectedHistoryItem._acc
                                                          .avg_pause_duration
                                                  ).toFixed(2)
                                                : "—"}
                                        </span>
                                    </div>

                                    {/* Audio Play Count */}
                                    <div>
                                        Audio Plays:{" "}
                                        <span className="font-medium text-blue-700">
                                            {loadingHistoryDetailAudio
                                                ? "…"
                                                : historyDetailAudioActivities.filter(
                                                      (act) =>
                                                          act.activity_type ===
                                                          "audio_play"
                                                  ).length || "0"}
                                        </span>
                                    </div>

                                    {/* Audio Pause Count */}
                                    <div>
                                        Audio Pauses:{" "}
                                        <span className="font-medium text-orange-700">
                                            {loadingHistoryDetailAudio
                                                ? "…"
                                                : historyDetailAudioActivities.filter(
                                                      (act) =>
                                                          act.activity_type ===
                                                          "audio_pause"
                                                  ).length || "0"}
                                        </span>
                                    </div>

                                    {/* Reading Time */}
                                    <div>
                                        Reading Time (s):{" "}
                                        <span className="font-medium text-gray-800">
                                            {selectedHistoryItem?.reading_time ??
                                                "0"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => {
                                        setShowHistoryDetailModal(false);
                                        setSelectedHistoryItem(null);
                                    }}
                                    className="rounded-[10px] border-2 border-gray-300 px-6 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Show when user is not logged in */}
                {showAccountModal && (
                    <div className="absolute inset-0 bg-opacity-20 flex items-center justify-center z-10">
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
