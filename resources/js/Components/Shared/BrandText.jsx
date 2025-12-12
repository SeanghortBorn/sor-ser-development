import React from 'react';
import { BRAND_CONSTANTS } from '@/constants/brand';

const TEXT_SIZES = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
};

const TEXT_COLORS = {
    blue: 'text-[#0052CC]',
    white: 'text-white',
    gray: 'text-gray-400'
};

/**
 * BrandText Component
 *
 * Reusable brand text component with variants
 * Single source for all brand text across the application
 *
 * @param {string} variant - Text variant (full|short|copyright) - default: 'short'
 * @param {string} size - Text size (sm|md|lg) - default: 'md'
 * @param {string} color - Text color (blue|white|gray) - default: 'blue'
 * @param {string} className - Additional CSS classes
 */
export default function BrandText({
    variant = 'short',
    size = 'md',
    color = 'blue',
    className = '',
    ...props
}) {
    const sizeClass = TEXT_SIZES[size] || TEXT_SIZES.md;
    const colorClass = TEXT_COLORS[color] || TEXT_COLORS.blue;

    let text;
    switch (variant) {
        case 'full':
            text = BRAND_CONSTANTS.NAME.FULL;
            break;
        case 'copyright':
            text = BRAND_CONSTANTS.COPYRIGHT.TEXT;
            break;
        case 'short':
        default:
            text = BRAND_CONSTANTS.NAME.SHORT;
            break;
    }

    return (
        <span className={`font-semibold ${sizeClass} ${colorClass} ${className}`} {...props}>
            {text}
        </span>
    );
}
