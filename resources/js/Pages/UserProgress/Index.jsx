import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, users, canViewAll }) {
    const title = canViewAll ? 'User Progress' : 'My Progress';
    const breadcrumbLinks = [{ title: 'Home', url: '/' }, { title: title, url: '' }];
    
    return (
        <AdminLayout breadcrumb={<Breadcrumb header={title} links={breadcrumbLinks} />}>
            <Head title={title} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                                                    className="text-blue-600 "
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
        </AdminLayout>
    );
}