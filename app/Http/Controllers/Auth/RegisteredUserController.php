<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'age' => 'nullable|integer|min:1|max:120',
            'education_level' => 'nullable|string|max:255',
            'khmer_experience' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'age' => $request->age,
            'education_level' => $request->education_level,
            'khmer_experience' => $request->khmer_experience,
        ]);

        // Check if this is the first user
        $this->assignRoleToFirstUser($user);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Assign admin role with all permissions to the first user
     */
    protected function assignRoleToFirstUser(User $user): void
    {
        // Check if this is the first user (excluding the current user)
        $userCount = User::count();

        if ($userCount === 1) {
            // This is the first user - make them admin
            
            // Create admin role if it doesn't exist
            $adminRole = Role::firstOrCreate(
                ['name' => 'Admin'],
                ['guard_name' => 'web']
            );

            // Get all permissions or create default ones
            $permissions = $this->ensurePermissionsExist();

            // Assign all permissions to admin role
            $adminRole->syncPermissions($permissions);

            // Assign admin role to user
            $user->assignRole($adminRole);

            \Log::info('First user registered and assigned as Admin', [
                'user_id' => $user->id,
                'email' => $user->email,
                'permissions_count' => count($permissions)
            ]);
        } else {
            // Not the first user - assign default student role
            $studentRole = Role::firstOrCreate(
                ['name' => 'Student'],
                ['guard_name' => 'web']
            );

            // Assign basic student permission
            $studentPermission = Permission::firstOrCreate(
                ['name' => 'student'],
                ['guard_name' => 'web']
            );

            $studentRole->givePermissionTo($studentPermission);
            $user->assignRole($studentRole);

            \Log::info('User registered with Student role', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
        }
    }

    /**
     * Ensure all necessary permissions exist in the database
     */
    protected function ensurePermissionsExist(): array
    {
        $permissionsList = [
            // Role management
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',
            
            // User management
            'user-list',
            'user-create',
            'user-edit',
            'user-block',
            
            // Quiz management
            'quiz-list',
            'quiz-create',
            'quiz-edit',
            'quiz-delete',
            
            // Article management
            'article-list',
            'article-create',
            'article-edit',
            'article-delete',
            
            // Homophone management
            'homophone-list',
            'homophone-create',
            'homophone-edit',
            'homophone-delete',
            
            // Student permission
            'student',
        ];

        $permissions = [];

        foreach ($permissionsList as $permissionName) {
            $permissions[] = Permission::firstOrCreate(
                ['name' => $permissionName],
                ['guard_name' => 'web']
            );
        }

        return $permissions;
    }
}