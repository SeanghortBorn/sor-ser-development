<?php

namespace App\Services;

use App\Models\PagePermission;
use App\Models\PermissionOverride;
use App\Models\User;
use Illuminate\Support\Facades\Cache;


class PermissionService {
    /**
     * Check if user can perform action on a page
     */
    public function canUserAccess(User $user, string $pageName, string $action = 'view'): bool
    {
        // Admin always has access (except explicit blocks)
        if ($user->hasRole('Admin')) {
            // Check for explicit block
            if ($this->isExplicitlyBlocked($user, $pageName)) {
                return false;
            }
            return true;
        }

        $cacheKey = "permission:{$user->id}:{$pageName}:{$action}";
        
        return Cache::remember($cacheKey, 300, function () use ($user, $pageName, $action) {
            return $this->checkPermission($user, $pageName, $action);
        });
    }
    
    /**
     * Core permission checking logic
     */
    protected function checkPermission(User $user, string $pageName, string $action): bool
    {
        // 1. Check for explicit block (highest priority)
        if ($this->isExplicitlyBlocked($user, $pageName)) {
            return false;
        }

        $pagePermission = PagePermission::where('page_name', $pageName)->first();
        
        if (!$pagePermission) {
            // Page not registered, deny by default
            return false;
        }

        // 2. Check user-specific permissions (second highest priority)
        $userOverride = PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->where('user_id', $user->id)
            ->where('permission_type', $action)
            ->first();
            
        if ($userOverride) {
            return true;
        }

        // 3. Check role-based permissions
        $userRoleIds = $user->roles->pluck('id')->toArray();
        
        $roleOverride = PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->whereIn('role_id', $userRoleIds)
            ->where('permission_type', $action)
            ->first();
            
        if ($roleOverride) {
            return true;
        }

        // 4. Check Spatie permission system
        $permission = "{$pageName}-{$action}";
        if ($user->hasPermissionTo($permission)) {
            return true;
        }

        // 5. Default: deny if page requires admin
        return !$pagePermission->requires_admin;
    }
    
    /**
     * Check if user is explicitly blocked from page
     */
    protected function isExplicitlyBlocked(User $user, string $pageName): bool
    {
        $pagePermission = PagePermission::where('page_name', $pageName)->first();
        
        if (!$pagePermission) {
            return false;
        }

        // Check user-specific block
        $userBlock = PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->where('user_id', $user->id)
            ->where('permission_type', 'block')
            ->exists();
            
        if ($userBlock) {
            return true;
        }

        // Check role-based block
        $userRoleIds = $user->roles->pluck('id')->toArray();
        
        return PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->whereIn('role_id', $userRoleIds)
            ->where('permission_type', 'block')
            ->exists();
    }
    
    /**
     * Check if user can view their own data on a page
     */
    public function canViewOwn(User $user, string $pageName): bool
    {
        $pagePermission = PagePermission::where('page_name', $pageName)->first();
        
        if (!$pagePermission) {
            return false;
        }

        // Check user-specific "own" permission
        $userOwn = PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->where('user_id', $user->id)
            ->where('permission_type', 'own')
            ->exists();
            
        if ($userOwn) {
            return true;
        }

        // Check role-based "own" permission
        $userRoleIds = $user->roles->pluck('id')->toArray();
        
        $roleOwn = PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->whereIn('role_id', $userRoleIds)
            ->where('permission_type', 'own')
            ->exists();
            
        if ($roleOwn) {
            return true;
        }

        // Check Spatie permission
        return $user->hasPermissionTo("{$pageName}-own");
    }
    
    /**
     * Grant permission to a role
     */
    public function grantToRole(string $pageName, int $roleId, string $action, User $grantedBy): bool
    {
        $pagePermission = PagePermission::firstOrCreate([
            'page_name' => $pageName,
        ], [
            'description' => ucfirst($pageName) . ' page',
            'requires_admin' => true,
        ]);

        PermissionOverride::updateOrCreate(
            [
                'page_permission_id' => $pagePermission->id,
                'role_id' => $roleId,
                'permission_type' => $action,
            ],
            [
                'granted_by' => $grantedBy->id,
            ]
        );

        // Clear cache for all users with this role
        $this->clearCacheForRole($roleId);

        return true;
    }
    
    /**
     * Grant permission to a user
     */
    public function grantToUser(string $pageName, int $userId, string $action, User $grantedBy): bool
    {
        $pagePermission = PagePermission::firstOrCreate([
            'page_name' => $pageName,
        ], [
            'description' => ucfirst($pageName) . ' page',
            'requires_admin' => true,
        ]);

        PermissionOverride::updateOrCreate(
            [
                'page_permission_id' => $pagePermission->id,
                'user_id' => $userId,
                'permission_type' => $action,
            ],
            [
                'granted_by' => $grantedBy->id,
            ]
        );

        // Clear cache for this user
        Cache::tags("user:{$userId}")->flush();

        return true;
    }
    
    /**
     * Revoke permission from role
     */
    public function revokeFromRole(string $pageName, int $roleId, string $action): bool
    {
        $pagePermission = PagePermission::where('page_name', $pageName)->first();
        
        if (!$pagePermission) {
            return false;
        }

        PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->where('role_id', $roleId)
            ->where('permission_type', $action)
            ->delete();

        $this->clearCacheForRole($roleId);

        return true;
    }
    
    /**
     * Revoke permission from user
     */
    public function revokeFromUser(string $pageName, int $userId, string $action): bool
    {
        $pagePermission = PagePermission::where('page_name', $pageName)->first();
        
        if (!$pagePermission) {
            return false;
        }

        PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->where('user_id', $userId)
            ->where('permission_type', $action)
            ->delete();

        Cache::tags("user:{$userId}")->flush();

        return true;
    }
    
    /**
     * Clear permission cache for all users with a role
     */
    protected function clearCacheForRole(int $roleId): void
    {
        $users = User::whereHas('roles', function ($query) use ($roleId) {
            $query->where('roles.id', $roleId);
        })->get();

        foreach ($users as $user) {
            Cache::tags("user:{$user->id}")->flush();
        }
    }
    
    /**
     * Get all permissions for a page
     */
    public function getPagePermissions(string $pageName): array
    {
        $pagePermission = PagePermission::where('page_name', $pageName)->first();
        
        if (!$pagePermission) {
            return [];
        }

        $overrides = PermissionOverride::where('page_permission_id', $pagePermission->id)
            ->with(['role', 'user', 'grantedBy'])
            ->get();

        return [
            'page' => $pagePermission,
            'role_permissions' => $overrides->where('role_id', '!=', null)->values(),
            'user_permissions' => $overrides->where('user_id', '!=', null)->values(),
        ];
    }
}