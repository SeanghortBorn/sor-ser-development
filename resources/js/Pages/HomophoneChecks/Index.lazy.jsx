import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import ErrorBoundary from '@/Components/ErrorBoundary';
import { ComponentLoader } from '@/Components/LoadingFallback';
import { lazyLoad } from '@/utils/lazyLoad';
import { useHomophoneStore, useNotificationStore } from '@/stores';
import homophoneApi from '@/services/homophoneApi';

/**
 * HomophoneChecks Index (Lazy Loading Example)
 *
 * This is an example of how to implement the HomophoneChecks page
 * with lazy loading for better performance.
 */

// Lazy load components for better code splitting
const ArticleSelectionSidebar = lazyLoad(
    () => import('@/Components/HomophoneChecks/ArticleSelectionSidebar'),
    { fallback: <ComponentLoader type="list" minHeight="400px" /> }
);

const EditorSection = lazyLoad(
    () => import('@/Components/HomophoneChecks/EditorSection'),
    { fallback: <ComponentLoader type="text" minHeight="500px" /> }
);

const ComparisonSection = lazyLoad(
    () => import('@/Components/HomophoneChecks/ComparisonSection'),
    { fallback: <ComponentLoader type="spinner" minHeight="300px" /> }
);

const StatisticsPanel = lazyLoad(
    () => import('@/Components/HomophoneChecks/StatisticsPanel'),
    { fallback: <ComponentLoader type="card" minHeight="300px" /> }
);

export default function Index({ articles: initialArticles = [], userRole }) {
    const { auth } = usePage().props;
    const userId = auth?.user?.id;

    // Zustand stores
    const {
        articleId,
        userText,
        comparisonResults,
        metrics,
        setUserText,
        initializeSession,
        setComparisonResults,
        calculateAccuracy,
        resetSession,
    } = useHomophoneStore();

    const { success, error: showError } = useNotificationStore();

    // Local state
    const [articles] = useState(initialArticles);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [title, setTitle] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);

    // Initialize session when article is selected
    useEffect(() => {
        if (selectedArticle) {
            initializeSession(selectedArticle.id, selectedArticle.content);
            setTitle(selectedArticle.title);
        } else {
            resetSession();
            setTitle('');
        }
    }, [selectedArticle]);

    // Handle article selection
    const handleSelectArticle = (article) => {
        if (userText && !confirm('Switching articles will lose unsaved work. Continue?')) {
            return;
        }
        setSelectedArticle(article);
    };

    // Handle text change
    const handleTextChange = (text) => {
        setUserText(text);
    };

    // Handle save
    const handleSave = async (text) => {
        if (!selectedArticle) return;

        setIsSaving(true);
        try {
            await homophoneApi.updateChecker(selectedArticle.id, {
                paragraph: text,
                docTitle: title,
            });
            setLastSavedAt(new Date());
            success('Progress saved automatically');
        } catch (err) {
            showError('Failed to save progress');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle check text
    const handleCheckText = async () => {
        if (!selectedArticle || !userText) return;

        setIsChecking(true);
        try {
            const result = await homophoneApi.checkText({
                originalText: selectedArticle.content,
                userText: userText,
                articleId: selectedArticle.id,
                userId: userId,
                sessionId: Date.now().toString(),
            });

            setComparisonResults(result);
            calculateAccuracy();
            success('Text comparison complete!');
        } catch (err) {
            showError('Failed to check text. Please try again.');
            console.error('Check text error:', err);
        } finally {
            setIsChecking(false);
        }
    };

    // Handle accept comparison
    const handleAccept = async () => {
        try {
            await homophoneApi.acceptComparison({
                userId,
                articleId: selectedArticle.id,
                sessionId: Date.now().toString(),
                accuracy: metrics.accuracy,
                metadata: metrics,
            });

            success('Result accepted! Moving to next article...');
            setComparisonResults(null);

            // Find next article
            const currentIndex = articles.findIndex(a => a.id === selectedArticle.id);
            if (currentIndex < articles.length - 1) {
                setSelectedArticle(articles[currentIndex + 1]);
            }
        } catch (err) {
            showError('Failed to save result');
        }
    };

    // Handle dismiss comparison
    const handleDismiss = () => {
        setComparisonResults(null);
    };

    return (
        <>
            <Head title="Homophone Check" />

            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Wrapped in error boundary */}
                <ErrorBoundary
                    fallback={
                        <div className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
                            <p className="text-sm text-gray-600">Failed to load sidebar</p>
                        </div>
                    }
                >
                    <div className="w-80 flex-shrink-0">
                        <ArticleSelectionSidebar
                            articles={articles}
                            selectedArticle={selectedArticle}
                            onSelectArticle={handleSelectArticle}
                            completedArticleIds={[]}
                            lockedArticleIds={[]}
                        />
                    </div>
                </ErrorBoundary>

                {/* Main Editor - Wrapped in error boundary */}
                <ErrorBoundary
                    fallback={
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900 mb-2">
                                    Editor Error
                                </p>
                                <p className="text-sm text-gray-600">
                                    Failed to load editor. Please refresh the page.
                                </p>
                            </div>
                        </div>
                    }
                >
                    <div className="flex-1 flex flex-col">
                        <EditorSection
                            article={selectedArticle}
                            title={title}
                            userText={userText}
                            onTitleChange={setTitle}
                            onTextChange={handleTextChange}
                            onSave={handleSave}
                            isSaving={isSaving}
                            lastSavedAt={lastSavedAt}
                            isZoomed={isZoomed}
                            onToggleZoom={() => setIsZoomed(!isZoomed)}
                            onCheckText={handleCheckText}
                            isChecking={isChecking}
                            canCheck={!!userText && !isChecking}
                            showProgress={true}
                            progress={metrics}
                            autoSave={true}
                        />
                    </div>
                </ErrorBoundary>

                {/* Statistics Panel - Wrapped in error boundary */}
                <ErrorBoundary
                    fallback={
                        <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center">
                            <p className="text-sm text-gray-600">Stats unavailable</p>
                        </div>
                    }
                >
                    <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                        <StatisticsPanel
                            currentAccuracy={metrics.accuracy}
                            bestAccuracy={metrics.accuracy}
                            totalWords={metrics.totalWords}
                            correctWords={metrics.correctWords}
                            incorrectWords={metrics.incorrectWords}
                            timeSpent={metrics.timeSpent}
                            minRequired={70}
                            showTarget={true}
                        />
                    </div>
                </ErrorBoundary>
            </div>

            {/* Comparison Modal - Wrapped in error boundary */}
            {comparisonResults && (
                <ErrorBoundary
                    fallback={
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md">
                                <p className="text-lg font-semibold text-gray-900 mb-2">
                                    Comparison Error
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Failed to display comparison results.
                                </p>
                                <button
                                    onClick={handleDismiss}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    }
                >
                    <ComparisonSection
                        comparisonData={comparisonResults}
                        onAccept={handleAccept}
                        onDismiss={handleDismiss}
                        onClose={handleDismiss}
                        isProcessing={false}
                    />
                </ErrorBoundary>
            )}
        </>
    );
}
