<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        
        $roles = Role::with('permissions')
            ->when($search, function ($query, $search) {
                return $query->where('name', 'LIKE', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(10);

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'search' => $search,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('Roles/CreateEdit', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        // Sync regular permissions
        if (!empty($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->get();
            $role->syncPermissions($permissions);
        }

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role created successfully with permissions');
    }

    /**
     * Display the specified resource.
     * DISABLED - Using modal view in Index page instead
     */
    // public function show(Role $role)
    // {
    //     $role->load('permissions');
    //     
    //     return Inertia::render('Roles/Show', [
    //         'role' => $role,
    //     ]);
    // }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $role->load('permissions');
        $permissions = Permission::orderBy('name')->get();

        return Inertia::render('Roles/CreateEdit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'],
        ]);

        // Sync regular permissions
        if (isset($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->get();
            $role->syncPermissions($permissions);
        }

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // Prevent deletion of Admin role
        if ($role->name === 'Admin') {
            return redirect()
                ->route('roles.index')
                ->with('error', 'Cannot delete Admin role');
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return redirect()
                ->route('roles.index')
                ->with('error', 'Cannot delete role with assigned users');
        }
        
        $role->delete();

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role deleted successfully');
    }
}