<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermissionOverride extends Model
{
    protected $fillable = [
        'page_permission_id',
        'role_id',
        'user_id',
        'permission_type',
        'granted_by',
    ];

    public function pagePermission(): BelongsTo
    {
        return $this->belongsTo(PagePermission::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(\Spatie\Permission\Models\Role::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }
    
    /**
     * Check if this is a role-based permission (vs user-specific)
     */
    public function isRoleBased(): bool
    {
        return !is_null($this->role_id);
    }
    
    /**
     * Check if this is a user-specific permission
     */
    public function isUserSpecific(): bool
    {
        return !is_null($this->user_id);
    }
}