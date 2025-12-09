import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authentication Store
 *
 * Manages user authentication state, permissions, and roles.
 * Persists to localStorage for session continuity.
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            permissions: [],
            roles: [],
            isAuthenticated: false,

            // Actions
            setUser: (user) => set({
                user,
                permissions: user?.permissions || [],
                roles: user?.roles || [],
                isAuthenticated: !!user,
            }),

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null,
            })),

            setPermissions: (permissions) => set({ permissions }),

            setRoles: (roles) => set({ roles }),

            /**
             * Check if user has a specific permission
             */
            can: (permission) => {
                const { permissions } = get();
                return permissions.includes(permission);
            },

            /**
             * Check if user has any of the specified permissions
             */
            canAny: (permissionArray) => {
                const { permissions } = get();
                return permissionArray.some(permission => permissions.includes(permission));
            },

            /**
             * Check if user has all of the specified permissions
             */
            canAll: (permissionArray) => {
                const { permissions } = get();
                return permissionArray.every(permission => permissions.includes(permission));
            },

            /**
             * Check if user has a specific role
             */
            hasRole: (role) => {
                const { roles } = get();
                return roles.some(r => r.name === role || r === role);
            },

            /**
             * Check if user has any of the specified roles
             */
            hasAnyRole: (roleArray) => {
                const { roles } = get();
                return roleArray.some(role =>
                    roles.some(r => r.name === role || r === role)
                );
            },

            /**
             * Check if user is admin
             */
            isAdmin: () => {
                const { roles } = get();
                return roles.some(r => r.name === 'Admin' || r === 'Admin');
            },

            /**
             * Check if user is student
             */
            isStudent: () => {
                const { roles } = get();
                return roles.some(r => r.name === 'Student' || r === 'Student');
            },

            /**
             * Logout - clear all auth data
             */
            logout: () => set({
                user: null,
                permissions: [],
                roles: [],
                isAuthenticated: false,
            }),

            /**
             * Get user's full name
             */
            getUserName: () => {
                const { user } = get();
                return user?.name || 'Guest';
            },

            /**
             * Get user's email
             */
            getUserEmail: () => {
                const { user } = get();
                return user?.email || '';
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                permissions: state.permissions,
                roles: state.roles,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
