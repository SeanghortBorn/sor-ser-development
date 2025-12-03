<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "🔧 Fixing Group A: NLP-only permissions...\n";

$groupA = Role::where('name', 'Group A: NLP-only')->first();

if (!$groupA) {
    echo "❌ Group A role not found!\n";
    exit(1);
}

// Set basic permissions only
$basicPermissions = ['article-list', 'homophone-list'];
$groupA->syncPermissions($basicPermissions);

echo "✅ Group A now has only: " . implode(', ', $basicPermissions) . "\n";

// Check Group B
$groupB = Role::where('name', 'Group B: NLP+LA')->first();
if ($groupB) {
    $fullPermissions = ['article-list', 'homophone-list', 'quiz-list'];
    $groupB->syncPermissions($fullPermissions);
    echo "✅ Group B now has: " . implode(', ', $fullPermissions) . "\n";
}

// Update existing users' permissions
$users = \App\Models\User::role('Group A: NLP-only')->get();
foreach ($users as $user) {
    // Force sync from role
    $user->syncPermissions($groupA->permissions);
}

echo "✅ Updated " . $users->count() . " users with Group A permissions\n";
echo "🎉 Done! Run: php artisan permission:cache-reset\n";