<?php

namespace Blessedjasonmwanza\ArtisanUi\Http\Middleware;

use Blessedjasonmwanza\ArtisanUi\Models\ArtisanUiUser;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class EnsureSetupComplete
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

        // If no user exists and we are not on the setup page, redirect to setup
        if (!Schema::hasTable('artisan_ui_users') || DB::table('artisan_ui_users')->count() === 0) {
            if ($request->routeIs('artisan-ui.setup') || $request->expectsJson()) {
                return $next($request);
            }
            return redirect()->route('artisan-ui.setup');
        }

        return $next($request);
    }
}
