import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Settings, Save } from 'lucide-react';

export default function SystemSettings({ roles, settings }) {
    const { auth } = usePage().props;
    const [selectedRoleId, setSelectedRoleId] = useState(settings.default_role_id || '');
    const [saving, setSaving] = useState(false);

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
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    System Settings
                </h2>
            }
        >
            <Head title="System Settings" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <Settings className="w-6 h-6 text-blue-600" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        User Registration Settings
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Configure default role for new user signups
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSave} className="p-6">
                            <div className="space-y-6">
                                {/* Default Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Default Role for New Users
                                    </label>
                                    <select
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                                                className={`px-3 py-2 rounded-lg border ${
                                                    role.id == selectedRoleId
                                                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                                                        : 'bg-gray-50 border-gray-200 text-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.id == selectedRoleId && (
                                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
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
                                    className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-yellow-900 mb-2">
                            💡 How to Create New Roles
                        </h4>
                        <p className="text-sm text-yellow-800">
                            Go to <a href={route('roles.create')} className="underline font-medium">Roles → Create Role</a> to create custom roles with specific permissions. Then return here to set which role new users should receive.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}