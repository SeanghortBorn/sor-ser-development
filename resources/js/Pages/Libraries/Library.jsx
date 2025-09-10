import HeaderNavbar from '@/Components/Navbars/HeaderNavbar';
import { Head, Link } from '@inertiajs/react';

export default function Library() {
    return (
        <>
            <Head title="Library" />
            <HeaderNavbar />
            <div className="bg-gray-50 text-black/50 dark:text-white/50">
                    <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                        <p className="text-lg font-semibold text-blue-400">Welcome to the Library Page</p>
                    </div>
            </div>
        </>
    );
}
