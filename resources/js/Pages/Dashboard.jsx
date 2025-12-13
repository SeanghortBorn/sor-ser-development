import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Head } from '@inertiajs/react';
import { BookOpen, HelpCircle, Users, TrendingUp, FileText, UserCircle, CheckCircle, Percent, Activity } from 'lucide-react';

export default function Dashboard({ auth, stats, recentActivity, isAdmin }) {
    const headWeb = 'Dashboard';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title="Dashboard" />

            <section className="content">
                <div className="container-fluid mb-12">
                    {isAdmin ? (
                        // ═══════════════════════════════════════════════════════════════
                        // ADMIN VIEW
                        // ═══════════════════════════════════════════════════════════════
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                                {/* Homophones Card */}
                                <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-blue-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">Homophones</p>
                                        <div className="text-blue-500">
                                            <BookOpen className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stats.homophones?.count || 0}</h2>
                                        <p className="text-xs text-green-600 mt-1">{stats.homophones?.change || '+0%'}</p>
                                    </div>
                                </div>

                                {/* Quizzes Card */}
                                <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-purple-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">Quizzes</p>
                                        <div className="text-purple-500">
                                            <HelpCircle className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stats.quizzes?.count || 0}</h2>
                                        <p className="text-xs text-green-600 mt-1">{stats.quizzes?.change || '+0%'}</p>
                                    </div>
                                </div>

                                {/* Students Card */}
                                <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-green-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">Students</p>
                                        <div className="text-green-500">
                                            <Users className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stats.students?.count || 0}</h2>
                                        <p className="text-xs text-green-600 mt-1">{stats.students?.change || '+0%'}</p>
                                    </div>
                                </div>

                                {/* Sessions Card */}
                                <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-yellow-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">Sessions</p>
                                        <div className="text-yellow-500">
                                            <TrendingUp className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stats.sessions?.count || 0}</h2>
                                        <p className="text-xs text-green-600 mt-1">{stats.sessions?.change || '+0%'}</p>
                                    </div>
                                </div>

                                {/* Articles Card */}
                                {stats.articles && (
                                    <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-indigo-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-800 text-base font-semibold">Articles</p>
                                            <div className="text-indigo-500">
                                                <FileText className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{stats.articles?.count || 0}</h2>
                                            <p className="text-xs text-green-600 mt-1">{stats.articles?.change || '+0%'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Users Card */}
                                {stats.users && (
                                    <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-pink-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-800 text-base font-semibold">Total Users</p>
                                            <div className="text-pink-500">
                                                <UserCircle className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{stats.users?.count || 0}</h2>
                                            <p className="text-xs text-green-600 mt-1">{stats.users?.change || '+0%'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                                <div className="px-6 py-4 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Recent Activity
                                    </h3>
                                </div>
                                <div className="p-6">
                                    {recentActivity && recentActivity.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentActivity.map((activity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all duration-200 px-2 rounded-xl"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="w-5 h-5 text-blue-600" />
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
                                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        // ═══════════════════════════════════════════════════════════════
                        // STUDENT VIEW
                        // ═══════════════════════════════════════════════════════════════
                        <>
                            {/* Student Stats */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                                {/* Articles Completed */}
                                <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-green-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">Articles Completed</p>
                                        <div className="text-green-500">
                                            <CheckCircle className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stats.articles_completed || 0}</h2>
                                        <p className="text-xs text-gray-500 mt-1">Completed articles</p>
                                    </div>
                                </div>

                                {/* Total Articles */}
                                <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-blue-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">Total Articles</p>
                                        <div className="text-blue-500">
                                            <BookOpen className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stats.total_articles || 0}</h2>
                                        <p className="text-xs text-gray-500 mt-1">Available articles</p>
                                    </div>
                                </div>

                                {/* Completion Rate */}
                                <div className="bg-white px-3 pb-2 pt-3 border-l-4 border-purple-100 shadow-sm rounded-2xl flex flex-col hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-800 text-base font-semibold">Completion Rate</p>
                                        <div className="text-purple-500">
                                            <Percent className="w-7 h-7" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stats.completion_rate || 0}%</h2>
                                        <p className="text-xs text-gray-500 mt-1">Overall progress</p>
                                    </div>
                                </div>
                            </div>

                            {/* My Recent Activity */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                                <div className="px-6 py-4 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        My Recent Activity
                                    </h3>
                                </div>
                                <div className="p-6">
                                    {recentActivity && recentActivity.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentActivity.map((activity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all duration-200 px-2 rounded-2xl"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="w-5 h-5 text-blue-600" />
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
                                        <p className="text-gray-500 text-center py-8">No recent activity. Start learning now!</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </AdminLayout>
    );
}