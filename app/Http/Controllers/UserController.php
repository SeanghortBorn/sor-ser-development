<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $showTrashed = $request->boolean('trashed');

        $baseQuery = User::with(['roles', 'permissions']);

        // Show deleted users if requested
        if ($showTrashed) {
            $baseQuery->onlyTrashed();
        }

        // Apply search filter to base query
        if ($request->filled('search')) {
            $search = $request->input('search');
            $baseQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Get paginated results
        $users = $baseQuery->paginate(10)->appends($request->only(['search', 'trashed']));
        $permissions = Permission::all();

        // Calculate stats for TOTAL users in database (ignore search filter)
        $studentCount = User::whereHas('permissions', function ($q) {
            $q->where('name', 'student');
        })->whereDoesntHave('roles')->count();

        $employeeCount = User::whereHas('roles')->count();

        $normalCount = User::whereDoesntHave('permissions')
            ->whereDoesntHave('roles')
            ->count();

        $userStats = [
            'total' => User::count(),
            'employees' => $employeeCount,
            'students' => $studentCount,
            'normal' => $normalCount,
            'trashed' => User::onlyTrashed()->count(),
        ];

        return Inertia::render('Users/Index', [
            'users' => $users,
            'permissions' => $permissions,
            'search' => $request->input('search', ''),
            'userStats' => $userStats,
            'showTrashed' => $showTrashed,
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        // Provide a default user object for create
        $user = [
            'id' => null,
            'name' => '',
            'email' => '',
            'roles' => [],
        ];
        return Inertia::render('Users/CreateEdit', [
            'roles' => $roles,
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'password' => ['required', 'string', 'min:8'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
        ])->validate();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Admin can assign specific role, or use default
        if (!empty($validated['roles'])) {
            $roles = Role::whereIn('id', $validated['roles'])->get();
            $user->syncRoles($roles);
        } else {
            // Use system default role
            $defaultRoleId = \App\Models\SystemSetting::get('default_role_id');
            if ($defaultRoleId) {
                $defaultRole = Role::find($defaultRoleId);
                if ($defaultRole) {
                    $user->assignRole($defaultRole);
                }
            }
        }

        return to_route('users.index')->with("success", "User created successfully");
    }

    public function edit($id)
    {
        $user = User::with(['roles', 'permissions'])->find($id);
        $roles = Role::all();
        $permissions = Permission::all();

        return Inertia::render('Users/CreateEdit', [
            'roles' => $roles,
            'user' => $user,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from editing own roles
        if (auth()->id() == $id && $request->has('roles')) {
            return back()->withErrors(['roles' => 'You cannot modify your own roles.']);
        }

        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ])->validate();

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        // Sync roles, allow empty array (user can have no roles)
        if (!empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        } else {
            $user->syncRoles([]); // Remove all roles if none provided
        }

        return back()->with("success", "User updated successfully");
    }

    public function updatePermissions(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from editing own permissions
        if (auth()->id() == $id) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => 'You cannot modify your own permissions.'], 403);
            }
            return back()->withErrors(['permissions' => 'You cannot modify your own permissions.']);
        }

        // Accept empty array or missing permissions key
        $validated = $request->validate([
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        // If permissions is not present, treat as empty array
        $permissions = $validated['permissions'] ?? [];

        $user->syncPermissions($permissions);

        // If AJAX, return JSON, else redirect back
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true]);
        }
        return back()->with('success', 'Permissions updated successfully.');
    }

    public function block($id)
    {
        $user = User::findOrFail($id);
        $user->blocked = true;
        $user->save();

        return back()->with('success', 'User blocked successfully.');
    }

    public function unblock($id)
    {
        $user = User::findOrFail($id);
        $user->blocked = false;
        $user->save();

        return back()->with('success', 'User unblocked successfully.');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return to_route('users.index')->with("success", "User deleted successfully");
    }

    public function restore($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return back()->with("success", "User restored successfully");
    }
}
