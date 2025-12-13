import React, { memo } from 'react';

/**
 * MetricCard Component
 *
 * Displays a single metric with label, value, and optional icon.
 * Used in statistics panels and dashboards.
 */
const MetricCard = memo(({
    label,
    value,
    icon,
    color = 'blue',
    suffix = '',
    trend = null, // 'up', 'down', or null
    size = 'md', // 'sm', 'md', 'lg'
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        red: 'bg-red-50 border-red-200 text-red-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        gray: 'bg-gray-50 border-gray-200 text-gray-700',
    };

    const sizeClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const valueSizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
    };

    return (
        <div className={`border rounded-xl ${sizeClasses[size]} ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-75">{label}</p>
                    <p className={`${valueSizeClasses[size]} font-bold mt-1`}>
                        {value}{suffix}
                    </p>
                    {trend && (
                        <span className={`text-xs mt-1 inline-block ${
                            trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {trend === 'up' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
                {icon && (
                    <div className="text-3xl opacity-50">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
