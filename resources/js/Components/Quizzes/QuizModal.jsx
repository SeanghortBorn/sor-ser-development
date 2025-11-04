import React from "react";
import { motion } from "framer-motion";

export default function QuizModal({
    currentQuiz,
    currentQuestionIdx,
    userAnswers = [],
    showResult,
    reviewMode,
    score,
    onAnswerChange,
    onNext,
    onPrev,
    onSubmit,
    onRestart,
    onDone,
    onStartAgain,
    setCurrentQuestionIdx,
    setReviewMode,
    setQuizStarted
}) {
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [selectedAnswer, setSelectedAnswer] = React.useState(null);
    const [isCorrect, setIsCorrect] = React.useState(false);

    React.useEffect(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        setIsCorrect(false);
    }, [currentQuestionIdx]);

    if (!currentQuiz) return null;

    const q = currentQuiz.questions[currentQuestionIdx];

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleCheck = () => {
        if (!selectedAnswer) return;

        onAnswerChange(currentQuestionIdx, selectedAnswer);

        let correct = false;
        if (q.type === "Checkboxes") {
            const correctAnswers = Array.isArray(q.correct_answer) ? q.correct_answer.sort() : [];
            const userAnswerSorted = Array.isArray(selectedAnswer) ? [...selectedAnswer].sort() : [];
            correct = JSON.stringify(correctAnswers) === JSON.stringify(userAnswerSorted);
        } else if (q.type === "Matching") {
            const correctPairs = q.correct_answer || [];
            const userPairs = selectedAnswer || [];
            correct = correctPairs.every(cp =>
                userPairs.find(ua => ua.left === cp.left && ua.right === cp.right)
            ) && userPairs.length === correctPairs.length;
        } else {
            correct = String(selectedAnswer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
        }

        setIsCorrect(correct);
        setShowFeedback(true);
    };

    const handleContinue = () => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        if (currentQuestionIdx < currentQuiz.questions.length - 1) {
            onNext();
        } else {
            onSubmit();
        }
    };

    const handleClose = () => {
        setQuizStarted(false);
    };

    const isAnswerSelected = () => {
        if (!selectedAnswer) return false;
        if (Array.isArray(selectedAnswer)) {
            if (q.type === "Matching") {
                return selectedAnswer.length > 0 && selectedAnswer.every(p => p.right);
            }
            return selectedAnswer.length > 0;
        }
        return true;
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {!showResult && (
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex-1 mx-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                                    <motion.div
                                        className="bg-green-500 h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIdx + 1) / currentQuiz.questions.length) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-gray-600 min-w-[40px]">
                                    {currentQuestionIdx + 1}/{currentQuiz.questions.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                        <div className="w-full max-w-2xl">
                            {q && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                                            {q.text}
                                        </h3>
                                        {q.description && (
                                            <p className="text-base text-gray-600 mb-2">{q.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {q.type === "Multiple Choice" && q.options.map((opt, oIdx) => {
                                            const isSelected = selectedAnswer === opt;
                                            const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => !showFeedback && handleAnswerSelect(opt)}
                                                    disabled={showFeedback}
                                                    className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all text-left ${showFeedback && isSelected
                                                        ? isCorrect
                                                            ? 'bg-green-100 border-green-500'
                                                            : 'bg-red-100 border-red-500'
                                                        : isSelected
                                                            ? 'bg-blue-50 border-blue-500'
                                                            : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                                        } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg mr-4 ${showFeedback && isSelected
                                                        ? isCorrect
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-red-500 text-white'
                                                        : isSelected
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-200 text-gray-700'
                                                        }`}>
                                                        {labels[oIdx]}
                                                    </span>
                                                    <span className="text-lg text-gray-800">{opt}</span>
                                                </button>
                                            );
                                        })}

                                        {q.type === "True/False" && ["True", "False"].map((val, vIdx) => {
                                            const isSelected = selectedAnswer === val;
                                            return (
                                                <button
                                                    key={vIdx}
                                                    onClick={() => !showFeedback && handleAnswerSelect(val)}
                                                    disabled={showFeedback}
                                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-3 transition-all ${showFeedback && isSelected
                                                        ? isCorrect
                                                            ? 'bg-green-100 border-green-500'
                                                            : 'bg-red-100 border-red-500'
                                                        : isSelected
                                                            ? 'bg-blue-50 border-blue-500 border-3'
                                                            : 'bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                                        } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {val === "True" ? (
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${showFeedback && isSelected
                                                                ? isCorrect
                                                                    ? 'bg-green-500'
                                                                    : 'bg-red-500'
                                                                : isSelected
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-green-50 border-2 border-green-300'
                                                                }`}>
                                                                <svg className={`w-7 h-7 ${isSelected || showFeedback ? 'text-white' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        ) : (
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${showFeedback && isSelected
                                                                ? isCorrect
                                                                    ? 'bg-green-500'
                                                                    : 'bg-red-500'
                                                                : isSelected
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-red-50 border-2 border-red-300'
                                                                }`}>
                                                                <svg className={`w-7 h-7 ${isSelected || showFeedback ? 'text-white' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <span className="text-xl font-bold text-gray-800">{val}</span>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                        }`}>
                                                        {isSelected && (
                                                            <div className="w-3 h-3 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {q.type === "Checkboxes" && (
                                            <>
                                                <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Select all that apply
                                                </p>
                                                {q.options.map((opt, oIdx) => {
                                                    const selected = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                                                    const isSelected = selected.includes(opt);
                                                    return (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => {
                                                                if (showFeedback) return;
                                                                let newSel = [...selected];
                                                                if (isSelected) {
                                                                    newSel = newSel.filter(v => v !== opt);
                                                                } else {
                                                                    newSel.push(opt);
                                                                }
                                                                handleAnswerSelect(newSel);
                                                            }}
                                                            disabled={showFeedback}
                                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${showFeedback && isSelected
                                                                ? 'bg-green-50 border-green-500'
                                                                : isSelected
                                                                    ? 'bg-blue-50 border-blue-500'
                                                                    : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                                                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${showFeedback && isSelected
                                                                ? 'bg-green-500 border-green-500'
                                                                : isSelected
                                                                    ? 'bg-blue-500 border-blue-500'
                                                                    : 'border-gray-400 bg-white'
                                                                }`}>
                                                                {isSelected && (
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="text-lg text-gray-800 flex-1">{opt}</span>
                                                        </button>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {q.type === "Fill-in-the-blank" && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Type your answer
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={selectedAnswer || ""}
                                                        onChange={(e) => handleAnswerSelect(e.target.value)}
                                                        disabled={showFeedback}
                                                        className={`w-full px-6 py-5 border-2 text-gray-800 text-lg focus:outline-none transition-all rounded-2xl ${showFeedback
                                                            ? isCorrect
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-red-500 bg-red-50'
                                                            : 'border-gray-300 focus:border-blue-500 bg-white'
                                                            } disabled:bg-gray-100`}
                                                        placeholder="Type your answer here..."
                                                    />
                                                    {selectedAnswer && !showFeedback && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {q.type === "Matching" && (
                                            <div className="space-y-3">
                                                <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                    </svg>
                                                    Match each item with its pair
                                                </p>
                                                {q.options.map((pair, idxPair) => (
                                                    <div key={idxPair} className="relative">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 text-base border-2 border-blue-200 rounded-xl font-semibold shadow-sm">
                                                                {pair.left}
                                                            </div>
                                                            <div className="flex items-center justify-center">
                                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <select
                                                                    value={(Array.isArray(selectedAnswer) && selectedAnswer.find(a => a.left === pair.left)?.right) || ""}
                                                                    onChange={(e) => {
                                                                        const current = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
                                                                        const updated = current.filter(p => p.left !== pair.left);
                                                                        if (e.target.value) updated.push({ left: pair.left, right: e.target.value });
                                                                        handleAnswerSelect(updated);
                                                                    }}
                                                                    disabled={showFeedback}
                                                                    className={`w-full px-5 py-4 border-2 text-gray-800 text-base rounded-xl focus:outline-none transition-all appearance-none cursor-pointer ${showFeedback
                                                                        ? 'bg-gray-100 border-gray-300'
                                                                        : (Array.isArray(selectedAnswer) && selectedAnswer.find(a => a.left === pair.left)?.right)
                                                                            ? 'bg-green-50 border-green-500'
                                                                            : 'bg-white border-gray-300 hover:border-blue-500'
                                                                        } disabled:cursor-not-allowed`}
                                                                    style={{
                                                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                                        backgroundRepeat: 'no-repeat',
                                                                        backgroundPosition: 'right 1rem center',
                                                                        backgroundSize: '1.5em 1.5em',
                                                                        paddingRight: '3rem'
                                                                    }}
                                                                >
                                                                    <option value="" className="text-gray-400">Select match...</option>
                                                                    {q.options.map((p, pIdx) => (
                                                                        <option key={pIdx} value={p.right}>{p.right}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {showFeedback && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            className={`${isCorrect ? 'bg-green-100' : 'bg-red-100'} border-t-2 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}
                        >
                            <div className="max-w-4xl mx-auto p-6 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {isCorrect ? (
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                            {isCorrect ? 'Correct' : 'Correct answer:'}
                                        </p>
                                        {!isCorrect && (
                                            <p className="text-lg text-red-700 mt-1">
                                                {q.type === "Checkboxes" && Array.isArray(q.correct_answer)
                                                    ? q.correct_answer.join(", ")
                                                    : q.type === "Matching" && Array.isArray(q.correct_answer)
                                                        ? q.correct_answer.map(p => `${p.left} = ${p.right}`).join("; ")
                                                        : String(q.correct_answer)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleContinue}
                                    className={`px-8 py-3 rounded-full font-bold text-white text-lg flex-shrink-0 ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        } transition-colors`}
                                >
                                    {currentQuestionIdx === currentQuiz.questions.length - 1 ? 'Finish' : 'Continue'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {!showFeedback && (
                        <div className="p-6 border-t bg-white">
                            <div className="max-w-4xl mx-auto flex justify-end">
                                <button
                                    onClick={handleCheck}
                                    disabled={!isAnswerSelected()}
                                    className={`px-8 py-4 rounded-full font-bold text-white text-lg transition-all ${!isAnswerSelected()
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    Check
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showResult && !reviewMode && (
                <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
                    <div className="w-full max-w-md text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="mb-8"
                        >
                            <div className="w-32 h-32 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </motion.div>

                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Quiz Complete</h2>
                        <p className="text-2xl text-gray-600 mb-12">
                            Your final score is {score}/{currentQuiz.questions.length} ({Math.round((score / currentQuiz.questions.length) * 100)}%)
                        </p>

                        <div className="space-y-3 mb-8">
                            <button
                                onClick={() => setReviewMode(true)}
                                className="w-full py-4 px-6 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-colors"
                            >
                                Review
                            </button>
                            <button
                                onClick={onStartAgain}
                                className="w-full py-4 px-6 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-colors"
                            >
                                Restart
                            </button>
                        </div>

                        <div className="pt-8 border-t">
                            <button
                                onClick={onDone}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Quit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showResult && reviewMode && (
  <div className="min-h-screen bg-white overflow-y-auto">
    {/* Sticky Header */}
    <div className="sticky top-0 bg-white border-b z-10 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <button onClick={() => setReviewMode(false)} className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">Answers Review</h2>
        <button onClick={handleClose} className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div className="max-w-3xl mx-auto p-6 pb-20 space-y-6">
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600">
          Score: <span className="font-bold text-gray-800">{score}/{currentQuiz.questions.length}</span>
        </p>
      </div>

      {currentQuiz.questions.map((cq, idx) => {
        const user = userAnswers[idx] || {};
        const isCorrect = !!user.isCorrect;

        return (
          <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className={`p-4 ${isCorrect ? 'bg-green-50' : 'bg-white'}`}>
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm font-semibold">{idx + 1}.</span>
                    <span className="text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                      {cq.type}
                    </span>
                  </div>
                  <p className="text-gray-800 font-semibold text-base mt-1">{cq.text}</p>
                </div>
                {isCorrect ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">Correct</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">Incorrect</span>
                )}
              </div>

              {/* ANSWERS */}
              <div className="pl-9 space-y-2 text-sm">
                {/* True/False */}
                {cq.type === "True/False" && (
                  <div>
                    <p>
                      Your answer:{' '}
                      <span className={`font-semibold ${user.answer === cq.correct_answer ? 'text-green-600' : 'text-red-600'}`}>
                        {String(user.answer)}
                      </span>
                    </p>
                    <p>
                      Correct answer:{' '}
                      <span className="font-semibold text-green-600">{String(cq.correct_answer)}</span>
                    </p>
                  </div>
                )}

                {/* Multiple Choice */}
                {cq.type === "Multiple Choice" && cq.options?.map((opt, i) => {
                  const isUserChoice = user.answer === opt;
                  const isCorrectChoice = cq.correct_answer === opt;
                  if (!isUserChoice && !isCorrectChoice) return null;
                  return (
                    <div key={i} className={`px-3 py-2 rounded-md border ${isCorrectChoice ? 'border-green-400 bg-green-50 text-green-700' : isUserChoice ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200'}`}>
                      {opt}
                    </div>
                  );
                })}

                {/* Checkbox / Checkboxes */}
                {(cq.type === "Checkbox" || cq.type === "Checkboxes") && (
                  <div className="space-y-1">
                    <p className="font-semibold">Your answer:</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(user.answer) ? user.answer : []).map((opt, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-red-50 border border-red-400 text-red-700">{opt}</span>
                      ))}
                      {(!user.answer || user.answer.length === 0) && <span className="text-gray-400">—</span>}
                    </div>
                    <p className="font-semibold mt-1">Correct answer:</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(cq.correct_answer) ? cq.correct_answer : []).map((opt, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-green-50 border border-green-400 text-green-700">{opt}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill-in / Fill-in-the-blank */}
                {(cq.type === "Fill-in" || cq.type === "Fill-in-the-blank") && (
                  <div>
                    <p>
                      Your answer:{' '}
                      <span className={`font-semibold ${user.answer?.toLowerCase() === cq.correct_answer?.toLowerCase() ? 'text-green-600' : 'text-red-600'}`}>
                        {user.answer || '—'}
                      </span>
                    </p>
                    <p>
                      Correct answer:{' '}
                      <span className="font-semibold text-green-600">{cq.correct_answer}</span>
                    </p>
                  </div>
                )}

                {/* Matching */}
                {cq.type === "Matching" && (
                  <div className="space-y-2">
                    {user.answer && (
                      <div className={`p-3 rounded-xl border ${isCorrect ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                        <p className="font-semibold text-gray-700 mb-1">Your answer:</p>
                        {Array.isArray(user.answer) && user.answer.map((pair, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>{pair.left}</span>
                            <span>= {pair.right}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 rounded-xl border border-green-500 bg-green-50">
                      <p className="font-semibold text-gray-700 mb-1">Correct answer:</p>
                      {Array.isArray(cq.correct_answer) && cq.correct_answer.map((pair, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span>{pair.left}</span>
                          <span>= {pair.right}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

        </div>
    );
}