import HeaderNavbar from '@/Components/Navbars/HeaderNavbar';
import { Head, usePage, router, Link } from '@inertiajs/react'; // <-- add Link import
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Award, Clock, BarChart3 } from 'lucide-react';

export default function Quiz() {
    const { quizData, auth } = usePage().props;
    const quizzes = quizData?.data || [];
    const isAuthenticated = !!(auth && auth.user);
    const showAccountModal = !isAuthenticated;

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
        if (pct === 100) return "Perfect score!";
        if (pct >= 80) return "Excellent work!";
        if (pct >= 70) return "Well done!";
        if (pct >= 60) return "Good effort!";
        if (pct >= 40) return "Keep trying!";
        return "Better luck next time!";
    };

    const getScoreColor = (score, total) => {
        const pct = Math.round((score / total) * 100);
        if (pct >= 80) return "from-green-500 to-emerald-600";
        if (pct >= 60) return "from-blue-500 to-blue-600";
        if (pct >= 40) return "from-orange-500 to-orange-600";
        return "from-red-500 to-red-600";
    };

    return (
        <>
            <Head title="Quiz" />
            <HeaderNavbar />
            <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-5xl mx-auto">

                    {/* Welcome Screen */}
                    {!quizStarted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <div className="inline-block p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6">
                                <BookOpen className="w-12 h-12 text-blue-600" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Quiz Hub
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Test your knowledge with interactive quizzes and track your progress
                            </p>
                        </motion.div>
                    )}

                    {/* Quiz List */}
                    {!quizStarted && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quizzes.map((quiz) => (
                                <motion.div
                                    key={quiz.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ translateY: -8 }}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-900 flex-1">{quiz.title}</h2>
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                {quiz.questions?.length || 0} Q's
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                                        <button
                                            onClick={() => handleStartQuiz(quiz)}
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                                        >
                                            Start Quiz
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Quiz Page */}
                    {quizStarted && currentQuiz && !showResult && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white shadow-lg"
                            style={{ borderRadius: '20px' }}
                        >
                            {/* Compact Header */}
                            <div className="bg-blue-600 text-white p-4" style={{ borderRadius: '20px 20px 0 0' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="text-xl font-bold">{currentQuiz.title}</h2>
                                        <p className="text-sm text-white opacity-90 mt-1">Question {currentQuestionIdx + 1} / {currentQuiz.questions.length}</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-white bg-opacity-30 h-2 overflow-hidden" style={{ borderRadius: '20px' }}>
                                    <motion.div
                                        className="bg-white h-2"
                                        style={{ borderRadius: '20px' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIdx + 1) / currentQuiz.questions.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    ></motion.div>
                                </div>
                            </div>

                            {/* Compact Content */}
                            <div className="p-5">
                                {/* Current Question */}
                                {currentQuiz.questions.map((q, idx) => 
                                    idx === currentQuestionIdx && (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <p className="text-lg font-bold text-blue-600 mb-3">
                                                    {q.text}
                                                </p>
                                                {q.description && (
                                                    <p className="text-sm text-blue-500 mb-3">{q.description}</p>
                                                )}
                                            </div>

                                            {/* Options Container */}
                                            <div className="space-y-2">
                                                {/* Multiple Choice */}
                                                {q.type === "Multiple Choice" && q.options.map((opt, oIdx) => (
                                                    <label key={oIdx} className="flex items-center p-3 bg-white border-2 border-blue-200 hover:border-blue-600 cursor-pointer transition-all" style={{ borderRadius: '20px' }}>
                                                        <input
                                                            type="radio"
                                                            name={`q-${idx}`}
                                                            value={opt}
                                                            checked={userAnswers[idx]?.answer === opt}
                                                            onChange={() => handleAnswerChange(idx, opt)}
                                                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                        />
                                                        <span className="ml-3 text-blue-900 text-sm">{opt}</span>
                                                    </label>
                                                ))}

                                                {/* Checkboxes */}
                                                {q.type === "Checkboxes" && q.options.map((opt, oIdx) => {
                                                    const selected = Array.isArray(userAnswers[idx]?.answer) ? userAnswers[idx].answer : [];
                                                    return (
                                                        <label key={oIdx} className="flex items-center p-3 bg-white border-2 border-blue-200 hover:border-blue-600 cursor-pointer transition-all" style={{ borderRadius: '20px' }}>
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
                                                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                            />
                                                            <span className="ml-3 text-blue-900 text-sm">{opt}</span>
                                                        </label>
                                                    );
                                                })}

                                                {/* True/False */}
                                                {q.type === "True/False" && ["True", "False"].map((val, vIdx) => (
                                                    <label key={vIdx} className="flex items-center p-3 bg-white border-2 border-blue-200 hover:border-blue-600 cursor-pointer transition-all" style={{ borderRadius: '20px' }}>
                                                        <input
                                                            type="radio"
                                                            name={`q-${idx}`}
                                                            value={val}
                                                            checked={userAnswers[idx]?.answer === val}
                                                            onChange={() => handleAnswerChange(idx, val)}
                                                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                        />
                                                        <span className="ml-3 text-blue-900 text-sm">{val}</span>
                                                    </label>
                                                ))}

                                                {/* Fill-in-the-blank */}
                                                {q.type === "Fill-in-the-blank" && (
                                                    <input
                                                        type="text"
                                                        value={userAnswers[idx]?.answer || ""}
                                                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-blue-300 focus:border-blue-600 bg-white text-blue-900 text-sm focus:outline-none transition-all"
                                                        style={{ borderRadius: '20px' }}
                                                        placeholder="Type your answer here"
                                                    />
                                                )}

                                                {/* Matching */}
                                                {q.type === "Matching" && (
                                                    <div className="space-y-2">
                                                        {q.options.map((pair, idxPair) => (
                                                            <div key={idxPair} className="flex items-center gap-3">
                                                                <div className="flex-1 px-3 py-2 bg-blue-100 text-blue-900 text-sm border border-blue-300" style={{ borderRadius: '20px' }}>
                                                                    {pair.left}
                                                                </div>
                                                                <select
                                                                    value={userAnswers[idx]?.answer?.[idxPair]?.right || ""}
                                                                    onChange={(e) => {
                                                                        const updated = [...(userAnswers[idx]?.answer || [])];
                                                                        updated[idxPair] = { left: pair.left, right: e.target.value };
                                                                        handleAnswerChange(idx, updated);
                                                                    }}
                                                                    className="flex-1 px-3 py-2 border-2 border-blue-300 bg-white text-blue-900 text-sm focus:outline-none focus:border-blue-600"
                                                                    style={{ borderRadius: '20px' }}
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
                                        </motion.div>
                                    )
                                )}

                                {/* Compact Question Navigator */}
                                <div className="flex flex-wrap gap-2 mt-4 p-3 bg-blue-50" style={{ borderRadius: '20px' }}>
                                    {currentQuiz.questions.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentQuestionIdx(idx)}
                                            className={`w-8 h-8 font-semibold transition-all text-xs ${
                                                idx === currentQuestionIdx
                                                    ? "bg-blue-600 text-white"
                                                    : userAnswers[idx]?.answer !== undefined
                                                        ? "bg-blue-400 text-white hover:bg-blue-500"
                                                        : "bg-white text-blue-600 border border-blue-300 hover:bg-blue-100"
                                            }`}
                                            style={{ borderRadius: '20px' }}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>

                                {/* Compact Navigation Buttons */}
                                <div className="flex justify-between items-center gap-3 mt-4">
                                    <button
                                        onClick={handlePrevQuestion}
                                        disabled={currentQuestionIdx === 0}
                                        className={`px-5 py-2 font-semibold transition-all text-sm ${
                                            currentQuestionIdx === 0
                                                ? "bg-blue-100 text-blue-300 cursor-not-allowed"
                                                : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                        }`}
                                        style={{ borderRadius: '20px' }}
                                    >
                                        Previous
                                    </button>

                                    {currentQuestionIdx === currentQuiz.questions.length - 1 ? (
                                        <button
                                            onClick={handleSubmitQuiz}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all text-sm"
                                            style={{ borderRadius: '20px' }}
                                        >
                                            Submit Quiz
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNextQuestion}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all text-sm"
                                            style={{ borderRadius: '20px' }}
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Result Page */}
                    {quizStarted && showResult && !reviewMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 text-center border border-gray-200 max-w-2xl mx-auto"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block mb-6"
                            >
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor(score, currentQuiz.questions.length)} flex items-center justify-center`}>
                                    <Award className="w-12 h-12 text-white" />
                                </div>
                            </motion.div>

                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quiz Completed!</h2>
                            
                            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-2">Your Score</p>
                                <p className="text-5xl font-bold text-blue-600 mb-2">
                                    {score}/{currentQuiz.questions.length}
                                </p>
                                <p className="text-lg font-semibold text-gray-700">
                                    {Math.round((score / currentQuiz.questions.length) * 100)}%
                                </p>
                            </div>

                            <p className={`text-2xl font-bold mb-8 bg-gradient-to-r ${getScoreColor(score, currentQuiz.questions.length)} bg-clip-text text-transparent`}>
                                {getMessage(score, currentQuiz.questions.length)}
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button 
                                    onClick={() => setReviewMode(true)} 
                                    className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Review Answers
                                </button>
                                <button 
                                    onClick={handleRestart} 
                                    className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Try Another
                                </button>
                                <button 
                                    onClick={handleDone} 
                                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Review Mode */}
                    {quizStarted && showResult && reviewMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-6 md:p-8">
                                <h2 className="text-3xl md:text-4xl font-bold">Review Answers</h2>
                                <p className="text-orange-100 mt-2">Check your responses and learn</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8 space-y-6">
                                {currentQuiz.questions.map((q, idx) => {
                                    const user = userAnswers[idx] || {};
                                    return (
                                        <motion.div 
                                            key={idx} 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-6 rounded-xl border-2 ${user.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">
                                                        Q{idx + 1}: {q.text}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {user.isCorrect ? (
                                                        <>
                                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">Correct</span>
                                                        </>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-600">Incorrect</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                <div className="p-3 bg-white rounded-lg">
                                                    <span className="font-semibold text-gray-800">Your Answer: </span>
                                                    <span className="text-gray-700">
                                                        {q.type === "Checkboxes"
                                                            ? Array.isArray(user.answer) ? user.answer.join(", ") || "Not answered" : "Not answered"
                                                            : q.type === "Matching"
                                                                ? Array.isArray(user.answer) ? user.answer.map(p => `${p.left} = ${p.right}`).join(", ") || "Not answered" : "Not answered"
                                                                : user.answer !== undefined && user.answer !== null ? user.answer.toString() : "Not answered"}
                                                    </span>
                                                </div>
                                                {!user.isCorrect && (
                                                    <div className="p-3 bg-white rounded-lg border-l-4 border-green-500">
                                                        <span className="font-semibold text-gray-800">Correct Answer: </span>
                                                        <span className="text-green-700 font-medium">
                                                            {q.type === "Checkboxes"
                                                                ? Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : ""
                                                                : q.type === "Matching"
                                                                    ? Array.isArray(q.correct_answer) ? q.correct_answer.map(p => `${p.left} = ${p.right}`).join(", ") : ""
                                                                    : q.correct_answer !== undefined && q.correct_answer !== null ? q.correct_answer.toString() : ""}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-6 md:px-8 py-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-center gap-3">
                                <button 
                                    onClick={() => setReviewMode(false)} 
                                    className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition-all"
                                >
                                    Back to Result
                                </button>
                                <button 
                                    onClick={handleRestart} 
                                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Try Another
                                </button>
                                <button 
                                    onClick={handleDone} 
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    )}

                </div>
                {/* Account Modal */}
                {showAccountModal && (
                    <div className="absolute inset-0 bg-opacity-20 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-xl mx-4">
                            <div className="text-center">
                                <h2 className="text-[24px] font-semibold text-gray-900 mb-2">
                                    Create an account to get started
                                </h2>
                                <p className="text-gray-600 text-md leading-relaxed font-sans mb-6">
                                    Create a free SorSer account to start<br />
                                    Quiz Hub and track your progress
                                </p>
                                <div className="space-y-3 mb-4">
                                    <a
                                        href={route("auth.google")}
                                        className="w-full flex items-center justify-center gap-3 px-3 py-3 border-[3px] border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="#4285f4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34a853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#fbbc05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#ea4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        <span className="text-gray-700 font-medium">
                                            Sign Up with Google
                                        </span>
                                    </a>

                                    <Link
                                        href={route("register")}
                                        className="w-full flex items-center justify-center gap-3 px-3 py-3 border-[3px] border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <svg
                                                className="w-12 h-12 text-gray-700"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-500">
                                            Sign Up by Email
                                        </span>
                                    </Link>
                                </div>

                                <div className="mt-6 text-md">
                                    <span className="text-gray-500">Or </span>
                                    <Link href={route("login")}>
                                        <span className="text-blue-500 font-medium">
                                            Sign In
                                        </span>
                                    </Link>{" "}
                                    to an existing account
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}