import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, usePage, Link } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import Footer from "@/Components/Footer/Footer";
import axios from "axios";
import GrammarCheckSection from "@/Components/GrammarChecks/GrammarCheckSection";
import GrammarCheckHeader from "@/Components/GrammarChecks/GrammarCheckHeader";
import React from "react";
import {
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

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

    useEffect(() => {
        fetchHistory();
    }, []);

    // Debounce auto-save
    const saveTimeout = useRef();

    const calculateWordCount = (text) =>
        text ? text.trim().split(/\s+/).length : 0;
    const calculateReadingTime = (text) =>
        Math.ceil((calculateWordCount(text) / 200) * 60);

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

    // Auto-save on docTitle or paragraph change
    useEffect(() => {
        if (!userId) return;
        if (!docTitle.trim() && !paragraph.trim()) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(
            () => autoSave(docTitle, paragraph),
            700
        );

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
    function SidebarCheckGrammar({ text = "", onReplace }) {
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

        const foundCorrections = corrections.filter((c) =>
            text.toLowerCase().includes(c.error)
        );

        return (
            <div className="w-80 flex flex-col h-full">
                <div className="bg-gray-50 hover:bg-gray-100 border border-slate-200 h-full flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-white">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Grammar Check</h3>
                        <div className="flex items-center gap-2">
                            {foundCorrections.length > 0 ? (
                                <>
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm text-slate-600 font-medium">
                                        {foundCorrections.length} issue{foundCorrections.length > 1 ? "s" : ""} found
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
                        {foundCorrections.length > 0 ? (
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
                                            <span className="mx-2 text-slate-400">→</span>
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-mono font-medium">
                                                {c.suggestion}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="flex items-center gap-1 flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                            onClick={() => {
                                                if (onReplace) {
                                                    const newText = text.replace(
                                                        new RegExp(c.error, "gi"),
                                                        c.suggestion
                                                    );
                                                    onReplace(newText);
                                                }
                                            }}
                                        >
                                            <Check size={16} /> Accept
                                        </button>
                                        <button className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm">
                                            <X size={16} /> Dismiss
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-1">
                                    Great job!
                                </h4>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-4">
                                    No grammar or spelling issues detected in your text.
                                </p>
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm shadow-md">
                                    <RotateCcw size={16} /> Re-check Text
                                </button>
                            </div>
                        )}
                    </div>
                    {foundCorrections.length > 0 && (
                        <div className="px-6 py-3 border-t border-slate-100 bg-white">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    {foundCorrections.length} correction{foundCorrections.length > 1 ? "s" : ""} available
                                </span>
                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    Ready to fix
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
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
                        {/* Document Title Input */}
                        <div className="mb-4 bg-white rounded-xl w-[200px] px-2 border border-slate-200">
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
                        <div className="flex-1">
                            <textarea
                                className={`w-full h-full text-[17.5px] bg-white border border-slate-200 outline-none p-4 placeholder:text-gray-700 resize-none overflow-y-auto transition-all duration-300 ease-in-out hide-scrollbar ${
                                    isZoomed ? "min-h-[90vh]" : "min-h-[85vh]"
                                }`}
                                style={{ boxShadow: "none" }}
                                placeholder="Type your text here..."
                                value={paragraph}
                                onChange={(e) => setParagraph(e.target.value)}
                                onCopy={handleBlock}
                                onPaste={handleBlock}
                                onCut={handleBlock}
                                onDoubleClick={() => setIsZoomed(!isZoomed)}
                            />
                        </div>
                    </div>
                    
                    {/* Right side - Grammar Check Sidebar (no gap) */}
                    <SidebarCheckGrammar text={paragraph} onReplace={setParagraph} />
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