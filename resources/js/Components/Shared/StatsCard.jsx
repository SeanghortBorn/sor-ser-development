import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Reusable stats card component
 * Replaces duplicate stats card displays
 *
 * @param {string} label - The stat label
 * @param {string|number} value - The stat value
 * @param {string} icon - Lucide icon name
 * @param {string} color - Text color class (e.g., "text-blue-500")
 * @param {string} borderColor - Border color class (e.g., "border-blue-100")
 * @param {string} bgColor - Background color class (e.g., "bg-blue-50")
 * @param {string} description - Optional description text
 * @param {string} className - Additional CSS classes
 */
export default function StatsCard({
    label,
    value,
    icon,
    color = "text-blue-500",
    borderColor = "border-blue-100",
    bgColor = "bg-blue-50",
    description = "",
    className = "",
}) {
    // Get the icon component dynamically
    const Icon = LucideIcons[icon] || LucideIcons.Circle;

    return (
        <div className={`bg-white px-3 pb-2 pt-3 border-l-4 ${borderColor} shadow-sm rounded-xl flex flex-col hover:shadow-sm transition-all duration-200 ${className}`}>
            <div className="flex items-center justify-between">
                <p className="text-gray-800 text-base font-semibold">{label}</p>
                <div className={`${bgColor} p-2 rounded-xl`}>
                    <Icon className={`w-7 h-7 ${color}`} />
                </div>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1">{value}</h2>
            {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );
}
