<?php

namespace App\Actions\Fortify;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ]);

        // Make the very first registered user an admin
        if (User::count() === 1) {
            // if no permissions exist yet, seed them
            if (Permission::count() === 0) {
                try {
                    Artisan::call('db:seed', ['--class' => \Database\Seeders\PermissionSeeder::class]);
                    Artisan::call('permission:cache-reset');
                } catch (\Throwable $e) {
                    // ignore seed errors here (will still attempt to continue)
                }
            }

            $role = Role::firstOrCreate(['name' => 'Admin']);
            $permissions = Permission::pluck('name')->toArray();
            if (!empty($permissions)) {
                $role->syncPermissions($permissions);
            }
            $user->assignRole($role->name);
        }

        return $user;
    }
}
