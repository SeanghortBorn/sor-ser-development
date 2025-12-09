# Permission System Migration Guide

## Overview

The application has been migrated from a **custom PagePermission system** to using **Spatie Laravel Permission** exclusively. This consolidation simplifies permission management and removes duplicate functionality.

---

## What Changed

### Before (Dual System)
- **Spatie Laravel Permission** - Standard Laravel permission package
- **Custom PagePermission + PermissionOverride** - Custom tables and logic

### After (Spatie Only)
- **Spatie Laravel Permission** - Single, unified permission system
- Permission format: `page_name.action` (e.g., `articles.view`, `users.edit`)

---

## Migration Steps

### Step 1: Backup Database
```bash
# Create a backup before migration
php artisan db:backup
# OR manually export your database
```

### Step 2: Run Migration Seeder
```bash
# This migrates PagePermission and PermissionOverride to Spatie
php artisan db:seed --class=MigrateToSpatiePermissionsSeeder
```

**What it does:**
- Creates Spatie permissions from PagePermission records (format: `page_name.action`)
- Migrates PermissionOverride records to Spatie role/user permissions
- Preserves all existing permission assignments

**Output:**
```
🔄 Starting migration from PagePermission to Spatie...
📋 Migrating page permissions...
   ✓ Created 45 permissions, skipped 5 existing
🔐 Migrating permission overrides...
   ✓ Migrated 12 role permissions
   ✓ Migrated 3 user permissions
   ⚠️  2 block permissions need manual review

✅ Migration complete!
⚠️  Review the migrated permissions before dropping old tables
```

### Step 3: Verify Permissions
```bash
# List all Spatie permissions
php artisan permission:show

# Check specific user permissions
php artisan tinker
>>> $user = User::find(1);
>>> $user->getAllPermissions()->pluck('name');
```

### Step 4: Test Application
- Log in as different user roles
- Verify access to protected pages
- Check that permission checks work correctly
- Test any custom permission-based features

### Step 5: Drop Old Tables (Optional)
```bash
# ONLY after verifying everything works
php artisan migrate --path=database/migrations/2025_12_09_061854_drop_custom_permission_tables.php
```

**Warning:** This permanently removes `page_permissions` and `permission_overrides` tables. Ensure migration is successful first!

---

## Updated PermissionService API

### Check User Access
```php
use App\Services\PermissionService;

$permissionService = app(PermissionService::class);

// Check if user can access a page
$canView = $permissionService->canUserAccess($user, 'articles', 'view');
$canEdit = $permissionService->canUserAccess($user, 'users', 'edit');
```

### Grant/Revoke Permissions

**To Roles:**
```php
// Grant permission to role
$permissionService->grantToRole('articles', $roleId, 'edit');

// Revoke permission from role
$permissionService->revokeFromRole('articles', $roleId, 'edit');
```

**To Users:**
```php
// Grant permission to user
$permissionService->grantToUser('dashboard', $userId, 'view');

// Revoke permission from user
$permissionService->revokeFromUser('dashboard', $userId, 'view');
```

### Block/Unblock Access
```php
// Block user from accessing page
$permissionService->blockUser('admin', $userId);

// Unblock user
$permissionService->unblockUser('admin', $userId);

// Block entire role
$permissionService->blockRole('admin', $roleId);
```

### Get Permissions
```php
// Get all permissions for a page
$pagePerms = $permissionService->getPagePermissions('articles');
// Returns: ['permissions', 'role_permissions', 'user_permissions']

// Get all permissions for a user
$userPerms = $permissionService->getUserPermissions($userId);
// Returns: ['direct_permissions', 'role_permissions', 'all_permissions']
```

---

## Permission Format

### Standard Permissions
Format: `page_name.action`

**Actions:**
- `view` - Can view the page/resource
- `create` - Can create new records
- `edit` - Can edit existing records
- `delete` - Can delete records
- `own` - Can only view/edit their own records
- `block` - Explicitly blocked from access

**Examples:**
- `articles.view` - View articles
- `users.edit` - Edit users
- `dashboard.own` - View own dashboard data
- `admin.block` - Blocked from admin area

### Using in Blade Templates
```blade
@can('articles.edit')
    <a href="/articles/{{ $article->id }}/edit">Edit</a>
@endcan

@cannot('users.delete')
    <p>You cannot delete users</p>
@endcannot
```

### Using in Controllers
```php
// Via PermissionService
if ($this->permissionService->canUserAccess(auth()->user(), 'articles', 'edit')) {
    // Allow editing
}

// Via Spatie directly
if (auth()->user()->can('articles.edit')) {
    // Allow editing
}

// Via middleware
Route::middleware(['can:articles.edit'])->group(function () {
    Route::get('/articles/{id}/edit', [ArticleController::class, 'edit']);
});
```

### Using in Policies
```php
class ArticlePolicy
{
    public function view(User $user, Article $article)
    {
        return $user->can('articles.view');
    }

    public function update(User $user, Article $article)
    {
        // Check if user can edit articles
        if ($user->can('articles.edit')) {
            return true;
        }

        // Or check if user can edit own articles
        if ($user->can('articles.own') && $article->user_id === $user->id) {
            return true;
        }

        return false;
    }
}
```

---

## Middleware Updates

### Old Middleware (DEPRECATED)
```php
// app/Http/Middleware/CheckPagePermission.php - DELETE THIS
Route::middleware(['page.permission:articles,view'])->group(...);
```

### New Middleware (Use Spatie)
```php
// Use Spatie's built-in middleware
Route::middleware(['can:articles.view'])->group(...);

// Or use role middleware
Route::middleware(['role:Admin'])->group(...);

// Or combine both
Route::middleware(['role:Admin|Editor', 'can:articles.edit'])->group(...);
```

---

## Block Permissions

**Important:** Block permissions work differently now.

**Old System:**
- `permission_type = 'block'` in `permission_overrides` table

**New System:**
- Permission name: `page_name.block`
- If user has this permission, they are **blocked** from the page

**Usage:**
```php
// Block user from admin area
$permissionService->blockUser('admin', $userId);

// Check in middleware
if (auth()->user()->hasPermissionTo('admin.block')) {
    abort(403, 'You are blocked from this area');
}
```

---

## Rollback Strategy

If you need to rollback:

1. **Before dropping tables:**
   - Original `PermissionService.php` is backed up at `app/Services/PermissionService.php.backup`
   - Simply restore it: `cp app/Services/PermissionService.php.backup app/Services/PermissionService.php`

2. **After dropping tables:**
   ```bash
   # Rollback the drop migration
   php artisan migrate:rollback --step=1
   ```
   This recreates `page_permissions` and `permission_overrides` tables.

---

## Testing Checklist

- [ ] Run migration seeder successfully
- [ ] Verify all permissions created in Spatie
- [ ] Test Admin role access (should have full access)
- [ ] Test Student role access (should be restricted)
- [ ] Test user-specific permission grants
- [ ] Test permission blocks
- [ ] Check middleware protection on routes
- [ ] Verify Blade @can directives work
- [ ] Test permission cache clearing
- [ ] Run automated tests (if any)
- [ ] Test in staging environment
- [ ] Drop old tables (optional)

---

## Troubleshooting

### Issue: "Permission does not exist"
**Solution:** Run the seeder again or manually create the permission:
```bash
php artisan tinker
>>> Spatie\Permission\Models\Permission::create(['name' => 'articles.view', 'guard_name' => 'web']);
```

### Issue: Admin has no access after migration
**Solution:** Clear permission cache:
```bash
php artisan permission:cache-reset
```

### Issue: User permissions not working
**Solution:** Check user has correct role and clear user cache:
```php
$permissionService->clearUserCache($userId);
```

---

## Support

For issues or questions:
1. Check `storage/logs/laravel.log` for errors
2. Review migration output in console
3. Verify database tables: `permissions`, `roles`, `model_has_permissions`, `role_has_permissions`
