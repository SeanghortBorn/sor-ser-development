import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import moment from "moment";
import React, { useState, useMemo } from "react";
import {
    Pencil,
    ShieldCheck,
    RotateCcw,
    Ban,
    UserPlus,
    CheckCircle,
} from "lucide-react";

// Import our new shared components and hooks
import SearchBar from "@/Components/Shared/SearchBar";
import StatsCard from "@/Components/Shared/StatsCard";
import ActionButton from "@/Components/Shared/ActionButton";
import ConfirmationModal from "@/Components/Shared/ConfirmationModal";
import { useSearch } from "@/Hooks/useSearch";
import { useConfirmationModal } from "@/Hooks/useDeleteModal";

export default function UserPage({
    users,
    permissions = [],
    search: searchProp = "",
    userStats = {},
    showTrashed = false,
}) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};

    // Use our custom hooks
    const { searchTerm, handleSearch } = useSearch("users.index", searchProp);

    // Permission modal state
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [permProcessing, setPermProcessing] = useState(false);

    // Reset password modal state
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);
    const [resetPassword, setResetPassword] = useState("");
    const [resetProcessing, setResetProcessing] = useState(false);
    const [resetError, setResetError] = useState("");

    // Block modal using our custom hook
    const blockModal = useConfirmationModal((user) => {
        const action = user.blocked
            ? route("users.unblock", user.id)
            : route("users.block", user.id);
        return window.axios.post(action).then(() => {
            router.reload({ only: ["users", "userStats"] });
        });
    });

    // Stats configuration
    const stats = useMemo(() => {
        const data = userStats && Object.keys(userStats).length > 0
            ? userStats
            : {
                total: users.data?.length || 0,
                employees: users.data?.filter((u) => u.roles?.length > 0).length || 0,
                students: users.data?.filter((u) => u.permissions?.length > 0 && (!u.roles || u.roles.length === 0)).length || 0,
                normal: users.data?.filter((u) => (!u.permissions || u.permissions.length === 0) && (!u.roles || u.roles.length === 0)).length || 0,
            };

        return [
            {
                label: "Total Users",
                value: data.total,
                icon: "UsersRound",
                color: "text-blue-500",
                borderColor: "border-blue-100",
                bgColor: "bg-blue-50",
                description: "All users registered in the system",
            },
            {
                label: "Employees",
                value: data.employees,
                icon: "UserCheck",
                color: "text-green-500",
                borderColor: "border-green-100",
                bgColor: "bg-green-50",
                description: "All verified staff or employee accounts",
            },
            {
                label: "Experiment Group",
                value: data.students,
                icon: "GraduationCap",
                color: "text-orange-500",
                borderColor: "border-orange-100",
                bgColor: "bg-orange-50",
                description: "All student accounts currently active",
            },
            {
                label: "Control Group",
                value: data.normal,
                icon: "User",
                color: "text-purple-500",
                borderColor: "border-purple-100",
                bgColor: "bg-purple-50",
                description: "All users without special roles",
            },
        ];
    }, [userStats, users.data]);

    // Handlers
    const openPermissionModal = (user) => {
        setSelectedUser(user);
        const userPerms = user.permissions ? user.permissions.map((p) => p.id) : [];
        const studentPermId = permissions.find((p) => p.name === "student")?.id;
        setUserPermissions(userPerms.length > 0 ? userPerms : studentPermId ? [studentPermId] : []);
        setShowPermissionModal(true);
    };

    const submitPermissions = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setPermProcessing(true);
        window.axios
            .patch(route("users.update-permissions", selectedUser.id), {
                permissions: userPermissions,
            })
            .then(() => {
                setPermProcessing(false);
                setShowPermissionModal(false);
                router.reload({ only: ["users", "userStats"] });
            })
            .catch(() => setPermProcessing(false));
    };

    const removePermission = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setPermProcessing(true);
        window.axios
            .patch(route("users.update-permissions", selectedUser.id), {
                permissions: [],
            })
            .then(() => {
                setPermProcessing(false);
                setShowPermissionModal(false);
                router.reload({ only: ["users", "userStats"] });
            })
            .catch(() => setPermProcessing(false));
    };

    const openResetModal = (user) => {
        setResetTarget(user);
        setResetPassword("");
        setResetError("");
        setShowResetModal(true);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!resetTarget || !resetPassword.trim()) {
            setResetError("Password is required.");
            return;
        }
        setResetProcessing(true);
        setResetError("");
        window.axios
            .post(route("users.reset-password", resetTarget.id), {
                password: resetPassword,
            })
            .then(() => {
                setShowResetModal(false);
                setResetTarget(null);
                setResetPassword("");
                setResetProcessing(false);
                router.reload({ only: ["users"] });
            })
            .catch((err) => {
                setResetProcessing(false);
                setResetError(err?.response?.data?.message || "Failed to reset password.");
            });
    };

    const toggleTrashedView = () => {
        router.get(
            route("users.index"),
            { search: searchTerm, trashed: showTrashed ? 0 : 1 },
            { preserveState: true, replace: true }
        );
    };

    const handleRestore = (userId) => {
        router.post(route("users.restore", userId), {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ["users", "userStats"] }),
        });
    };

    const headWeb = "User List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            
            {/* Stats Cards - Using our new StatsCard component */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat, index) => (
                            <StatsCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        {/* Header with Search and Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {showTrashed ? "Deleted Users" : "Active Users"}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Bar - Using our new SearchBar component */}
                                <SearchBar
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search users..."
                                />

                                {/* Trashed Toggle */}
                                <button
                                    onClick={toggleTrashedView}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-gray-600 hover:bg-gray-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                >
                                    {showTrashed ? "View Active" : "View Deleted"}
                                </button>

                                {/* Add User Button */}
                                {can["user-create"] && !showTrashed && (
                                    <Link
                                        href={route("users.create")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add User
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">ID</th>
                                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                                        <th className="px-6 py-4 text-left font-semibold">Email</th>
                                        <th className="px-6 py-4 text-left font-semibold">Roles</th>
                                        <th className="px-6 py-4 text-left font-semibold">Permissions</th>
                                        <th className="px-6 py-4 text-left font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left font-semibold">Joined</th>
                                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-200 bg-white">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                {showTrashed ? "No deleted users found" : "No users found"}
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-blue-50 transition-all duration-200">
                                                <td className="px-6 py-4 font-medium text-gray-900">{user.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    {user.roles?.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles.map((role) => (
                                                                <span key={role.id} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                                    {role.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No roles</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.permissions?.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.permissions.slice(0, 2).map((perm) => (
                                                                <span key={perm.id} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                                    {perm.name}
                                                                </span>
                                                            ))}
                                                            {user.permissions.length > 2 && (
                                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                                                    +{user.permissions.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No permissions</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.blocked ? (
                                                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {moment(user.created_at).format("MMM D, YYYY")}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {showTrashed ? (
                                                            <ActionButton
                                                                onClick={() => handleRestore(user.id)}
                                                                icon={RotateCcw}
                                                                tooltip="Restore User"
                                                                variant="green"
                                                            />
                                                        ) : (
                                                            <>
                                                                {can["user-edit"] && (
                                                                    <Link href={route("users.edit", user.id)}>
                                                                        <ActionButton
                                                                            icon={Pencil}
                                                                            tooltip="Edit User"
                                                                            variant="blue"
                                                                        />
                                                                    </Link>
                                                                )}
                                                                {can["user-permissions"] && (
                                                                    <ActionButton
                                                                        onClick={() => openPermissionModal(user)}
                                                                        icon={ShieldCheck}
                                                                        tooltip="Manage Permissions"
                                                                        variant="green"
                                                                    />
                                                                )}
                                                                {can["user-block"] && (
                                                                    <ActionButton
                                                                        onClick={() => blockModal.openModal(user)}
                                                                        icon={Ban}
                                                                        tooltip={user.blocked ? "Unblock User" : "Block User"}
                                                                        variant={user.blocked ? "green" : "red"}
                                                                    />
                                                                )}
                                                                {can["user-reset-password"] && (
                                                                    <ActionButton
                                                                        onClick={() => openResetModal(user)}
                                                                        icon={CheckCircle}
                                                                        tooltip="Reset Password"
                                                                        variant="yellow"
                                                                    />
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6">
                            <Pagination links={users.links} />
                        </div>
                    </div>


            {/* Block/Unblock Modal - Using our new ConfirmationModal */}
            <ConfirmationModal
                show={blockModal.showModal}
                onClose={blockModal.closeModal}
                onConfirm={blockModal.confirm}
                title={blockModal.target?.blocked ? "Unblock User" : "Block User"}
                message={
                    blockModal.target?.blocked
                        ? `Are you sure you want to unblock ${blockModal.target?.name}?`
                        : `Are you sure you want to block ${blockModal.target?.name}? They will not be able to access the system.`
                }
                confirmText={blockModal.target?.blocked ? "Unblock" : "Block"}
                confirmStyle={blockModal.target?.blocked ? "success" : "danger"}
                processing={blockModal.processing}
            />

            {/* Permission Modal - Keep as is (complex custom logic) */}
            <Modal show={showPermissionModal} onClose={() => setShowPermissionModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Manage Permissions for {selectedUser?.name}
                    </h2>
                    <form onSubmit={submitPermissions}>
                        <div className="space-y-2 mb-4">
                            {permissions.map((perm) => (
                                <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userPermissions.includes(perm.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setUserPermissions([...userPermissions, perm.id]);
                                            } else {
                                                setUserPermissions(userPermissions.filter((id) => id !== perm.id));
                                            }
                                        }}
                                        className="rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{perm.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-between gap-3">
                            <button
                                type="button"
                                onClick={removePermission}
                                className="rounded-xl border-2 border-red-300 px-6 py-1 text-red-600 hover:bg-red-50 transition font-semibold"
                                disabled={permProcessing}
                            >
                                Remove All
                            </button>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPermissionModal(false)}
                                    className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                    disabled={permProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                    disabled={permProcessing}
                                >
                                    {permProcessing ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Reset Password Modal - Keep as is (custom form) */}
            <Modal show={showResetModal} onClose={() => setShowResetModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Reset Password for {resetTarget?.name}
                    </h2>
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter new password"
                            />
                            {resetError && (
                                <p className="text-red-600 text-sm mt-1">{resetError}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowResetModal(false)}
                                className="rounded-xl border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                disabled={resetProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-xl px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95"
                                disabled={resetProcessing}
                            >
                                {resetProcessing ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AdminLayout>
    );
}
