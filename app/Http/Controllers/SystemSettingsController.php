<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SystemSetting;
use Spatie\Permission\Models\Role;

class SystemSettingsController extends Controller
{
    /**
     * Display system settings page
     */
    public function index()
    {
        $roles = Role::all();
        $defaultRoleId = SystemSetting::get('default_role_id');

        return Inertia::render('Settings/Index', [
            'roles' => $roles,
            'settings' => [
                'default_role_id' => $defaultRoleId,
            ],
        ]);
    }

    /**
     * Update system settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'default_role_id' => 'required|exists:roles,id',
        ]);

        SystemSetting::set('default_role_id', $validated['default_role_id'], 'integer');

        return back()->with('success', 'Default role updated successfully');
    }
}