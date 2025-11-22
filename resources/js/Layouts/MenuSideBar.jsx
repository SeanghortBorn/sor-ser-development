import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

function MenuGroup({ label, icon, children, active }) {
    const [open, setOpen] = useState(active);

    useEffect(() => {
        setOpen(active);
    }, [active]);

    return (
        <div className="mb-2">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`flex items-center w-full px-2 py-2.5 rounded-lg font-medium transition-all duration-300 group ${
                    open || active
                        ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                }`}
            >
                <span
                    className={`mr-3 transition-colors duration-300 ${
                        open || active
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-600"
                    }`}
                >
                    {icon}
                </span>
                <span className="flex-1 text-left text-sm font-semibold">
                    {label}
                </span>
                <svg
                    className={`w-4 h-4 ml-auto transition-all duration-300 ${
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
                className={`transition-all duration-300 overflow-hidden ${
                    open ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
            >
                <div className="pl-2 space-y-1">{children}</div>
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
            className={`flex items-center px-2 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                active
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "hover:bg-gray-50 text-gray-700 border-l-4 border-transparent"
            }`}
        >
            {/* Icon */}
            <span
                className={`mr-3 ${active ? "text-blue-600" : "text-gray-400"}`}
            >
                {icon}
            </span>

            {/* Label */}
            <span
                className={`text-sm transition-colors duration-200 ${
                    active
                        ? "text-blue-700"
                        : "text-gray-600 group-hover:text-gray-900"
                }`}
            >
                {label}
            </span>
        </Link>
    );
}

/* ----------------------------
 * Sidebar Component
 * ---------------------------- */
export default function MenuSideBar({ lang, setLang }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const routeName = route().current();

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
    };

    return (
        <aside className="main-sidebar bg-white border-r border-gray-200 w-64 fixed h-full overflow-y-auto pb-4">
            {/* ----------------------------
             * Header / Logo
             * ---------------------------- */}
            <div className="px-4 py-3 border-b border-gray-100 mt-2">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 flex-shrink-0"
                    >
                        <div className="relative -mt-2">
                            <img
                                src="/images/sor-ser logo.png"
                                alt="Sor-Ser logo"
                                className="h-9 w-9"
                                style={{
                                    filter: "brightness(0) saturate(100%) invert(21%) sepia(94%) saturate(2783%) hue-rotate(210deg) brightness(96%) contrast(97%)",
                                }}
                            />
                        </div>
                    </Link>
                    <div className="flex-1">
                        <div className="text-base font-semibold text-blue-700 leading-tight">
                            Sor-Ser
                        </div>
                        <div className="text-xs text-gray-500 leading-tight">
                            Application
                        </div>
                    </div>
                </div>
            </div>

            {/* ----------------------------
             * Sidebar Menu
             * ---------------------------- */}
            <div className="sidebar">
                <nav className="flex-1 px-2 py-3 space-y-2">
                    {/* Dashboard */}
                    {/* <MenuItem
                        href={route("dashboard")}
                        icon={icons.dashboard}
                        label={"Dashboard"}
                        active={isActive("dashboard")}
                    /> */}

                    <MenuGroup
                        label={"Dashboard"}
                        icon={icons.dashboard}
                        active={
                            route().current("dashboard") ||
                            route().current("student.analytics")
                        }
                    >
                        <MenuItem
                            href={route("dashboard")}
                            label={"Dashboard Analytics"}
                            active={route().current("dashboard")}
                        />

                        <MenuItem
                            href={route("student.analytics")}
                            label={"Student Analytics"}
                            active={route().current("student.analytics")}
                        />
                    </MenuGroup>

                    {(can["article-list"] || can["article-create"]) && (
                        <MenuGroup
                            label={"Articles"}
                            icon={icons.article}
                            active={isActive("articles")}
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
                        </MenuGroup>
                    )}

                    {(can["homophone-list"] || can["homophone-create"]) && (
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
                    )}

                    {(can["quiz-list"] || can["quiz-create"]) && (
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
                    )}

                    {/* Authentication Section */}
                    {(can["role-list"] || can["user-list"]) && (
                        <>
                            <div className="text-xs font-semibold text-gray-400 mb-2 pt-2 px-2 tracking-wider uppercase">
                                {"Authentication"}
                            </div>

                            {/* <MenuItem
                                href={route("roles.index")}
                                icon={icons.role}
                                label={t("Roles List", "បញ្ជីតួនាទី")}
                                active={routeName === "roles.index"}
                            /> */}

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

                            {/* Users */}
                            {/* <MenuItem
                                href={route("users.index")}
                                icon={icons.user}
                                label={t("User List", "បញ្ជីអ្នកប្រើប្រាស់")}
                                active={routeName === "users.index"}
                            /> */}
                            {(can["user-list"] || can["user-create"]) && (
                                <MenuGroup
                                    label={"Users"}
                                    icon={icons.user}
                                    active={isActive("users")}
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
                                </MenuGroup>
                            )}
                        </>
                    )}

                    {/* Feedback Section */}
                    {/* <MenuItem
                        href={route("feedback.index")}
                        icon={icons.feedback}
                        label={"Feedback"}
                        active={routeName === "feedback.index"}
                    /> */}
                </nav>
            </div>
        </aside>
    );
}
