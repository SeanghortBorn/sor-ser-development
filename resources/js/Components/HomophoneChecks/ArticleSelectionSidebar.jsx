import React, { memo, useState } from 'react';
import ArticleCard from './ArticleCard';
import { Search, Filter, BookOpen, Lock, CheckCircle } from 'lucide-react';

/**
 * ArticleSelectionSidebar Component
 *
 * Sidebar for browsing and selecting articles with filtering.
 */
const ArticleSelectionSidebar = memo(({
    articles = [],
    selectedArticle = null,
    onSelectArticle,
    loading = false,
    completedArticleIds = [],
    lockedArticleIds = [],
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, incomplete

    // Filter articles based on search and status
    const filteredArticles = articles.filter(article => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.category?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const isCompleted = completedArticleIds.includes(article.id);
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'completed' && isCompleted) ||
            (filterStatus === 'incomplete' && !isCompleted);

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: articles.length,
        completed: completedArticleIds.length,
        incomplete: articles.length - completedArticleIds.length,
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="text-blue-600" size={24} />
                    <h2 className="text-lg font-bold text-gray-900">
                        Articles
                    </h2>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-900">{stats.total}</div>
                        <div className="text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold text-green-700">{stats.completed}</div>
                        <div className="text-green-600">Done</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-bold text-blue-700">{stats.incomplete}</div>
                        <div className="text-blue-600">Todo</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Filter */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                            filterStatus === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                            filterStatus === 'completed'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <CheckCircle size={12} />
                        Done
                    </button>
                    <button
                        onClick={() => setFilterStatus('incomplete')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                            filterStatus === 'incomplete'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Lock size={12} />
                        Todo
                    </button>
                </div>
            </div>

            {/* Article List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="mt-2 text-sm text-gray-600">Loading articles...</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-sm text-gray-600">
                            {searchQuery || filterStatus !== 'all'
                                ? 'No articles match your filters'
                                : 'No articles available'
                            }
                        </p>
                        {(searchQuery || filterStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterStatus('all');
                                }}
                                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    filteredArticles.map(article => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            isSelected={selectedArticle?.id === article.id}
                            isCompleted={completedArticleIds.includes(article.id)}
                            isLocked={lockedArticleIds.includes(article.id)}
                            onClick={onSelectArticle}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="text-xs text-gray-600 text-center">
                    Showing {filteredArticles.length} of {articles.length} articles
                </div>
            </div>
        </div>
    );
});

ArticleSelectionSidebar.displayName = 'ArticleSelectionSidebar';

export default ArticleSelectionSidebar;
