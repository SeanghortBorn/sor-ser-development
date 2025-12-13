import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Settings, Save } from 'lucide-react';
import { LAYOUT_CONSTANTS } from '@/constants/layout';

export default function SystemSettings({ roles, settings }) {
    const { auth } = usePage().props;
    const [selectedRoleId, setSelectedRoleId] = useState(settings.default_role_id || '');
    const [saving, setSaving] = useState(false);
    const title = 'System Settings';
    const breadcrumbLinks = [{ title: 'Home', url: '/' }, { title: title, url: '' }];

    const handleSave = (e) => {
        e.preventDefault();
        setSaving(true);

        router.post(route('settings.update'), {
            default_role_id: selectedRoleId,
        }, {
            onSuccess: () => {
                setSaving(false);
            },
            onError: () => {
                setSaving(false);
            },
        });
    };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={title} links={breadcrumbLinks} />}>
            <Head title={title} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Content */}
                        <form onSubmit={handleSave} className="p-6">
                            <div className="space-y-6">
                                {/* Title */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        User Registration Settings
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Configure default role for new user signups
                                    </p>
                                </div>

                                {/* Default Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Default Role for New Users
                                    </label>
                                    <select
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select a role...</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-2 text-sm text-gray-500">
                                        When users register on the platform, they will automatically be assigned this role.
                                    </p>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                                        📌 Important Notes:
                                    </h4>
                                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                        <li>The first user to register will always become an Admin</li>
                                        <li>This setting only affects subsequent user registrations</li>
                                        <li>Admins can manually change user roles later</li>
                                        <li>Create roles at /roles/create before setting default</li>
                                    </ul>
                                </div>

                                {/* Current Roles List */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        Available Roles ({roles.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className={`px-3 py-2 rounded-xl border ${
                                                    role.id == selectedRoleId
                                                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                                                        : 'bg-gray-50 border-gray-200 text-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.id == selectedRoleId && (
                                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving || !selectedRoleId}
                                    className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-yellow-900 mb-2">
                            💡 How to Create New Roles
                        </h4>
                        <p className="text-sm text-yellow-800">
                            Go to <a href={route('roles.create')} className="underline font-medium">Roles → Create Role</a> to create custom roles with specific permissions. Then return here to set which role new users should receive.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}