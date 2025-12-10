import React, { useState } from 'react';

/**
 * Reusable action button with tooltip
 * Replaces 10+ duplicate tooltip button patterns
 *
 * @param {function} onClick - Click handler
 * @param {React.Component} icon - Lucide icon component
 * @param {string} tooltip - Tooltip text
 * @param {string} variant - Color variant ("blue", "green", "red", "yellow", "gray")
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} className - Additional CSS classes
 */
export default function ActionButton({
    onClick,
    icon: Icon,
    tooltip,
    variant = "blue",
    disabled = false,
    className = "",
}) {
    const [showTooltip, setShowTooltip] = useState(false);

    const getVariantClasses = () => {
        const variants = {
            blue: "bg-blue-500 hover:bg-blue-600 text-white",
            green: "bg-green-500 hover:bg-green-600 text-white",
            red: "bg-red-500 hover:bg-red-600 text-white",
            yellow: "bg-yellow-500 hover:bg-yellow-600 text-white",
            gray: "bg-gray-500 hover:bg-gray-600 text-white",
        };
        return variants[variant] || variants.blue;
    };

    return (
        <div
            className="relative group"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                onClick={onClick}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-xl ${getVariantClasses()} transition ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            >
                {Icon && <Icon className="w-4 h-4" />}
            </button>
            {tooltip && showTooltip && !disabled && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs px-3 py-1 rounded-lg shadow-md border whitespace-nowrap z-10">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-white"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
