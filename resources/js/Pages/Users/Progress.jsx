import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function UserProgress({ 
    auth, 
    user, 
    articlesAttempted, 
    accuracyTrends, 
    correctionPatterns,
    typingActivity,
    audioBehavior,
    learningMetrics 
}) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${user.name} - Progress Dashboard`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header with Back Button */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                User Progress Dashboard
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Comprehensive learning analytics for {user.name}
                            </p>
                        </div>
                        <Link
                            href={route('users.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                        >
                            ← Back to Users
                        </Link>
                    </div>

                    {/* User Profile Summary */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">User Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-semibold">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-semibold">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                        user.status === 'Active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Roles</p>
                                    <p className="font-semibold">
                                        {user.roles.length > 0 ? user.roles.join(', ') : 'No roles'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Registered</p>
                                    <p className="font-semibold">{user.created_at}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Checks</p>
                                    <p className="font-semibold">{user.total_checks}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-sm text-gray-600">Overall Accuracy</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {learningMetrics.overall_accuracy}%
                            </p>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-sm text-gray-600">Progress Trend</p>
                            <p className={`text-2xl font-bold ${
                                learningMetrics.progress_trend === 'Improving' ? 'text-green-600' :
                                learningMetrics.progress_trend === 'Declining' ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                                {learningMetrics.progress_trend}
                            </p>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-sm text-gray-600">Total Attempts</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {learningMetrics.total_attempts}
                            </p>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-sm text-gray-600">Improvement Rate</p>
                            <p className={`text-2xl font-bold ${
                                learningMetrics.improvement_rate > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {learningMetrics.improvement_rate > 0 ? '+' : ''}
                                {learningMetrics.improvement_rate}%
                            </p>
                        </div>
                    </div>

                    {/* Strengths and Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-3 text-green-700">Strengths</h3>
                                {learningMetrics.strengths.length > 0 ? (
                                    <ul className="space-y-2">
                                        {learningMetrics.strengths.map((strength, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">Not enough data yet</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-3 text-red-700">Areas for Improvement</h3>
                                {learningMetrics.weaknesses.length > 0 ? (
                                    <ul className="space-y-2">
                                        {learningMetrics.weaknesses.map((weakness, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                {weakness}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">Excellent performance across all areas!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Daily Accuracy Trends Chart */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Daily Accuracy Trends (Last 30 Days)</h3>
                            {accuracyTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={accuracyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="accuracy" 
                                            stroke="#3B82F6" 
                                            strokeWidth={2}
                                            name="Accuracy (%)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No accuracy data available for the last 30 days</p>
                            )}
                        </div>
                    </div>

                    {/* Correction Patterns Chart */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Correction Patterns (Accept vs Reject)</h3>
                            {correctionPatterns.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={correctionPatterns}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="accepted" fill="#10B981" name="Accepted" />
                                        <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No correction data available</p>
                            )}
                        </div>
                    </div>

                    {/* Typing Activity Chart */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Typing Activity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600">Total Characters Typed</p>
                                    <p className="text-2xl font-bold">{typingActivity.total_characters.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600">Average Per Session</p>
                                    <p className="text-2xl font-bold">{typingActivity.average_per_session}</p>
                                </div>
                            </div>
                            {typingActivity.daily.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={typingActivity.daily}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="characters" 
                                            stroke="#8B5CF6" 
                                            strokeWidth={2}
                                            name="Characters Typed"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No typing data available</p>
                            )}
                        </div>
                    </div>

                    {/* Audio Listening Behavior */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Audio Listening Behavior</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600">Total Plays</p>
                                    <p className="text-2xl font-bold">{audioBehavior.total_plays}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600">Rewinds</p>
                                    <p className="text-2xl font-bold">{audioBehavior.total_rewinds}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600">Fast Forwards</p>
                                    <p className="text-2xl font-bold">{audioBehavior.total_forwards}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600">Avg Position</p>
                                    <p className="text-2xl font-bold">{audioBehavior.avg_playback_position}s</p>
                                </div>
                            </div>
                            {audioBehavior.daily.length > 0 && (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={audioBehavior.daily}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="plays" fill="#F59E0B" name="Audio Plays" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Articles Attempted Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Articles Attempted</h3>
                            {articlesAttempted.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Article Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Attempts
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Best Accuracy
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Avg Accuracy
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Latest Attempt
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {articlesAttempted.map((article) => (
                                                <tr key={article.article_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {article.title}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {article.attempts}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                                            article.best_accuracy >= 80 ? 'bg-green-100 text-green-800' :
                                                            article.best_accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {article.best_accuracy}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {article.average_accuracy}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {article.latest_attempt}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No articles attempted yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}