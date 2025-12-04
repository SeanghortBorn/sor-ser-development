import Breadcrumb from "@/Components/Breadcrumb";
import InputError from "@/Components/InputError";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { Shield, BookOpen, Users, Settings, BarChart, Eye, Plus, Pencil, Trash2, Lock } from "lucide-react";

export default function RoleCreateEdit({ role, permissions, pages = [] }) {
    const { data, setData, post, patch, errors, reset, processing } = useForm({
        name: role?.name || "",
        permissions: [],
        page_permissions: {}, // { page_name: { view: true, create: false, ... } }
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("permissions"); // "permissions" or "pages"
    const [selectedTemplate, setSelectedTemplate] = useState("");

    useEffect(() => {
        if (role !== undefined) {
            const permIds = role.permissions.map((p) => p.id);
            setData("permissions", permIds);
            
            // Load existing page permissions if role has them
            if (role.page_permissions) {
                setData("page_permissions", role.page_permissions);
            }
        }
    }, [role]);

    // Permission templates for common roles
    const permissionTemplates = {
        "nlp-only": {
            label: "NLP-only (Basic)",
            description: "Can view article list and check homophones",
            permissions: ["article-list", "homophone-list"],
            pages: {
                "dashboard": ["view"],
                "articles": ["view"],
                "user-progress": ["own"],
            }
        },
        "nlp-la": {
            label: "NLP+LA (Full Features)",
            description: "Everything NLP-only has + learning analytics",
            permissions: ["article-list", "homophone-list", "quiz-list"],
            pages: {
                "dashboard": ["view"],
                "articles": ["view"],
                "user-progress": ["view", "own"],
            }
        },
        "instructor": {
            label: "Instructor",
            description: "Can manage groups, view all progress, create articles",
            permissions: ["article-list", "article-create", "article-edit", "homophone-list", "quiz-list", "user-list", "role-list"],
            pages: {
                "dashboard": ["view"],
                "articles": ["view", "create", "update"],
                "user-progress": ["view"],
                "users": ["view", "create", "update"],
                "roles": ["view"],
            }
        },
        "admin": {
            label: "Admin (Full Access)",
            description: "Complete system access",
            permissions: "all",
            pages: "all"
        }
    };

    const applyTemplate = (templateKey) => {
        const template = permissionTemplates[templateKey];
        if (!template) return;

        if (template.permissions === "all") {
            // Select all permissions
            const allPermIds = permissions.map(p => p.id);
            setData("permissions", allPermIds);
        } else {
            // Select specific permissions
            const permIds = permissions
                .filter(p => template.permissions.includes(p.name))
                .map(p => p.id);
            setData("permissions", permIds);
        }

        if (template.pages === "all") {
            // Grant all page permissions
            const allPages = {};
            (pages || []).forEach(page => {
                allPages[page.page_name] = {
                    view: true,
                    create: true,
                    update: true,
                    delete: true,
                };
            });
            setData("page_permissions", allPages);
        } else {
            // Grant specific page permissions
            const pagePerms = {};
            Object.entries(template.pages).forEach(([pageName, actions]) => {
                pagePerms[pageName] = {};
                actions.forEach(action => {
                    pagePerms[pageName][action] = true;
                });
            });
            setData("page_permissions", pagePerms);
        }

        setSelectedTemplate(templateKey);
    };

    const handleSelectPermission = (e) => {
        const id = parseInt(e.target.value);
        if (e.target.checked) {
            if (!data.permissions.includes(id)) {
                setData("permissions", [...data.permissions, id]);
            }
        } else {
            setData(
                "permissions",
                data.permissions.filter((p) => p !== id)
            );
        }
        setSelectedTemplate(""); // Clear template when manually changing
    };

    const handleSelectAllModule = (module, modulePermissions) => {
        const moduleIds = modulePermissions.map((p) => p.id);
        const allSelected = moduleIds.every((id) =>
            data.permissions.includes(id)
        );

        if (allSelected) {
            setData(
                "permissions",
                data.permissions.filter((id) => !moduleIds.includes(id))
            );
        } else {
            const newPermissions = [...data.permissions];
            moduleIds.forEach((id) => {
                if (!newPermissions.includes(id)) {
                    newPermissions.push(id);
                }
            });
            setData("permissions", newPermissions);
        }
        setSelectedTemplate(""); // Clear template
    };

    const handlePagePermission = (pageName, action) => {
        const currentPagePerms = data.page_permissions[pageName] || {};
        const newPagePerms = {
            ...data.page_permissions,
            [pageName]: {
                ...currentPagePerms,
                [action]: !currentPagePerms[action]
            }
        };
        setData("page_permissions", newPagePerms);
        setSelectedTemplate(""); // Clear template
    };

    const submit = (e) => {
        e.preventDefault();
        if (role == undefined) {
            post(route("roles.store"), {
                preserveState: true,
                onFinish: () => reset(),
            });
        } else {
            patch(route("roles.update", role.id), {
                preserveState: true,
                onFinish: () => reset(),
            });
        }
    };

    const capitalizeWords = (str) => {
        return str
            .split("-")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
    };

    const groupPermissions = () => {
        const groups = {};
        permissions.forEach((permission) => {
            const parts = permission.name.split("-");
            const actions = [
                "list",
                "create",
                "edit",
                "delete",
                "export",
                "import",
                "view",
                "manage",
                "own",
            ];

            let module, action;
            const lastPart = parts[parts.length - 1];

            if (actions.includes(lastPart)) {
                action = lastPart;
                module = parts.slice(0, -1).join("-");
            } else {
                module = parts[0];
                action = parts.slice(1).join("-");
            }

            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push({
                ...permission,
                action: action,
                displayAction: capitalizeWords(action),
            });
        });

        Object.keys(groups).forEach((module) => {
            groups[module].sort((a, b) => {
                const order = ["list", "view", "create", "edit", "update", "delete", "own", "manage"];
                return order.indexOf(a.action) - order.indexOf(b.action);
            });
        });

        return groups;
    };

    const permissionGroups = groupPermissions();

    const filteredGroups = Object.keys(permissionGroups).filter(
        (module) =>
            module.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permissionGroups[module].some((perm) =>
                perm.displayAction
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
    );

    // Available page actions
    const pageActions = [
        { key: "view", label: "View", icon: Eye, color: "blue" },
        { key: "create", label: "Create", icon: Plus, color: "green" },
        { key: "update", label: "Update", icon: Pencil, color: "yellow" },
        { key: "delete", label: "Delete", icon: Trash2, color: "red" },
        { key: "own", label: "Own Data", icon: Lock, color: "purple" },
    ];

    // Get icon for page
    const getPageIcon = (pageName) => {
        const icons = {
            "dashboard": BarChart,
            "user-progress": Users,
            "articles": BookOpen,
            "roles": Shield,
            "users": Users,
            "settings": Settings,
        };
        return icons[pageName] || BookOpen;
    };

    const headWeb = role?.id ? "Edit Role" : "Create Role";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: "Roles", url: route("roles.index") },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="container-fluid sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 mb-12">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {headWeb}
                                    </h1>
                                    <p className="text-gray-500">
                                        {role?.id
                                            ? "Update role details, permissions, and page access"
                                            : "Create a new role with permissions and page access"}
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-6">
                                    {/* Role Name Field */}
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Role Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="Enter role name (e.g., Group A: NLP-only)"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                className={`block mt-2 w-full px-3 py-[11px] text-sm rounded-xl border ${
                                                    errors.name
                                                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                                                } placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2`}
                                            />
                                            {errors.name && (
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg
                                                        className="h-5 w-5 text-red-500"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <InputError
                                            message={errors.name}
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>

                                    {/* Permission Templates */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Quick Templates
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                            {Object.entries(permissionTemplates).map(([key, template]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => applyTemplate(key)}
                                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                        selectedTemplate === key
                                                            ? "border-blue-500 bg-blue-100"
                                                            : "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                                                    }`}
                                                >
                                                    <div className="font-semibold text-sm text-gray-900 mb-1">
                                                        {template.label}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {template.description}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-blue-700 mt-3">
                                            💡 Select a template to quickly configure permissions, or customize manually below
                                        </p>
                                    </div>

                                    {/* Tabs */}
                                    <div className="border-b border-gray-200">
                                        <nav className="flex space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("permissions")}
                                                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                    activeTab === "permissions"
                                                        ? "border-blue-500 text-blue-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                            >
                                                Feature Permissions
                                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
                                                    {data.permissions.length}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("pages")}
                                                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                    activeTab === "pages"
                                                        ? "border-blue-500 text-blue-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                            >
                                                Page Access Control
                                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
                                                    {Object.keys(data.page_permissions).length}
                                                </span>
                                            </button>
                                        </nav>
                                    </div>

                                    {/* Tab Content */}
                                    {activeTab === "permissions" ? (
                                        // Feature Permissions Tab
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Feature Permissions{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="relative w-full max-w-xs">
                                                    <input
                                                        type="text"
                                                        placeholder="Search modules..."
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="pl-10 pr-16 py-2 border border-gray-300 rounded-xl focus:ring-0 w-full"
                                                    />
                                                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {filteredGroups.map((module) => {
                                                    const modulePermissions =
                                                        permissionGroups[module];
                                                    const selectedCount =
                                                        modulePermissions.filter(
                                                            (p) =>
                                                                data.permissions.includes(
                                                                    p.id
                                                                )
                                                        ).length;
                                                    const allSelected =
                                                        selectedCount ===
                                                        modulePermissions.length;
                                                    const someSelected =
                                                        selectedCount > 0 &&
                                                        selectedCount <
                                                            modulePermissions.length;
                                                    return (
                                                        <div
                                                            key={module}
                                                            className="bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-xl">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="font-semibold text-blue-700 capitalize flex items-center">
                                                                        {capitalizeWords(
                                                                            module
                                                                        )}
                                                                    </h3>
                                                                    <div className="flex items-center space-x-2">
                                                                        <span
                                                                            className={`px-2 py-1 text-xs rounded-full ${
                                                                                allSelected
                                                                                    ? "bg-blue-100 text-blue-800"
                                                                                    : someSelected
                                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                                    : "bg-gray-100 text-gray-600"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                selectedCount
                                                                            }
                                                                            /
                                                                            {
                                                                                modulePermissions.length
                                                                            }
                                                                        </span>
                                                                        <label className="inline-flex items-center cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    allSelected
                                                                                }
                                                                                ref={(
                                                                                    input
                                                                                ) => {
                                                                                    if (
                                                                                        input
                                                                                    )
                                                                                        input.indeterminate =
                                                                                            someSelected;
                                                                                }}
                                                                                onChange={() =>
                                                                                    handleSelectAllModule(
                                                                                        module,
                                                                                        modulePermissions
                                                                                    )
                                                                                }
                                                                                className="form-checkbox mt-2 h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 focus:ring-1"
                                                                            />
                                                                            <span className="ml-2 mt-2 text-xs text-gray-600">
                                                                                All
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3">
                                                                {modulePermissions.map(
                                                                    (
                                                                        permission
                                                                    ) => (
                                                                        <label
                                                                            key={
                                                                                permission.id
                                                                            }
                                                                            className="flex items-center space-x-4 cursor-pointer group hover:bg-blue-50 p-2 rounded"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                value={
                                                                                    permission.id
                                                                                }
                                                                                checked={data.permissions.includes(
                                                                                    permission.id
                                                                                )}
                                                                                onChange={
                                                                                    handleSelectPermission
                                                                                }
                                                                                className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-1 focus:ring-blue-500"
                                                                            />
                                                                            <div className="flex items-center space-x-2 flex-1">
                                                                                <span className="text-sm font-medium text-gray-700">
                                                                                    {
                                                                                        permission.displayAction
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </label>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <InputError
                                                className="mt-4 text-sm text-red-600"
                                                message={errors.permissions}
                                            />
                                        </div>
                                    ) : (
                                        // Page Access Control Tab
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Page Access Control
                                            </label>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Control which pages this role can access and what actions they can perform.
                                            </p>

                                            <div className="space-y-4">
                                                {(pages && pages.length > 0) ? pages.map((page) => {
                                                    const PageIcon = getPageIcon(page.page_name);
                                                    const pagePerms = data.page_permissions[page.page_name] || {};
                                                    const activeCount = Object.values(pagePerms).filter(Boolean).length;

                                                    return (
                                                        <div
                                                            key={page.id}
                                                            className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                        <PageIcon className="w-5 h-5 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 capitalize">
                                                                            {capitalizeWords(page.page_name)}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-500">
                                                                            {page.description || 'Page access control'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {activeCount > 0 && (
                                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                                        {activeCount} enabled
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                {pageActions.map((action) => {
                                                                    const ActionIcon = action.icon;
                                                                    const isActive = pagePerms[action.key];
                                                                    const colorClasses = {
                                                                        blue: "bg-blue-100 text-blue-700 border-blue-300",
                                                                        green: "bg-green-100 text-green-700 border-green-300",
                                                                        yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
                                                                        red: "bg-red-100 text-red-700 border-red-300",
                                                                        purple: "bg-purple-100 text-purple-700 border-purple-300",
                                                                    };
                                                                    const inactiveClass = "bg-gray-50 text-gray-400 border-gray-200";

                                                                    return (
                                                                        <button
                                                                            key={action.key}
                                                                            type="button"
                                                                            onClick={() => handlePagePermission(page.page_name, action.key)}
                                                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                                                                isActive ? colorClasses[action.color] : inactiveClass
                                                                            } hover:scale-105`}
                                                                        >
                                                                            <ActionIcon className="w-4 h-4" />
                                                                            {action.label}
                                                                            {isActive && (
                                                                                <span className="ml-1">✓</span>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                        <p>No pages available for access control</p>
                                                        <p className="text-sm">Run migrations to create page permissions</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                                        <Link
                                            href={route("roles.index")}
                                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-gray-700 border hover:bg-gray-200 hover:border-gray-400 hover:text-gray-900 transition duration-200"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                                />
                                            </svg>
                                            Cancel
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-500 shadow-sm transition duration-200 hover:from-blue-500 hover:to-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    {role?.id
                                                        ? "Updating..."
                                                        : "Saving..."}
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    {role?.id
                                                        ? "Update Role"
                                                        : "Create Role"}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}