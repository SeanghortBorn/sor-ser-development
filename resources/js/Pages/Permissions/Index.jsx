import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, pages, roles, actions }) {
    const [selectedPage, setSelectedPage] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedAction, setSelectedAction] = useState('view');
    
    const { post, delete: destroy, processing } = useForm();

    const handleGrantPermission = () => {
        if (!selectedPage || !selectedRole || !selectedAction) {
            alert('Please select page, role, and action');
            return;
        }

        post(route('permissions.grant-role'), {
            page_name: selectedPage.page_name,
            role_id: selectedRole,
            action: selectedAction,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Permission granted successfully');
            }
        });
    };

    const handleRevokePermission = (override) => {
        if (!confirm('Are you sure you want to revoke this permission?')) {
            return;
        }

        destroy(route('permissions.revoke-role'), {
            data: {
                page_name: override.page_permission.page_name,
                role_id: override.role_id,
                action: override.permission_type,
            },
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header="Permission Management" links={[{ title: "Home", url: "/" }, { title: "Permissions", url: "" }]} />}>
            <Head title="Permissions" />

            <div className="p-6">
                    {/* Grant Permission Section */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Grant Permission</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Page</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        onChange={(e) => {
                                            const page = pages.find(p => p.id === parseInt(e.target.value));
                                            setSelectedPage(page);
                                        }}
                                    >
                                        <option value="">Select Page</option>
                                        {pages.map(page => (
                                            <option key={page.id} value={page.id}>
                                                {page.page_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Role</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Action</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={selectedAction}
                                        onChange={(e) => setSelectedAction(e.target.value)}
                                    >
                                        {actions.map(action => (
                                            <option key={action} value={action}>
                                                {action}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleGrantPermission}
                                        disabled={processing}
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Grant Permission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Permissions Section */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Current Permissions</h3>
                            
                            {pages.map(page => (
                                <div key={page.id} className="mb-6 border-b pb-4">
                                    <h4 className="font-semibold text-md mb-2">{page.page_name}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{page.description}</p>
                                    
                                    {page.overrides && page.overrides.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 text-left">Role</th>
                                                    <th className="px-4 py-2 text-left">Action</th>
                                                    <th className="px-4 py-2 text-left">Granted By</th>
                                                    <th className="px-4 py-2 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {page.overrides.map(override => (
                                                    <tr key={override.id} className="border-t">
                                                        <td className="px-4 py-2">
                                                            {override.role ? override.role.name : 'Specific User'}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                override.permission_type === 'block' ? 'bg-red-100 text-red-800' :
                                                                override.permission_type === 'view' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {override.permission_type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {override.granted_by ? override.granted_by.name : 'System'}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <button
                                                                onClick={() => handleRevokePermission(override)}
                                                                className="text-red-600  text-sm"
                                                            >
                                                                Revoke
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No custom permissions set</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
            </div>
        </AdminLayout>
    );
}