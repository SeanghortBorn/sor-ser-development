import HeaderNavbar from '@/Components/Navbars/HeaderNavbar';
import { Head, usePage } from '@inertiajs/react';
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

    // Store answers for all questions
    const [userAnswers, setUserAnswers] = useState([]);

    const handleStartQuiz = (quiz) => {
        setCurrentQuiz(quiz);
        setQuizStarted(true);
        setScore(0);
        setShowResult(false);
        setUserAnswers([]);
        setReviewMode(false);
    };

    const handleAnswerChange = (qIdx, answer) => {
        setUserAnswers((prev) => {
            const arr = [...prev];
            arr[qIdx] = { answer };
            return arr;
        });
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
                const correctVal =
                    q.correct_answer === true || q.correct_answer === "True"
                        ? "True"
                        : "False";
                correct = user.answer === correctVal;
            } else if (q.type === "Matching") {
                correct =
                    Array.isArray(q.correct_answer) &&
                    Array.isArray(user.answer) &&
                    q.correct_answer.length === user.answer.length &&
                    q.correct_answer.every((c) =>
                        user.answer.some(
                            (a) => a.left === c.left && a.right === c.right
                        )
                    );
            } else {
                correct = user.answer === q.correct_answer;
            }

            if (correct) newScore++;
            if (userAnswers[idx])
                userAnswers[idx].isCorrect = correct;
        });

        setScore(newScore);
        setShowResult(true);
    };

    const handleRestart = () => {
        setQuizStarted(false);
        setCurrentQuiz(null);
        setShowResult(false);
        setUserAnswers([]);
        setReviewMode(false);
    };

    const handleDone = () => {
        setQuizStarted(false);
        setCurrentQuiz(null);
        setShowResult(false);
        setUserAnswers([]);
        setReviewMode(false);
    };

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
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-white">
                <div className="max-w-4xl mx-auto">

                    {/* Welcome Screen */}
                    {!quizStarted && (
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-extrabold text-blue-400 mb-4 animate-pulse">
                                Welcome to the Quiz Hub
                            </h1>
                            <p className="text-lg text-gray-300">
                                Challenge yourself with fun and interactive quizzes!
                            </p>
                        </div>
                    )}

                    {/* Quiz List */}
                    {!quizStarted &&
                        quizzes.map((quiz) => (
                            <motion.div
                                key={quiz.id}
                                className="p-6 mb-4 bg-gray-800 shadow-lg rounded-xl hover:shadow-2xl transition"
                                whileHover={{ scale: 1.02 }}
                            >
                                <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
                                <p className="text-gray-400 mb-4">{quiz.description}</p>
                                <button
                                    onClick={() => handleStartQuiz(quiz)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow transition"
                                >
                                    Start Quiz
                                </button>
                            </motion.div>
                        ))}

                    {/* Quiz Page (Google Form style) */}
                    {quizStarted && currentQuiz && !showResult && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-900 shadow-lg rounded-2xl p-6 max-w-3xl mx-auto space-y-8"
                        >
                            <h2 className="text-3xl font-bold text-center mb-6">
                                {currentQuiz.title}
                            </h2>
                            {currentQuiz.questions.map((q, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-gray-700 shadow bg-gray-800">
                                    <p className="font-semibold text-lg mb-2">
                                        Q{idx + 1}: {q.text}
                                    </p>
                                    {q.description && (
                                        <p className="mb-4 text-gray-400">{q.description}</p>
                                    )}

                                    {/* Multiple Choice */}
                                    {q.type === "Multiple Choice" &&
                                        q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className="block mb-2">
                                                <input
                                                    type="radio"
                                                    name={`q-${idx}`}
                                                    value={opt}
                                                    checked={userAnswers[idx]?.answer === opt}
                                                    onChange={() => handleAnswerChange(idx, opt)}
                                                    className="mr-2"
                                                />
                                                {opt}
                                            </label>
                                        ))}

                                    {/* Checkboxes */}
                                    {q.type === "Checkboxes" &&
                                        q.options.map((opt, oIdx) => {
                                            const selected = Array.isArray(userAnswers[idx]?.answer)
                                                ? userAnswers[idx].answer
                                                : [];
                                            return (
                                                <label key={oIdx} className="block mb-2">
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
                                                        className="mr-2"
                                                    />
                                                    {opt}
                                                </label>
                                            );
                                        })}

                                    {/* True/False */}
                                    {q.type === "True/False" &&
                                        ["True", "False"].map((val, vIdx) => (
                                            <label key={vIdx} className="block mb-2">
                                                <input
                                                    type="radio"
                                                    name={`q-${idx}`}
                                                    value={val}
                                                    checked={userAnswers[idx]?.answer === val}
                                                    onChange={() => handleAnswerChange(idx, val)}
                                                    className="mr-2"
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
                                            className="px-3 py-2 rounded-xl border border-gray-600 bg-gray-700 text-white w-full"
                                            placeholder="Type your answer"
                                        />
                                    )}

                                    {/* Matching */}
                                    {q.type === "Matching" && (
                                        <div className="space-y-3">
                                            {q.options.map((pair, pIdx) => {
                                                const selected = userAnswers[idx]?.answer || [];
                                                const matched = selected.find(s => s.left === pair.left)?.right || "";
                                                return (
                                                    <div key={pIdx} className="flex items-center gap-3">
                                                        <span className="w-32">{pair.left}</span>
                                                        <select
                                                            value={matched}
                                                            onChange={(e) => {
                                                                const updated = selected.filter(s => s.left !== pair.left);
                                                                updated.push({ left: pair.left, right: e.target.value });
                                                                handleAnswerChange(idx, updated);
                                                            }}
                                                            className="px-3 py-2 rounded-xl border border-gray-600 bg-gray-700 text-white"
                                                        >
                                                            <option value="">Select</option>
                                                            {q.options.map((p, rIdx) => (
                                                                <option key={rIdx} value={p.right}>{p.right}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="text-center mt-6">
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl shadow transition"
                                >
                                    Submit Quiz
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Result Page */}
                    {quizStarted && showResult && !reviewMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-900 shadow-xl rounded-2xl p-8 text-center max-w-md mx-auto"
                        >
                            <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
                            <p className="text-lg mb-2">
                                Your score: <span className="font-semibold">{score}</span> / {currentQuiz.questions.length}
                            </p>
                            <p className="text-blue-400 text-xl font-medium mb-6">
                                {getMessage(score, currentQuiz.questions.length)}
                            </p>
                            <div className="flex justify-center gap-6">
                                <button
                                    onClick={handleRestart}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl"
                                >
                                    Restart
                                </button>
                                <button
                                    onClick={handleDone}
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={() => setReviewMode(true)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl"
                                >
                                    Review Answers
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Review Mode */}
                    {quizStarted && showResult && reviewMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-900 shadow-xl rounded-2xl p-8 max-w-2xl mx-auto text-white"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-center">Review Answers</h2>
                            <div className="space-y-6">
                                {currentQuiz.questions.map((q, idx) => {
                                    const user = userAnswers[idx] || {};
                                    return (
                                        <div key={idx} className="p-4 rounded-xl border border-gray-700 bg-gray-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-lg">
                                                    Q{idx + 1}: {q.text}
                                                </span>
                                                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${user.isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                                                    {user.isCorrect ? "Correct" : "Incorrect"}
                                                </span>
                                            </div>
                                            <div className="text-sm mt-2 space-y-1">
                                                <div>
                                                    <span className="font-medium">Your Answer: </span>
                                                    {q.type === "Checkboxes"
                                                        ? Array.isArray(user.answer) ? user.answer.join(", ") : <em>None</em>
                                                        : q.type === "Matching"
                                                            ? Array.isArray(user.answer) ? user.answer.map(p => `${p.left} = ${p.right}`).join(", ") : <em>None</em>
                                                            : user.answer !== undefined && user.answer !== null ? user.answer.toString() : <em>None</em>}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Correct Answer: </span>
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
                            <div className="flex justify-center gap-6 mt-8">
                                <button
                                    onClick={handleRestart}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl"
                                >
                                    Restart
                                </button>
                                <button
                                    onClick={handleDone}
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={() => setReviewMode(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl"
                                >
                                    Back to Result
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
