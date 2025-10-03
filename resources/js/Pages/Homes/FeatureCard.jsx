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
    <div className="group bg-white rounded-xl p-6 hover:shadow-md transition-all duration-300 border border-gray-100">
        <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-2">
                {title}
            </h3>
        </div>
        <ul className="space-y-3 ml-2">
            {bullets.map((b, i) => (
                <li
                    key={i}
                    className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed"
                >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                    <span className="text-gray-500 text-sm font-medium">
                        {b}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);
