import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, usePage, router, Link } from "@inertiajs/react"; // <-- add Link import
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Award, Clock, BarChart3 } from "lucide-react";
import QuizzesSection from "@/Components/Quizzes/QuizzesSection";
import Footer from "@/Components/Footer/Footer";
import QuizModal from "@/Components/Quizzes/QuizModal";

export default function Quiz() {
    const { quizData, auth } = usePage().props;
    const quizzes = quizData?.data || [];
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

    const [canAccessLibrary, setCanAccessLibrary] = useState(() => {
        if (auth?.can?.["student"]) return true;
        if (
            typeof window !== "undefined" &&
            window.__canAccessLibrary !== undefined
        )
            return window.__canAccessLibrary;
        return null;
    });

    useEffect(() => {
        if (canAccessLibrary === true || !auth?.user) return;
        let cancelled = false;
        (async () => {
            try {
                const response = await fetch(
                    route("api.user.can-access-library"),
                    {
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                    }
                );
                const ok = response.ok;
                if (!cancelled) {
                    setCanAccessLibrary(ok);
                    if (typeof window !== "undefined")
                        window.__canAccessLibrary = ok;
                }
            } catch {
                if (!cancelled) {
                    setCanAccessLibrary(false);
                    if (typeof window !== "undefined")
                        window.__canAccessLibrary = false;
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [auth?.user, canAccessLibrary]);

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
            if (userAnswers[idx]) userAnswers[idx].isCorrect = correct;
        });

        setScore(newScore);
        setShowResult(true);

        router.post(
            route("quizzes.submit"),
            {
                quiz_id: currentQuiz.id,
                score: newScore,
                answers: userAnswers,
            },
            {
                onSuccess: () => alert("Quiz submitted successfully! ✅"),
                preserveState: true,
            }
        );
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

            {/* Fullscreen quiz modal at top for visibility */}
            {quizStarted && currentQuiz && (
                <QuizModal
                    currentQuiz={currentQuiz}
                    currentQuestionIdx={currentQuestionIdx}
                    userAnswers={userAnswers}
                    showResult={showResult}
                    reviewMode={reviewMode}
                    score={score}
                    onAnswerChange={handleAnswerChange}
                    onNext={handleNextQuestion}
                    onPrev={handlePrevQuestion}
                    onSubmit={handleSubmitQuiz}
                    onRestart={handleRestart}
                    onDone={handleDone}
                    onStartAgain={() => {
                        handleRestart();
                        setTimeout(() => handleStartQuiz(currentQuiz), 150);
                    }}
                    setCurrentQuestionIdx={setCurrentQuestionIdx}
                    setReviewMode={setReviewMode}
                    setQuizStarted={setQuizStarted}
                />
            )}

            {/* show navbar only when not in-quiz modal */}
            {!quizStarted && <HeaderNavbar />}

            {/* Main page: hide while quizStarted (modal active) */}
            <div
                className={`min-h-screen w-full py-12 max-w-7xl mx-auto ${
                    quizStarted ? "hidden" : ""
                }`}
            >
                <QuizzesSection />

                {canAccessLibrary !== true ? (
                    <>
                        <div className="flex justify-between items-center text-md">
                            <span className="text-gray-500 text-md">
                                Try it out above by using{" "}
                                <span className="font-semibold">
                                    handwritten notes.
                                </span>
                            </span>
                            <span className="text-gray-500 text-md">
                                Don't have any content? {""}
                                <button className="text-blue-500 text-md hover:underline">
                                    Create from scratch
                                </button>
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="max-w-7xl mx-auto px-2">
                        {/* Welcome Screen */}
                        {!quizStarted && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-12"
                            >
                                {/* <div className="inline-block p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6">
                                    <BookOpen className="w-12 h-12 text-blue-600" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                    Quiz Hub
                                </h1>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Test your knowledge with interactive quizzes
                                    and track your progress
                                </p> */}
                            </motion.div>
                        )}

                        {/* Quiz List */}
                        {!quizStarted && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                <h2 className="text-xl font-bold text-gray-900 flex-1">
                                                    {quiz.title}
                                                </h2>
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    {quiz.questions?.length ||
                                                        0}{" "}
                                                    Q's
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {quiz.description}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    handleStartQuiz(quiz)
                                                }
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
                                style={{ borderRadius: "20px" }}
                            >
                                {/* Compact Header */}
                                <div
                                    className="bg-blue-600 text-white p-4"
                                    style={{ borderRadius: "20px 20px 0 0" }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h2 className="text-xl font-bold">
                                                {currentQuiz.title}
                                            </h2>
                                            <p className="text-sm text-white opacity-90 mt-1">
                                                Question{" "}
                                                {currentQuestionIdx + 1} /{" "}
                                                {currentQuiz.questions.length}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div
                                        className="w-full bg-white bg-opacity-30 h-2 overflow-hidden"
                                        style={{ borderRadius: "20px" }}
                                    >
                                        <motion.div
                                            className="bg-white h-2"
                                            style={{ borderRadius: "20px" }}
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${
                                                    ((currentQuestionIdx + 1) /
                                                        currentQuiz.questions
                                                            .length) *
                                                    100
                                                }%`,
                                            }}
                                            transition={{ duration: 0.5 }}
                                        ></motion.div>
                                    </div>
                                </div>

                                {/* Compact Content */}
                                <div className="p-5">
                                    {/* Current Question */}
                                    {currentQuiz.questions.map(
                                        (q, idx) =>
                                            idx === currentQuestionIdx && (
                                                <motion.div
                                                    key={idx}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className="space-y-4"
                                                >
                                                    <div>
                                                        <p className="text-lg font-bold text-blue-600 mb-3">
                                                            {q.text}
                                                        </p>
                                                        {q.description && (
                                                            <p className="text-sm text-blue-500 mb-3">
                                                                {q.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Options Container */}
                                                    <div className="space-y-2">
                                                        {/* Multiple Choice */}
                                                        {q.type ===
                                                            "Multiple Choice" &&
                                                            q.options.map(
                                                                (opt, oIdx) => (
                                                                    <label
                                                                        key={
                                                                            oIdx
                                                                        }
                                                                        className="flex items-center p-3 bg-white border-2 border-blue-200 hover:border-blue-600 cursor-pointer transition-all"
                                                                        style={{
                                                                            borderRadius:
                                                                                "20px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name={`q-${idx}`}
                                                                            value={
                                                                                opt
                                                                            }
                                                                            checked={
                                                                                userAnswers[
                                                                                    idx
                                                                                ]
                                                                                    ?.answer ===
                                                                                opt
                                                                            }
                                                                            onChange={() =>
                                                                                handleAnswerChange(
                                                                                    idx,
                                                                                    opt
                                                                                )
                                                                            }
                                                                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                                        />
                                                                        <span className="ml-3 text-blue-900 text-sm">
                                                                            {
                                                                                opt
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                )
                                                            )}

                                                        {/* Checkboxes */}
                                                        {q.type ===
                                                            "Checkboxes" &&
                                                            q.options.map(
                                                                (opt, oIdx) => {
                                                                    const selected =
                                                                        Array.isArray(
                                                                            userAnswers[
                                                                                idx
                                                                            ]
                                                                                ?.answer
                                                                        )
                                                                            ? userAnswers[
                                                                                  idx
                                                                              ]
                                                                                  .answer
                                                                            : [];
                                                                    return (
                                                                        <label
                                                                            key={
                                                                                oIdx
                                                                            }
                                                                            className="flex items-center p-3 bg-white border-2 border-blue-200 hover:border-blue-600 cursor-pointer transition-all"
                                                                            style={{
                                                                                borderRadius:
                                                                                    "20px",
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                value={
                                                                                    opt
                                                                                }
                                                                                checked={selected.includes(
                                                                                    opt
                                                                                )}
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    let newSel =
                                                                                        [
                                                                                            ...selected,
                                                                                        ];
                                                                                    if (
                                                                                        e
                                                                                            .target
                                                                                            .checked
                                                                                    )
                                                                                        newSel.push(
                                                                                            opt
                                                                                        );
                                                                                    else
                                                                                        newSel =
                                                                                            newSel.filter(
                                                                                                (
                                                                                                    v
                                                                                                ) =>
                                                                                                    v !==
                                                                                                    opt
                                                                                            );
                                                                                    handleAnswerChange(
                                                                                        idx,
                                                                                        newSel
                                                                                    );
                                                                                }}
                                                                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                                            />
                                                                            <span className="ml-3 text-blue-900 text-sm">
                                                                                {
                                                                                    opt
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                }
                                                            )}

                                                        {/* True/False */}
                                                        {q.type ===
                                                            "True/False" &&
                                                            [
                                                                "True",
                                                                "False",
                                                            ].map(
                                                                (val, vIdx) => (
                                                                    <label
                                                                        key={
                                                                            vIdx
                                                                        }
                                                                        className="flex items-center p-3 bg-white border-2 border-blue-200 hover:border-blue-600 cursor-pointer transition-all"
                                                                        style={{
                                                                            borderRadius:
                                                                                "20px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name={`q-${idx}`}
                                                                            value={
                                                                                val
                                                                            }
                                                                            checked={
                                                                                userAnswers[
                                                                                    idx
                                                                                ]
                                                                                    ?.answer ===
                                                                                val
                                                                            }
                                                                            onChange={() =>
                                                                                handleAnswerChange(
                                                                                    idx,
                                                                                    val
                                                                                )
                                                                            }
                                                                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                                        />
                                                                        <span className="ml-3 text-blue-900 text-sm">
                                                                            {
                                                                                val
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                )
                                                            )}

                                                        {/* Fill-in-the-blank */}
                                                        {q.type ===
                                                            "Fill-in-the-blank" && (
                                                            <input
                                                                type="text"
                                                                value={
                                                                    userAnswers[
                                                                        idx
                                                                    ]?.answer ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleAnswerChange(
                                                                        idx,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="w-full px-4 py-3 border-2 border-blue-300 focus:border-blue-600 bg-white text-blue-900 text-sm focus:outline-none transition-all"
                                                                style={{
                                                                    borderRadius:
                                                                        "20px",
                                                                }}
                                                                placeholder="Type your answer here"
                                                            />
                                                        )}

                                                        {/* Matching */}
                                                        {q.type ===
                                                            "Matching" && (
                                                            <div className="space-y-2">
                                                                {q.options.map(
                                                                    (
                                                                        pair,
                                                                        idxPair
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                idxPair
                                                                            }
                                                                            className="flex items-center gap-3"
                                                                        >
                                                                            <div
                                                                                className="flex-1 px-3 py-2 bg-blue-100 text-blue-900 text-sm border border-blue-300"
                                                                                style={{
                                                                                    borderRadius:
                                                                                        "20px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    pair.left
                                                                                }
                                                                            </div>
                                                                            <select
                                                                                value={
                                                                                    userAnswers[
                                                                                        idx
                                                                                    ]
                                                                                        ?.answer?.[
                                                                                        idxPair
                                                                                    ]
                                                                                        ?.right ||
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    const updated =
                                                                                        [
                                                                                            ...(userAnswers[
                                                                                                idx
                                                                                            ]
                                                                                                ?.answer ||
                                                                                                []),
                                                                                        ];
                                                                                    updated[
                                                                                        idxPair
                                                                                    ] =
                                                                                        {
                                                                                            left: pair.left,
                                                                                            right: e
                                                                                                .target
                                                                                                .value,
                                                                                        };
                                                                                    handleAnswerChange(
                                                                                        idx,
                                                                                        updated
                                                                                    );
                                                                                }}
                                                                                className="flex-1 px-3 py-2 border-2 border-blue-300 bg-white text-blue-900 text-sm focus:outline-none focus:border-blue-600"
                                                                                style={{
                                                                                    borderRadius:
                                                                                        "20px",
                                                                                }}
                                                                            >
                                                                                <option value="">
                                                                                    Select
                                                                                    answer
                                                                                </option>
                                                                                {q.options
                                                                                    .map(
                                                                                        (
                                                                                            p
                                                                                        ) =>
                                                                                            p.right
                                                                                    )
                                                                                    .sort(
                                                                                        () =>
                                                                                            Math.random() -
                                                                                            0.5
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            rightItem,
                                                                                            rightIdx
                                                                                        ) => (
                                                                                            <option
                                                                                                key={
                                                                                                    rightIdx
                                                                                                }
                                                                                                value={
                                                                                                    rightItem
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    rightItem
                                                                                                }
                                                                                            </option>
                                                                                        )
                                                                                    )}
                                                                            </select>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                    )}

                                    {/* Compact Question Navigator */}
                                    <div
                                        className="flex flex-wrap gap-2 mt-4 p-3 bg-blue-50"
                                        style={{ borderRadius: "20px" }}
                                    >
                                        {currentQuiz.questions.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setCurrentQuestionIdx(idx)
                                                }
                                                className={`w-8 h-8 font-semibold transition-all text-xs ${
                                                    idx === currentQuestionIdx
                                                        ? "bg-blue-600 text-white"
                                                        : userAnswers[idx]
                                                              ?.answer !==
                                                          undefined
                                                        ? "bg-blue-400 text-white hover:bg-blue-500"
                                                        : "bg-white text-blue-600 border border-blue-300 hover:bg-blue-100"
                                                }`}
                                                style={{ borderRadius: "20px" }}
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
                                            style={{ borderRadius: "20px" }}
                                        >
                                            Previous
                                        </button>

                                        {currentQuestionIdx ===
                                        currentQuiz.questions.length - 1 ? (
                                            <button
                                                onClick={handleSubmitQuiz}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all text-sm"
                                                style={{ borderRadius: "20px" }}
                                            >
                                                Submit Quiz
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleNextQuestion}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all text-sm"
                                                style={{ borderRadius: "20px" }}
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
                                    <div
                                        className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor(
                                            score,
                                            currentQuiz.questions.length
                                        )} flex items-center justify-center`}
                                    >
                                        <Award className="w-12 h-12 text-white" />
                                    </div>
                                </motion.div>

                                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                    Quiz Completed!
                                </h2>

                                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Your Score
                                    </p>
                                    <p className="text-5xl font-bold text-blue-600 mb-2">
                                        {score}/{currentQuiz.questions.length}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {Math.round(
                                            (score /
                                                currentQuiz.questions.length) *
                                                100
                                        )}
                                        %
                                    </p>
                                </div>

                                <p
                                    className={`text-2xl font-bold mb-8 bg-gradient-to-r ${getScoreColor(
                                        score,
                                        currentQuiz.questions.length
                                    )} bg-clip-text text-transparent`}
                                >
                                    {getMessage(
                                        score,
                                        currentQuiz.questions.length
                                    )}
                                </p>

                                <div className="flex flex-col sm:flex-row justify-center gap-3">
                                    <button
                                        onClick={() => setReviewMode(true)}
                                        className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                    >
                                        Review Answers
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRestart();
                                            setTimeout(
                                                () => handleStartQuiz(currentQuiz),
                                                150
                                            );
                                        }}
                                        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={handleDone}
                                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                    >
                                        Done (Exit Quiz)
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
                                    <h2 className="text-3xl md:text-4xl font-bold">
                                        Review Answers
                                    </h2>
                                    <p className="text-orange-100 mt-2">
                                        Check your responses and learn
                                    </p>
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
                                                className={`p-6 rounded-xl border-2 ${
                                                    user.isCorrect
                                                        ? "border-green-200 bg-green-50"
                                                        : "border-red-200 bg-red-50"
                                                }`}
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
                                                                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                                                                    Correct
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-600">
                                                                Incorrect
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 text-sm">
                                                    <div className="p-3 bg-white rounded-lg">
                                                        <span className="font-semibold text-gray-800">
                                                            Your Answer:{" "}
                                                        </span>
                                                        <span className="text-gray-700">
                                                            {q.type ===
                                                            "Checkboxes"
                                                                ? Array.isArray(
                                                                      user.answer
                                                                  )
                                                                    ? user.answer.join(
                                                                          ", "
                                                                      ) ||
                                                                      "Not answered"
                                                                    : "Not answered"
                                                                : q.type ===
                                                                  "Matching"
                                                                ? Array.isArray(
                                                                      user.answer
                                                                  )
                                                                    ? user.answer
                                                                          .map(
                                                                              (
                                                                                  p
                                                                              ) =>
                                                                                  `${p.left} = ${p.right}`
                                                                          )
                                                                          .join(
                                                                              ", "
                                                                          ) ||
                                                                      "Not answered"
                                                                    : "Not answered"
                                                                : user.answer !==
                                                                      undefined &&
                                                                  user.answer !==
                                                                      null
                                                                ? user.answer.toString()
                                                                : "Not answered"}
                                                        </span>
                                                    </div>
                                                    {!user.isCorrect && (
                                                        <div className="p-3 bg-white rounded-lg border-l-4 border-green-500">
                                                            <span className="font-semibold text-gray-800">
                                                                Correct Answer:{" "}
                                                            </span>
                                                            <span className="text-green-700 font-medium">
                                                                {q.type ===
                                                                "Checkboxes"
                                                                    ? Array.isArray(
                                                                          q.correct_answer
                                                                      )
                                                                        ? q.correct_answer.join(
                                                                              ", "
                                                                          )
                                                                        : ""
                                                                    : q.type ===
                                                                      "Matching"
                                                                    ? Array.isArray(
                                                                          q.correct_answer
                                                                      )
                                                                        ? q.correct_answer
                                                                              .map(
                                                                                  (
                                                                                      p
                                                                                  ) =>
                                                                                      `${p.left} = ${p.right}`
                                                                              )
                                                                              .join(
                                                                                  ", "
                                                                              )
                                                                        : ""
                                                                    : q.correct_answer !==
                                                                          undefined &&
                                                                      q.correct_answer !==
                                                                          null
                                                                    ? q.correct_answer.toString()
                                                                    : ""}
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
                )}
            </div>

            

            {/* show footer only when not in-quiz modal */}
            {!quizStarted && <Footer />}
        </>
    );
}
