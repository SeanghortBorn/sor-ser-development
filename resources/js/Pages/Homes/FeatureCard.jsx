import React from "react";

export const Icon = ({ children, className = "w-6 h-6" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
    >
        {children}
    </svg>
);

export const FeatureCard = ({ title, bullets, icon }) => (
    <div className="group bg-white rounded-xl p-6 hover:shadow-sm transition-all duration-300 border border-gray-100">
        <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-2">
                {title}
            </h3>
        </div>
        <ul className="space-y-3 ml-2">
            {bullets.map((bullet, i) => {
                // Check if bullet is an object with main/subs structure
                if (typeof bullet === 'object' && bullet.main) {
                    return (
                        <li key={i} className="space-y-2">
                            {/* Main bullet point */}
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                <span className="text-gray-900 text-sm font-semibold">
                                    {bullet.main}
                                </span>
                            </div>
                            {/* Sub bullet points */}
                            {bullet.subs && bullet.subs.length > 0 && (
                                <ul className="space-y-1.5 ml-5">
                                    {bullet.subs.map((sub, j) => (
                                        <li key={j} className="flex items-start gap-2">
                                            <span className="flex-shrink-0 text-gray-400 text-xs mt-1">•</span>
                                            <span className="text-gray-500 text-sm font-medium">
                                                {sub}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    );
                }
                // Fallback for simple string bullets (backward compatible)
                return (
                    <li
                        key={i}
                        className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed"
                    >
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                        <span className="text-gray-500 text-sm font-medium">
                            {bullet}
                        </span>
                    </li>
                );
            })}
        </ul>
    </div>
);
