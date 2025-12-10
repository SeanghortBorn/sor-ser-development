import { useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Custom hook for managing delete modal state and logic
 * Eliminates duplicate modal management code across Index pages
 *
 * @param {string} resourceRoute - The route name for deletion (e.g., 'articles.destroy')
 * @returns {object} - Modal state and handlers
 */
export function useDeleteModal(resourceRoute) {
    const [showModal, setShowModal] = useState(false);
    const [target, setTarget] = useState(null);
    const [processing, setProcessing] = useState(false);

    /**
     * Open the modal with the target item
     */
    const openModal = (item) => {
        setTarget(item);
        setShowModal(true);
    };

    /**
     * Close the modal and reset state
     */
    const closeModal = () => {
        if (!processing) {
            setShowModal(false);
            setTarget(null);
        }
    };

    /**
     * Confirm deletion and send request
     */
    const confirmDelete = (e) => {
        e?.preventDefault?.();
        if (!target) return;

        setProcessing(true);
        router.delete(route(resourceRoute, target.id), {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setShowModal(false);
                setTarget(null);
            },
        });
    };

    return {
        showModal,
        target,
        processing,
        openModal,
        closeModal,
        confirmDelete,
    };
}

/**
 * Custom hook for managing generic confirmation modal (block, clear, etc.)
 *
 * @param {function} onConfirm - The callback function to execute on confirmation
 * @returns {object} - Modal state and handlers
 */
export function useConfirmationModal(onConfirm) {
    const [showModal, setShowModal] = useState(false);
    const [target, setTarget] = useState(null);
    const [processing, setProcessing] = useState(false);

    const openModal = (item) => {
        setTarget(item);
        setShowModal(true);
    };

    const closeModal = () => {
        if (!processing) {
            setShowModal(false);
            setTarget(null);
        }
    };

    const confirm = async () => {
        if (!target && target !== null) return;

        setProcessing(true);
        try {
            await onConfirm(target);
        } finally {
            setProcessing(false);
            setShowModal(false);
            setTarget(null);
        }
    };

    return {
        showModal,
        target,
        processing,
        openModal,
        closeModal,
        confirm,
    };
}
