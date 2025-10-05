import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    return (
        links?.length > 1 ? (
            <ul className="pagination pagination-sm m-0 float-right">
                {links.map((link, key) => (
                    <li
                        key={key}
                        className={`page-item ${link.active ? 'active' : ''} ${link.url === null ? 'disabled' : ''}`}
                    >
                        {link.url ? (
                            <Link
                                className="page-link"
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                className="page-link"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </li>
                ))}
            </ul>
        ) : null
    );
}
