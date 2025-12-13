import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner Component
 *
 * Simple spinner for loading states.
 */
export const LoadingSpinner = ({ size = 'md', color = 'blue', text = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const colors = {
        blue: 'text-blue-600',
        gray: 'text-gray-600',
        white: 'text-white',
        green: 'text-green-600',
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <Loader2 className={`${sizes[size]} ${colors[color]} animate-spin`} />
            {text && (
                <p className="mt-2 text-sm text-gray-600">{text}</p>
            )}
        </div>
    );
};

/**
 * LoadingSkeleton Component
 *
 * Skeleton loader for content placeholders.
 */
export const LoadingSkeleton = ({ type = 'default' }) => {
    if (type === 'card') {
        return (
            <div className="animate-pulse p-4 border border-gray-200 rounded-xl">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'text') {
        return (
            <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
        );
    }

    // Default skeleton
    return (
        <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
        </div>
    );
};

/**
 * FullPageLoader Component
 *
 * Full page loading overlay.
 */
export const FullPageLoader = ({ text = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <LoadingSpinner size="xl" color="blue" />
                <p className="mt-4 text-lg font-medium text-gray-900">{text}</p>
            </div>
        </div>
    );
};

/**
 * ComponentLoader Component
 *
 * Fallback for lazy-loaded components.
 */
export const ComponentLoader = ({ type = 'spinner', minHeight = '200px' }) => {
    return (
        <div
            className="flex items-center justify-center w-full"
            style={{ minHeight }}
        >
            {type === 'spinner' ? (
                <LoadingSpinner size="lg" color="blue" text="Loading component..." />
            ) : (
                <LoadingSkeleton type={type} />
            )}
        </div>
    );
};

/**
 * InlineLoader Component
 *
 * Small inline loader for buttons and inline actions.
 */
export const InlineLoader = ({ text = '' }) => {
    return (
        <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {text && <span>{text}</span>}
        </span>
    );
};

export default {
    LoadingSpinner,
    LoadingSkeleton,
    FullPageLoader,
    ComponentLoader,
    InlineLoader,
};
