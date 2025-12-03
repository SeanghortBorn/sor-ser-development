<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class InitialRolesSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions if they don't exist
        $permissions = [
            // Articles
            'article-list',
            'article-create',
            'article-edit',
            'article-delete',
            
            // Homophones
            'homophone-list',
            'homophone-create',
            'homophone-edit',
            'homophone-delete',
            
            // Quizzes
            'quiz-list',
            'quiz-create',
            'quiz-edit',
            'quiz-delete',
            
            // Roles
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',
            
            // Users
            'user-list',
            'user-create',
            'user-edit',
            'user-block',
            
            // Settings
            'settings-edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'web']
            );
        }

        // Create Admin role
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $admin->syncPermissions(Permission::all());

        // Create Group A: NLP-only role
        $nlpOnly = Role::firstOrCreate(['name' => 'Group A: NLP-only']);
        $nlpOnly->syncPermissions(['article-list', 'homophone-list']);

        // Create Group B: NLP+LA role
        $nlpLa = Role::firstOrCreate(['name' => 'Group B: NLP+LA']);
        $nlpLa->syncPermissions(['article-list', 'homophone-list', 'quiz-list']);

        echo "✅ Initial roles created successfully!\n";
        echo "- Admin (all permissions)\n";
        echo "- Group A: NLP-only (basic features)\n";
        echo "- Group B: NLP+LA (full features)\n";
    }
}