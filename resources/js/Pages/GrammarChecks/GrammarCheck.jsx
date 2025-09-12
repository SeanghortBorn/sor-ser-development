import HeaderNavbar from '@/Components/Navbars/HeaderNavbar';
import { Head, Link } from '@inertiajs/react';
import SidebarHistory from '@/Components/GrammarChecks/SidebarHistory';
import SidebarCheckGrammar from "@/Components/GrammarChecks/SidebarCheckGrammar";
import Footer from '@/Components/Footer/Footer';

export default function GrammarCheck() {
    return (
        <>
            <Head title="Grammar Check" />
            <HeaderNavbar />
            <div className="bg-gray-50 min-h-screen flex flex-row">
                {/* Left sidebar with document navigation */}
                <SidebarHistory />
                {/* Main content */}
                <div className="flex-1 flex flex-col items-start justify-start px-16 py-20">
                    <h1 className="text-xl font-semibold mb-4">Test</h1>
                    <textarea
                        className="w-full max-w-2xl h-16 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg mb-4"
                        defaultValue="Hello My name is Socheat i study"
                    />
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 mb-8">Check Text</button>
                </div>
            
                <SidebarCheckGrammar />
            </div>
        </>
    );
}
