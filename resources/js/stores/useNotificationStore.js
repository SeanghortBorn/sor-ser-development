import { create } from 'zustand';

/**
 * Notification Store
 *
 * Manages toast notifications and alerts.
 */
const useNotificationStore = create((set, get) => ({
    // State
    notifications: [],
    nextId: 1,

    // Actions
    addNotification: (notification) => {
        const { nextId } = get();
        const id = nextId;

        const newNotification = {
            id,
            type: notification.type || 'info', // success, error, warning, info
            title: notification.title || '',
            message: notification.message,
            duration: notification.duration || 5000,
            autoClose: notification.autoClose !== false,
            createdAt: Date.now(),
        };

        set((state) => ({
            notifications: [...state.notifications, newNotification],
            nextId: nextId + 1,
        }));

        // Auto-remove notification after duration
        if (newNotification.autoClose) {
            setTimeout(() => {
                get().removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    },

    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
    })),

    clearAll: () => set({ notifications: [] }),

    // Convenience methods
    success: (message, title = 'Success', options = {}) => {
        return get().addNotification({
            type: 'success',
            title,
            message,
            ...options,
        });
    },

    error: (message, title = 'Error', options = {}) => {
        return get().addNotification({
            type: 'error',
            title,
            message,
            duration: 7000, // Errors stay longer
            ...options,
        });
    },

    warning: (message, title = 'Warning', options = {}) => {
        return get().addNotification({
            type: 'warning',
            title,
            message,
            ...options,
        });
    },

    info: (message, title = 'Info', options = {}) => {
        return get().addNotification({
            type: 'info',
            title,
            message,
            ...options,
        });
    },

    /**
     * Show loading notification
     */
    loading: (message, title = 'Loading', options = {}) => {
        return get().addNotification({
            type: 'info',
            title,
            message,
            autoClose: false, // Loading notifications don't auto-close
            ...options,
        });
    },

    /**
     * Update an existing notification
     */
    updateNotification: (id, updates) => set((state) => ({
        notifications: state.notifications.map(n =>
            n.id === id ? { ...n, ...updates } : n
        ),
    })),

    /**
     * Get notification by ID
     */
    getNotification: (id) => {
        const { notifications } = get();
        return notifications.find(n => n.id === id);
    },

    /**
     * Get notifications by type
     */
    getByType: (type) => {
        const { notifications } = get();
        return notifications.filter(n => n.type === type);
    },
}));

export default useNotificationStore;
