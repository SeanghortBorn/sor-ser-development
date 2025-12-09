import { create } from 'zustand';

/**
 * Quiz Store
 *
 * Manages quiz state, answers, and progress.
 */
const useQuizStore = create((set, get) => ({
    // State
    quiz: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
    isSubmitting: false,
    isComplete: false,
    startTime: null,
    endTime: null,

    // Actions
    initializeQuiz: (quiz, questions) => set({
        quiz,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        isSubmitting: false,
        isComplete: false,
        startTime: Date.now(),
        endTime: null,
    }),

    setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),

    nextQuestion: () => set((state) => {
        const { currentQuestionIndex, questions } = state;
        if (currentQuestionIndex < questions.length - 1) {
            return { currentQuestionIndex: currentQuestionIndex + 1 };
        }
        return state;
    }),

    previousQuestion: () => set((state) => {
        const { currentQuestionIndex } = state;
        if (currentQuestionIndex > 0) {
            return { currentQuestionIndex: currentQuestionIndex - 1 };
        }
        return state;
    }),

    setAnswer: (questionId, answer) => set((state) => ({
        answers: {
            ...state.answers,
            [questionId]: answer,
        },
    })),

    clearAnswer: (questionId) => set((state) => {
        const newAnswers = { ...state.answers };
        delete newAnswers[questionId];
        return { answers: newAnswers };
    }),

    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

    completeQuiz: (score) => set({
        score,
        isComplete: true,
        isSubmitting: false,
        endTime: Date.now(),
    }),

    resetQuiz: () => set({
        quiz: null,
        questions: [],
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        isSubmitting: false,
        isComplete: false,
        startTime: null,
        endTime: null,
    }),

    /**
     * Get current question
     */
    getCurrentQuestion: () => {
        const { questions, currentQuestionIndex } = get();
        return questions[currentQuestionIndex];
    },

    /**
     * Get answer for a specific question
     */
    getAnswer: (questionId) => {
        const { answers } = get();
        return answers[questionId];
    },

    /**
     * Check if question is answered
     */
    isQuestionAnswered: (questionId) => {
        const { answers } = get();
        return answers[questionId] !== undefined;
    },

    /**
     * Get number of answered questions
     */
    getAnsweredCount: () => {
        const { answers } = get();
        return Object.keys(answers).length;
    },

    /**
     * Get progress percentage
     */
    getProgress: () => {
        const { questions, answers } = get();
        if (questions.length === 0) return 0;

        return Math.round((Object.keys(answers).length / questions.length) * 100);
    },

    /**
     * Check if all questions are answered
     */
    areAllQuestionsAnswered: () => {
        const { questions, answers } = get();
        return questions.length > 0 && Object.keys(answers).length === questions.length;
    },

    /**
     * Get time spent in seconds
     */
    getTimeSpent: () => {
        const { startTime, endTime } = get();
        if (!startTime) return 0;

        const end = endTime || Date.now();
        return Math.floor((end - startTime) / 1000);
    },

    /**
     * Get quiz summary
     */
    getSummary: () => {
        const { quiz, questions, answers, score, isComplete } = get();

        return {
            quiz_id: quiz?.id,
            quiz_title: quiz?.title,
            total_questions: questions.length,
            answered_questions: Object.keys(answers).length,
            score: score,
            percentage: questions.length > 0 ? Math.round((score / questions.length) * 100) : 0,
            is_complete: isComplete,
            time_spent: get().getTimeSpent(),
            answers: answers,
        };
    },

    /**
     * Check if can submit quiz
     */
    canSubmit: () => {
        const { areAllQuestionsAnswered, isSubmitting, isComplete } = get();
        return areAllQuestionsAnswered() && !isSubmitting && !isComplete;
    },
}));

export default useQuizStore;
