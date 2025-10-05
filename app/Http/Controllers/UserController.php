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
        $query = User::with(['roles', 'permissions']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(10)->appends($request->only('search'));
        $permissions = Permission::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'permissions' => $permissions,
            'search' => $request->input('search', ''),
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
            'roles.*' => ['integer', 'exists:roles,id'],
        ])->validate();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign roles only if provided and not empty
        if (!empty($validated['roles'])) {
            $user->assignRole($validated['roles']);
        }
        // If roles is empty/null, do not assign any role (user will have no roles)
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

        return to_route('users.index')->with("success", "User updated successfully");
    }

    public function updatePermissions(Request $request, $id)
    {
        $user = User::findOrFail($id);

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

        return to_route('users.index')->with("success", "User Deleted successfully");
    }
}
