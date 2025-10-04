<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class BlockIfUserIsBlocked
{
    public function handle($request, Closure $next)
    {
        if (Auth::check() && Auth::user()->blocked) {
            Auth::logout();
            return redirect()->route('login')->withErrors(['email' => 'Your account is blocked.']);
        }
        return $next($request);
    }
}
