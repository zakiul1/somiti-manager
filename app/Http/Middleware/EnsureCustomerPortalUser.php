<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerPortalUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_unless(
            $user
            && $user->hasRole('customer')
            && (bool) $user->portal_access_enabled
            && $user->customer_id,
            403
        );

        return $next($request);
    }
}
