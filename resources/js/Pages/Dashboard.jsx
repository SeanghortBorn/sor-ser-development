import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, stats, recentActivity, isAdmin }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {isAdmin ? (
                        // ═══════════════════════════════════════════════════════════════
                        // ADMIN VIEW
                        // ═══════════════════════════════════════════════════════════════
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                                {/* Homophones Card */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Homophones
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.homophones?.count || 0}
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">
                                                {stats.homophones?.change || '+0%'}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-book text-blue-600 text-xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Quizzes Card */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Quizzes
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.quizzes?.count || 0}
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">
                                                {stats.quizzes?.change || '+0%'}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-question-circle text-purple-600 text-xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Students Card */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Students
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.students?.count || 0}
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">
                                                {stats.students?.change || '+0%'}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-users text-green-600 text-xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Sessions Card */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Sessions
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.sessions?.count || 0}
                                            </p>
                                            <p className="text-sm text-green-600 mt-1">
                                                {stats.sessions?.change || '+0%'}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-chart-line text-yellow-600 text-xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Articles Card */}
                                {stats.articles && (
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    Articles
                                                </p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                                    {stats.articles?.count || 0}
                                                </p>
                                                <p className="text-sm text-green-600 mt-1">
                                                    {stats.articles?.change || '+0%'}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-newspaper text-indigo-600 text-xl"></i>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Users Card */}
                                {stats.users && (
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    Total Users
                                                </p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                                    {stats.users?.count || 0}
                                                </p>
                                                <p className="text-sm text-green-600 mt-1">
                                                    {stats.users?.change || '+0%'}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-user-circle text-pink-600 text-xl"></i>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Recent Activity
                                </h3>
                                {recentActivity && recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentActivity.map((activity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <i className="fas fa-check text-blue-600"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {activity.user?.name || 'Unknown User'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Completed: {activity.article?.title || 'Article'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(activity.completed_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No recent activity</p>
                                )}
                            </div>
                        </>
                    ) : (
                        // ═══════════════════════════════════════════════════════════════
                        // STUDENT VIEW
                        // ═══════════════════════════════════════════════════════════════
                        <>
                            {/* Student Stats */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                                {/* Articles Completed */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Articles Completed
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.articles_completed || 0}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-check-circle text-green-600 text-xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Articles */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Total Articles
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.total_articles || 0}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-book text-blue-600 text-xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Completion Rate */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Completion Rate
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.completion_rate || 0}%
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-percentage text-purple-600 text-xl"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* My Recent Activity */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    My Recent Activity
                                </h3>
                                {recentActivity && recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentActivity.map((activity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <i className="fas fa-check text-blue-600"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {activity.article?.title || 'Article'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Completed
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(activity.completed_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No recent activity. Start learning now!</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}