import React from 'react';

const QuizResult = ({ score, total, onRestart }) => {
    const percentage = Math.round((score / total) * 100);
    let message = 'Good job!';
    if (percentage === 100) message = 'Perfect score! 🎉';
    else if (percentage >= 70) message = 'Well done!';
    else if (percentage >= 40) message = 'Keep trying!';
    else message = 'Better luck next time!';

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center max-w-md mx-auto animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-lg mb-2">
                Your score: <span className="font-semibold">{score}</span> / {total}
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-lg font-medium mb-4">{message}</p>
            <button
                onClick={onRestart}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition"
            >
                Restart Quiz
            </button>
        </div>
    );
};

export default QuizResult;
