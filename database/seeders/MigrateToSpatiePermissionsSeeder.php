<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PagePermission;
use App\Models\PermissionOverride;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MigrateToSpatiePermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Migrates custom PagePermission system to Spatie Laravel Permission.
     */
    public function run(): void
    {
        $this->command->info('🔄 Starting migration from PagePermission to Spatie...');

        DB::transaction(function () {
            $this->migratePagePermissions();
            $this->migratePermissionOverrides();
        });

        $this->command->newLine();
        $this->command->info('✅ Migration complete!');
        $this->command->warn('⚠️  Review the migrated permissions before dropping old tables');
        $this->command->info('💡 To drop old tables, run: php artisan migrate --path=database/migrations/xxxx_drop_custom_permission_tables.php');
    }

    /**
     * Migrate PagePermission records to Spatie permissions.
     */
    protected function migratePagePermissions(): void
    {
        $this->command->info('📋 Migrating page permissions...');

        $pagePermissions = PagePermission::all();

        $created = 0;
        $skipped = 0;

        foreach ($pagePermissions as $pagePermission) {
            $actions = ['view', 'create', 'edit', 'delete', 'own'];

            foreach ($actions as $action) {
                $permissionName = "{$pagePermission->page_name}.{$action}";

                // Check if permission already exists
                if (Permission::where('name', $permissionName)->exists()) {
                    $skipped++;
                    continue;
                }

                // Create Spatie permission
                Permission::create([
                    'name' => $permissionName,
                    'guard_name' => 'web',
                ]);

                $created++;
            }
        }

        $this->command->info("   ✓ Created {$created} permissions, skipped {$skipped} existing");
    }

    /**
     * Migrate PermissionOverride records to Spatie role/user permissions.
     */
    protected function migratePermissionOverrides(): void
    {
        $this->command->info('🔐 Migrating permission overrides...');

        $overrides = PermissionOverride::with(['pagePermission', 'role', 'user'])->get();

        $rolePermissions = 0;
        $userPermissions = 0;
        $blocks = 0;

        foreach ($overrides as $override) {
            if (!$override->pagePermission) {
                continue;
            }

            $permissionName = "{$override->pagePermission->page_name}.{$override->permission_type}";

            // Handle block permissions (special case)
            if ($override->permission_type === 'block') {
                $blocks++;
                // Note: Blocks need to be handled differently in the new system
                // You may want to create a "blocked_from_X" permission or use a different approach
                $this->command->warn("   ⚠️  Block permission found for {$override->pagePermission->page_name} - manual review needed");
                continue;
            }

            // Ensure permission exists
            $permission = Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);

            // Role-based permission
            if ($override->role_id) {
                $role = Role::find($override->role_id);

                if ($role && !$role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                    $rolePermissions++;
                }
            }

            // User-specific permission
            if ($override->user_id) {
                $user = User::find($override->user_id);

                if ($user && !$user->hasPermissionTo($permission)) {
                    $user->givePermissionTo($permission);
                    $userPermissions++;
                }
            }
        }

        $this->command->info("   ✓ Migrated {$rolePermissions} role permissions");
        $this->command->info("   ✓ Migrated {$userPermissions} user permissions");

        if ($blocks > 0) {
            $this->command->warn("   ⚠️  {$blocks} block permissions need manual review");
        }
    }
}
