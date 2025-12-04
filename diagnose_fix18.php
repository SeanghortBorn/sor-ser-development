#!/usr/bin/env php
<?php

/**
 * FIX18 Quick Diagnostic Script
 * 
 * Run this to diagnose FIX18 issues
 * 
 * Usage: php diagnose_fix18.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=================================\n";
echo "FIX18 DIAGNOSTIC TOOL\n";
echo "=================================\n\n";

$errors = [];
$warnings = [];
$success = [];

// 1. Check if PermissionService exists
echo "1. Checking PermissionService...\n";
if (file_exists('app/Services/PermissionService.php')) {
    $success[] = "✓ PermissionService file exists";
    echo "   ✓ File exists\n";
} else {
    $errors[] = "✗ PermissionService file NOT found at app/Services/PermissionService.php";
    echo "   ✗ File NOT found\n";
}

// 2. Check if models exist
echo "\n2. Checking Models...\n";
$models = [
    'PagePermission' => 'app/Models/PagePermission.php',
    'PermissionOverride' => 'app/Models/PermissionOverride.php',
];

foreach ($models as $name => $path) {
    if (file_exists($path)) {
        $success[] = "✓ {$name} model exists";
        echo "   ✓ {$name} exists\n";
    } else {
        $errors[] = "✗ {$name} model NOT found at {$path}";
        echo "   ✗ {$name} NOT found\n";
    }
}

// 3. Check if controllers exist
echo "\n3. Checking Controllers...\n";
$controllers = [
    'DashboardController' => 'app/Http/Controllers/DashboardController.php',
    'UserProgressController' => 'app/Http/Controllers/UserProgressController.php',
    'PermissionManagementController' => 'app/Http/Controllers/PermissionManagementController.php',
];

foreach ($controllers as $name => $path) {
    if (file_exists($path)) {
        $success[] = "✓ {$name} exists";
        echo "   ✓ {$name} exists\n";
    } else {
        $errors[] = "✗ {$name} NOT found at {$path}";
        echo "   ✗ {$name} NOT found\n";
    }
}

// 4. Check if middleware exists
echo "\n4. Checking Middleware...\n";
if (file_exists('app/Http/Middleware/CheckPagePermission.php')) {
    $success[] = "✓ CheckPagePermission middleware exists";
    echo "   ✓ CheckPagePermission exists\n";
} else {
    $errors[] = "✗ CheckPagePermission middleware NOT found";
    echo "   ✗ CheckPagePermission NOT found\n";
}

// 5. Check database tables
echo "\n5. Checking Database Tables...\n";
try {
    if (Schema::hasTable('page_permissions')) {
        $count = DB::table('page_permissions')->count();
        $success[] = "✓ page_permissions table exists ({$count} records)";
        echo "   ✓ page_permissions table exists ({$count} records)\n";
    } else {
        $errors[] = "✗ page_permissions table NOT found - Run migrations!";
        echo "   ✗ page_permissions table NOT found\n";
    }

    if (Schema::hasTable('permission_overrides')) {
        $count = DB::table('permission_overrides')->count();
        $success[] = "✓ permission_overrides table exists ({$count} records)";
        echo "   ✓ permission_overrides table exists ({$count} records)\n";
    } else {
        $errors[] = "✗ permission_overrides table NOT found - Run migrations!";
        echo "   ✗ permission_overrides table NOT found\n";
    }
} catch (Exception $e) {
    $errors[] = "✗ Database error: " . $e->getMessage();
    echo "   ✗ Database error\n";
}

// 6. Check routes
echo "\n6. Checking Routes...\n";
$routes = [
    'dashboard',
    'user-progress.index',
    'user-progress.show',
    'articles.index',
    'permissions.index',
];

foreach ($routes as $routeName) {
    try {
        $route = Route::getRoutes()->getByName($routeName);
        if ($route) {
            $success[] = "✓ Route '{$routeName}' registered";
            echo "   ✓ {$routeName} exists\n";
        } else {
            $errors[] = "✗ Route '{$routeName}' NOT registered";
            echo "   ✗ {$routeName} NOT found\n";
        }
    } catch (Exception $e) {
        $errors[] = "✗ Route '{$routeName}' error: " . $e->getMessage();
        echo "   ✗ {$routeName} error\n";
    }
}

// 7. Check permissions in database
echo "\n7. Checking Permissions in Database...\n";
try {
    $requiredPermissions = [
        'dashboard-view',
        'user-progress-own',
        'user-progress-view',
        'articles-view',
        'permissions-manage',
    ];

    foreach ($requiredPermissions as $perm) {
        $exists = Spatie\Permission\Models\Permission::where('name', $perm)->exists();
        if ($exists) {
            $success[] = "✓ Permission '{$perm}' exists";
            echo "   ✓ {$perm} exists\n";
        } else {
            $warnings[] = "⚠ Permission '{$perm}' NOT found - You may need to grant it";
            echo "   ⚠ {$perm} NOT found\n";
        }
    }
} catch (Exception $e) {
    $errors[] = "✗ Permission check error: " . $e->getMessage();
    echo "   ✗ Permission check error\n";
}

// 8. Check current user (if logged in via CLI)
echo "\n8. Checking Test User...\n";
try {
    $user = App\Models\User::first();
    if ($user) {
        echo "   User: {$user->name} ({$user->email})\n";
        
        $roles = $user->roles->pluck('name')->toArray();
        echo "   Role: " . implode(', ', $roles) . "\n";
        
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();
        echo "   Permissions: " . count($permissions) . " permissions\n";
        
        foreach ($permissions as $perm) {
            echo "     - {$perm}\n";
        }
        
        $success[] = "✓ Found test user: {$user->email}";
    } else {
        $warnings[] = "⚠ No users found in database";
        echo "   ⚠ No users found\n";
    }
} catch (Exception $e) {
    $errors[] = "✗ User check error: " . $e->getMessage();
    echo "   ✗ User check error\n";
}

// Summary
echo "\n=================================\n";
echo "SUMMARY\n";
echo "=================================\n";

echo "\n✓ SUCCESS ({count($success)}):\n";
foreach ($success as $msg) {
    echo "  {$msg}\n";
}

if (count($warnings) > 0) {
    echo "\n⚠ WARNINGS ({count($warnings)}):\n";
    foreach ($warnings as $msg) {
        echo "  {$msg}\n";
    }
}

if (count($errors) > 0) {
    echo "\n✗ ERRORS ({count($errors)}):\n";
    foreach ($errors as $msg) {
        echo "  {$msg}\n";
    }
    
    echo "\n=================================\n";
    echo "RECOMMENDED ACTIONS:\n";
    echo "=================================\n";
    
    if (in_array(true, array_map(fn($e) => str_contains($e, 'table NOT found'), $errors))) {
        echo "1. Run migrations:\n";
        echo "   php artisan migrate\n";
        echo "   php artisan db:seed --class=PagePermissionsSeeder\n\n";
    }
    
    if (in_array(true, array_map(fn($e) => str_contains($e, 'Route'), $errors))) {
        echo "2. Check routes/web.php and ensure all FIX18 routes are added\n\n";
    }
    
    if (in_array(true, array_map(fn($e) => str_contains($e, 'file NOT found') || str_contains($e, 'NOT found at'), $errors))) {
        echo "3. Missing files - Re-copy files from FIX18 documentation\n\n";
    }
    
    echo "4. Clear all caches:\n";
    echo "   php artisan config:clear\n";
    echo "   php artisan cache:clear\n";
    echo "   php artisan route:clear\n";
    echo "   php artisan permission:cache-reset\n\n";
    
    exit(1);
} else {
    echo "\n=================================\n";
    echo "✓ ALL CHECKS PASSED!\n";
    echo "=================================\n";
    
    if (count($warnings) > 0) {
        echo "\nYou may need to grant permissions to users:\n";
        echo "  php artisan tinker\n";
        echo "  \$user = \\App\\Models\\User::find(1);\n";
        echo "  \$user->givePermissionTo('dashboard-view');\n";
        echo "  \$user->givePermissionTo('user-progress-own');\n";
        echo "  exit\n";
    }
    
    exit(0);
}