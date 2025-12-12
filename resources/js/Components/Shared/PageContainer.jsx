import React from 'react';
import { LAYOUT_CONSTANTS } from '@/constants/layout';

/**
 * PageContainer Component
 *
 * Consistent page-level wrapper ensuring all sections align horizontally
 * Provides standardized max-width and responsive padding
 *
 * @param {string} width - Container width variant (default|admin|narrow|wide)
 * @param {string} padding - Padding variant (default|admin|none)
 * @param {boolean} centered - Apply flex centering
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Child components
 */
export default function PageContainer({
    width = 'default',
    padding = 'default',
    centered = false,
    className = '',
    children,
    ...props
}) {
    const widthClass = LAYOUT_CONSTANTS.CONTAINER_WIDTH[width.toUpperCase()] ||
                       LAYOUT_CONSTANTS.CONTAINER_WIDTH.DEFAULT;
    const paddingClass = LAYOUT_CONSTANTS.CONTAINER_PADDING[padding.toUpperCase()] ||
                         LAYOUT_CONSTANTS.CONTAINER_PADDING.DEFAULT;

    const centeredClass = centered ? 'flex flex-col items-center' : '';

    return (
        <div
            className={`${widthClass} mx-auto ${paddingClass} ${centeredClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
