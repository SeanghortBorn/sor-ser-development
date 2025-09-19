import React, { useState } from 'react';

const QuizQuestion = ({ question, onAnswer, progress, onBack, canGoBack }) => {
    const [selected, setSelected] = useState(null);

    const handleClick = (option) => {
        setSelected(option);
        setTimeout(() => {
            onAnswer(option === question.answer);
            setSelected(null);
        }, 800); // wait for animation/feedback
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
                {question.options.map((option, index) => {
                    const isSelected = selected === option;
                    const baseClass =
                        'py-2 px-4 rounded border cursor-pointer transition-all duration-300';
                    const selectedClass = isSelected
                        ? option === question.answer
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-red-500 text-white border-red-500'
                        : 'bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900';
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
            </div>

            {/* Back button */}
            {canGoBack && (
                <button
                    onClick={onBack}
                    className="mt-6 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded transition"
                >
                    Back
                </button>
            )}
        </div>
    );
};

export default QuizQuestion;
