<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionManagementController extends Controller
{
    /**
     * Display permission management page
     */
    public function index()
    {
        $permissions = Permission::orderBy('name')->get();
        $roles = Role::with('permissions')->get();
        $users = User::with('roles', 'permissions')->get(['id', 'name', 'email']);

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
            'roles' => $roles,
            'users' => $users,
        ]);
    }

    /**
     * Grant permission to a role
     */
    public function grantToRole(Request $request)
    {
        $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findById($request->role_id);
        $permission = Permission::findById($request->permission_id);
        
        $role->givePermissionTo($permission);

        return redirect()->back()->with('success', 'Permission granted to role successfully');
    }

    /**
     * Grant permission to a user
     */
    public function grantToUser(Request $request)
    {
        $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);
        $permission = Permission::findById($request->permission_id);
        
        $user->givePermissionTo($permission);

        return redirect()->back()->with('success', 'Permission granted to user successfully');
    }

    /**
     * Revoke permission from role
     */
    public function revokeFromRole(Request $request)
    {
        $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findById($request->role_id);
        $permission = Permission::findById($request->permission_id);
        
        $role->revokePermissionTo($permission);

        return redirect()->back()->with('success', 'Permission revoked from role successfully');
    }

    /**
     * Revoke permission from user
     */
    public function revokeFromUser(Request $request)
    {
        $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);
        $permission = Permission::findById($request->permission_id);
        
        $user->revokePermissionTo($permission);

        return redirect()->back()->with('success', 'Permission revoked from user successfully');
    }
}
