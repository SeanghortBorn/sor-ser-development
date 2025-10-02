import React from "react";
import { Head, usePage } from "@inertiajs/react";
import Breadcrumb from '@/Components/Breadcrumb';
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import TwoFactorAuthenticationForm from "./Partials/TwoFactorAuthenticationForm";
import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import AdminLayout from "@/Layouts/AdminLayout";

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
                            <div className="bg-white border border-gray-200 rounded-2xl p-8">
                                {/* Personal Information card */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </div>
                                {/* Other cards */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                                    <UpdatePasswordForm />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                                    <TwoFactorAuthenticationForm />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6">
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

                    <div className="py-12">
                        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="bg-white border border-gray-200 rounded-2xl px-8 py-4">
                                <p className="text-lg font-semibold">Profile</p>
                                {/* Personal Information card */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </div>
                                {/* Other cards */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                                    <UpdatePasswordForm />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                                    <TwoFactorAuthenticationForm />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                                    <DeleteUserForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
