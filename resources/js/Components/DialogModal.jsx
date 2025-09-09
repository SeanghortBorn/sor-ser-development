import React from 'react';
import Modal from './Modal';

export default function DialogModal({
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose,
    title,
    content,
    footer,
}) {
    return (
        <Modal show={show} maxWidth={maxWidth} closeable={closeable} onClose={onClose}>
            <div className="px-6 py-4">
                <div className="text-lg font-medium text-gray-900">
                    {title}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    {content}
                </div>
            </div>

            <div className="flex flex-row justify-end px-6 py-4 bg-gray-100 text-end">
                {footer}
            </div>
        </Modal>
    );
}
