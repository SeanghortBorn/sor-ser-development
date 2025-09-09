import { Link, usePage } from '@inertiajs/react';

export default function HeaderNavbar() {
    const { auth } = usePage().props;

    return (
        <header className="top-0 left-0 w-full bg-white shadow-sm z-50 sticky">
            <nav className="flex items-center justify-between px-24 py-3">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <span className="flex items-center gap-2">
                            {/* Logo icon */}
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="8" fill="#2563EB" />
                                <path d="M16 10L22 13.5V19.5L16 23L10 19.5V13.5L16 10Z" fill="white" />
                            </svg>
                            <span className="font-bold text-xl text-blue-900">Sor Ser</span>
                        </span>
                    </Link>
                    <Link href="/home" className="text-blue-900 font-medium px-3">Home</Link>
                    <Link href="/checktext" className="text-blue-900 font-medium px-3">Check Text</Link>
                    <Link href="/quiz" className="text-blue-900 font-medium px-3">Quiz Practice</Link>
                    <div className="relative group">
                        <button className="text-blue-900 font-medium px-3 flex items-center">More <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.063a.75.75 0 111.08 1.04l-4.25 4.667a.75.75 0 01-1.08 0l-4.25-4.667a.75.75 0 01.02-1.06z" /></svg></button>
                        <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                            <Link href="/about" className="block px-4 py-2 text-blue-900 hover:bg-gray-100">About</Link>
                            <Link href="/contact" className="block px-4 py-2 text-blue-900 hover:bg-gray-100">Contact</Link>
                        </div>
                    </div>
                </div>

                {/* Auth Section */}
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-blue-900 font-medium px-3"
                            >
                                Login
                            </Link>
                            <Link
                                href={route('register')}
                                className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2"
                            >
                                Get Start
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
