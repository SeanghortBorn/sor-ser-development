<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PagePermission;

class PagePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'page_name' => 'dashboard',
                'description' => 'Main dashboard with analytics and statistics',
                'requires_admin' => false, // Allow self-view
            ],
            [
                'page_name' => 'user-progress',
                'description' => 'User learning progress tracking',
                'requires_admin' => false, // Allow self-view
            ],
            [
                'page_name' => 'articles',
                'description' => 'Article management and viewing',
                'requires_admin' => true,
            ],
            [
                'page_name' => 'article-settings',
                'description' => 'Article configuration and progression settings',
                'requires_admin' => true,
            ],
            [
                'page_name' => 'roles',
                'description' => 'Role and permission management',
                'requires_admin' => true,
            ],
            [
                'page_name' => 'users',
                'description' => 'User management',
                'requires_admin' => true,
            ],
            [
                'page_name' => 'settings',
                'description' => 'System settings and configuration',
                'requires_admin' => true,
            ],
        ];

        foreach ($pages as $page) {
            PagePermission::firstOrCreate(
                ['page_name' => $page['page_name']],
                [
                    'description' => $page['description'],
                    'requires_admin' => $page['requires_admin'],
                ]
            );
        }
    }
}