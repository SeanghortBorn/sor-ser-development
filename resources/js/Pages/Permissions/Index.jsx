import React, { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Head, useForm } from '@inertiajs/react';
import { Shield, Users, User, Check, X, ChevronRight, Search } from 'lucide-react';

export default function Index({ auth, permissions, roles, users }) {
    const [selectedTarget, setSelectedTarget] = useState(null); // { type: 'role'|'user', id, name }
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    
    const { post, processing } = useForm();

    // Group permissions by page/component
    const groupedPermissions = useMemo(() => {
        const groups = {};
        permissions.forEach(permission => {
            const parts = permission.name.split('-');
            const page = parts[0];
            const action = parts.slice(1).join('-');
            
            if (!groups[page]) {
                groups[page] = {
                    name: page,
                    permissions: []
                };
            }
            groups[page].permissions.push({
                ...permission,
                action: action
            });
        });
        return Object.values(groups);
    }, [permissions]);

    // Filter permissions based on search and category
    const filteredGroups = useMemo(() => {
        return groupedPermissions.filter(group => {
            const matchesSearch = searchTerm === '' || 
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.permissions.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
            if (filterCategory === 'all') return matchesSearch;
            
            return matchesSearch && group.permissions.some(p => 
                p.action.includes(filterCategory)
            );
        });
    }, [groupedPermissions, searchTerm, filterCategory]);

    // Get current permissions for selected target
    const currentPermissions = useMemo(() => {
        if (!selectedTarget) return [];
        
        if (selectedTarget.type === 'role') {
            const role = roles.find(r => r.id === selectedTarget.id);
            return role?.permissions || [];
        } else {
            const user = users.find(u => u.id === selectedTarget.id);
            return user?.permissions || [];
        }
    }, [selectedTarget, roles, users]);

    const hasPermission = (permissionId) => {
        return currentPermissions.some(p => p.id === permissionId);
    };

    const togglePermission = (permission) => {
        if (!selectedTarget) {
            alert('Please select a role or user first');
            return;
        }

        const has = hasPermission(permission.id);
        const routeName = selectedTarget.type === 'role' 
            ? (has ? 'permissions.revoke-role' : 'permissions.grant-role')
            : (has ? 'permissions.revoke-user' : 'permissions.grant-user');

        const data = selectedTarget.type === 'role'
            ? { permission_id: permission.id, role_id: selectedTarget.id }
            : { permission_id: permission.id, user_id: selectedTarget.id };

        post(route(routeName), data, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const getActionColor = (action) => {
        if (action.includes('view') || action.includes('list')) return 'blue';
        if (action.includes('create')) return 'green';
        if (action.includes('edit') || action.includes('update')) return 'yellow';
        if (action.includes('delete')) return 'red';
        if (action.includes('manage')) return 'purple';
        return 'gray';
    };

    const getActionIcon = (action) => {
        if (action.includes('view') || action.includes('list')) return '👁️';
        if (action.includes('create')) return '➕';
        if (action.includes('edit') || action.includes('update')) return '✏️';
        if (action.includes('delete')) return '🗑️';
        if (action.includes('manage')) return '⚙️';
        return '🔒';
    };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header="Permission Management" links={[{ title: "Home", url: "/" }, { title: "Permissions", url: "" }]} />}>
            <Head title="Permissions" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-4 border-l-4 border-blue-500 shadow-sm rounded-2xl transition-all duration-200 hover:shadow-md hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-700 text-sm font-medium mb-1">Total Permissions</p>
                                    <h2 className="text-3xl font-bold text-blue-900">{permissions.length}</h2>
                                </div>
                                <div className="text-blue-500 bg-white p-3 rounded-2xl shadow-sm">
                                    <Shield className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-4 border-l-4 border-green-500 shadow-sm rounded-2xl transition-all duration-200 hover:shadow-md hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-700 text-sm font-medium mb-1">Roles</p>
                                    <h2 className="text-3xl font-bold text-green-900">{roles.length}</h2>
                                </div>
                                <div className="text-green-500 bg-white p-3 rounded-2xl shadow-sm">
                                    <Users className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-4 border-l-4 border-purple-500 shadow-sm rounded-2xl transition-all duration-200 hover:shadow-md hover:scale-105">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-700 text-sm font-medium mb-1">Users</p>
                                    <h2 className="text-3xl font-bold text-purple-900">{users.length}</h2>
                                </div>
                                <div className="text-purple-500 bg-white p-3 rounded-2xl shadow-sm">
                                    <User className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Step 1: Select Role or User */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span className="bg-white text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                        Select Target
                                    </h3>
                                    <p className="text-blue-100 text-sm mt-1">Choose a role or user</p>
                                </div>

                                <div className="p-4">
                                    {/* Roles Section */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Roles
                                        </h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {roles.map(role => (
                                                <button
                                                    key={role.id}
                                                    onClick={() => setSelectedTarget({ type: 'role', id: role.id, name: role.name })}
                                                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 ${
                                                        selectedTarget?.type === 'role' && selectedTarget?.id === role.id
                                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{role.name}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {role.permissions?.length || 0} permissions
                                                            </p>
                                                        </div>
                                                        <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${
                                                            selectedTarget?.type === 'role' && selectedTarget?.id === role.id 
                                                                ? 'text-blue-600 rotate-90' 
                                                                : 'text-gray-400'
                                                        }`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Users Section */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Users
                                        </h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {users.slice(0, 10).map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => setSelectedTarget({ type: 'user', id: user.id, name: user.name })}
                                                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 ${
                                                        selectedTarget?.type === 'user' && selectedTarget?.id === user.id
                                                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-sm'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.name}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                                                        </div>
                                                        <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${
                                                            selectedTarget?.type === 'user' && selectedTarget?.id === user.id 
                                                                ? 'text-purple-600 rotate-90' 
                                                                : 'text-gray-400'
                                                        }`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Select Pages & Actions */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                                <div className={`bg-gradient-to-r px-5 py-4 ${
                                    selectedTarget 
                                        ? 'from-green-500 to-emerald-600' 
                                        : 'from-gray-400 to-gray-500'
                                }`}>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span className="bg-white text-green-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                        Manage Permissions
                                    </h3>
                                    {selectedTarget ? (
                                        <p className="text-green-100 text-sm mt-1">
                                            Managing permissions for: <span className="font-semibold">{selectedTarget.name}</span>
                                        </p>
                                    ) : (
                                        <p className="text-gray-100 text-sm mt-1">Select a role or user to manage permissions</p>
                                    )}
                                </div>

                                <div className="p-5">
                                    {selectedTarget ? (
                                        <>
                                            {/* Search and Filter */}
                                            <div className="mb-5 flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1 relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search pages or permissions..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    />
                                                </div>
                                                <select
                                                    value={filterCategory}
                                                    onChange={(e) => setFilterCategory(e.target.value)}
                                                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                >
                                                    <option value="all">All Actions</option>
                                                    <option value="view">View/List</option>
                                                    <option value="create">Create</option>
                                                    <option value="edit">Edit</option>
                                                    <option value="delete">Delete</option>
                                                    <option value="manage">Manage</option>
                                                </select>
                                            </div>

                                            {/* Permissions Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                                                {filteredGroups.map(group => (
                                                    <div 
                                                        key={group.name}
                                                        className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:border-blue-200 bg-gradient-to-br from-white to-gray-50"
                                                    >
                                                        <h4 className="font-semibold text-base text-gray-900 mb-3 capitalize flex items-center gap-2">
                                                            <span className="text-xl">{getActionIcon(group.name)}</span>
                                                            {group.name.replace(/-/g, ' ')}
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {group.permissions.map(permission => {
                                                                const isActive = hasPermission(permission.id);
                                                                const color = getActionColor(permission.action);
                                                                const colorClasses = {
                                                                    blue: isActive ? 'bg-blue-500 border-blue-600' : 'bg-gray-200 border-gray-300',
                                                                    green: isActive ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300',
                                                                    yellow: isActive ? 'bg-yellow-500 border-yellow-600' : 'bg-gray-200 border-gray-300',
                                                                    red: isActive ? 'bg-red-500 border-red-600' : 'bg-gray-200 border-gray-300',
                                                                    purple: isActive ? 'bg-purple-500 border-purple-600' : 'bg-gray-200 border-gray-300',
                                                                    gray: isActive ? 'bg-gray-500 border-gray-600' : 'bg-gray-200 border-gray-300',
                                                                };

                                                                return (
                                                                    <button
                                                                        key={permission.id}
                                                                        onClick={() => togglePermission(permission)}
                                                                        disabled={processing}
                                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 ${
                                                                            isActive 
                                                                                ? `${colorClasses[color]} text-white shadow-sm` 
                                                                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                                                                        }`}
                                                                    >
                                                                        <span className="text-sm font-medium capitalize">
                                                                            {permission.action.replace(/-/g, ' ')}
                                                                        </span>
                                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                                                                            isActive ? 'bg-white bg-opacity-30' : 'bg-transparent'
                                                                        }`}>
                                                                            {isActive ? (
                                                                                <Check className="w-4 h-4" />
                                                                            ) : (
                                                                                <X className="w-4 h-4 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                            <Shield className="w-20 h-20 mb-4 opacity-20" />
                                            <p className="text-lg font-medium">Select a role or user to begin</p>
                                            <p className="text-sm mt-2">Choose from the list on the left to manage permissions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
        </AdminLayout>
    );
}
