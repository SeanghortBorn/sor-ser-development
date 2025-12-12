/**
 * Brand Constants
 *
 * Centralized brand identity constants
 * Single source of truth for brand name, colors, logo paths, and filters
 */

export const BRAND_CONSTANTS = {
    // Brand name variations
    NAME: {
        SHORT: 'Sor-Ser',
        SHORT_KH: 'សរសេរ',
        FULL: 'Sor-Ser Application',
        FULL_KH: 'កម្មវិធីសរសេរ'
    },

    // Tagline variations
    TAGLINE: {
        EN: 'Khmer Homophone Learning Platform',
        KH: 'វេទិកាសិក្សាសូរដូច'
    },

    // Copyright text (dynamic year)
    COPYRIGHT: {
        YEAR: new Date().getFullYear(),
        TEXT: `© ${new Date().getFullYear()}`,
        FULL: `© ${new Date().getFullYear()} All rights reserved.`
    },

    // Logo assets
    LOGO: {
        PATH: '/images/sor-ser logo.png',
        PATH_WEBP: '/images/sor-ser logo.webp',
        ALT_TEXT: 'Sor-Ser logo'
    },

    // Brand colors
    COLORS: {
        PRIMARY: '#0052CC',     // Blue (matches logo filter)
        SECONDARY: '#0F5BFF',
        DARK: '#1D2B60'
    },

    // Logo CSS filters
    FILTERS: {
        BLUE: 'brightness(0) saturate(100%) invert(21%) sepia(94%) saturate(2783%) hue-rotate(210deg) brightness(96%) contrast(97%)',
        WHITE: 'invert brightness-0',
        NONE: 'none'
    }
};
