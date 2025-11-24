<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $this->info('Creating permissions...');

        // Define all permissions
        $permissions = [
            // Role Management
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',
            
            // User Management
            'user-list',
            'user-create',
            'user-edit',
            'user-block',
            'user-delete',
            
            // Quiz Management
            'quiz-list',
            'quiz-create',
            'quiz-edit',
            'quiz-delete',
            'quiz-publish',
            
            // Article Management
            'article-list',
            'article-create',
            'article-edit',
            'article-delete',
            
            // Homophone Management
            'homophone-list',
            'homophone-create',
            'homophone-edit',
            'homophone-delete',
            
            // Grammar Checker Management
            'grammar-list',
            'grammar-create',
            'grammar-edit',
            'grammar-delete',
            
            // Category & Tag Management
            'category-list',
            'category-create',
            'category-edit',
            'category-delete',
            'tag-list',
            'tag-create',
            'tag-edit',
            'tag-delete',
            
            // Feedback Management
            'feedback-list',
            'feedback-view',
            'feedback-delete',
            
            // Analytics & Reports
            'analytics-view',
            'reports-view',
            
            // Special Permissions
            'student',
            'teacher',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'web']
            );
            $this->info("Created: {$permission}");
        }

        $this->info("\nCreating roles...");

        // Create Admin Role with all permissions
        $adminRole = Role::firstOrCreate(
            ['name' => 'Admin'],
            ['guard_name' => 'web']
        );
        $adminRole->syncPermissions(Permission::all());
        $this->info("✓ Admin role created with all permissions");

        // Create Teacher Role
        $teacherRole = Role::firstOrCreate(
            ['name' => 'Teacher'],
            ['guard_name' => 'web']
        );
        $teacherPermissions = [
            'quiz-list', 'quiz-create', 'quiz-edit', 'quiz-delete', 'quiz-publish',
            'article-list', 'article-create', 'article-edit', 'article-delete',
            'homophone-list', 'homophone-create', 'homophone-edit',
            'grammar-list', 'grammar-create', 'grammar-edit',
            'category-list', 'tag-list',
            'analytics-view',
            'teacher',
        ];
        $teacherRole->syncPermissions($teacherPermissions);
        $this->info("✓ Teacher role created with " . count($teacherPermissions) . " permissions");

        // Create Student Role
        $studentRole = Role::firstOrCreate(
            ['name' => 'Student'],
            ['guard_name' => 'web']
        );
        $studentPermissions = [
            'quiz-list',
            'article-list',
            'homophone-list',
            'student',
        ];
        $studentRole->syncPermissions($studentPermissions);
        $this->info("✓ Student role created with " . count($studentPermissions) . " permissions");

        $this->info("\n✅ Permission seeding completed!");
        $this->info("Total Permissions: " . Permission::count());
        $this->info("Total Roles: " . Role::count());
    }

    /**
     * Display info message
     */
    protected function info(string $message): void
    {
        echo $message . "\n";
    }
}