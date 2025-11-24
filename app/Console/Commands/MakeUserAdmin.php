<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class MakeUserAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:make-admin {email : The email of the user to make admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Make a user an administrator with all permissions';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');

        // Find the user
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found!");
            return Command::FAILURE;
        }

        // Create or get admin role
        $adminRole = Role::firstOrCreate(
            ['name' => 'Admin'],
            ['guard_name' => 'web']
        );

        // Ensure all permissions exist
        $permissions = $this->ensurePermissionsExist();

        // Assign all permissions to admin role
        $adminRole->syncPermissions($permissions);

        // Remove existing roles and assign admin role
        $user->syncRoles([$adminRole]);

        $this->info("✓ User '{$user->name}' ({$email}) is now an Administrator!");
        $this->info("✓ Assigned {$permissions->count()} permissions");
        
        $this->table(
            ['Permission'],
            $permissions->pluck('name')->map(fn($name) => [$name])->toArray()
        );

        return Command::SUCCESS;
    }

    /**
     * Ensure all necessary permissions exist
     */
    protected function ensurePermissionsExist()
    {
        $permissionsList = [
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',
            'user-list',
            'user-create',
            'user-edit',
            'user-block',
            'quiz-list',
            'quiz-create',
            'quiz-edit',
            'quiz-delete',
            'article-list',
            'article-create',
            'article-edit',
            'article-delete',
            'homophone-list',
            'homophone-create',
            'homophone-edit',
            'homophone-delete',
            'student',
        ];

        $permissions = collect();

        foreach ($permissionsList as $permissionName) {
            $permissions->push(
                Permission::firstOrCreate(
                    ['name' => $permissionName],
                    ['guard_name' => 'web']
                )
            );
        }

        return $permissions;
    }
}