import React, { useState } from "react";
import { Check, Trash } from "lucide-react";

export default function SidebarCheckGrammar() {
    const [suggestions, setSuggestions] = useState([
        { original: "heello", suggestion: "Hello,", rest: "my name is John" },
        { original: "we want", suggestion: "wanted to", rest: "buy some fruits" },
        { original: "I goed", suggestion: "went", rest: "to the market yesterday" },
        { original: "She dont", suggestion: "doesn't", rest: "like spicy food" },
        { original: "They was", suggestion: "were", rest: "playing football in the park" },
        { original: "its raining", suggestion: "it's raining", rest: "heavily today" },
        { original: "I has", suggestion: "have", rest: "a new phone now" },
        { original: "writting", suggestion: "writing", rest: "an essay for school" },
        { original: "he runned", suggestion: "ran", rest: "fast to catch the bus" },
    ]);

    // Swap clicked card to the top
    const handleCardClick = (idx) => {
        if (idx === 0) return; // Do nothing if the first card is clicked
        const newSuggestions = [...suggestions];
        [newSuggestions[0], newSuggestions[idx]] = [newSuggestions[idx], newSuggestions[0]];
        setSuggestions(newSuggestions);
    };

    return (
        <div className="p-8 mt-4 w-4/12 mb-4 rounded-xl border bg-white h-[85vh] flex flex-col mr-3">
            {/* Header Message */}
            <div className="text-gray-700 text-lg font-medium mb-3">
                Enter at least 25 words to see score.
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-0 mb-2">
                <button
                    type="button"
                    className="text-blue-900 px-3 py-2 font-semibold border-gray-400 flex items-center hover:bg-gray-100 rounded"
                >
                    All
                    <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                        {suggestions.length}
                    </span>
                </button>
                <button
                    type="button"
                    className="text-green-600 px-3 py-2 font-semibold border-green-500 flex items-center hover:bg-gray-100 rounded"
                >
                    Grammar
                    <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5 ml-2">
                        {suggestions.length}
                    </span>
                </button>
            </div>

            <div className="border-b mb-2" />

            {/* Scrollable List */}
            <div className="space-y-2 p-2 flex-1 overflow-y-auto hide-scrollbar">
                {/* Summary Card */}
                <div className="flex justify-between items-center border border-gray-200 rounded-xl px-6 py-2 bg-white max-w-xl mx-auto">
                    <span className="flex items-center font-semibold">
                        <span className="text-red-500 text-[16px]">
                            {suggestions.length} grammar
                        </span>
                        <span className="text-gray-700 ml-1">suggestions</span>
                    </span>
                    <button className="border border-green-500 text-green-600 px-4 py-1 rounded-full text-[16px] hover:bg-green-50 transition">
                        Accept all
                    </button>
                </div>

                {/* Suggestion Cards */}
                {suggestions.map((item, idx) => {
                    const isFirst = idx === 0;
                    return (
                        <div
                            key={idx}
                            onClick={() => handleCardClick(idx)}
                            className={`bg-white rounded-xl p-3 border shadow-sm cursor-pointer transition 
                                ${isFirst ? "border-blue-600 border-2" : "border-gray-200"}`}
                        >
                            {/* Section Title */}
                            <p className="text-sm text-gray-500 mb-2">Replace with</p>

                            {/* Main Suggestion Text */}
                            <div className="mb-3">
                                <span
                                    className={`line-through mr-2 ${
                                        isFirst ? "text-red-500" : "text-gray-500"
                                    }`}
                                >
                                    {item.original}
                                </span>
                                <span
                                    className={`ml-2 font-bold mr-2 ${
                                        isFirst ? "text-green-600" : "text-green-700"
                                    }`}
                                >
                                    {item.suggestion}
                                </span>
                                <span className="text-gray-800">{item.rest}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full flex items-center">
                                    <Check className="w-4 h-4 mr-1" />
                                    Accept
                                </button>
                                <button className="flex items-center text-gray-800 hover:text-red-600">
                                    <Trash className="w-4 h-4 mr-1" />
                                    Ignore
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
