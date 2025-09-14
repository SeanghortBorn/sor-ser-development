import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import SidebarCheckGrammar from "@/Components/GrammarChecks/SidebarCheckGrammar";
import Footer from "@/Components/Footer/Footer";
import axios from "axios";

export default function GrammarCheck() {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;
    const [showModal, setShowModal] = useState(false);
    const [docTitle, setDocTitle] = useState("");
    const [paragraph, setParagraph] = useState("");
    const [checkerId, setCheckerId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameValue, setRenameValue] = useState("");
    const [renameId, setRenameId] = useState(null);
    const [previousDocuments, setPreviousDocuments] = useState([]);
    const [isZoomed, setIsZoomed] = useState(false);

    // Fetch history on mount and after rename
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

    useEffect(() => {
        fetchHistory();
    }, []);

    // Debounce auto-save
    const saveTimeout = useRef();

    // Utility function for word count
    const calculateWordCount = (text) => {
        return text ? text.trim().split(/\s+/).length : 0;
    };

    // Utility function for reading time
    const calculateReadingTime = (text) => {
        const words = calculateWordCount(text);
        return Math.ceil((words / 200) * 60);
    };

    // Auto-save handler
    const autoSave = (newTitle, newParagraph) => {
        if (!userId) return;
        setSaving(true);
        const payload = {
            user_id: userId,
            title: newTitle ?? "",
            paragraph: newParagraph ?? "",
            word_count: calculateWordCount(newParagraph),
            incorrect_word_count: 0,
            reading_time: calculateReadingTime(newParagraph),
        };
        if (checkerId) {
            axios
                .patch(`/grammar-checkers/${checkerId}`, payload, {
                    headers: { Accept: "application/json" },
                })
                .then((res) => {
                    setCheckerId(res.data.id);
                    console.log("Update Document", res.data);
                    fetchHistory(); // <-- Refresh sidebar history after update
                })
                .catch((err) => {
                    console.error(
                        "Save update error:",
                        err.response?.data
                    );
                })
                .finally(() => setSaving(false));
        } else {
            axios
                .post("/grammar-checkers", payload, {
                    headers: { Accept: "application/json" },
                })
                .then((res) => {
                    setCheckerId(res.data.id);
                    console.log("New Document", res.data);
                    fetchHistory(); // <-- Refresh sidebar history after create
                })
                .catch((err) => {
                    console.error(
                        "Save Document error:",
                        err.response?.data
                    );
                })
                .finally(() => setSaving(false));
        }
    };

    // Watch for changes and auto-save
    useEffect(() => {
        if (!userId) return;
        // Don't save if both title and paragraph are empty
        if (!docTitle.trim() && !paragraph.trim()) {
            return;
        }
        // Always save with whatever docTitle is (can be empty)
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            autoSave(docTitle, paragraph);
        }, 700); // 700ms debounce
        return () => clearTimeout(saveTimeout.current);
    }, [docTitle, paragraph]);

    // Handler for copy/paste/cut
    const handleBlock = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const closeRenameModal = () => {
        setShowRenameModal(false);
        setRenameId(null);
        setRenameValue("");
    };

    const submitRename = (id) => {
        // Send all required fields for PATCH, not just title
        const doc = previousDocuments.find((d) => d.id === id);
        if (!doc) return;

        const payload = {
            user_id: doc.user_id,
            title: renameValue,
            paragraph: doc.paragraph ?? "",
            word_count: doc.word_count ?? 0,
            incorrect_word_count: doc.incorrect_word_count ?? 0,
            reading_time: doc.reading_time ?? 0,
        };

        axios
            .patch(`/grammar-checkers/${id}`, payload, {
                headers: { Accept: "application/json" },
            })
            .then((res) => {
                fetchHistory(); // Refresh history after rename
                closeRenameModal();
            })
            .catch((err) => {
                console.error("Rename error:", err.response?.data);
            });
    };

    // Close rename modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            const modal = document.getElementById("rename-modal");
            if (showRenameModal && modal && !modal.contains(event.target)) {
                closeRenameModal();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showRenameModal]);

    return (
        <>
            <Head title="Grammar Check" />
            <HeaderNavbar />
            <div className="w-full max-w-7xl mx-auto text-left py-8 pl-2">
                {/* Title */}
                <h1 className="text-[26px] font-semibold text-[#2a355c]">
                    Grammar Check
                </h1>

                {/* Subtitle */}
                <p className="mt-2 font-sans text-[17.5px] text-[#32437f]">
                    Scribens checks the grammar of your texts and finds spelling
                    mistakes
                </p>
            </div>

            <div className="bg-white w-full max-w-7xl mx-auto min-h-screen flex flex-row">
                <div className="flex-1 flex flex-col pl-2 pr-2">
                    {/* Document Title Input */}
                    <div className="mb-4 bg-gray-100 rounded-xl w-[200px] px-2">
                        <input
                            type="text"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            className="w-full text-[16px] font-medium text-gray-700 bg-transparent border-none outline-none placeholder-gray-500 px-2 py-2 rounded-lg"
                            style={{
                                boxShadow: "none",
                                background: "transparent",
                            }}
                            placeholder="Untitled document"
                        />
                    </div>

                    {/* Textarea */}
                    <div>
                        <textarea
                            className={`w-full max-w-4xl text-[17.5px] rounded-2xl bg-gray-50 hover:bg-gray-100 border outline-none p-4 placeholder:text-gray-700 resize-none overflow-y-auto transition-all duration-300 ease-in-out hide-scrollbar ${
                                isZoomed ? "min-h-[90vh]" : "min-h-[85vh]"
                            }`}
                            style={{
                                boxShadow: "none",
                            }}
                            placeholder="Type your text here..."
                            value={paragraph}
                            onChange={(e) => setParagraph(e.target.value)}
                            onCopy={handleBlock}
                            onPaste={handleBlock}
                            onCut={handleBlock}
                            onDoubleClick={() => setIsZoomed(!isZoomed)} // <-- toggle zoom
                        />
                    </div>
                </div>
                <SidebarCheckGrammar />
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-xl shadow-lg p-6 min-w-[300px] flex flex-col items-center pointer-events-auto border border-blue-600">
                        <span className="text-lg font-semibold text-gray-800 mb-2">
                            Copy, Paste, and Cut are disabled!
                        </span>
                        <button
                            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                            onClick={() => setShowModal(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}
