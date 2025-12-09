import { create } from 'zustand';

/**
 * Article Store
 *
 * Manages article state, selection, and filtering.
 */
const useArticleStore = create((set, get) => ({
    // State
    articles: [],
    selectedArticle: null,
    filters: {
        search: '',
        category: null,
        status: 'all', // all, completed, incomplete
    },
    loading: false,
    error: null,

    // Actions
    setArticles: (articles) => set({ articles, loading: false }),

    setSelectedArticle: (article) => set({ selectedArticle: article }),

    clearSelectedArticle: () => set({ selectedArticle: null }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error, loading: false }),

    clearError: () => set({ error: null }),

    /**
     * Update filters
     */
    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
    })),

    resetFilters: () => set({
        filters: {
            search: '',
            category: null,
            status: 'all',
        },
    }),

    /**
     * Get filtered articles
     */
    getFilteredArticles: () => {
        const { articles, filters } = get();

        return articles.filter(article => {
            // Search filter
            if (filters.search && !article.title.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Category filter
            if (filters.category && article.category_id !== filters.category) {
                return false;
            }

            // Status filter
            if (filters.status === 'completed' && !article.is_completed) {
                return false;
            }
            if (filters.status === 'incomplete' && article.is_completed) {
                return false;
            }

            return true;
        });
    },

    /**
     * Get article by ID
     */
    getArticleById: (id) => {
        const { articles } = get();
        return articles.find(article => article.id === id);
    },

    /**
     * Mark article as completed
     */
    markAsCompleted: (articleId) => set((state) => ({
        articles: state.articles.map(article =>
            article.id === articleId
                ? { ...article, is_completed: true }
                : article
        ),
    })),

    /**
     * Update article in list
     */
    updateArticle: (articleId, updates) => set((state) => ({
        articles: state.articles.map(article =>
            article.id === articleId
                ? { ...article, ...updates }
                : article
        ),
    })),

    /**
     * Add new article to list
     */
    addArticle: (article) => set((state) => ({
        articles: [...state.articles, article],
    })),

    /**
     * Remove article from list
     */
    removeArticle: (articleId) => set((state) => ({
        articles: state.articles.filter(article => article.id !== articleId),
    })),

    /**
     * Get next article to complete
     */
    getNextArticle: () => {
        const { articles } = get();
        return articles.find(article => !article.is_completed && article.can_access);
    },

    /**
     * Get completion statistics
     */
    getStats: () => {
        const { articles } = get();
        const total = articles.length;
        const completed = articles.filter(a => a.is_completed).length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        return {
            total,
            completed,
            remaining: total - completed,
            percentage: Math.round(percentage),
        };
    },
}));

export default useArticleStore;
