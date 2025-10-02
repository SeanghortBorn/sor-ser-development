import React, { useState } from "react";

const QuizQuestion = ({ question, onAnswer, progress }) => {
    // Add support for Matching type
    const [selected, setSelected] = useState(
        question.type === "Checkboxes"
            ? []
            : question.type === "Matching"
                ? []
                : null
    );

    const handleClick = (option) => {
        if (question.type === "Checkboxes") {
            let arr = Array.isArray(selected) ? selected : [];
            if (arr.includes(option)) {
                arr = arr.filter(v => v !== option);
            } else {
                arr = [...arr, option];
            }
            setSelected(arr);
        } else {
            setSelected(option);
            setTimeout(() => {
                onAnswer(option === question.answer);
                setSelected(null);
            }, 500);
        }
    };

    const handleSubmitCheckboxes = () => {
        const correct = Array.isArray(question.answer)
            ? Array.isArray(selected) &&
              selected.length === question.answer.length &&
              selected.every(v => question.answer.includes(v))
            : false;
        onAnswer(correct, true); // Pass second param for checkboxes
        setSelected([]);
    };

    // Matching select handler
    const handleSelectMatch = (left, right) => {
        const updated = (Array.isArray(selected) ? selected : []).filter(s => s.left !== left);
        updated.push({ left, right });
        setSelected(updated);
    };

    // Matching submit handler
    const handleSubmitMatching = () => {
        // Check if all pairs match
        const correct = Array.isArray(question.answer)
            ? selected.length === question.answer.length &&
              question.answer.every(c =>
                  selected.some(a => a.left === c.left && a.right === c.right)
              )
            : false;
        onAnswer(correct, true);
        setSelected([]);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 max-w-xl mx-auto animate-fadeIn">
            <div className="mb-4">
                <div className="bg-gray-200 h-2 rounded">
                    <div
                        className="bg-blue-500 h-2 rounded transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-gray-500 text-sm mt-1">{`Progress: ${Math.round(progress)}%`}</p>
            </div>

            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            <div className="flex flex-col gap-3">
                {question.type === "Checkboxes" ? (
                    <>
                        {question.options.map((option, index) => {
                            const isSelected = Array.isArray(selected) && selected.includes(option);
                            return (
                                <label key={index} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleClick(option)}
                                        className="mr-2"
                                    />
                                    <span
                                        className={`py-2 px-4 rounded border cursor-pointer transition-all duration-300 ${
                                            isSelected
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900"
                                        }`}
                                    >
                                        {option}
                                    </span>
                                </label>
                            );
                        })}
                        <button
                            onClick={handleSubmitCheckboxes}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
                            disabled={!Array.isArray(selected) || selected.length === 0}
                        >
                            Submit Answers
                        </button>
                    </>
                ) : question.type === "Matching" ? (
                    <div className="flex flex-col gap-4">
                        {(question.options || []).map((pair, idx) => {
                            const matched = (selected || []).find(s => s.left === pair.left)?.right || "";
                            return (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="w-32 font-medium">{pair.left}</span>
                                    <select
                                        value={matched}
                                        onChange={e => handleSelectMatch(pair.left, e.target.value)}
                                        className="flex-1 px-3 py-2 rounded border shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    >
                                        <option value="">Select match</option>
                                        {(question.options || []).map((opt, rIdx) => (
                                            <option key={rIdx} value={opt.right}>{opt.right}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                        <button
                            onClick={handleSubmitMatching}
                            disabled={!(selected && selected.length === (question.options || []).length)}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
                        >
                            Submit Matching
                        </button>
                    </div>
                ) : (
                    // ...existing code for other question types...
                    <>
                        {question.options.map((option, index) => {
                            const isSelected = selected === option;
                            const baseClass =
                                "py-2 px-4 rounded border cursor-pointer transition-all duration-300";
                            const selectedClass = isSelected
                                ? option === question.answer
                                    ? "bg-green-500 text-white border-green-500"
                                    : "bg-red-500 text-white border-red-500"
                                : "bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900";
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleClick(option)}
                                    className={`${baseClass} ${selectedClass}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                        {/* ...existing code for Checkboxes submit... */}
                    </>
                )}
            </div>
            {/* ...existing code... */}
        </div>
    );
};

export default QuizQuestion;
