import React, { useState } from "react";

const QuizResult = ({ quiz, attempt, onRestart, onDone }) => {
    const [reviewMode, setReviewMode] = useState(false);

    // Parse the attempt answers JSON safely
    const answers = attempt ? JSON.parse(attempt.answers) : [];

    const score = attempt?.score || 0;
    const total = quiz?.questions?.length || 0;
    const percentage = Math.round((score / total) * 100);

    let message = "Good job!";
    if (percentage === 100) message = "Perfect score! 🎉";
    else if (percentage >= 70) message = "Well done!";
    else if (percentage >= 40) message = "Keep trying!";
    else message = "Better luck next time!";

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 max-w-4xl mx-auto animate-fadeIn">
            {/* Summary Score */}
            {!reviewMode && (
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
                    <p className="text-lg mb-2">
                        Your score: <span className="font-semibold">{score}</span> / {total}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-lg font-medium mb-6">{message}</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onRestart}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                        >
                            Restart Quiz
                        </button>
                        <button
                            onClick={onDone}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                        >
                            Done
                        </button>
                        <button
                            onClick={() => setReviewMode(true)}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
                        >
                            Review Answers
                        </button>
                    </div>
                </div>
            )}

            {/* Review Mode */}
            {reviewMode && quiz && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6 text-center">Review Answers</h2>
                    {quiz.questions.map((q, idx) => {
                        const user = answers[idx] || {};
                        const isCorrect = user.isCorrect;
                        return (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl border ${isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"} dark:bg-gray-700`}
                            >
                                <div className="flex items-center mb-2">
                                    <span className="font-semibold text-lg">
                                        Q{idx + 1}: {q.text}
                                    </span>
                                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                        {isCorrect ? "Correct" : "Incorrect"}
                                    </span>
                                </div>
                                <div className="text-sm mt-2 space-y-1">
                                    <div>
                                        <span className="font-medium">Your Answer: </span>
                                        {q.type === "Checkboxes"
                                            ? Array.isArray(user.answer) ? user.answer.join(", ") : <em>None</em>
                                            : q.type === "Matching"
                                                ? Array.isArray(user.answer) ? user.answer.map(p => `${p.left} = ${p.right}`).join(", ") : <em>None</em>
                                                : user.answer || <em>None</em>}
                                    </div>
                                    <div>
                                        <span className="font-medium">Correct Answer: </span>
                                        {q.type === "Checkboxes"
                                            ? Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : <em>None</em>
                                            : q.type === "Matching"
                                                ? Array.isArray(q.correct_answer) ? q.correct_answer.map(p => `${p.left} = ${p.right}`).join(", ") : <em>None</em>
                                                : q.correct_answer || <em>None</em>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            onClick={onRestart}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                        >
                            Restart Quiz
                        </button>
                        <button
                            onClick={onDone}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                        >
                            Done
                        </button>
                        <button
                            onClick={() => setReviewMode(false)}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
                        >
                            Back to Result
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizResult;
