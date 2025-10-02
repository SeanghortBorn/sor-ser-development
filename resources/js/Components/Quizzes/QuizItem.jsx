import React, { useState } from "react";
import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";

const QuizItem = ({ quiz }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">{quiz?.title || "Untitled Quiz"}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    This quiz has no questions yet.
                </p>
            </div>
        );
    }

    const handleAnswer = (isCorrect) => {
        if (isCorrect) setScore((prev) => prev + 1);

        if (currentQuestion + 1 < quiz.questions.length) {
            setCurrentQuestion((prev) => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    const currentQ = quiz.questions[currentQuestion];

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
            {quiz.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {quiz.description}
                </p>
            )}

            {!showResult ? (
                <QuizQuestion
                    question={{
                        question: currentQ.text,
                        options: currentQ.type === "Matching"
                            ? currentQ.options || []
                            : currentQ.options || [],
                        answer: currentQ.type === "Matching"
                            ? currentQ.correct_answer || []
                            : currentQ.correct_answer,
                        type: currentQ.type,
                    }}
                    onAnswer={handleAnswer}
                    progress={((currentQuestion + 1) / quiz.questions.length) * 100}
                />
            ) : (
                <QuizResult
                    score={score}
                    total={quiz.questions.length}
                    onRestart={() => {
                        setCurrentQuestion(0);
                        setScore(0);
                        setShowResult(false);
                    }}
                />
            )}
        </div>
    );
};

export default QuizItem;
