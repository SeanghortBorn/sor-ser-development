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
            'age' => 'required|integer|min:1|max:120',
            'education_level' => 'required|string|max:50',
            'khmer_experience' => 'required|string|max:50',
            'agreeTerms' => 'accepted',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'age' => $request->age,
            'education_level' => $request->education_level,
            'khmer_experience' => $request->khmer_experience,
        ]);

        // If this is the first user in the system, make them Admin
        if (User::count() === 1) {
            $role = Role::firstOrCreate(['name' => 'Admin']);
            $permissions = \Spatie\Permission\Models\Permission::pluck('name')->toArray();
            if (!empty($permissions)) {
                $role->syncPermissions($permissions);
            }
            $user->assignRole($role->name);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
