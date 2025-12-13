import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { LAYOUT_CONSTANTS } from "@/constants/layout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import TwoFactorAuthenticationForm from "./Partials/TwoFactorAuthenticationForm";
import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import Footer from "@/Components/Footer/Footer";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from '@/Components/Breadcrumb';

export default function Edit({ mustVerifyEmail, status, user }) {
    const { auth } = usePage().props;

    const isAdmin =
        auth.user &&
        (
            (Array.isArray(auth.user.roles) && auth.user.roles.length > 0) ||
            (Array.isArray(auth.user.roles_list) && auth.user.roles_list.length > 0)
        );
    
    const headWeb = 'Profile'
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];


    return (
        <>
            {isAdmin ? (
                <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
                    <Head title="Profile" />

                    <div className="mb-12">
                        <div className="mx-auto max-w-7xl">
                            <div className="bg-white border border-gray-200 rounded-xl p-8">
                                {/* Personal Information card */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </div>
                                {/* Other cards */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                                    <UpdatePasswordForm />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                                    <TwoFactorAuthenticationForm />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <DeleteUserForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </AdminLayout>
            ) : (
                <>
                    <HeaderNavbar />
                    <Head title="Profile" />

                    <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                            {/* Page Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Profile</h1>
                                <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
                            </div>

                            {/* Profile Cards Grid */}
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div className={`bg-white border border-gray-200 ${LAYOUT_CONSTANTS.ROUNDED.LARGE} p-6 md:p-8 shadow-sm hover:shadow-sm transition-shadow`}>
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                                    </div>
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </div>

                                {/* Security - Password */}
                                <div className={`bg-white border border-gray-200 ${LAYOUT_CONSTANTS.ROUNDED.LARGE} p-6 md:p-8 shadow-sm hover:shadow-sm transition-shadow`}>
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                                    </div>
                                    <UpdatePasswordForm />
                                </div>

                                {/* Two-Factor Authentication */}
                                <div className={`bg-white border border-gray-200 ${LAYOUT_CONSTANTS.ROUNDED.LARGE} p-6 md:p-8 shadow-sm hover:shadow-sm transition-shadow`}>
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                                    </div>
                                    <TwoFactorAuthenticationForm />
                                </div>

                                {/* Danger Zone */}
                                <div className={`bg-red-50 border border-red-200 ${LAYOUT_CONSTANTS.ROUNDED.LARGE} p-6 md:p-8 shadow-sm`}>
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 4v2M6 9v2m0 4v2m0 4v2m12 0v2m0-4v2m0-4v2m0-4v2" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
                                    </div>
                                    <DeleteUserForm />
                                </div>
                            </div>
                        </div>
                    </main>

                    <Footer />
                </>
            )}
        </>
    );
}
