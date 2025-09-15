import React from "react";

export default function GrammarCheckHeader() {
    return (
        <div className="w-full max-w-7xl mx-auto text-left py-8 pl-2">
            {/* Title */}
            {/* <h1 className="text-3xl font-semibold text-[#2a355c]">
                AI Quiz Generator
            </h1> */}

            {/* Subtitle */}
            {/* <p className="mt-2 text-lg text-[#2a355c]">
                Upload a document, paste your notes, or select a video to
                automatically generate a quiz with AI.
            </p> */}
            <div className="mt-2 flex justify-between items-center text-md">
                <span className="text-gray-500 text-md">
                    Try it out above by using <span className="font-semibold">handwritten notes.</span>
                </span>
                <span className="text-gray-500 text-md">
                    Don't have any content? {""}
                    <button className="text-blue-500 text-md hover:underline">
                        Create from scratch
                    </button>
                </span>
            </div>
        </div>
    );
}
