<?php

namespace App\Http\Middleware;

use App\Services\PermissionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPagePermission
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $pageName, string $action = 'view'): Response
    {
        $user = auth()->user();

        if (!$user) {
            abort(403, 'Authentication required');
        }

        // Check if user has permission to access this page
        if (!$this->permissionService->canUserAccess($user, $pageName, $action)) {
            abort(403, "You don't have permission to {$action} {$pageName}");
        }

        return $next($request);
    }
}