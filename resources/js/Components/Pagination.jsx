import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, currentPage, total, perPage }) {
    if (!links || links.length <= 1) return null;

    // Calculate total pages
    const totalPages = Math.ceil(total / perPage);
    const current = currentPage || 1;

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7; // Maximum number of page buttons to show

        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (current > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, current - 1);
            const end = Math.min(totalPages - 1, current + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (current < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    // Get Previous and Next URLs from links
    const prevLink = links.find(link => link.label.includes('Previous') || link.label.includes('&laquo;'));
    const nextLink = links.find(link => link.label.includes('Next') || link.label.includes('&raquo;'));

    const baseClasses = "px-4 py-2 font-medium text-sm transition-all duration-200 ease-in-out";
    const shapeClasses = "rounded-2xl";

    return (
        <nav className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            {prevLink && (
                prevLink.url ? (
                    <Link
                        href={prevLink.url}
                        className={`${baseClasses} ${shapeClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm`}
                    >
                        ← Previous
                    </Link>
                ) : (
                    <span
                        className={`${baseClasses} ${shapeClasses} bg-gray-100 text-gray-400 cursor-not-allowed`}
                    >
                        ← Previous
                    </span>
                )
            )}

            {/* Page Numbers */}
            {pageNumbers.map((page, index) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-2 text-gray-500"
                        >
                            ...
                        </span>
                    );
                }

                const isActive = page === current;
                const pageLink = links.find(link => {
                    const linkLabel = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                    return linkLabel === String(page);
                });

                const stateClasses = isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm";

                return pageLink && pageLink.url ? (
                    <Link
                        key={page}
                        href={pageLink.url}
                        className={`${baseClasses} ${shapeClasses} ${stateClasses}`}
                    >
                        {page}
                    </Link>
                ) : (
                    <span
                        key={page}
                        className={`${baseClasses} ${shapeClasses} ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}
                    >
                        {page}
                    </span>
                );
            })}

            {/* Next Button */}
            {nextLink && (
                nextLink.url ? (
                    <Link
                        href={nextLink.url}
                        className={`${baseClasses} ${shapeClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm`}
                    >
                        Next →
                    </Link>
                ) : (
                    <span
                        className={`${baseClasses} ${shapeClasses} bg-gray-100 text-gray-400 cursor-not-allowed`}
                    >
                        Next →
                    </span>
                )
            )}
        </nav>
    );
}
