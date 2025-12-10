import React from 'react';

/**
 * Reusable data table component
 * Replaces nearly identical table structures in all Index pages
 *
 * @param {array} columns - Column configuration [{key, label, render, className}]
 * @param {array} data - Data array to display
 * @param {string} emptyMessage - Message when no data (default: "No data available")
 * @param {string} className - Additional CSS classes
 */
export default function DataTable({
    columns = [],
    data = [],
    emptyMessage = "No data available",
    className = "",
}) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full table-auto">
                <thead className="bg-blue-600 text-white text-sm">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-left font-semibold ${column.headerClassName || ''}`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-8 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className="hover:bg-gray-50 transition"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-4 py-3 ${column.className || ''}`}
                                    >
                                        {column.render
                                            ? column.render(row, rowIndex)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
