import Breadcrumb from "@/Components/Breadcrumb";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import SecondaryButton from "@/Components/SecondaryButton";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import moment from "moment";
import React, { useState } from "react";
import {
    Search,
    Pencil,
    ShieldCheck,
    RotateCcw,
    Ban,
    UserPlus,
    CheckCircle
} from "lucide-react";

export default function UserPage({ users, permissions = [] }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};

    const datasList = users.data;
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [permProcessing, setPermProcessing] = useState(false);

    // Block modal state
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockTarget, setBlockTarget] = useState(null);
    const [blockProcessing, setBlockProcessing] = useState(false); // add this

    const openPermissionModal = (user) => {
        setSelectedUser(user);
        setUserPermissions(
            user.permissions ? user.permissions.map((p) => p.id) : []
        );
        setShowPermissionModal(true);
    };

    const handlePermissionChange = (permId) => {
        setUserPermissions((prev) =>
            prev.includes(permId)
                ? prev.filter((id) => id !== permId)
                : [...prev, permId]
        );
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
        setBlockProcessing(true); // start processing
        const action = blockTarget.blocked
            ? route("users.unblock", blockTarget.id)
            : route("users.block", blockTarget.id);
        window.axios
            .post(action)
            .then(() => window.location.reload())
            .finally(() => {
                setBlockProcessing(false); // stop processing
                setShowBlockModal(false);
                setBlockTarget(null);
            });
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
                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-12">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between items-center gap-3">
                            {/* Left side (Title) */}
                            <h3 className="text-xl font-semibold">
                                User Management
                            </h3>

                            {/* Right side (Search + Add User) */}
                            <div className="flex items-center gap-3 ml-auto">
                                <form className="inline-block">
                                    <div className="inline-flex items-center gap-2 px-3 rounded-lg border hover:shadow-lg transition text-sm bg-white">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search User"
                                            className="px-2 outline-none border-none bg-transparent text-sm placeholder-gray-400 w-full min-w-[150px] focus:outline-none focus:ring-0"
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
                                            Permissions
                                        </th>
                                        <th className="py-3 px-4">
                                            Created At
                                        </th>
                                        {(can["user-edit"] ||
                                            can["user-delete"]) && (
                                            <th className="py-3 px-4 text-center">
                                                Action
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {datasList.length > 0 ? (
                                        datasList.map((item) => (
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
                                                        <span className="badge bg-green-600 text-white text-xs">
                                                            {item.roles[0].name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 text-xs">
                                                            No Role
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
                                                    {item.permissions?.length >
                                                    0
                                                        ? item.permissions
                                                              .map(
                                                                  (p) => p.name
                                                              )
                                                              .join(", ")
                                                        : "-"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {moment(
                                                        item.created_at
                                                    ).format("DD/MM/YYYY")}
                                                </td>

                                                {(can["user-edit"] ||
                                                    can["user-block"]) && (
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="flex justify-center gap-2 items-center">
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
                                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border">
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
                                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border">
                                                                            Assign
                                                                            Permissions
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
                                                                                openPermissionModal(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            <RotateCcw className="w-4 h-4" />
                                                                        </button>
                                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border">
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
                                                                        onClick={() => handleBlockClick(item)}
                                                                    >
                                                                        {item.blocked ? (
                                                                            <>
                                                                                <CheckCircle  className="w-4 h-4" />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Ban className="w-4 h-4" />
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-800 text-xs px-2 py-1 rounded-lg shadow-md border">
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
                                                    can["user-block"]
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
                                setBlockProcessing(false); // reset on close
                            }}
                            maxWidth="lg"
                        >
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    if (!blockProcessing) confirmBlock();
                                }}
                                className="p-6"
                            >
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    {blockTarget?.blocked ? "Unblock User" : "Block User"}
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
                            onClose={() => setShowPermissionModal(false)}
                            maxWidth="xl"
                        >
                            <form
                                onSubmit={submitPermissions}
                                className="p-6 space-y-3"
                            >
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Assign Permissions
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Select the permissions you want to assign to{" "}
                                    <span className="font-medium">
                                        {selectedUser?.name}
                                    </span>
                                    .
                                </p>

                                <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50 hide-scrollbar">
                                    {permissions.map((perm) => (
                                        <label
                                            key={perm.id}
                                            className="flex items-center gap-2 py-1 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 focus:ring-0"
                                                checked={userPermissions.includes(
                                                    perm.id
                                                )}
                                                onChange={() =>
                                                    handlePermissionChange(
                                                        perm.id
                                                    )
                                                }
                                            />
                                            {perm.name}
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPermissionModal(false)
                                        }
                                        className="rounded-[10px] border-2 border-gray-300 px-8 py-1 text-gray-700 hover:bg-gray-100 transition font-semibold disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={permProcessing}
                                        className="rounded-[10px] px-9 py-1 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                    >
                                        {permProcessing ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        </Modal>

                        {/* Pagination */}
                        {users.total > 15 && (
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
