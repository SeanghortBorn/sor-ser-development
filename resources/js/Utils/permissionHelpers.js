/**
 * Check if user has a specific permission
 *
 * @param {object} auth - The auth object from Inertia props
 * @param {string} permission - The permission name
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (auth, permission) => {
    return auth?.can?.[permission] ?? false;
};

/**
 * Check if user has a specific role
 *
 * @param {object} auth - The auth object from Inertia props
 * @param {string} roleName - The role name
 * @returns {boolean} - True if user has role
 */
export const hasRole = (auth, roleName) => {
    return auth?.user?.roles?.some(role => role.name === roleName) ?? false;
};

/**
 * Check if user has any of the specified roles
 *
 * @param {object} auth - The auth object from Inertia props
 * @param {string[]} roleNames - Array of role names
 * @returns {boolean} - True if user has any of the roles
 */
export const hasAnyRole = (auth, roleNames) => {
    return auth?.user?.roles?.some(role => roleNames.includes(role.name)) ?? false;
};

/**
 * Check if user has all of the specified roles
 *
 * @param {object} auth - The auth object from Inertia props
 * @param {string[]} roleNames - Array of role names
 * @returns {boolean} - True if user has all of the roles
 */
export const hasAllRoles = (auth, roleNames) => {
    if (!auth?.user?.roles) return false;
    return roleNames.every(roleName =>
        auth.user.roles.some(role => role.name === roleName)
    );
};

/**
 * Check if user can perform an action (has permission OR has any of specified roles)
 *
 * @param {object} auth - The auth object from Inertia props
 * @param {string} permission - The permission name
 * @param {string[]} roles - Array of role names (optional)
 * @returns {boolean} - True if user can perform action
 */
export const canPerformAction = (auth, permission, roles = []) => {
    return hasPermission(auth, permission) || (roles.length > 0 && hasAnyRole(auth, roles));
};

/**
 * Check if user is admin
 *
 * @param {object} auth - The auth object from Inertia props
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (auth) => {
    return hasRole(auth, 'Admin');
};

/**
 * Check if user is instructor/teacher
 *
 * @param {object} auth - The auth object from Inertia props
 * @returns {boolean} - True if user is instructor
 */
export const isInstructor = (auth) => {
    return hasRole(auth, 'Instructor') || hasRole(auth, 'Teacher');
};

/**
 * Check if user is student
 *
 * @param {object} auth - The auth object from Inertia props
 * @returns {boolean} - True if user is student
 */
export const isStudent = (auth) => {
    return hasRole(auth, 'Student') || hasPermission(auth, 'student');
};
