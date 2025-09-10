import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Volume2, Lightbulb, Info } from 'lucide-react';
import HeaderNavbar from '@/Components/Navbars/HeaderNavbar';
import { Head, Link } from '@inertiajs/react';

export default function CheckText() {
    const [text, setText] = useState('អ្នកមិនអាចសរសេរឲ្យបានល្អទេ');
    const [accuracy, setAccuracy] = useState(87);
    const [suggestions, setSuggestions] = useState([
        {
            type: 'Homophone Correction',
            confidence: 95,
            description: 'Correct homophone usage in this context',
            original: 'សរសេរ',
            corrected: 'សរសេរ'
        }
    ]);

    // Simulate accuracy calculation based on text length and content
    useEffect(() => {
        const calculateAccuracy = () => {
            if (!text.trim()) return 100;
            const wordCount = text.trim().split(/\s+/).length;
            const baseAccuracy = Math.max(75, 100 - wordCount * 2);
            setAccuracy(baseAccuracy);
        };
        calculateAccuracy();
    }, [text]);

    const handleReset = () => {
        setText('');
        setAccuracy(100);
        setSuggestions([]);
    };

    const handleSaveDraft = () => {
        // Simulate saving functionality
        console.log('Draft saved:', text);
        alert('Draft saved successfully!');
    };

    const handleTextToSpeech = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech not supported in your browser');
        }
    };

    const applySuggestion = (suggestion) => {
        const newText = text.replace(suggestion.original, suggestion.corrected);
        setText(newText);
        setSuggestions(suggestions.filter(s => s !== suggestion));
        setAccuracy(Math.min(100, accuracy + 5));
    };

    return (
        
        <div className="min-h-screen bg-gray-50">
            <HeaderNavbar />
            
            {/* Header */}
            {/* <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Smart Writing Assistant</h1>
                        <p className="text-gray-600">Write with confidence using real-time corrections</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                        <button
                            onClick={handleSaveDraft}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <Save size={16} />
                            Save Draft
                        </button>
                    </div>
                </div>
            </div> */}

            <div className="flex mx-auto py-6 gap-6 px-24">
                {/* Main Writing Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Writing Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Your Writing</h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">{accuracy}% Accuracy</span>
                                </div>
                                <button
                                    onClick={handleTextToSpeech}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Volume2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className="p-4">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Start writing here..."
                                className="w-full h-96 p-4 text-lg leading-relaxed resize-none border-none outline-none"
                                style={{ fontFamily: 'Khmer OS, Arial, sans-serif' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 space-y-6">
                    {/* Suggestions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="text-orange-500" size={20} />
                                <h3 className="font-semibold text-gray-900">Suggestions</h3>
                            </div>
                        </div>
                        <div className="p-4">
                            {suggestions.length > 0 ? (
                                <div className="space-y-3">
                                    {suggestions.map((suggestion, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {suggestion.type}
                                                </span>
                                                <span className="text-xs text-orange-600 font-medium">
                                                    {suggestion.confidence}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {suggestion.description}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                                                    {suggestion.original}
                                                </div>
                                                <div className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                                                    {suggestion.corrected}
                                                </div>
                                                <button
                                                    onClick={() => applySuggestion(suggestion)}
                                                    className="w-full px-3 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    Apply Correction
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No suggestions available</p>
                            )}
                        </div>
                    </div>

                    {/* Today's Tip */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Today's Tip</h3>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Info className="text-blue-600" size={16} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Common Mistake Alert</h4>
                                    <p className="text-sm text-gray-600">
                                        Remember: "សរសេរ" (to write) vs "សរសេរ" (writing) - context matters!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Writing Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Writing Stats</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Characters:</span>
                                <span className="font-medium">{text.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Words:</span>
                                <span className="font-medium">{text.trim().split(/\s+/).filter(word => word.length > 0).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Sentences:</span>
                                <span className="font-medium">{text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}