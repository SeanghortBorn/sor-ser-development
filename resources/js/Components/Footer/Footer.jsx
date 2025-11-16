import React from "react";
import { Link } from "@inertiajs/react";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 pt-12 pb-6 px-8 w-full">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12 pb-8">
                <div className="flex flex-col gap-2">
                    <span className="text-[16px] font-semibold mb-4 text-gray-400">
                        INFORMATION
                    </span>
                    <Link
                        href="#"
                        className="text-gray-300 hover:text-white text-[16px] mb-2"
                    >
                        Our Plans
                    </Link>
                    <Link
                        href="#"
                        className="text-gray-300 hover:text-white text-[16px] mb-2"
                    >
                        Help Center
                    </Link>
                    <Link
                        href="#"
                        className="text-gray-300 hover:text-white text-[16px]"
                    >
                        Contact
                    </Link>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[16px] font-semibold mb-4 text-gray-400">
                        LEGAL
                    </span>
                    <Link
                        href="#"
                        className="text-gray-300 hover:text-white text-[16px] mb-2"
                    >
                        Terms of Use
                    </Link>
                    <Link
                        href="#"
                        className="text-gray-300 hover:text-white text-[16px] mb-2"
                    >
                        Privacy Policy
                    </Link>
                    <span className="invisible mb-2">&nbsp;</span>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2 flex-shrink-0"
                    >
                        <div class="relative -mt-2">
                            <img
                                src="/images/sor-ser logo.png"
                                alt="Sor-Ser logo"
                                class="h-20 w-20 invert brightness-0"
                            />
                        </div>
                    </Link>
                </div>
            </div>
            <hr className="border-gray-700 mb-6" />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-400 text-[16px] px-2">
                <span>© 2025 Sor Ser</span>
                <span>All rights reserved.</span>
            </div>
        </footer>
    );
}
