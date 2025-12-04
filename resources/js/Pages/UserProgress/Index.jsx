import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, users, canViewAll }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                {canViewAll ? 'User Progress' : 'My Progress'}
            </h2>}
        >
            <Head title="User Progress" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">User</th>
                                        <th className="text-left py-2">Email</th>
                                        <th className="text-center py-2">Completed Articles</th>
                                        <th className="text-center py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data && users.data.map(user => (
                                        <tr key={user.id} className="border-b">
                                            <td className="py-3">{user.name}</td>
                                            <td className="py-3">{user.email}</td>
                                            <td className="text-center py-3">{user.article_completions_count}</td>
                                            <td className="text-center py-3">
                                                <Link
                                                    href={route('user-progress.show', user.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!canViewAll && (
                                <div className="mt-4 text-sm text-gray-500">
                                    You are viewing your own progress only.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}