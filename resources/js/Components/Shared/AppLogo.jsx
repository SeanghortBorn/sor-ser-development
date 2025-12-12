import React from 'react';
import { BRAND_CONSTANTS } from '@/constants/brand';

const LOGO_SIZES = {
    sm: { width: 24, height: 24, className: 'w-6 h-6' },
    md: { width: 36, height: 36, className: 'w-9 h-9' },
    lg: { width: 64, height: 64, className: 'w-16 h-16' },
    xl: { width: 80, height: 80, className: 'w-20 h-20' }
};

/**
 * AppLogo Component
 *
 * Reusable logo component with size and color variants
 * Replaces 3 duplicate logo implementations across the codebase
 *
 * @param {string} size - Logo size (sm|md|lg|xl) - default: 'md'
 * @param {string} variant - Color variant (blue|white|original) - default: 'blue'
 * @param {number} width - Custom width override
 * @param {number} height - Custom height override
 * @param {string} className - Additional CSS classes
 */
export default function AppLogo({
    size = 'md',
    variant = 'blue',
    width,
    height,
    className = '',
    ...props
}) {
    const sizeConfig = LOGO_SIZES[size] || LOGO_SIZES.md;
    const filter = BRAND_CONSTANTS.FILTERS[variant.toUpperCase()] ||
                   BRAND_CONSTANTS.FILTERS.BLUE;

    const finalWidth = width || sizeConfig.width;
    const finalHeight = height || sizeConfig.height;
    const sizeClass = className || sizeConfig.className;

    return (
        <img
            src={BRAND_CONSTANTS.LOGO.PATH}
            alt={BRAND_CONSTANTS.LOGO.ALT_TEXT}
            width={finalWidth}
            height={finalHeight}
            className={sizeClass}
            style={{ filter: filter === 'none' ? undefined : filter }}
            loading="lazy"
            {...props}
        />
    );
}
