<?php

namespace App\Http\Middleware;

use App\Models\Membre;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsMembre
{
    /**
     * Allow the request only if the authenticated principal is a Membre
     * (actions réservées aux adhérents : voter, soumettre une idée, etc.).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() instanceof Membre) {
            abort(403, 'Action réservée aux membres adhérents.');
        }

        return $next($request);
    }
}
