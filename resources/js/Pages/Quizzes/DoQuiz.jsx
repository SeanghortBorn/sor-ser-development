import HeaderNavbar from '@/Components/Navbars/HeaderNavbar';
import { Head, usePage, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Quiz() {
    const { quizData } = usePage().props;
    const quizzes = quizData?.data || [];

    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

    const handleStartQuiz = (quiz) => {
        setCurrentQuiz(quiz);
        setQuizStarted(true);
        setScore(0);
        setShowResult(false);
        setUserAnswers(new Array(quiz.questions.length).fill(null));
        setReviewMode(false);
        setCurrentQuestionIdx(0);
    };

    const handleAnswerChange = (qIdx, answer) => {
        setUserAnswers((prev) => {
            const arr = [...prev];
            arr[qIdx] = { answer };
            return arr;
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIdx < currentQuiz.questions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx(currentQuestionIdx - 1);
        }
    };

    const handleSubmitQuiz = () => {
        let newScore = 0;
        currentQuiz.questions.forEach((q, idx) => {
            const user = userAnswers[idx] || {};
            let correct = false;

            if (q.type === "Checkboxes") {
                correct =
                    Array.isArray(q.correct_answer) &&
                    Array.isArray(user.answer) &&
                    user.answer.length === q.correct_answer.length &&
                    user.answer.every((v) => q.correct_answer.includes(v));
            } else if (q.type === "True/False") {
                const correctVal = q.correct_answer === true || q.correct_answer === "True" ? "True" : "False";
                correct = user.answer === correctVal;
            } else if (q.type === "Matching") {
                correct =
                    Array.isArray(q.correct_answer) &&
                    Array.isArray(user.answer) &&
                    q.correct_answer.length === user.answer.length &&
                    q.correct_answer.every((c) => user.answer.some((a) => a.left === c.left && a.right === c.right));
            } else {
                correct = user.answer === q.correct_answer;
            }

            if (correct) newScore++;
            if (userAnswers[idx]) userAnswers[idx].isCorrect = correct;
        });

        setScore(newScore);
        setShowResult(true);

        router.post(route('quizzes.submit'), {
            quiz_id: currentQuiz.id,
            score: newScore,
            answers: userAnswers
        }, {
            onSuccess: () => alert('Quiz submitted successfully! ✅'),
            preserveState: true,
        });
    };

    const handleRestart = () => {
        setQuizStarted(false);
        setCurrentQuiz(null);
        setShowResult(false);
        setUserAnswers([]);
        setReviewMode(false);
        setCurrentQuestionIdx(0);
    };

    const handleDone = () => handleRestart();

    const getMessage = (score, total) => {
        const pct = Math.round((score / total) * 100);
        if (pct === 100) return "Perfect score! 🎉";
        if (pct >= 70) return "Well done!";
        if (pct >= 40) return "Keep trying!";
        return "Better luck next time!";
    };

    return (
        <>
            <Head title="Quiz" />
            <HeaderNavbar />
            <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Welcome Screen */}
                    {!quizStarted && (
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-extrabold text-blue-600 mb-4">
                                Welcome to the Quiz Hub
                            </h1>
                            <p className="text-lg text-gray-600">
                                Challenge yourself with fun and interactive quizzes!
                            </p>
                        </div>
                    )}

                    {/* Quiz List */}
                    {!quizStarted && quizzes.map((quiz) => (
                        <motion.div
                            key={quiz.id}
                            className="p-6 mb-4 bg-white shadow-md rounded-2xl hover:shadow-lg border border-gray-200 transition-all"
                            whileHover={{ scale: 1.02 }}
                        >
                            <h2 className="text-xl font-bold mb-2 text-gray-800">{quiz.title}</h2>
                            <p className="text-gray-600 mb-4">{quiz.description}</p>
                            <button
                                onClick={() => handleStartQuiz(quiz)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow transition font-medium"
                            >
                                Start Quiz
                            </button>
                        </motion.div>
                    ))}

                    {/* Quiz Page */}
                    {quizStarted && currentQuiz && !showResult && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl mx-auto space-y-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-800">{currentQuiz.title}</h2>
                                <div className="text-sm font-semibold text-gray-600">
                                    Question {currentQuestionIdx + 1} of {currentQuiz.questions.length}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestionIdx + 1) / currentQuiz.questions.length) * 100}%` }}
                                ></div>
                            </div>

                            {/* Current Question */}
                            {currentQuiz.questions.map((q, idx) => 
                                idx === currentQuestionIdx && (
                                    <div key={idx} className="p-6 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                                        <p className="font-semibold text-lg mb-3 text-gray-800">
                                            Q{idx + 1}: {q.text}
                                        </p>
                                        {q.description && <p className="mb-4 text-gray-600">{q.description}</p>}

                                        {/* Multiple Choice */}
                                        {q.type === "Multiple Choice" && q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className="block mb-3 text-gray-700">
                                                <input
                                                    type="radio"
                                                    name={`q-${idx}`}
                                                    value={opt}
                                                    checked={userAnswers[idx]?.answer === opt}
                                                    onChange={() => handleAnswerChange(idx, opt)}
                                                    className="mr-3 accent-blue-600"
                                                />
                                                {opt}
                                            </label>
                                        ))}

                                        {/* Checkboxes */}
                                        {q.type === "Checkboxes" && q.options.map((opt, oIdx) => {
                                            const selected = Array.isArray(userAnswers[idx]?.answer) ? userAnswers[idx].answer : [];
                                            return (
                                                <label key={oIdx} className="block mb-3 text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        value={opt}
                                                        checked={selected.includes(opt)}
                                                        onChange={(e) => {
                                                            let newSel = [...selected];
                                                            if (e.target.checked) newSel.push(opt);
                                                            else newSel = newSel.filter((v) => v !== opt);
                                                            handleAnswerChange(idx, newSel);
                                                        }}
                                                        className="mr-3 accent-blue-600"
                                                    />
                                                    {opt}
                                                </label>
                                            );
                                        })}

                                        {/* True/False */}
                                        {q.type === "True/False" && ["True", "False"].map((val, vIdx) => (
                                            <label key={vIdx} className="block mb-3 text-gray-700">
                                                <input
                                                    type="radio"
                                                    name={`q-${idx}`}
                                                    value={val}
                                                    checked={userAnswers[idx]?.answer === val}
                                                    onChange={() => handleAnswerChange(idx, val)}
                                                    className="mr-3 accent-blue-600"
                                                />
                                                {val}
                                            </label>
                                        ))}

                                        {/* Fill-in-the-blank */}
                                        {q.type === "Fill-in-the-blank" && (
                                            <input
                                                type="text"
                                                value={userAnswers[idx]?.answer || ""}
                                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                                className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Type your answer"
                                            />
                                        )}

                                        {/* Matching */}
                                        {q.type === "Matching" && (
                                            <div className="flex flex-col gap-3">
                                                {q.options.map((pair, idxPair) => (
                                                    <div key={idxPair} className="flex items-center gap-4">
                                                        <div className="w-1/2 px-4 py-3 bg-blue-50 text-gray-800 rounded-xl border border-blue-200">
                                                            {pair.left}
                                                        </div>
                                                        <select
                                                            value={userAnswers[idx]?.answer?.[idxPair]?.right || ""}
                                                            onChange={(e) => {
                                                                const updated = [...(userAnswers[idx]?.answer || [])];
                                                                updated[idxPair] = { left: pair.left, right: e.target.value };
                                                                handleAnswerChange(idx, updated);
                                                            }}
                                                            className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select answer</option>
                                                            {q.options.map((p) => p.right).sort(() => Math.random() - 0.5).map((rightItem, rightIdx) => (
                                                                <option key={rightIdx} value={rightItem}>{rightItem}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center mt-8 gap-4">
                                <button
                                    onClick={handlePrevQuestion}
                                    disabled={currentQuestionIdx === 0}
                                    className={`px-6 py-3 rounded-xl font-medium transition ${
                                        currentQuestionIdx === 0
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-gray-600 hover:bg-gray-700 text-white"
                                    }`}
                                >
                                    Previous
                                </button>

                                <div className="flex gap-2">
                                    {currentQuiz.questions.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestionIdx(idx)}
                                            className={`w-10 h-10 rounded-lg font-semibold transition ${
                                                idx === currentQuestionIdx
                                                    ? "bg-blue-600 text-white"
                                                    : userAnswers[idx]?.answer !== undefined
                                                        ? "bg-green-500 text-white"
                                                        : "bg-gray-300 text-gray-700"
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>

                                {currentQuestionIdx === currentQuiz.questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmitQuiz}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition font-medium"
                                    >
                                        Submit Quiz
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNextQuestion}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition font-medium"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Result Page */}
                    {quizStarted && showResult && !reviewMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md mx-auto border border-gray-200"
                        >
                            <h2 className="text-3xl font-bold mb-4 text-gray-800">Quiz Completed!</h2>
                            <p className="text-lg mb-2 text-gray-700">
                                Your score: <span className="font-semibold text-blue-600">{score}</span> / {currentQuiz.questions.length}
                            </p>
                            <p className="text-blue-600 text-xl font-medium mb-6">{getMessage(score, currentQuiz.questions.length)}</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow transition">Restart</button>
                                <button onClick={handleDone} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl shadow transition">Done</button>
                                <button onClick={() => setReviewMode(true)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl shadow transition">Review Answers</button>
                            </div>
                        </motion.div>
                    )}

                    {/* Review Mode */}
                    {quizStarted && showResult && reviewMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl mx-auto border border-gray-200"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Review Answers</h2>
                            <div className="space-y-6">
                                {currentQuiz.questions.map((q, idx) => {
                                    const user = userAnswers[idx] || {};
                                    return (
                                        <div key={idx} className="p-5 rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-semibold text-lg text-gray-800">
                                                    Q{idx + 1}: {q.text}
                                                </span>
                                                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold text-white ${user.isCorrect ? "bg-emerald-600" : "bg-red-600"}`}>
                                                    {user.isCorrect ? "Correct" : "Incorrect"}
                                                </span>
                                            </div>
                                            <div className="text-sm mt-2 space-y-2 text-gray-700">
                                                <div>
                                                    <span className="font-medium text-gray-800">Your Answer: </span>
                                                    {q.type === "Checkboxes"
                                                        ? Array.isArray(user.answer) ? user.answer.join(", ") : <em>None</em>
                                                        : q.type === "Matching"
                                                            ? Array.isArray(user.answer) ? user.answer.map(p => `${p.left} = ${p.right}`).join(", ") : <em>None</em>
                                                            : user.answer !== undefined && user.answer !== null ? user.answer.toString() : <em>None</em>}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-800">Correct Answer: </span>
                                                    {q.type === "Checkboxes"
                                                        ? Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : <em>None</em>
                                                        : q.type === "Matching"
                                                            ? Array.isArray(q.correct_answer) ? q.correct_answer.map(p => `${p.left} = ${p.right}`).join(", ") : <em>None</em>
                                                            : q.correct_answer !== undefined && q.correct_answer !== null ? q.correct_answer.toString() : <em>None</em>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-center gap-4 mt-8">
                                <button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow transition">Restart</button>
                                <button onClick={handleDone} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl shadow transition">Done</button>
                                <button onClick={() => setReviewMode(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl shadow transition">Back to Result</button>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </>
    );
}