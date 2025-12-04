import React from 'react';
import { router } from '@inertiajs/react';

export default function PermissionButton({ pageName, currentPermissions, canManage }) {
    if (!canManage) {
        return null;
    }

    return (
        <div className="inline-flex items-center gap-2">
            <button
                onClick={() => router.visit(route('permissions.index'), {
                    data: { page: pageName },
                    preserveScroll: true
                })}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Manage Permissions
            </button>
        </div>
    );
}