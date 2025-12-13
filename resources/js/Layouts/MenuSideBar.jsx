import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Settings, Shield } from 'lucide-react';
import AppLogo from '@/Components/Shared/AppLogo';
import { BRAND_CONSTANTS } from '@/constants/brand';

function MenuGroup({ label, icon, children, active }) {
    const [open, setOpen] = useState(active);

    useEffect(() => {
        setOpen(active);
    }, [active]);

    return (
        <div className="mb-1.5">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`flex items-center w-full px-3 py-2.5 rounded-2xl font-medium transition-all duration-200 ease-in-out group ${
                    open || active
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm hover:shadow-md"
                        : "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
                } hover:scale-[1.02] active:scale-[0.98]`}
            >
                <span
                    className={`mr-3 transition-all duration-200 ease-in-out ${
                        open || active
                            ? "text-blue-600 scale-110"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                >
                    {icon}
                </span>
                <span className="flex-1 text-left text-sm font-semibold">
                    {label}
                </span>
                <svg
                    className={`w-4 h-4 ml-auto transition-all duration-200 ease-in-out ${
                        open ? "rotate-90" : ""
                    } ${
                        open || active
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>

            <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    open ? "max-h-96 opacity-100 mt-1.5" : "max-h-0 opacity-0"
                }`}
            >
                <div className="pl-3 space-y-1">{children}</div>
            </div>
        </div>
    );
}

/* ----------------------------
 * Simple Menu Item
 * ---------------------------- */
function MenuItem({ href, icon, label, active }) {
    return (
        <Link
            href={href}
            className={`flex items-center px-3 py-2 rounded-xl font-medium transition-all duration-200 ease-in-out group ${
                active
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm"
                    : "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
            } hover:scale-[1.02] hover:translate-x-1 active:scale-[0.98]`}
        >
            {/* Icon */}
            <span
                className={`mr-3 transition-all duration-200 ease-in-out ${
                    active ? "text-blue-600 scale-110" : "text-gray-400 group-hover:text-gray-600"
                }`}
            >
                {icon}
            </span>

            {/* Label */}
            <span
                className={`text-sm transition-all duration-200 ease-in-out ${
                    active
                        ? "text-blue-700 font-semibold"
                        : "text-gray-600 group-hover:text-gray-900"
                }`}
            >
                {label}
            </span>
        </Link>
    );
}

/* ----------------------------
 * Helper: Check if route exists
 * Prevents JavaScript crash when route is not defined
 * ---------------------------- */
function routeExists(name) {
    try {
        route(name);
        return true;
    } catch (e) {
        return false;
    }
}

/* ----------------------------
 * Helper: Safe route - returns '#' if route doesn't exist
 * ---------------------------- */
function safeRoute(name, params = {}) {
    try {
        return route(name, params);
    } catch (e) {
        console.warn(`Route "${name}" not found`);
        return '#';
    }
}

/* ----------------------------
 * Sidebar Component
 * ---------------------------- */
export default function MenuSideBar({ lang, setLang }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const routeName = route().current();    const isAdmin = auth?.user?.roles_list?.some(role => role.name === 'Admin') ?? false;
    const t = (en, kh) => (lang === "kh" ? kh : en);
    const isActive = (...names) => names.some((n) => routeName?.includes(n));

    /* ----------------------------
     * SVG ICONS
     * ---------------------------- */
    const icons = {
        dashboard: (
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
        ),
        user: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users"
            >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
            </svg>
        ),
        role: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user-lock"
            >
                <circle cx="10" cy="7" r="4" />
                <path d="M10.3 15H7a4 4 0 0 0-4 4v2" />
                <path d="M15 15.5V14a2 2 0 0 1 4 0v1.5" />
                <rect width="8" height="5" x="13" y="16" rx=".899" />
            </svg>
        ),
        quiz: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-message-circle-question-mark-icon lucide-message-circle-question-mark"
            >
                <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
            </svg>
        ),
        feedback: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-message-square"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M3 8V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1" />
                <path d="M3 12h18" />
            </svg>
        ),
        article: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-clipboard-plus-icon lucide-clipboard-plus"
            >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M9 14h6" />
                <path d="M12 17v-6" />
            </svg>
        ),
        homophone: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-book-plus"
            >
                {/* Book */}
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
                {/* Plus sign */}
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
        ),
        settings: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        ),
        learning: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        ),
        progress: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
            </svg>
        ),
        permissions: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
            </svg>
        ),
        analytics: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
            </svg>
        ),
    };

    return (
        <aside className="main-sidebar bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 w-64 fixed h-full overflow-y-auto pb-4 shadow-sm">
            {/* ----------------------------
             * Header / Logo
             * ---------------------------- */}
            <div className="px-4 py-4 border-b border-gray-200 mt-2 mb-1 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 flex-shrink-0 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                    >
                        <div className="relative -mt-2">
                            <AppLogo size="md" variant="blue" />
                        </div>
                    </Link>
                    <div className="flex-1">
                        <div className="text-base font-bold text-blue-700 leading-tight">
                            {BRAND_CONSTANTS.NAME.SHORT}
                        </div>
                        <div className="text-xs text-gray-500 leading-tight font-medium">
                            Application
                        </div>
                    </div>
                </div>
            </div>

            {/* ----------------------------
             * Sidebar Menu
             * ---------------------------- */}
            <div className="sidebar">
                <nav className="flex-1 px-3 py-4 space-y-1.5">
                    {/* ═══════════════════════════════════════════════════════
                     * Dashboard
                     * ═══════════════════════════════════════════════════════ */}
                    <MenuItem
                        href={route("dashboard")}
                        icon={icons.dashboard}
                        label={"Dashboard"}
                        active={route().current("dashboard")}
                    />

                    {/* ═══════════════════════════════════════════════════════
                     * Analytics
                     * ═══════════════════════════════════════════════════════ */}
                    <MenuGroup
                        label={"Analytics"}
                        icon={icons.analytics}
                        active={
                            route().current("user.analytics") ||
                            isActive("user-progress")
                        }
                    >
                        <MenuItem
                            href={route("user.analytics")}
                            label={"User Analytics"}
                            active={route().current("user.analytics")}
                        />

                        {routeExists('user-progress.index') && (
                            <MenuItem
                                href={safeRoute("user-progress.index")}
                                label={"My Progress"}
                                active={isActive("user-progress")}
                            />
                        )}
                    </MenuGroup>

                    {/* ═══════════════════════════════════════════════════════
                     * Articles (with Article Settings - FIX16)
                     * SHOW TO ALL USERS
                     * ═══════════════════════════════════════════════════════ */}
                    <MenuGroup
                        label={"Articles"}
                        icon={icons.article}
                        active={isActive("articles", "article-settings")}
                    >
                        <MenuItem
                            href={route("articles.index")}
                            label={"Article List"}
                            active={routeName === "articles.index"}
                        />
                        {can["article-create"] && (
                            <MenuItem
                                href={route("articles.create")}
                                label={"Create Article"}
                                active={routeName === "articles.create"}
                            />
                        )}
                        {/* ═══════════════════════════════════════════
                         * FIX16: Article Settings (Progression)
                         * Only show if route exists and user has permission
                         * ═══════════════════════════════════════════ */}
                        {can["article-create"] && routeExists('article-settings.index') && (
                            <MenuItem
                                href={safeRoute("article-settings.index")}
                                label={"Article Settings"}
                                active={routeName === "article-settings.index" || isActive("article-settings")}
                            />
                        )}
                    </MenuGroup>

                    {/* ═══════════════════════════════════════════════════════
                     * Homophones
                     * SHOW TO ALL USERS
                     * ═══════════════════════════════════════════════════════ */}
                    <MenuGroup
                        label={"Homophones"}
                        icon={icons.homophone}
                        active={isActive("homophones")}
                    >
                        <MenuItem
                            href={route("homophones.index")}
                            label={"Homophone List"}
                            active={routeName === "homophones.index"}
                        />
                        {can["homophone-create"] && (
                            <MenuItem
                                href={route("homophones.create")}
                                label={"Create Homophone"}
                                active={routeName === "homophones.create"}
                            />
                        )}
                    </MenuGroup>

                    {/* ═══════════════════════════════════════════════════════
                     * Quizzes
                     * SHOW TO ALL USERS
                     * ═══════════════════════════════════════════════════════ */}
                    <MenuGroup
                        label={"Quizzes"}
                        icon={icons.quiz}
                        active={isActive("quizzes")}
                    >
                        <MenuItem
                            href={route("quizzes.index")}
                            label={"Quiz List"}
                            active={routeName === "quizzes.index"}
                        />
                        {can["quiz-create"] && (
                            <MenuItem
                                href={route("quizzes.create")}
                                label={"Create Quiz"}
                                active={routeName === "quizzes.create"}
                            />
                        )}
                    </MenuGroup>

                    {/* ═══════════════════════════════════════════════════════
                     * Authentication Section
                     * ═══════════════════════════════════════════════════════ */}
                    {(can["role-list"] || can["user-list"]) && (
                        <>
                            <div className="text-xs font-bold text-gray-500 mb-2 mt-4 pt-3 px-2 tracking-wider uppercase border-t border-gray-200">
                                {"Authentication"}
                            </div>

                            {/* Roles */}
                            {(can["role-list"] || can["role-create"]) && (
                                <MenuGroup
                                    label={"Roles"}
                                    icon={icons.role}
                                    active={isActive("roles")}
                                >
                                    <MenuItem
                                        href={route("roles.index")}
                                        label={"Roles List"}
                                        active={routeName === "roles.index"}
                                    />
                                    {can["role-create"] && (
                                        <MenuItem
                                            href={route("roles.create")}
                                            label={"Create Role"}
                                            active={
                                                routeName === "roles.create"
                                            }
                                        />
                                    )}
                                </MenuGroup>
                            )}

                            {/* ═══════════════════════════════════════════════════════
                             * Users (with User Learning - FIX16)
                             * ═══════════════════════════════════════════════════════ */}
                            {(can["user-list"] || can["user-create"]) && (
                                <MenuGroup
                                    label={"Users"}
                                    icon={icons.user}
                                    active={isActive("users", "learn")}
                                >
                                    <MenuItem
                                        href={route("users.index")}
                                        label={"User List"}
                                        active={routeName === "users.index"}
                                    />
                                    {can["user-create"] && (
                                        <MenuItem
                                            href={route("users.create")}
                                            label={"Create User"}
                                            active={
                                                routeName === "users.create"
                                            }
                                        />
                                    )}
                                    {/* ═══════════════════════════════════════════
                                     * FIX16: User Learning (My Learning)
                                     * Only show if route exists
                                     * ═══════════════════════════════════════════ */}
                                    {routeExists('learn.articles.index') && (
                                        <MenuItem
                                            href={safeRoute("learn.articles.index")}
                                            label={"User Learning"}
                                            active={isActive("learn")}
                                        />
                                    )}
                                </MenuGroup>
                            )}

                            {/* ═══════════════════════════════════════════════════════
                             * Settings
                             * ═══════════════════════════════════════════════════════ */}
                            {(can["settings-edit"] || can["permissions-manage"] || isAdmin) && (
                                <MenuGroup
                                    label={"Settings"}
                                    icon={icons.settings}
                                    active={isActive("settings", "permissions")}
                                >
                                    {(can["settings-edit"] || isAdmin) && routeExists('settings.index') && (
                                        <MenuItem
                                            href={safeRoute("settings.index")}
                                            label={"User Registration"}
                                            active={routeName === "settings.index" || isActive("settings")}
                                        />
                                    )}

                                    {(can["permissions-manage"] || isAdmin) && routeExists('permissions.index') && (
                                        <MenuItem
                                            href={safeRoute("permissions.index")}
                                            label={"Permission"}
                                            active={routeName === "permissions.index" || isActive("permissions")}
                                        />
                                    )}
                                </MenuGroup>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </aside>
    );
}