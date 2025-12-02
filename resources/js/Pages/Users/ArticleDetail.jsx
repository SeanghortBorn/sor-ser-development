import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import {
    ArrowLeft, Download, FileText, TrendingUp, TrendingDown,
    Minus, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

export default function ArticleDetail({
    auth,
    user,
    article,
    summaryMetrics,
    sessionTimeline,
    errorAnalysis,
    keystrokePatterns,
    audioBehavior,
    comparisonMetrics,
    temporalProgression
}) {
    // Format date helper
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get color based on accuracy
    const getAccuracyColor = (accuracy) => {
        if (accuracy >= 80) return 'text-green-600 bg-green-50';
        if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    // Get trend icon
    const getTrendIcon = (value) => {
        if (value > 5) return <TrendingUp className="w-5 h-5 text-green-600" />;
        if (value < -5) return <TrendingDown className="w-5 h-5 text-red-600" />;
        return <Minus className="w-5 h-5 text-gray-600" />;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('users.progress', user.id)}
                            className="inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Progress
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Article Detail Analytics
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {user.name} • {article.title}
                            </p>
                        </div>
                    </div>
                    
                    {/* Export buttons */}
                    <div className="flex space-x-2">
                        <a
                            href={route('users.articles.export', {
                                userId: user.id,
                                articleId: article.id,
                                format: 'csv'
                            })}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </a>
                        <a
                            href={route('users.articles.export', {
                                userId: user.id,
                                articleId: article.id,
                                format: 'json'
                            })}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export JSON
                        </a>
                        <a
                            href={route('users.articles.export', {
                                userId: user.id,
                                articleId: article.id,
                                format: 'xml'
                            })}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export XML
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Article Analysis: ${article.title}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Summary Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Total Attempts</span>
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                {summaryMetrics.total_attempts}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Learning Gain</span>
                                {getTrendIcon(summaryMetrics.learning_gain)}
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                {summaryMetrics.learning_gain >= 0 ? '+' : ''}
                                {summaryMetrics.learning_gain}%
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {summaryMetrics.first_attempt_accuracy}% → {summaryMetrics.last_attempt_accuracy}%
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Best Accuracy</span>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-3xl font-bold text-green-600">
                                {summaryMetrics.best_accuracy}%
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Avg Accuracy</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                {summaryMetrics.avg_accuracy}%
                            </div>
                        </div>
                    </div>

                    {/* Comparison Metrics (if available) */}
                    {comparisonMetrics.has_comparison && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                First vs Latest Attempt Comparison
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-sm font-medium text-gray-600 mb-2">Accuracy Improvement</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {comparisonMetrics.accuracy_comparison.improvement >= 0 ? '+' : ''}
                                        {comparisonMetrics.accuracy_comparison.improvement}%
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        From {comparisonMetrics.accuracy_comparison.first}% to {comparisonMetrics.accuracy_comparison.last}%
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-600 mb-2">Error Reduction</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        -{comparisonMetrics.error_comparison.reduction_percent}%
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        From {comparisonMetrics.error_comparison.first} to {comparisonMetrics.error_comparison.last} errors
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-600 mb-2">Effect Size (Cohen's d)</div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {comparisonMetrics.effect_size_cohens_d}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {comparisonMetrics.effect_size_cohens_d > 0.8 ? 'Large effect' :
                                         comparisonMetrics.effect_size_cohens_d > 0.5 ? 'Medium effect' : 'Small effect'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Learning Curve Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Curve: Accuracy Progression</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sessionTimeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="attempt_number" 
                                    label={{ value: 'Attempt Number', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis 
                                    label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
                                    domain={[0, 100]}
                                />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="accuracy_percent" 
                                    stroke="#3B82F6" 
                                    strokeWidth={3}
                                    name="Accuracy %"
                                    dot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            <strong>Interpretation:</strong> {summaryMetrics.learning_gain > 0 
                                ? `Positive learning trajectory with ${summaryMetrics.learning_gain}% improvement. This indicates successful skill acquisition.`
                                : 'Performance remains stable or declined. May need additional support or practice.'}
                        </div>
                    </div>

                    {/* Error Evolution Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Pattern Evolution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={errorAnalysis.error_evolution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="attempt" 
                                    label={{ value: 'Attempt Number', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis 
                                    label={{ value: 'Error Count', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="replaced" 
                                    stackId="1"
                                    stroke="#F59E0B" 
                                    fill="#F59E0B"
                                    name="Replaced Errors"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="extra" 
                                    stackId="1"
                                    stroke="#FBBF24" 
                                    fill="#FBBF24"
                                    name="Extra Errors"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="missing" 
                                    stackId="1"
                                    stroke="#EF4444" 
                                    fill="#EF4444"
                                    name="Missing Errors"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-700">Error Reduction</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {errorAnalysis.error_reduction.reduction_percent}%
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {errorAnalysis.error_reduction.first_attempt_errors} → {errorAnalysis.error_reduction.last_attempt_errors}
                                </div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-700">Repeated Errors</div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {errorAnalysis.repeated_error_analysis.repeated_error_rate_percent}%
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {errorAnalysis.repeated_error_analysis.errors_repeated} of {errorAnalysis.repeated_error_analysis.unique_errors} unique errors
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-700">Total Unique Errors</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {errorAnalysis.repeated_error_analysis.unique_errors}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Across all attempts
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typing Fluency Evolution */}
                    {keystrokePatterns.typing_evolution && keystrokePatterns.typing_evolution.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Typing Fluency Evolution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={keystrokePatterns.typing_evolution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="attempt" 
                                        label={{ value: 'Attempt Number', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis 
                                        label={{ value: 'Speed (WPM)', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="typing_speed_wpm" 
                                        stroke="#8B5CF6" 
                                        strokeWidth={2}
                                        name="Typing Speed (WPM)"
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 p-4 rounded">
                                    <div className="text-sm font-medium text-gray-700">Speed Improvement</div>
                                    <div className="text-xl font-bold text-purple-600">
                                        {keystrokePatterns.trends.typing_speed_improvement_percent >= 0 ? '+' : ''}
                                        {keystrokePatterns.trends.typing_speed_improvement_percent}%
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded">
                                    <div className="text-sm font-medium text-gray-700">Backspace Reduction</div>
                                    <div className="text-xl font-bold text-green-600">
                                        -{keystrokePatterns.trends.backspace_reduction_percent}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audio Dependency Trend */}
                    {audioBehavior.audio_evolution && audioBehavior.audio_evolution.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Listening Behavior</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={audioBehavior.audio_evolution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="attempt" 
                                        label={{ value: 'Attempt Number', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis 
                                        label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="plays" fill="#F59E0B" name="Audio Plays" />
                                    <Bar dataKey="rewinds" fill="#EF4444" name="Rewinds" />
                                    <Bar dataKey="forwards" fill="#10B981" name="Forwards" />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 bg-yellow-50 p-4 rounded">
                                <div className="text-sm font-medium text-gray-700 mb-1">Dependency Trend</div>
                                <div className="flex items-center space-x-2">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        audioBehavior.dependency_trend.trend === 'declining' 
                                            ? 'bg-green-100 text-green-700'
                                            : audioBehavior.dependency_trend.trend === 'increasing'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {audioBehavior.dependency_trend.trend.charAt(0).toUpperCase() + 
                                         audioBehavior.dependency_trend.trend.slice(1)}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        ({audioBehavior.dependency_trend.change_percent >= 0 ? '+' : ''}
                                        {audioBehavior.dependency_trend.change_percent}% from first to last)
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-2">
                                    {audioBehavior.dependency_trend.trend === 'declining' 
                                        ? 'âœ… Positive trend: User is becoming more independent from audio support'
                                        : audioBehavior.dependency_trend.trend === 'increasing'
                                        ? 'â ï¸ Increasing reliance on audio may indicate difficulty'
                                        : 'Stable audio usage across attempts'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Session Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Detailed Session History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Attempt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Accuracy
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Errors
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Typing Speed
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acceptance Rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sessionTimeline.map((session) => (
                                        <tr key={session.attempt_number} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{session.attempt_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(session.session_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccuracyColor(session.accuracy_percent)}`}>
                                                    {session.accuracy_percent}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {session.total_errors}
                                                <span className="text-xs text-gray-500 ml-1">
                                                    (R:{session.replaced_errors} E:{session.extra_errors} M:{session.missing_errors})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {session.typing_speed_wpm ? `${session.typing_speed_wpm} WPM` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {session.session_duration_minutes ? `${session.session_duration_minutes} min` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {session.acceptance_rate_percent ? `${session.acceptance_rate_percent}%` : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Thesis Analysis Notes */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-indigo-600" />
                            Key Insights for Thesis Analysis
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <strong>H2.1 (Learning Gains):</strong> {summaryMetrics.learning_gain > 15 
                                    ? `âœ… Substantial improvement of ${summaryMetrics.learning_gain}% exceeds typical learning curves`
                                    : `Moderate improvement observed. Consider intervention duration or support level.`}
                            </p>
                            <p>
                                <strong>H2.2 (Error Reduction):</strong> {errorAnalysis.repeated_error_analysis.repeated_error_rate_percent < 30 
                                    ? `âœ… Low repeated error rate (${errorAnalysis.repeated_error_analysis.repeated_error_rate_percent}%) indicates effective learning`
                                    : `â ï¸ High repeated error rate suggests need for targeted remediation`}
                            </p>
                            {comparisonMetrics.has_comparison && (
                                <p>
                                    <strong>Effect Size:</strong> Cohen's d = {comparisonMetrics.effect_size_cohens_d} 
                                    {comparisonMetrics.effect_size_cohens_d > 0.8 ? ' (Large effect - strong intervention impact)' :
                                     comparisonMetrics.effect_size_cohens_d > 0.5 ? ' (Medium effect)' : ' (Small effect)'}
                                </p>
                            )}
                            <p className="text-xs text-gray-600 italic mt-3">
                                💡 Export data above for statistical analysis in SPSS, R, or Python. Use temporal progression to analyze spaced repetition effects.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}