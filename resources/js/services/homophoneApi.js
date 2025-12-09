import axios from 'axios';

/**
 * Homophone API Service
 *
 * Centralized API calls for homophone checking functionality.
 * All HTTP requests should go through this service for consistency and easier maintenance.
 */

const homophoneApi = {
    /**
     * Get all articles
     */
    getArticles: async () => {
        const response = await axios.get('/api/articles');
        return response.data;
    },

    /**
     * Get specific article details
     */
    getArticle: async (articleId) => {
        const response = await axios.get(`/api/articles/${articleId}`);
        return response.data;
    },

    /**
     * Create new grammar checker session
     */
    createChecker: async (data) => {
        const response = await axios.post('/api/grammar-checkers', {
            article_id: data.articleId,
            session_id: data.sessionId,
            doc_title: data.docTitle,
            paragraph: data.paragraph || '',
            user_id: data.userId,
        });
        return response.data;
    },

    /**
     * Update grammar checker (auto-save)
     */
    updateChecker: async (checkerId, data) => {
        const response = await axios.put(`/api/grammar-checkers/${checkerId}`, {
            doc_title: data.docTitle,
            paragraph: data.paragraph,
        });
        return response.data;
    },

    /**
     * Check text for homophones and compare with original
     */
    checkText: async (data) => {
        const response = await axios.post('/api/homophone-checks', {
            original_text: data.originalText,
            user_text: data.userText,
            article_id: data.articleId,
            user_id: data.userId,
            session_id: data.sessionId,
        });
        return response.data;
    },

    /**
     * Accept comparison action
     */
    acceptComparison: async (data) => {
        const response = await axios.post('/api/track/comparison-action', {
            user_id: data.userId,
            article_id: data.articleId,
            session_id: data.sessionId,
            action: 'accept',
            accuracy: data.accuracy,
            metadata: data.metadata,
        });
        return response.data;
    },

    /**
     * Dismiss comparison action
     */
    dismissComparison: async (data) => {
        const response = await axios.post('/api/track/comparison-action', {
            user_id: data.userId,
            article_id: data.articleId,
            session_id: data.sessionId,
            action: 'dismiss',
            metadata: data.metadata,
        });
        return response.data;
    },

    /**
     * Save final homophone check result
     */
    saveHomophoneCheck: async (data) => {
        const response = await axios.post('/api/homophone-checks/save', {
            user_id: data.userId,
            article_id: data.articleId,
            session_id: data.sessionId,
            original_text: data.originalText,
            user_text: data.userText,
            accuracy: data.accuracy,
            total_words: data.totalWords,
            correct_words: data.correctWords,
            incorrect_words: data.incorrectWords,
            time_spent: data.timeSpent,
        });
        return response.data;
    },

    /**
     * Get homophone check history for user
     */
    getHistory: async (userId, articleId = null) => {
        const params = articleId ? { article_id: articleId } : {};
        const response = await axios.get(`/api/users/${userId}/homophone-history`, { params });
        return response.data;
    },

    /**
     * Get specific history item details
     */
    getHistoryDetail: async (historyId) => {
        const response = await axios.get(`/api/homophone-history/${historyId}`);
        return response.data;
    },

    /**
     * Track audio activity
     */
    trackAudio: async (data) => {
        const response = await axios.post('/api/track/audio-activity', {
            user_id: data.userId,
            article_id: data.articleId,
            checker_id: data.checkerId,
            session_id: data.sessionId,
            action: data.action, // play, pause, stop, seek
            timestamp: data.timestamp,
        });
        return response.data;
    },

    /**
     * Check library access permission
     */
    checkLibraryAccess: async (userId) => {
        const response = await axios.get(`/api/users/${userId}/can-access-library`);
        return response.data;
    },

    /**
     * Get user statistics
     */
    getUserStats: async (userId) => {
        const response = await axios.get(`/api/users/${userId}/homophone-stats`);
        return response.data;
    },

    /**
     * Export homophone results
     */
    exportResults: async (data) => {
        const response = await axios.post('/api/homophone-checks/export', {
            user_id: data.userId,
            article_id: data.articleId,
            format: data.format || 'pdf', // pdf, excel, json
        }, {
            responseType: 'blob', // For file download
        });
        return response.data;
    },
};

export default homophoneApi;
