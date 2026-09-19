<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaffRole
{
    /**
     * Allow the request only if the authenticated principal is a staff
     * User (Administrateur/Modérateur) with one of the given roles.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user instanceof User || ! in_array($user->role, $roles, true)) {
            abort(403, "Accès réservé au personnel d'administration.");
        }

        return $next($request);
    }
}
