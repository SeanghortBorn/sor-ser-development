import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ProfileCard from '@/Components/Shared/ProfileCard';
import { AnimatePresence, motion } from 'framer-motion';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('categories.index')}
                                    active={route().current('categories.index')}
                                >
                                    Categories
                                </NavLink>
                                
                                {/* ═══════════════════════════════════════════ */}
                                {/* FIX16: Article Settings Link (Admin)        */}
                                {/* ═══════════════════════════════════════════ */}
                                <NavLink
                                    href={route('article-settings.index')}
                                    active={route().current('article-settings.*')}
                                >
                                    Article Settings
                                </NavLink>
                                
                                {/* FIX16: My Learning Link (User)              */}
                                <NavLink
                                    href={route('learn.articles.index')}
                                    active={route().current('learn.articles.*')}
                                >
                                    My Learning
                                </NavLink>
                                {/* ═══════════════════════════════════════════ */}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center" ref={dropdownRef}>
                            <div className="relative ms-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-xl bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 hover:bg-gray-50 hover:shadow-sm transition duration-150 ease-in-out"
                                    onClick={() => setDropdownOpen((v) => !v)}
                                >
                                    <img src="/images/person-icon.svg" className="h-9 w-9 rounded-full mr-2" alt="User avatar" />
                                    <span className="mr-2">{user.name}</span>
                                    <svg className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                            className="absolute right-0 mt-2 w-[340px] bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden origin-top-right"
                                        >
                                            <ProfileCard
                                                user={user}
                                                className="border-0 p-4"
                                                actions={(
                                                    <div className="flex gap-3">
                                                        <Link
                                                            href={route('profile.edit')}
                                                            onClick={() => setDropdownOpen(false)}
                                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-xl text-gray-700 border hover:bg-gray-50 transition-all"
                                                        >
                                                            Profile
                                                        </Link>
                                                        <Link
                                                            method="post"
                                                            href={route('logout')}
                                                            as="button"
                                                            onClick={() => setDropdownOpen(false)}
                                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all"
                                                        >
                                                            Log Out
                                                        </Link>
                                                    </div>
                                                )}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100  focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        
                        {/* ═══════════════════════════════════════════ */}
                        {/* FIX16: Mobile Navigation Links              */}
                        {/* ═══════════════════════════════════════════ */}
                        <ResponsiveNavLink
                            href={route('article-settings.index')}
                            active={route().current('article-settings.*')}
                        >
                            Article Settings
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('learn.articles.index')}
                            active={route().current('learn.articles.*')}
                        >
                            My Learning
                        </ResponsiveNavLink>
                        {/* ═══════════════════════════════════════════ */}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}