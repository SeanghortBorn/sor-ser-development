<?php

namespace App\Http\Controllers;

use App\Models\PagePermission;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class PermissionManagementController extends Controller
{
    protected PermissionService $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Display permission management page
     */
    public function index()
    {
        $pages = PagePermission::with(['overrides.role', 'overrides.user'])->get();
        $roles = Role::all();
        $actions = ['view', 'create', 'update', 'delete', 'block', 'own'];

        return Inertia::render('Permissions/Index', [
            'pages' => $pages,
            'roles' => $roles,
            'actions' => $actions,
        ]);
    }

    /**
     * Grant permission to a role
     */
    public function grantToRole(Request $request)
    {
        $request->validate([
            'page_name' => 'required|string',
            'role_id' => 'required|exists:roles,id',
            'action' => 'required|in:view,create,update,delete,block,own',
        ]);

        $this->permissionService->grantToRole(
            $request->page_name,
            $request->role_id,
            $request->action,
            auth()->user()
        );

        return redirect()->back()->with('success', 'Permission granted successfully');
    }

    /**
     * Grant permission to a user
     */
    public function grantToUser(Request $request)
    {
        $request->validate([
            'page_name' => 'required|string',
            'user_id' => 'required|exists:users,id',
            'action' => 'required|in:view,create,update,delete,block,own',
        ]);

        $this->permissionService->grantToUser(
            $request->page_name,
            $request->user_id,
            $request->action,
            auth()->user()
        );

        return redirect()->back()->with('success', 'Permission granted successfully');
    }

    /**
     * Revoke permission from role
     */
    public function revokeFromRole(Request $request)
    {
        $request->validate([
            'page_name' => 'required|string',
            'role_id' => 'required|exists:roles,id',
            'action' => 'required|in:view,create,update,delete,block,own',
        ]);

        $this->permissionService->revokeFromRole(
            $request->page_name,
            $request->role_id,
            $request->action
        );

        return redirect()->back()->with('success', 'Permission revoked successfully');
    }

    /**
     * Revoke permission from user
     */
    public function revokeFromUser(Request $request)
    {
        $request->validate([
            'page_name' => 'required|string',
            'user_id' => 'required|exists:users,id',
            'action' => 'required|in:view,create,update,delete,block,own',
        ]);

        $this->permissionService->revokeFromUser(
            $request->page_name,
            $request->user_id,
            $request->action
        );

        return redirect()->back()->with('success', 'Permission revoked successfully');
    }
}