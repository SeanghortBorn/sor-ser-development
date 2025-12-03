<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration seeds initial system settings and roles
     */
    public function up(): void
    {
        // ============================================
        // 1. Ensure Settings Permission Exists
        // ============================================
        Permission::firstOrCreate(
            ['name' => 'settings-edit'],
            ['guard_name' => 'web']
        );

        // ============================================
        // 2. Give Admin Role Settings Permission
        // ============================================
        $adminRole = Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo('settings-edit');
        }

        // ============================================
        // 3. Create Initial Roles if They Don't Exist
        // ============================================
        
        // Group A: NLP-only (Basic features)
        $nlpOnlyRole = Role::firstOrCreate(
            ['name' => 'Group A: NLP-only'],
            ['guard_name' => 'web']
        );
        $nlpOnlyPermissions = Permission::whereIn('name', [
            'article-list',
            'homophone-list',
        ])->pluck('name');
        $nlpOnlyRole->syncPermissions($nlpOnlyPermissions);

        // Group B: NLP+LA (Full features)
        $nlpLaRole = Role::firstOrCreate(
            ['name' => 'Group B: NLP+LA'],
            ['guard_name' => 'web']
        );
        $nlpLaPermissions = Permission::whereIn('name', [
            'article-list',
            'homophone-list',
            'quiz-list',
        ])->pluck('name');
        $nlpLaRole->syncPermissions($nlpLaPermissions);

        // ============================================
        // 4. Set Default Role to Group A: NLP-only
        // ============================================
        $defaultRoleSetting = DB::table('system_settings')
            ->where('key', 'default_role_id')
            ->first();

        if ($defaultRoleSetting && !$defaultRoleSetting->value) {
            // Set default role to Group A: NLP-only
            DB::table('system_settings')
                ->where('key', 'default_role_id')
                ->update([
                    'value' => $nlpOnlyRole->id,
                    'updated_at' => now(),
                ]);
        }

        // Log the results
        \Log::info('Initial settings seeded successfully', [
            'default_role' => $nlpOnlyRole->name,
            'roles_created' => [
                'Group A: NLP-only' => $nlpOnlyRole->id,
                'Group B: NLP+LA' => $nlpLaRole->id,
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove settings-edit permission from admin
        $adminRole = Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $adminRole->revokePermissionTo('settings-edit');
        }

        // Reset default role setting
        DB::table('system_settings')
            ->where('key', 'default_role_id')
            ->update([
                'value' => null,
                'updated_at' => now(),
            ]);

        // Note: We don't delete the roles because they might be in use
        // Only reset the default role setting
    }
};