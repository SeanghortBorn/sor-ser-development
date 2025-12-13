import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 1) return null;

    return (
        <nav className="flex items-center justify-center gap-2">
            {links.map((link, key) => {
                const isActive = link.active;
                const isDisabled = link.url === null;
                
                // Parse label to clean up Previous/Next text
                let label = link.label;
                if (label.includes('Previous')) label = '← Previous';
                if (label.includes('Next')) label = 'Next →';

                const baseClasses = "px-4 py-2 font-medium text-sm transition-all duration-200 ease-in-out";
                const shapeClasses = "rounded-2xl";
                
                let stateClasses = "";
                if (isDisabled) {
                    stateClasses = "bg-gray-100 text-gray-400 cursor-not-allowed";
                } else if (isActive) {
                    stateClasses = "bg-blue-600 text-white shadow-sm";
                } else {
                    stateClasses = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm";
                }

                const className = `${baseClasses} ${shapeClasses} ${stateClasses}`;

                if (isDisabled) {
                    return (
                        <span
                            key={key}
                            className={className}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={key}
                        href={link.url}
                        className={className}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </nav>
    );
}
