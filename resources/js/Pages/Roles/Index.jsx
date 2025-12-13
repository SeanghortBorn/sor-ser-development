import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { Search, Pencil, Trash2, Plus, Eye, X } from "lucide-react";

export default function RolePage({ roles, search: searchProp = "" }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [viewingRole, setViewingRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchProp || "");
    const { delete: destroy, processing, reset } = useForm();

    // Helper function to group permissions by module
    const groupPermissionsByModule = (permissions) => {
        return permissions.reduce((acc, perm) => {
            const module = perm.name.split("-")[0];
            if (!acc[module]) acc[module] = [];
            acc[module].push(perm);
            return acc;
        }, {});
    };

    // Helper function to format permission names
    const formatPermissionName = (name) => {
        return name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    useEffect(() => {
        setSearchTerm(searchProp || "");
    }, [searchProp]);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        router.get(
            route("roles.index"),
            { search: term },
            { preserveState: true, replace: true }
        );
    };

    const clearSearch = () => {
        setSearchTerm("");
        router.get(route("roles.index"), {}, { preserveState: true });
    };

    const confirmDelete = (role) => {
        setRoleToDelete(role);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setRoleToDelete(null);
        reset();
    };

    const openViewRole = (role) => {
        setViewingRole(role);
    };

    const closeViewRole = () => {
        setViewingRole(null);
    };

    const deleteRole = (e) => {
        e.preventDefault();
        if (!roleToDelete) return;

        destroy(route("roles.destroy", roleToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                // Force refresh the page to show updated list
                router.reload({ only: ['roles'] });
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
            onFinish: () => reset(),
        });
    };

    const headWeb = "Role List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-center gap-3">
                            <h3 className="text-xl sm:text-lg font-semibold text-gray-800">
                                Role Management
                            </h3>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* Search Box */}
                                <div className="relative flex-1 sm:flex-none">
                                    <div className="inline-flex items-center gap-2 px-3 rounded-xl border border-gray-300 hover:shadow-sm transition text-sm bg-white w-full sm:w-auto">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search roles..."
                                            className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full focus:outline-none focus:ring-0"
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={clearSearch}
                                                className="text-gray-400  transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {can["role-create"] && (
                                    <Link
                                        href={route("roles.create")}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Role
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Responsive Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <tr>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">
                                            #ID
                                        </th>
                                        <th className="py-4 px-6 font-semibold whitespace-nowrap">
                                            Name
                                        </th>
                                        <th className="py-4 px-6 font-semibold text-right whitespace-nowrap">
                                            Created At
                                        </th>
                                        {(can["role-edit"] ||
                                            can["role-delete"]) && (
                                            <th className="py-4 px-6 font-semibold text-center whitespace-nowrap">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 bg-white divide-y divide-gray-200">
                                    {roles.data.length > 0 ? (
                                        roles.data.map((role) => (
                                            <tr
                                                key={role.id}
                                                className="hover:bg-blue-50 transition-all duration-200"
                                            >
                                                <td className="py-4 px-6 font-medium text-gray-900">
                                                    {role.id}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        {role.name}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 text-right">
                                                    {role.created_at
                                                        ? moment(
                                                              role.created_at
                                                          ).format("DD/MM/YYYY")
                                                        : "N/A"}
                                                </td>

                                                {(can["role-edit"] ||
                                                    can["role-delete"]) && (
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <div className="group relative">
                                                                <button
                                                                    onClick={() =>
                                                                        openViewRole(
                                                                            role
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                                    View
                                                                </span>
                                                            </div>

                                                            {can[
                                                                "role-edit"
                                                            ] && (
                                                                <div className="group relative">
                                                                    <Link
                                                                        href={route(
                                                                            "roles.edit",
                                                                            role.id
                                                                        )}
                                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                    </Link>
                                                                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                                        Edit
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {can[
                                                                "role-delete"
                                                            ] && (
                                                                <div className="group relative">
                                                                    <button
                                                                        onClick={() =>
                                                                            confirmDelete(
                                                                                role
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                                        Delete
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={
                                                    can["role-edit"] ||
                                                    can["role-delete"]
                                                        ? 4
                                                        : 3
                                                }
                                                className="py-10 text-center text-gray-500 text-sm"
                                            >
                                                {searchTerm
                                                    ? "No roles found matching your search"
                                                    : "No roles found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {roles.total > roles.per_page && (
                            <div className="px-6 py-3 border-t flex justify-center">
                                <Pagination links={roles.links} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* View Role Modal */}
            <Modal show={!!viewingRole} onClose={closeViewRole} maxWidth="2xl">
                {viewingRole && (
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                            Role Details
                        </h2>
                        <div className="mb-2">
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-4">
                                {/* Role Name */}
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-700">
                                        Role Name:
                                    </span>
                                    <span className="text-gray-800">
                                        {viewingRole.name}
                                    </span>
                                </div>

                                {/* Created At */}
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-700">
                                        Created At:
                                    </span>
                                    <span className="text-gray-800">
                                        {moment(viewingRole.created_at).format(
                                            "DD/MM/YYYY HH:mm"
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="font-semibold text-gray-700 block mb-3">
                                    Permissions:
                                </span>
                                <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-xl p-3">
                                    {Array.isArray(viewingRole.permissions) &&
                                    viewingRole.permissions.length > 0 ? (
                                        Object.entries(
                                            groupPermissionsByModule(
                                                viewingRole.permissions
                                            )
                                        ).map(([module, perms]) => (
                                            <div
                                                key={module}
                                                className="mb-3 last:mb-0"
                                            >
                                                <div className="font-semibold text-gray-800 text-sm mb-2">
                                                    {formatPermissionName(
                                                        module
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {perms.map((perm, idx) => (
                                                        <span
                                                            key={perm.id || idx}
                                                            className="inline-block bg-blue-100 text-blue-700 rounded-xl px-2.5 py-1 text-xs font-medium"
                                                        >
                                                            {formatPermissionName(
                                                                perm.name
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm">
                                            No permissions assigned
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeViewRole}
                                className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmingDeletion} onClose={closeModal} maxWidth="xl">
                <form onSubmit={deleteRole} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-full">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Delete Role
                        </h2>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-900">
                            "{roleToDelete?.name}"
                        </span>
                        ? This action cannot be undone.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-1 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                        >
                            {processing ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </form>
            </Modal>
            </div>
        </AdminLayout>
    );
}