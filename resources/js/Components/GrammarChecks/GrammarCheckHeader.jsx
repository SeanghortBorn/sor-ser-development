import React from "react";

export default function GrammarCheckHeader() {
  return (
    <div className="w-full max-w-7xl mx-auto text-left py-8 pl-2">
      {/* Title */}
      <h1 className="text-3xl font-semibold text-[#2a355c]">
        AI Quiz Generator
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-lg text-[#2a355c]">
        Upload a document, paste your notes, or select a video to automatically
        generate a quiz with AI.
      </p>
    </div>
  );
}
