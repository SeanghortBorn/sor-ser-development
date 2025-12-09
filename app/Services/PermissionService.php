<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionService
{
    /**
     * Check if user can perform action on a page.
     *
     * Uses Spatie Laravel Permission exclusively.
     * Permission format: "page_name.action" (e.g., "articles.view", "users.edit")
     */
    public function canUserAccess(User $user, string $pageName, string $action = 'view'): bool
    {
        // Admin role always has access (except explicit blocks)
        if ($user->hasRole('Admin')) {
            // Check for explicit block permission
            if ($this->isExplicitlyBlocked($user, $pageName)) {
                return false;
            }
            return true;
        }

        // Cache permission check for performance
        $cacheKey = "permission:{$user->id}:{$pageName}:{$action}";

        return Cache::remember($cacheKey, 300, function () use ($user, $pageName, $action) {
            return $this->checkPermission($user, $pageName, $action);
        });
    }

    /**
     * Core permission checking logic using Spatie.
     */
    protected function checkPermission(User $user, string $pageName, string $action): bool
    {
        // 1. Check for explicit block (highest priority)
        if ($this->isExplicitlyBlocked($user, $pageName)) {
            return false;
        }

        // 2. Check Spatie permission: "page_name.action"
        $permission = "{$pageName}.{$action}";

        return $user->hasPermissionTo($permission);
    }

    /**
     * Check if user is explicitly blocked from page.
     *
     * Blocks are implemented as "page_name.block" permissions.
     * If a user has this permission, they are blocked from the page.
     */
    protected function isExplicitlyBlocked(User $user, string $pageName): bool
    {
        $blockPermission = "{$pageName}.block";

        return $user->hasPermissionTo($blockPermission);
    }

    /**
     * Check if user can view their own data on a page.
     */
    public function canViewOwn(User $user, string $pageName): bool
    {
        $permission = "{$pageName}.own";

        return $user->hasPermissionTo($permission);
    }

    /**
     * Grant permission to a role.
     */
    public function grantToRole(string $pageName, int $roleId, string $action): bool
    {
        $role = Role::find($roleId);

        if (!$role) {
            return false;
        }

        // Create permission if it doesn't exist
        $permissionName = "{$pageName}.{$action}";
        $permission = Permission::firstOrCreate([
            'name' => $permissionName,
            'guard_name' => 'web',
        ]);

        // Grant permission to role
        if (!$role->hasPermissionTo($permission)) {
            $role->givePermissionTo($permission);
        }

        // Clear cache for all users with this role
        $this->clearCacheForRole($roleId);

        return true;
    }

    /**
     * Grant permission to a user.
     */
    public function grantToUser(string $pageName, int $userId, string $action): bool
    {
        $user = User::find($userId);

        if (!$user) {
            return false;
        }

        // Create permission if it doesn't exist
        $permissionName = "{$pageName}.{$action}";
        $permission = Permission::firstOrCreate([
            'name' => $permissionName,
            'guard_name' => 'web',
        ]);

        // Grant permission to user
        if (!$user->hasPermissionTo($permission)) {
            $user->givePermissionTo($permission);
        }

        // Clear cache for this user
        $this->clearUserCache($userId);

        return true;
    }

    /**
     * Revoke permission from role.
     */
    public function revokeFromRole(string $pageName, int $roleId, string $action): bool
    {
        $role = Role::find($roleId);

        if (!$role) {
            return false;
        }

        $permissionName = "{$pageName}.{$action}";
        $permission = Permission::where('name', $permissionName)->first();

        if ($permission && $role->hasPermissionTo($permission)) {
            $role->revokePermissionTo($permission);
        }

        $this->clearCacheForRole($roleId);

        return true;
    }

    /**
     * Revoke permission from user.
     */
    public function revokeFromUser(string $pageName, int $userId, string $action): bool
    {
        $user = User::find($userId);

        if (!$user) {
            return false;
        }

        $permissionName = "{$pageName}.{$action}";
        $permission = Permission::where('name', $permissionName)->first();

        if ($permission && $user->hasPermissionTo($permission)) {
            $user->revokePermissionTo($permission);
        }

        $this->clearUserCache($userId);

        return true;
    }

    /**
     * Block user from accessing a page.
     */
    public function blockUser(string $pageName, int $userId): bool
    {
        return $this->grantToUser($pageName, $userId, 'block');
    }

    /**
     * Unblock user from accessing a page.
     */
    public function unblockUser(string $pageName, int $userId): bool
    {
        return $this->revokeFromUser($pageName, $userId, 'block');
    }

    /**
     * Block role from accessing a page.
     */
    public function blockRole(string $pageName, int $roleId): bool
    {
        return $this->grantToRole($pageName, $roleId, 'block');
    }

    /**
     * Unblock role from accessing a page.
     */
    public function unblockRole(string $pageName, int $roleId): bool
    {
        return $this->revokeFromRole($pageName, $roleId, 'block');
    }

    /**
     * Get all permissions for a page.
     */
    public function getPagePermissions(string $pageName): array
    {
        $pattern = "{$pageName}.%";
        $permissions = Permission::where('name', 'like', $pattern)->get();

        $rolePermissions = [];
        $userPermissions = [];

        foreach ($permissions as $permission) {
            // Get roles with this permission
            $roles = Role::permission($permission)->get();
            foreach ($roles as $role) {
                $rolePermissions[] = [
                    'role' => $role->name,
                    'permission' => $permission->name,
                    'action' => str_replace("{$pageName}.", '', $permission->name),
                ];
            }

            // Get users with this permission (direct assignment)
            $users = User::permission($permission)->get();
            foreach ($users as $user) {
                $userPermissions[] = [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'permission' => $permission->name,
                    'action' => str_replace("{$pageName}.", '', $permission->name),
                ];
            }
        }

        return [
            'page' => $pageName,
            'permissions' => $permissions,
            'role_permissions' => $rolePermissions,
            'user_permissions' => $userPermissions,
        ];
    }

    /**
     * Get all permissions for a user.
     */
    public function getUserPermissions(int $userId): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [];
        }

        return [
            'direct_permissions' => $user->getDirectPermissions()->pluck('name')->toArray(),
            'role_permissions' => $user->getPermissionsViaRoles()->pluck('name')->toArray(),
            'all_permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ];
    }

    /**
     * Clear permission cache for a user.
     */
    public function clearUserCache(int $userId): void
    {
        // Clear Spatie's permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Clear user-specific cache keys
        Cache::forget("permission:{$userId}:*");
        Cache::forget("user:{$userId}");
    }

    /**
     * Clear permission cache for all users with a role.
     */
    protected function clearCacheForRole(int $roleId): void
    {
        // Clear Spatie's permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Clear cache for all users with this role
        $users = User::whereHas('roles', function ($query) use ($roleId) {
            $query->where('roles.id', $roleId);
        })->get();

        foreach ($users as $user) {
            $this->clearUserCache($user->id);
        }
    }

    /**
     * Sync role permissions (remove all existing, add new ones).
     */
    public function syncRolePermissions(int $roleId, array $permissions): bool
    {
        $role = Role::find($roleId);

        if (!$role) {
            return false;
        }

        // Sync permissions (remove all old, add new)
        $role->syncPermissions($permissions);

        $this->clearCacheForRole($roleId);

        return true;
    }

    /**
     * Sync user permissions (remove all existing, add new ones).
     */
    public function syncUserPermissions(int $userId, array $permissions): bool
    {
        $user = User::find($userId);

        if (!$user) {
            return false;
        }

        // Sync permissions (remove all old, add new)
        $user->syncPermissions($permissions);

        $this->clearUserCache($userId);

        return true;
    }
}
