import { create } from 'zustand';

/**
 * Homophone Store
 *
 * Manages homophone checking session state, metrics, and comparisons.
 */
const useHomophoneStore = create((set, get) => ({
    // State
    articleId: null,
    userText: '',
    originalText: '',
    comparisonResults: null,
    metrics: {
        totalWords: 0,
        correctWords: 0,
        incorrectWords: 0,
        accuracy: 0,
        timeSpent: 0,
        startTime: null,
    },
    isChecking: false,
    hasChanges: false,
    autoSaveEnabled: true,

    // Actions
    initializeSession: (articleId, originalText) => set({
        articleId,
        originalText,
        userText: '',
        comparisonResults: null,
        metrics: {
            totalWords: 0,
            correctWords: 0,
            incorrectWords: 0,
            accuracy: 0,
            timeSpent: 0,
            startTime: Date.now(),
        },
        hasChanges: false,
    }),

    setUserText: (text) => set({ userText: text, hasChanges: true }),

    setComparisonResults: (results) => set({
        comparisonResults: results,
        isChecking: false,
    }),

    setIsChecking: (isChecking) => set({ isChecking }),

    updateMetrics: (metrics) => set((state) => ({
        metrics: { ...state.metrics, ...metrics },
    })),

    calculateAccuracy: () => {
        const { metrics } = get();
        const { totalWords, correctWords } = metrics;

        if (totalWords === 0) return 0;

        const accuracy = (correctWords / totalWords) * 100;
        set((state) => ({
            metrics: { ...state.metrics, accuracy: Math.round(accuracy * 100) / 100 },
        }));

        return accuracy;
    },

    calculateTimeSpent: () => {
        const { metrics } = get();
        if (!metrics.startTime) return 0;

        const timeSpent = Math.floor((Date.now() - metrics.startTime) / 1000);
        set((state) => ({
            metrics: { ...state.metrics, timeSpent },
        }));

        return timeSpent;
    },

    markAsSaved: () => set({ hasChanges: false }),

    toggleAutoSave: () => set((state) => ({
        autoSaveEnabled: !state.autoSaveEnabled,
    })),

    resetSession: () => set({
        articleId: null,
        userText: '',
        originalText: '',
        comparisonResults: null,
        metrics: {
            totalWords: 0,
            correctWords: 0,
            incorrectWords: 0,
            accuracy: 0,
            timeSpent: 0,
            startTime: null,
        },
        isChecking: false,
        hasChanges: false,
    }),

    /**
     * Get session summary for saving
     */
    getSessionSummary: () => {
        const { articleId, userText, metrics, comparisonResults } = get();

        return {
            article_id: articleId,
            user_text: userText,
            accuracy: metrics.accuracy,
            total_words: metrics.totalWords,
            correct_words: metrics.correctWords,
            incorrect_words: metrics.incorrectWords,
            time_spent: metrics.timeSpent,
            comparison_results: comparisonResults,
        };
    },

    /**
     * Get progress percentage (0-100)
     */
    getProgress: () => {
        const { userText, originalText } = get();
        if (!originalText) return 0;

        const progress = (userText.length / originalText.length) * 100;
        return Math.min(progress, 100);
    },

    /**
     * Check if session is complete
     */
    isComplete: () => {
        const { comparisonResults, metrics } = get();
        return comparisonResults !== null && metrics.accuracy > 0;
    },

    /**
     * Get completion status
     */
    getCompletionStatus: () => {
        const { metrics } = get();

        if (metrics.accuracy >= 90) return 'excellent';
        if (metrics.accuracy >= 80) return 'good';
        if (metrics.accuracy >= 70) return 'fair';
        return 'needs-improvement';
    },
}));

export default useHomophoneStore;
