<?php

namespace Blessedjasonmwanza\ArtisanUi\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class AuthenticateArtisanUi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  (\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (!config('artisan-ui.auth.enabled')) {
            return $next($request);
        }

        // Allow setup and login routes without authentication
        $path = trim(config('artisan-ui.path', 'artisan-ui'), '/');
        if ($request->routeIs('artisan-ui.login') || 
            $request->routeIs('artisan-ui.setup') ||
            $request->routeIs('artisan-ui.api.login') ||
            $request->routeIs('artisan-ui.api.setup') ||
            $request->routeIs('artisan-ui.api.setup-status') ||
            $request->is($path . '/login*') || 
            $request->is($path . '/setup*') || 
            $request->is($path . '/api/login*') || 
            $request->is($path . '/api/setup*') || 
            $request->is($path . '/api/setup-status*')) {
            return $next($request);
        }

        if (!Session::has('artisan_ui_user_id')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('artisan-ui.login');
        }

        return $next($request);
    }
}
