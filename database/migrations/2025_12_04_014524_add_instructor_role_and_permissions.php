<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    public function up(): void
    {
        // Create Instructor role
        $instructor = Role::firstOrCreate(
            ['name' => 'Instructor', 'guard_name' => 'web']
        );
        
        // Create new permissions
        $permissions = [
            'dashboard-view',
            'dashboard-edit',
            'user-progress-view',
            'user-progress-own',
            'articles-view',
            'articles-create',
            'articles-update',
            'articles-delete',
            'article-settings-view',
            'article-settings-edit',
            'roles-view',
            'roles-edit',
            'users-view',
            'users-edit',
            'settings-view',
            'permissions-manage', // New: manage page permissions
        ];
        
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web'
            ]);
        }
        
        // Grant instructor permissions
        $instructorPermissions = [
            'dashboard-view',
            'user-progress-view',
            'articles-view',
            'articles-create',
            'articles-update',
        ];
        
        $instructor->syncPermissions($instructorPermissions);
        
        // Grant admin all permissions
        $adminRole = Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $allPermissions = Permission::all();
            $adminRole->syncPermissions($allPermissions);
        }
        
        // Grant NLP-only and NLP+LA self-view permissions
        $nlpOnlyRole = Role::where('name', 'Group A: NLP-only')->first();
        if ($nlpOnlyRole) {
            $nlpOnlyRole->givePermissionTo(['dashboard-view', 'user-progress-own']);
        }
        
        $nlpLaRole = Role::where('name', 'Group B: NLP+LA')->first();
        if ($nlpLaRole) {
            $nlpLaRole->givePermissionTo(['dashboard-view', 'user-progress-own']);
        }
    }

    public function down(): void
    {
        // Remove permissions
        Permission::whereIn('name', [
            'dashboard-view',
            'dashboard-edit',
            'user-progress-view',
            'user-progress-own',
            'articles-view',
            'articles-create',
            'articles-update',
            'articles-delete',
            'article-settings-view',
            'article-settings-edit',
            'roles-view',
            'roles-edit',
            'users-view',
            'users-edit',
            'settings-view',
            'permissions-manage',
        ])->delete();
        
        // Remove Instructor role
        Role::where('name', 'Instructor')->delete();
    }
};