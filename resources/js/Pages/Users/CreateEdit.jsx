import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function UsersCreateEdit({ user, roles }) {
    // Provide default user object if not passed
    user = user || { id: null, name: '', email: '', roles: [], created_at: null };
    const { data, setData, post, patch, errors, reset, processing, recentlySuccessful } =
        useForm({
            name: user.name ?? '',
            email: user.email ?? '',
            roles: Array.isArray(user.roles) && user.roles.length > 0
                ? user.roles.map(role => role.id)
                : [],
            password: '', // Always a string
        });

    const [DropUpOpen, setDropUpOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!DropUpOpen) return;
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropUpOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [DropUpOpen]);

    const selectedRole = useMemo(
        () => roles.find(r => r.id === data.roles[0]),
        [roles, data.roles]
    );
    const handleSelect = (roleId) => {
        setData("roles", roleId ? [roleId] : []);
        setDropUpOpen(false);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!user.id) {
            post(route('users.store'), {
                preserveState: true,
                onFinish: () => reset(),
            });
        } else {
            patch(route('users.update', user.id), {
                preserveState: true,
                onFinish: () => reset(),
            });
        }
    };

    const headWeb = user.id ? 'User Edit' : 'User Create';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];
    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 mb-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">{headWeb}</h1>
                            <p className="text-gray-500">
                                {user ? "Update user details" : "Create a new user for your system"}
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter user name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className={`block mt-2 w-full px-3 py-[11px] text-sm rounded-xl border ${
                                        errors.name
                                            ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                            : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                    } placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2`}
                                />
                                <InputError message={errors.name} className="mt-1 text-sm text-red-600" />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className={`block mt-2 w-full px-3 py-[11px] text-sm rounded-xl border ${
                                        errors.email
                                            ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                            : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                    } placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2`}
                                />
                                <InputError message={errors.email} className="mt-1 text-sm text-red-600" />
                            </div>

                            {/* Password Field (Create Only) */}
                            {!user.id && (
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password 
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Enter password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className={`block mt-2 w-full px-3 py-[11px] text-sm rounded-xl border ${
                                            errors.password
                                                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                        } placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2`}
                                    />
                                    <InputError message={errors.password} className="mt-1 text-sm text-red-600" />
                                </div>
                            )}

                            {/* Roles Field */}
                            <div>
                                <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-1">
                                    Roles
                                </label>
                                <div className="relative w-1/3" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        className={`w-full px-3 py-2 text-sm rounded-xl border bg-white shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 ${
                                            errors.roles
                                                ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                                : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                        }`}
                                        onClick={() => setDropUpOpen(!DropUpOpen)}
                                    >
                                        {selectedRole ? selectedRole.name : "Select a Role (optional)"}
                                        <svg
                                            className={`w-4 h-4 ml-2 transition-transform ${
                                                DropUpOpen ? "rotate-180" : "rotate-0"
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {DropUpOpen && (
                                        <div className="absolute right-0 bottom-full mb-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                <button
                                                    type="button"
                                                    className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm rounded-xl transition ${
                                                        !data.roles[0]
                                                            ? "bg-blue-100 text-blue-700 font-bold"
                                                            : "hover:bg-gray-100 text-gray-700"
                                                    }`}
                                                    onClick={() => handleSelect(null)}
                                                >
                                                    Select a Roles (Optional)
                                                </button>
                                                {roles.map((role) => (
                                                    <button
                                                        key={role.id}
                                                        type="button"
                                                        className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm rounded-xl transition ${
                                                            data.roles[0] === role.id
                                                                ? "bg-blue-100 text-blue-700 font-bold"
                                                                : "hover:bg-gray-100 text-gray-700"
                                                        }`}
                                                        onClick={() => handleSelect(role.id)}
                                                    >
                                                        {role.name}
                                                    </button>   
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.roles} className="mt-1 text-sm text-red-600" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                                <Link
                                    href={route("users.index")}
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-gray-600 border-2 hover:bg-gray-50 hover:border-gray-300  transition duration-200"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-500 shadow-sm transition duration-200 hover:from-blue-500 hover:to-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {processing
                                        ? (user.id ? "Updating..." : "Saving...")
                                        : user.id ? "Update User" : "Save User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}