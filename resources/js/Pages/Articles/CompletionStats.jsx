import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Head, Link } from '@inertiajs/react';

export default function CompletionStats({ auth, article, stats, completed_users, not_completed_users }) {
    const breadcrumbLinks = [
        { title: 'Home', url: '/' },
        { title: 'Articles', url: route('articles.index') },
        { title: 'Completion Stats', url: '' }
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={`${article.title} - Stats`} links={breadcrumbLinks} />}>
            <Head title={`Completion Stats - ${article.title}`} />

            <div className="p-6">
                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6">
                            <div className="text-sm font-medium text-gray-500">Total Users</div>
                            <div className="mt-2 text-3xl font-bold text-gray-900">
                                {stats.total_users}
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6">
                            <div className="text-sm font-medium text-gray-500">Completed</div>
                            <div className="mt-2 text-3xl font-bold text-green-600">
                                {stats.completed_count}
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6">
                            <div className="text-sm font-medium text-gray-500">Not Completed</div>
                            <div className="mt-2 text-3xl font-bold text-orange-600">
                                {stats.not_completed_count}
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6">
                            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
                            <div className="mt-2 text-3xl font-bold text-blue-600">
                                {stats.completion_rate}%
                            </div>
                        </div>
                    </div>

                    {/* Completed Users Table */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Completed Users ({stats.completed_count})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            {completed_users.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Accuracy
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Best Accuracy
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Typing Speed
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Completed At
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {completed_users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {user.accuracy ? `${user.accuracy}%` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-green-600">
                                                        {user.best_accuracy ? `${user.best_accuracy}%` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {user.typing_speed ? `${user.typing_speed} WPM` : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {user.completed_at}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    No users have completed this article yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Not Completed Users Table */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Not Completed Users ({stats.not_completed_count})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            {not_completed_users.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Member Since
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {not_completed_users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {user.member_since}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    All users have completed this article!
                                </div>
                            )}
                        </div>
                    </div>
            </div>
        </AdminLayout>
    );
}
