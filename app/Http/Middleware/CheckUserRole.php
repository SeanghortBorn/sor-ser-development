<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        // If user has no roles, redirect to Welcome page
        if (!$user || ($user->roles()->count() === 0)) {
            return redirect('/library');
        }

        return $next($request);
    }
}