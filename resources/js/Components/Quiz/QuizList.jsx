import React, { useState } from 'react';
import QuizStart from './QuizStart';
import QuizQuestion from './QuizQuestion';
import QuizResult from './QuizResult';

const QuizList = ({ quizzes }) => {
    const [quizIndex, setQuizIndex] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);

    if (!quizzes || quizzes.length === 0) return <p>Loading quizzes...</p>;

    const quiz = quizzes[quizIndex ?? 0];

    const handleStart = (index) => {
        setQuizIndex(index);
        setCurrentQuestion(0);
        setScore(0);
    };

    const handleAnswer = (isCorrect) => {
        if (isCorrect) setScore(score + 1);

        if (currentQuestion + 1 < quiz.questions.length) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setCurrentQuestion(null); // quiz finished
        }
    };

    const handleBack = () => {
        // Always go back to quiz selection
        setQuizIndex(null);
    };

    // Show start screen if quiz not started
    if (quizIndex === null) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((q, index) => (
                    <QuizStart key={q.id} quiz={q} onStart={() => handleStart(index)} />
                ))}
            </div>
        );
    }

    // Show quiz content (questions or results)
    return (
        <div className="relative">
            {/* Single Back button */}
            <div className="mb-4">
                <button
                    onClick={handleBack}
                    className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded transition"
                >
                    Back
                </button>
            </div>

            {currentQuestion === null ? (
                <QuizResult
                    score={score}
                    total={quiz.questions.length}
                    onRestart={() => setQuizIndex(null)}
                />
            ) : (
                <QuizQuestion
                    question={quiz.questions[currentQuestion]}
                    onAnswer={handleAnswer}
                    progress={((currentQuestion + 1) / quiz.questions.length) * 100}
                />
            )}
        </div>
    );
};

export default QuizList;
