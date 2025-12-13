import React from "react";

const QuizStart = ({ quiz, onStart }) => (
    <div
        onClick={onStart}
        className="cursor-pointer bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 flex flex-col justify-between hover:scale-105 transform transition duration-300 hover:shadow-sm"
    >
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {quiz.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{quiz.description}</p>
        <button
            onClick={onStart}
            className="mt-auto bg-blue-500 hover:bg-blue-600 hover:scale-105 hover:shadow-sm text-white font-semibold py-2 px-4 rounded transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
        >
            Start Quiz
        </button>
    </div>
);

export default QuizStart;
