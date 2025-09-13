import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head } from "@inertiajs/react";
import SidebarHistory from "@/Components/GrammarChecks/SidebarHistory";
import { useState } from "react";
import SidebarCheckGrammar from "@/Components/GrammarChecks/SidebarCheckGrammar";
import Footer from "@/Components/Footer/Footer";

export default function GrammarCheck() {
    const [showModal, setShowModal] = useState(false);
    const [docTitle, setDocTitle] = useState("Untitled document");

    // Handler for copy/paste/cut
    const handleBlock = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    return (
        <>
            <Head title="Grammar Check" />
            <HeaderNavbar />
            <div className="bg-white min-h-screen flex flex-row">
                {/*  */}
                <SidebarHistory />

                {/* Main content area */}
                <div className="flex-1 flex flex-row">
                    {/* Center content */}
                    <div className="flex-1 flex flex-col pt-12 pl-3 pr-2">
                        <div className="flex items-center justify-start ml-3">
                            <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                className="text-[16px] font-semibold text-gray-700 bg-transparent border-none outline-none px-2 py-1 w-full max-w-xs"
                                style={{
                                    boxShadow: "none",
                                    background: "transparent",
                                }}
                                placeholder="Enter title..."
                            />
                        </div>
                        <div className="m-3">
                            <textarea
                                className="w-full max-w-5xl min-h-[75vh] text-lg border-none outline-none resize-none hide-scrollbar"
                                style={{
                                    boxShadow: "none",
                                    background: "transparent",
                                }}
                                placeholder="Type your text here..."
                                onCopy={handleBlock}
                                onPaste={handleBlock}
                                onCut={handleBlock}
                            />
                        </div>
                    </div>
                </div>
                <SidebarCheckGrammar />
            </div>
            {/* Modal message (overlay only the modal, not the whole screen) */}
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
