<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;

class RolesController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $roles = Role::with('permissions')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('permissions', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('id', 'asc')
            ->paginate(10)
            ->appends(['search' => $search]);

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'search' => $search,
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();

        return Inertia::render('Roles/CreateEdit', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
           'name' => 'required|min:3|unique:roles,name'
        ]);

        $role = Role::create($validated);

        if($request->permissions) {

            $permissions = Permission::whereIn("id", $request->permissions)->pluck('name');

            $role->syncPermissions($permissions);
        }

        return to_route('roles.index')->with("success", "Role added successfully");
    }

    public function edit($id)
    {
        $role = Role::with(['permissions'])->find($id);

        $permissions = Permission::all();

        return Inertia::render('Roles/CreateEdit', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|unique:roles,name,' . $id
        ]);

        $role = Role::findById($id);

        $role->name = $validated['name'];

        $role->save();

        $permissions = Permission::whereIn("id", $request->permissions)->pluck('name');

        $role->syncPermissions($permissions);

        return to_route('roles.index')->with("success", "Role updated successfully");
    }

    public function destroy($id)
    {
        $role = Role::findById($id);

        $role->delete();

        return to_route('roles.index')->with("success", "Role Deleted successfully");
    }
}
