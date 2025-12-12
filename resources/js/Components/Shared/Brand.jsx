import React from 'react';
import { Link } from '@inertiajs/react';
import AppLogo from './AppLogo';
import BrandText from './BrandText';

/**
 * Brand Component
 *
 * Combined logo + text component for common use cases
 * Provides flexible composition of brand elements with link wrapper
 *
 * @param {string} logoSize - Logo size (sm|md|lg|xl) - default: 'md'
 * @param {string} logoVariant - Logo color variant (blue|white|original) - default: 'blue'
 * @param {string} textVariant - Text variant (full|short|copyright) - default: 'short'
 * @param {string} textSize - Text size (sm|md|lg) - default: 'md'
 * @param {string} textColor - Text color (blue|white|gray) - default: 'blue'
 * @param {boolean} showText - Show text component - default: true
 * @param {boolean} showLogo - Show logo component - default: true
 * @param {string} linkTo - Link destination - default: '/'
 * @param {string} className - Additional CSS classes
 */
export default function Brand({
    logoSize = 'md',
    logoVariant = 'blue',
    textVariant = 'short',
    textSize = 'md',
    textColor = 'blue',
    showText = true,
    showLogo = true,
    linkTo = '/',
    className = '',
    ...props
}) {
    const content = (
        <>
            {showLogo && (
                <div className="relative -mt-2">
                    <AppLogo size={logoSize} variant={logoVariant} />
                </div>
            )}
            {showText && (
                <BrandText variant={textVariant} size={textSize} color={textColor} />
            )}
        </>
    );

    return (
        <Link
            href={linkTo}
            className={`flex items-center gap-2 flex-shrink-0 ${className}`}
            {...props}
        >
            {content}
        </Link>
    );
}
