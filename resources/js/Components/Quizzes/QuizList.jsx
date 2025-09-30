import React, { useState } from "react";
import QuizStart from "./QuizStart";
import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";

const QuizList = ({ quizzes, quizStarted, setQuizStarted, onBack }) => {
    const [quizIndex, setQuizIndex] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    if (!quizzes || quizzes.length === 0) {
        return <p>No quizzes available.</p>;
    }

    const quiz = quizIndex !== null ? quizzes[quizIndex] : null;

    const handleStart = (index) => {
        setQuizIndex(index);
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        if (setQuizStarted) setQuizStarted(true);
    };

    // Handles answer for MCQ, True/False, Fill-in-the-blank, Checkboxes
    const handleAnswer = (isCorrect, isCheckboxes = false) => {
        if (isCorrect) setScore((prev) => prev + 1);

        if (quiz && currentQuestion + 1 < quiz.questions.length) {
            setTimeout(() => setCurrentQuestion((prev) => prev + 1), isCheckboxes ? 0 : 400);
        } else if (quiz && currentQuestion + 1 === quiz.questions.length) {
            setTimeout(() => setShowResult(true), isCheckboxes ? 0 : 400);
        }
    };

    const handleBack = () => {
        setQuizIndex(null);
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        if (onBack) onBack();
    };

    // Start screen (list of quizzes)
    if (quizIndex === null) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((q, index) => (
                    <QuizStart key={q.id} quiz={q} onStart={() => handleStart(index)} />
                ))}
            </div>
        );
    }

    // Quiz content (questions or results)
    return (
        <div className="relative">
            {/* Back button */}
            <div className="mb-4">
                <button
                    onClick={handleBack}
                    className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded transition"
                >
                    Back
                </button>
            </div>

            {showResult ? (
                <QuizResult
                    score={score}
                    total={quiz.questions.length}
                    onRestart={() => {
                        setCurrentQuestion(0);
                        setScore(0);
                        setShowResult(false);
                    }}
                />
            ) : (
                <QuizQuestion
                    question={{
                        type: quiz.questions[currentQuestion].type,
                        question: quiz.questions[currentQuestion].text,
                        options: quiz.questions[currentQuestion].options || [],
                        answer: quiz.questions[currentQuestion].correct_answer,
                    }}
                    onAnswer={(isCorrect, isCheckboxes) => handleAnswer(isCorrect, isCheckboxes)}
                    progress={((currentQuestion + 1) / quiz.questions.length) * 100}
                />
            )}
        </div>
    );
};

export default QuizList;
