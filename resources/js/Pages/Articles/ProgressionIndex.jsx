import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import {
    BookOpen,
    Lock,
    Unlock,
    Clock,
    CheckCircle,
    PlayCircle,
    AlertCircle,
    ChevronRight,
    Trophy,
    Target,
    BarChart2,
    Timer,
    Star,
} from 'lucide-react';

/**
 * Articles/ProgressionIndex.jsx
 * 
 * User-facing page showing article progression with:
 * - Progress overview
 * - Article list with availability status
 * - Time countdown for locked articles
 * - Next suggested article
 */

export default function ProgressionIndex({ articles, progress, nextUnlock, currentArticle }) {
    const { flash, auth } = usePage().props;
    const [countdown, setCountdown] = useState(null);

    // ═══════════════════════════════════════════════════════════════════
    // COUNTDOWN TIMER FOR NEXT UNLOCK
    // ═══════════════════════════════════════════════════════════════════
    
    useEffect(() => {
        if (!nextUnlock?.time_remaining?.total_seconds) return;

        const updateCountdown = () => {
            const target = new Date(nextUnlock.available_at);
            const now = new Date();
            const diff = target - now;

            if (diff <= 0) {
                setCountdown(null);
                // Refresh page to show newly available article
                window.location.reload();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [nextUnlock]);

    // ═══════════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═══════════════════════════════════════════════════════════════════

    const getArticleStatusIcon = (article) => {
        if (article.is_passed) {
            return <CheckCircle className="w-6 h-6 text-green-500" />;
        }
        if (article.is_completed) {
            return <CheckCircle className="w-6 h-6 text-blue-500" />;
        }
        if (article.is_available) {
            return <PlayCircle className="w-6 h-6 text-blue-600" />;
        }
        if (article.available_at) {
            return <Clock className="w-6 h-6 text-orange-500" />;
        }
        return <Lock className="w-6 h-6 text-gray-400" />;
    };

    const getArticleStatusText = (article) => {
        if (article.is_passed) return 'Passed';
        if (article.is_completed) return 'Completed';
        if (article.is_available) return 'Available';
        return article.availability_reason;
    };

    const getArticleCardClass = (article) => {
        if (article.is_passed) return 'border-green-200 bg-green-50';
        if (article.is_completed) return 'border-blue-200 bg-blue-50';
        if (article.is_available) return 'border-blue-300 bg-white hover:shadow-sm cursor-pointer';
        return 'border-gray-200 bg-gray-50 opacity-75';
    };

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════

    return (
        <AdminLayout breadcrumb={<Breadcrumb header="Article Settings" links={[{ title: "Home", url: "/" }, { title: "Article Settings", url: "" }]} />}>
            <Head title="Article Settings" />

            <div className="p-6">
                <div className="space-y-6">

                    {/* Flash Messages */}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            {flash.error}
                        </div>
                    )}

                    {/* Progress Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {/* Total Progress */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Target className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {progress.completion_percentage}%
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress.completion_percentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Completed */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {progress.completed_count} / {progress.total_articles}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <Timer className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {progress.in_progress_count}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Best Scores */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Trophy className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Passed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {progress.passed_count}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current/Next Article Highlight */}
                    {currentArticle && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                Continue Learning
                            </h3>
                            <Link
                                href={route('learn.articles.show', currentArticle.article.id)}
                                className="block bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold mb-1">{currentArticle.article.title}</h4>
                                        <p className="text-blue-100 text-sm">
                                            {currentArticle.setting?.description || 'Continue where you left off'}
                                        </p>
                                        {currentArticle.setting?.typing_mode === 'nlp_la' && (
                                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                                                <BarChart2 className="w-3 h-3" />
                                                Full Analytics Enabled
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Start Now</span>
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Next Unlock Countdown */}
                    {nextUnlock && countdown && (
                        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-6 h-6 text-orange-600" />
                                <h3 className="text-lg font-semibold text-orange-800">
                                    Next Article Unlocks In
                                </h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-3">
                                    {countdown.days > 0 && (
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-700">{countdown.days}</div>
                                            <div className="text-xs text-orange-600">days</div>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-700">{String(countdown.hours).padStart(2, '0')}</div>
                                        <div className="text-xs text-orange-600">hours</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-700">{String(countdown.minutes).padStart(2, '0')}</div>
                                        <div className="text-xs text-orange-600">min</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-700">{String(countdown.seconds).padStart(2, '0')}</div>
                                        <div className="text-xs text-orange-600">sec</div>
                                    </div>
                                </div>
                                <div className="ml-6 text-orange-700">
                                    <p className="font-medium">{nextUnlock.article.title}</p>
                                    <p className="text-sm">will be available soon</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Articles List */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">All Articles</h3>
                    </div>
                    
                    <div className="space-y-3">
                        {articles.map((item, index) => (
                            <div key={item.article.id}>
                                {item.is_available && !item.is_completed ? (
                                    <Link
                                        href={route('learn.articles.show', item.article.id)}
                                        className={`block rounded-xl border-2 p-5 transition-all ${getArticleCardClass(item)}`}
                                    >
                                        <ArticleCard item={item} index={index} getArticleStatusIcon={getArticleStatusIcon} getArticleStatusText={getArticleStatusText} />
                                    </Link>
                                ) : (
                                    <div className={`rounded-xl border-2 p-5 ${getArticleCardClass(item)}`}>
                                        <ArticleCard item={item} index={index} getArticleStatusIcon={getArticleStatusIcon} getArticleStatusText={getArticleStatusText} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTICLE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ArticleCard({ item, index, getArticleStatusIcon, getArticleStatusText }) {
    return (
        <div className="flex items-center gap-4">
            {/* Step Number */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                item.is_completed 
                    ? 'bg-green-200 text-green-700' 
                    : item.is_available 
                        ? 'bg-blue-200 text-blue-700'
                        : 'bg-gray-200 text-gray-500'
            }`}>
                {index + 1}
            </div>

            {/* Article Info */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className={`font-semibold truncate ${
                        item.is_available ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                        {item.article.title}
                    </h4>
                    {item.setting?.typing_mode === 'nlp_la' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs transition-all duration-200 ease-in-out hover:scale-105">
                            <BarChart2 className="w-3 h-3" />
                            Full
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                    {item.setting?.description || 'Transcription practice'}
                </p>
                {item.best_accuracy !== null && (
                    <p className="text-sm text-green-600 mt-1">
                        Best score: {item.best_accuracy}% ({item.attempt_count} attempts)
                    </p>
                )}
            </div>

            {/* Status */}
            <div className="flex-shrink-0 flex items-center gap-3">
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                        {getArticleStatusIcon(item)}
                        <span className={`text-sm font-medium ${
                            item.is_passed 
                                ? 'text-green-600' 
                                : item.is_completed
                                    ? 'text-blue-600'
                                    : item.is_available 
                                        ? 'text-blue-600'
                                        : 'text-gray-500'
                        }`}>
                            {getArticleStatusText(item)}
                        </span>
                    </div>
                    {item.available_at && !item.is_available && (
                        <p className="text-xs text-orange-600 mt-1">
                            {new Date(item.available_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
                {item.is_available && !item.is_completed && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
            </div>
        </div>
    );
}