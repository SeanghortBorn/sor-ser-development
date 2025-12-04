<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PagePermission extends Model
{
    protected $fillable = [
        'page_name',
        'description',
        'requires_admin',
    ];

    protected $casts = [
        'requires_admin' => 'boolean',
    ];

    public function overrides(): HasMany
    {
        return $this->hasMany(PermissionOverride::class);
    }
    
    /**
     * Get all permission overrides for a specific role
     */
    public function getOverridesForRole(int $roleId): array
    {
        return $this->overrides()
            ->where('role_id', $roleId)
            ->pluck('permission_type')
            ->toArray();
    }
    
    /**
     * Get all permission overrides for a specific user
     */
    public function getOverridesForUser(int $userId): array
    {
        return $this->overrides()
            ->where('user_id', $userId)
            ->pluck('permission_type')
            ->toArray();
    }
}