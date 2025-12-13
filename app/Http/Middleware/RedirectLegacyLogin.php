<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectLegacyLogin
{
    /**
     * Handle an incoming request.
     *
     * Force redirect /login and /register to /auth
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the request is for /login or /register
        if ($request->is('login') || $request->is('register')) {
            return redirect('/auth', 301);
        }

        return $next($request);
    }
}
