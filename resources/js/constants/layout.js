/**
 * Layout Constants
 *
 * Centralized layout spacing and container definitions
 * Single source of truth for all padding, width, and spacing values
 */

export const LAYOUT_CONSTANTS = {
    // Container max widths
    CONTAINER_WIDTH: {
        DEFAULT: 'max-w-7xl',      // 1280px - main content
        ADMIN: 'max-w-full',       // Full width for admin
        NARROW: 'max-w-4xl',       // 896px - forms, articles
        WIDE: 'max-w-screen-2xl'   // 1536px - dashboards
    },

    // Responsive horizontal padding (Option A: Moderate & Professional)
    CONTAINER_PADDING: {
        DEFAULT: 'px-6 sm:px-8 md:px-12 lg:px-16',
        ADMIN: 'px-2 md:px-4 lg:px-6',
        NONE: 'px-0'
    },

    // Vertical spacing
    SECTION_SPACING: {
        SMALL: 'py-6',
        MEDIUM: 'py-12',
        LARGE: 'py-16',
        XLARGE: 'py-24'
    },

    // Complete container classes (for convenience)
    CONTAINER_CLASSES: {
        DEFAULT: 'max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16',
        ADMIN: 'max-w-full px-2 md:px-4 lg:px-6',
    },

    // Standardized Rounded Corners (Use consistently across app)
    ROUNDED: {
        SMALL: 'rounded-lg',      // 8px - small buttons, badges
        MEDIUM: 'rounded-xl',     // 12px - cards, inputs, modals
        LARGE: 'rounded-2xl',     // 16px - major cards, containers
        FULL: 'rounded-full'      // 9999px - circular elements (avatars)
    }
};
