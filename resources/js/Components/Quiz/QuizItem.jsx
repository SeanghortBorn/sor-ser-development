import React, { useState } from 'react';
import QuizQuestion from './QuizQuestion';
import QuizResult from './QuizResult';

const QuizItem = ({ quiz }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const handleAnswer = (isCorrect) => {
        if (isCorrect) setScore(score + 1);
        if (currentQuestion + 1 < quiz.questions.length) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResult(true);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
            <p className="text-gray-600 mb-4">{quiz.description}</p>

            {!showResult ? (
                <QuizQuestion
                    question={quiz.questions[currentQuestion]}
                    onAnswer={handleAnswer}
                />
            ) : (
                <QuizResult score={score} total={quiz.questions.length} />
            )}
        </div>
    );
};

export default QuizItem;
