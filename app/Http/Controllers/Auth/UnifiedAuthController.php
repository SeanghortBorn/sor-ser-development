<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UnifiedAuthController extends Controller
{
    protected $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show unified auth page
     */
    public function create()
    {
        return Inertia::render('Auth/UnifiedAuth');
    }

    /**
     * Check if email exists
     */
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        return response()->json([
            'exists' => $user ? true : false,
            'message' => $user ? 'Please enter your password' : 'Create a new account',
        ]);
    }

    /**
     * Handle login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password], $request->remember ?? false)) {
            $request->session()->regenerate();

            $user = Auth::user();

            // If email is not verified, redirect to OTP verification
            if (!$user->email_verified_at) {
                // Send OTP
                $this->otpService->sendOTP($user, 'verification');

                return response()->json([
                    'success' => true,
                    'requires_verification' => true,
                    'message' => 'Please verify your email with the OTP code sent to your inbox',
                ]);
            }

            return response()->json([
                'success' => true,
                'requires_verification' => false,
                'redirect' => route('homophone-check.index'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'The provided credentials do not match our records.',
        ], 422);
    }

    /**
     * Handle registration
     */
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'name' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:1|max:150',
            'education_level' => 'nullable|string',
            'khmer_experience' => 'nullable|string',
        ]);

        // Create user
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $request->name ?? $request->email,
            'age' => $request->age,
            'education_level' => $request->education_level,
            'khmer_experience' => $request->khmer_experience,
        ]);

        // Assign role based on system settings
        $this->assignRoleToNewUser($user);

        // Send OTP for email verification
        $this->otpService->sendOTP($user, 'verification');

        // Log the user in
        Auth::login($user);

        return response()->json([
            'success' => true,
            'requires_verification' => true,
            'message' => 'Account created! Please verify your email with the OTP code sent to your inbox',
        ]);
    }

    /**
     * Assign role to newly registered user
     */
    protected function assignRoleToNewUser($user)
    {
        // Check if this is the first user
        if (User::count() === 1) {
            // First user becomes Admin
            $adminRole = Role::firstOrCreate(
                ['name' => 'Admin'],
                ['guard_name' => 'web']
            );

            // Ensure admin has all permissions
            $permissions = $this->ensurePermissionsExist();
            $adminRole->syncPermissions($permissions);
            $user->assignRole($adminRole);

            \Log::info('First user registered as Admin', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } else {
            // Get default role from system settings
            $defaultRoleId = \App\Models\SystemSetting::get('default_role_id');

            if ($defaultRoleId) {
                $defaultRole = Role::find($defaultRoleId);
                if ($defaultRole) {
                    $user->assignRole($defaultRole);
                    \Log::info('User registered with configured default role', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'role' => $defaultRole->name,
                    ]);
                    return;
                }
            }

            // Fallback: Create "User" role if no default is set
            $userRole = Role::firstOrCreate(
                ['name' => 'User'],
                ['guard_name' => 'web']
            );

            // Give basic permissions
            $basicPermissions = Permission::whereIn('name', ['article-list', 'homophone-list'])->get();
            $userRole->syncPermissions($basicPermissions);

            $user->assignRole($userRole);

            \Log::info('User registered with fallback User role', [
                'user_id' => $user->id,
                'email' => $user->email,
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

            // Settings management
            'settings-edit',
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
