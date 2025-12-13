import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable search bar component
 * Replaces 8+ duplicate search input implementations
 *
 * @param {string} value - Current search value
 * @param {function} onChange - Handler for search input change
 * @param {string} placeholder - Placeholder text (default: "Search...")
 * @param {string} className - Additional CSS classes
 */
export default function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    className = "",
}) {
    return (
        <div className={`inline-flex items-center gap-2 px-3 rounded-xl border hover:shadow-sm transition text-sm bg-white ${className}`}>
            <Search className="w-4 h-4 text-gray-500" />
            <input
                type="text"
                className="px-2 w-[250px] py-2 rounded-xl border-none border-gray-300 text-sm focus:outline-none focus:ring-0"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
