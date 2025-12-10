import { useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Custom hook for managing search functionality
 * Eliminates duplicate search logic across Index pages
 *
 * @param {string} routeName - The route name for search (e.g., 'articles.index')
 * @param {string} initialSearch - Initial search value from server
 * @returns {object} - Search state and handlers
 */
export function useSearch(routeName, initialSearch = '') {
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    /**
     * Handle search input change and update URL
     */
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        router.get(
            route(routeName),
            { search: value },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    /**
     * Clear search and reload
     */
    const clearSearch = () => {
        setSearchTerm('');
        router.get(
            route(routeName),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    return {
        searchTerm,
        handleSearch,
        clearSearch,
    };
}
