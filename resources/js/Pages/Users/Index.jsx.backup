import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import moment from "moment";
import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Pencil,
    ShieldCheck,
    RotateCcw,
    Ban,
    UserPlus,
    CheckCircle,
    UsersRound,
    UserCheck,
    GraduationCap,
    User,
    BarChart3,
} from "lucide-react";

export default function UserPage({
    users,
    permissions = [],
    search: searchProp = "",
    userStats = {},
}) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [permProcessing, setPermProcessing] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockTarget, setBlockTarget] = useState(null);
    const [blockProcessing, setBlockProcessing] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);
    const [resetPassword, setResetPassword] = useState("");
    const [resetProcessing, setResetProcessing] = useState(false);
    const [resetError, setResetError] = useState("");
    const [searchTerm, setSearchTerm] = useState(searchProp || "");

    // Define stat card configurations
    const STAT_CONFIG = [
        {
            id: "total",
            label: "Total Users",
            icon: "UsersRound",
            color: "text-blue-500",
            borderColor: "border-blue-100",
            bgColor: "bg-blue-50",
            value: 0,
            description: "All users registered in the system",
        },
        {
            id: "employees",
            label: "Employees",
            icon: "UserCheck",
            color: "text-green-500",
            borderColor: "border-green-100",
            bgColor: "bg-green-50",
            value: 0,
            description: "All verified staff or employee accounts",
        },
        {
            id: "students",
            label: "Experiment Group",
            icon: "GraduationCap",
            color: "text-orange-500",
            borderColor: "border-orange-100",
            bgColor: "bg-orange-50",
            value: 0,
            description: "All student accounts currently active",
        },
        {
            id: "normal",
            label: "Control Group",
            icon: "User",
            color: "text-purple-500",
            borderColor: "border-purple-100",
            bgColor: "bg-purple-50",
            value: 0,
            description: "All users without special roles",
        },
    ];

    // Calculate stats from paginated results
    const calculatePageStats = () => {
        const allUsers = users.data || [];
        return {
            total: allUsers.length,
            employees: allUsers.filter((u) => u.roles?.length > 0).length,
            students: allUsers.filter(
                (u) =>
                    u.permissions?.length > 0 &&
                    (!u.roles || u.roles.length === 0)
            ).length,
            normal: allUsers.filter(
                (u) =>
                    (!u.permissions || u.permissions.length === 0) &&
                    (!u.roles || u.roles.length === 0)
            ).length,
        };
    };

    // Compute stats with memoization
    const stats = useMemo(() => {
        const data =
            userStats && Object.keys(userStats).length > 0
                ? userStats
                : calculatePageStats();

        return STAT_CONFIG.map((config) => ({
            ...config,
            value: data[config.id] ?? 0,
        }));
    }, [userStats, users.data]);

    useEffect(() => {
        setSearchTerm(searchProp || "");
    }, [searchProp]);

    const openPermissionModal = (user) => {
        setSelectedUser(user);
        const userPerms = user.permissions
            ? user.permissions.map((p) => p.id)
            : [];
        // Auto-select 'student' permission if user has no permissions
        const studentPermId = permissions.find((p) => p.name === "student")?.id;
        setUserPermissions(
            userPerms.length > 0
                ? userPerms
                : studentPermId
                ? [studentPermId]
                : []
        );
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
                // Reload entire page to recalculate stats
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
                // Reload entire page to recalculate stats
                router.reload({ only: ["users", "userStats"] });
            })
            .catch(() => setPermProcessing(false));
    };

    // Block/unblock handler
    const handleBlockClick = (user) => {
        setBlockTarget(user);
        setShowBlockModal(true);
    };

    const confirmBlock = () => {
        if (!blockTarget) return;
        setBlockProcessing(true);
        const action = blockTarget.blocked
            ? route("users.unblock", blockTarget.id)
            : route("users.block", blockTarget.id);
        window.axios
            .post(action)
            .then(() => {
                // Reload to recalculate stats
                router.reload({ only: ["users", "userStats"] });
            })
            .finally(() => {
                setBlockProcessing(false);
                setShowBlockModal(false);
                setBlockTarget(null);
            });
    };

    // Open reset password modal
    const openResetModal = (user) => {
        setResetTarget(user);
        setResetPassword("");
        setResetError("");
        setShowResetModal(true);
    };

    // Handle reset password submit
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
                setResetError(
                    err?.response?.data?.message || "Failed to reset password."
                );
            });
    };

    const handleSearch = (e) => {
        const term = e.target.value || "";
        setSearchTerm(term);
        router.get(
            route("users.index"),
            { search: term },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const headWeb = "User List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat) => (
                            <div
                                key={stat.id}
                                className={`bg-white px-3 pb-2 pt-3 border-l-4 ${stat.borderColor} shadow-sm rounded-xl flex flex-col hover:shadow-md transition-all duration-200`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-800 text-base font-semibold">
                                        {stat.label}
                                    </p>
                                    <div className={`${stat.color}`}>
                                        {stat.icon === "UsersRound" && (
                                            <UsersRound className="w-7 h-7" />
                                        )}
                                        {stat.icon === "UserCheck" && (
                                            <UserCheck className="w-7 h-7" />
                                        )}
                                        {stat.icon === "GraduationCap" && (
                                            <GraduationCap className="w-7 h-7" />
                                        )}
                                        {stat.icon === "User" && (
                                            <User className="w-7 h-7" />
                                        )}
                                    </div>
                                </div>
                                <div className="">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {stat.value}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stat.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-12">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            {/* Left side (Title) */}
                            <h3 className="text-xl font-semibold">
                                User Management
                            </h3>

                            {/* Right side (Search + Add User) */}
                            <div className="flex items-center gap-3 ml-auto">
                                <form
                                    className="inline-block"
                                    onSubmit={(e) => e.preventDefault()}
                                >
                                    <div className="inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-lg transition text-sm bg-white">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email"
                                            className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px] focus:outline-none focus:ring-0"
                                            value={searchTerm ?? ""}
                                            onChange={handleSearch}
                                        />
                                    </div>
                                </form>

                                {can["user-create"] && can["user-list"] && (
                                    <a
                                        href={route("users.create")}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add User
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm">
                                    <tr>
                                        <th className="py-3 px-4">#ID</th>
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Blocked</th>
                                        <th className="py-3 px-4">
                                            Created At
                                        </th>
                                        {(can["user-edit"] ||
                                            can["user-delete"] ||
                                            can["user-list"]) && (
                                            <th className="py-3 px-4 text-center">
                                                Action
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {users.data.length > 0 ? (
                                        users.data.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >
                                                <td className="py-3 px-4 font-semibold">
                                                    {item.id}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {item.name}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {item.email}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {item.roles?.length > 0 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                                                            {item.roles[0].name}
                                                        </span>
                                                    ) : item.permissions
                                                          ?.length > 0 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                                            Student
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-400 text-white">
                                                            No Access
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {item.blocked ? (
                                                        <span className="badge bg-red-600 text-white text-xs">
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-green-600 text-white text-xs">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {moment(
                                                        item.created_at
                                                    ).format("DD/MM/YYYY")}
                                                </td>

                                                {(can["user-edit"] ||
                                                    can["user-block"] ||
                                                    can["user-list"]) && (
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="flex justify-center gap-2 items-center">
                                                            {/* NEW: View Progress Button */}
                                                            {can["user-list"] && (
                                                                <div className="relative group">
                                                                    <Link
                                                                        href={route(
                                                                            "users.progress",
                                                                            item.id
                                                                        )}
                                                                        className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition"
                                                                    >
                                                                        <BarChart3 className="w-4 h-4" />
                                                                    </Link>
                                                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border whitespace-nowrap z-10">
                                                                        View
                                                                        Progress
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {can["user-edit"] &&
                                                                can[
                                                                    "user-create"
                                                                ] && (
                                                                    <div className="relative group">
                                                                        <Link
                                                                            href={route(
                                                                                "users.edit",
                                                                                item.id
                                                                            )}
                                                                            className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                                                                        >
                                                                            <Pencil className="w-4 h-4" />
                                                                        </Link>
                                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border whitespace-nowrap z-10">
                                                                            Edit
                                                                            User
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            {can["user-edit"] &&
                                                                can[
                                                                    "user-create"
                                                                ] && (
                                                                    <div className="relative group">
                                                                        <button
                                                                            type="button"
                                                                            className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition"
                                                                            onClick={() =>
                                                                                openPermissionModal(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                        </button>
                                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border whitespace-nowrap z-10">
                                                                            Assign
                                                                            Student
                                                                            Role
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            {can["user-edit"] &&
                                                                can[
                                                                    "user-create"
                                                                ] && (
                                                                    <div className="relative group">
                                                                        <button
                                                                            type="button"
                                                                            className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition"
                                                                            onClick={() =>
                                                                                openResetModal(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            <RotateCcw className="w-4 h-4" />
                                                                        </button>
                                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border whitespace-nowrap z-10">
                                                                            Reset
                                                                            Password
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            {can[
                                                                "user-block"
                                                            ] && (
                                                                <div className="relative group">
                                                                    <button
                                                                        type="button"
                                                                        className={`inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl ${
                                                                            item.blocked
                                                                                ? "bg-green-500 hover:bg-green-600"
                                                                                : "bg-red-500 hover:bg-red-400"
                                                                        } text-white transition`}
                                                                        onClick={() =>
                                                                            handleBlockClick(
                                                                                item
                                                                            )
                                                                        }
                                                                    >
                                                                        {item.blocked ? (
                                                                            <>
                                                                                <CheckCircle className="w-4 h-4" />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Ban className="w-4 h-4" />
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-2 py-1 rounded-lg shadow-md border whitespace-nowrap z-10">
                                                                        {item.blocked
                                                                            ? "Unblock"
                                                                            : "Block"}
                                                                    </div>
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
                                                    can["user-edit"] ||
                                                    can["user-block"] ||
                                                    can["user-list"]
                                                        ? 7
                                                        : 6
                                                }
                                                className="py-8 text-center text-gray-500"
                                            >
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Block/Unblock Modal */}
                        <Modal
                            show={showBlockModal}
                            onClose={() => {
                                setShowBlockModal(false);
                                setBlockTarget(null);
                                setBlockProcessing(false);
                            }}
                            maxWidth="lg"
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!blockProcessing) confirmBlock();
                                }}
                                className="p-6"
                            >
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    {blockTarget?.blocked
                                        ? "Unblock User"
                                        : "Block User"}
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    {blockTarget?.blocked
                                        ? `Are you sure you want to unblock "${blockTarget?.name}"?`
                                        : `Are you sure you want to block "${blockTarget?.name}"? The user will not be able to log in.`}
                                </p>
                                <div className="flex justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowBlockModal(false);
                                            setBlockTarget(null);
                                            setBlockProcessing(false);
                                        }}
                                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={blockProcessing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`rounded-[10px] px-9 py-1 text-white font-semibold transition ${
                                            blockTarget?.blocked
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-red-600 hover:bg-red-700"
                                        }`}
                                        disabled={blockProcessing}
                                    >
                                        {blockProcessing
                                            ? "Saving..."
                                            : blockTarget?.blocked
                                            ? "Unblock"
                                            : "Block"}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* Permission Modal */}
                        <Modal
                            show={showPermissionModal}
                            onClose={() => {
                                setShowPermissionModal(false);
                                setUserPermissions([]);
                                setSelectedUser(null);
                            }}
                            maxWidth="xl"
                        >
                            {selectedUser &&
                            selectedUser.permissions?.length === 0 &&
                            selectedUser.roles?.length === 0 ? (
                                <form
                                    onSubmit={submitPermissions}
                                    className="p-6 space-y-3"
                                >
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Assign Student Permission
                                    </h2>

                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">
                                            {selectedUser?.name}
                                        </span>{" "}
                                        has no role yet. Click{" "}
                                        <strong>Save</strong> to give them the
                                        default <strong>Student</strong> role.
                                    </p>

                                    {/* Admin-only hint – tiny badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded">
                                            Default: Student
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3 mt-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPermissionModal(false);
                                                setUserPermissions([]);
                                                setSelectedUser(null);
                                            }}
                                            className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={permProcessing}
                                            className="rounded-[10px] px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                        >
                                            {permProcessing
                                                ? "Saving…"
                                                : "Save"}
                                        </button>
                                    </div>
                                </form>
                            ) : selectedUser?.roles?.length > 0 ? (
                                <div className="p-6 space-y-3">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        User Role Information
                                    </h2>

                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">
                                            {selectedUser?.name}
                                        </span>{" "}
                                        is assigned the following role:
                                    </p>

                                    {/* Current role badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-3 py-1 text-sm font-medium text-green-900 bg-green-100 rounded-full">
                                            {selectedUser?.roles?.[0]?.name}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 italic">
                                        This user has been assigned a role and
                                        cannot be modified through this
                                        interface.
                                    </p>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPermissionModal(false);
                                                setUserPermissions([]);
                                                setSelectedUser(null);
                                            }}
                                            className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : selectedUser?.permissions?.length > 0 ? (
                                <form
                                    onSubmit={removePermission}
                                    className="p-6 space-y-3"
                                >
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Remove Student Permission
                                    </h2>

                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">
                                            {selectedUser?.name}
                                        </span>{" "}
                                        currently has the following permission:
                                    </p>

                                    {/* Current permission badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-900 bg-blue-100 rounded-full">
                                            Student
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600">
                                        Click <strong>Remove</strong> to revoke
                                        this permission.
                                    </p>

                                    <div className="flex justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPermissionModal(false);
                                                setUserPermissions([]);
                                                setSelectedUser(null);
                                            }}
                                            className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={permProcessing}
                                            className="rounded-[10px] px-9 py-1 bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
                                        >
                                            {permProcessing
                                                ? "Removing…"
                                                : "Remove"}
                                        </button>
                                    </div>
                                </form>
                            ) : null}
                        </Modal>

                        {/* Reset Password Modal */}
                        <Modal
                            show={showResetModal}
                            onClose={() => {
                                setShowResetModal(false);
                                setResetTarget(null);
                                setResetPassword("");
                                setResetProcessing(false);
                                setResetError("");
                            }}
                            maxWidth="lg"
                        >
                            <form
                                onSubmit={handleResetPassword}
                                className="p-6"
                            >
                                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                                    Reset Password
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    Enter a new password for{" "}
                                    <span className="font-semibold">
                                        {resetTarget?.name}
                                    </span>
                                    .
                                </p>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl transition-colors text-gray-600 focus:ring-3 focus:ring-gray-100 focus:outline-none text-[18px] font-medium"
                                        value={resetPassword || ""}
                                        onChange={(e) =>
                                            setResetPassword(e.target.value)
                                        }
                                        disabled={resetProcessing}
                                    />
                                    {resetError && (
                                        <div className="text-red-600 text-xs mt-1">
                                            {resetError}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetModal(false);
                                            setResetTarget(null);
                                            setResetPassword("");
                                            setResetProcessing(false);
                                            setResetError("");
                                        }}
                                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold"
                                        disabled={resetProcessing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-[10px] px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                                        disabled={resetProcessing}
                                    >
                                        {resetProcessing ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* Pagination */}
                        {users.total > 10 && (
                            <div className="px-6 py-3 border-t flex justify-center">
                                <Pagination
                                    links={users.links}
                                    currentPage={users.current_page}
                                    perPage={users.per_page}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}