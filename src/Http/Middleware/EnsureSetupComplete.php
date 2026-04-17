<?php

namespace Blessedjasonmwanza\ArtisanUi\Http\Middleware;

use Blessedjasonmwanza\ArtisanUi\Models\ArtisanUiUser;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Throwable;

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
        // Ensure migrations are run on first access
        $this->ensureMigrationsRun();

        // If auth is disabled, allow access
        if (!config('artisan-ui.auth.enabled')) {
            return $next($request);
        }

        // If auth is enabled, check if setup is complete
        $tableExists = Schema::hasTable('artisan_ui_users');
        $hasUsers = $tableExists && DB::table('artisan_ui_users')->count() > 0;

        // If setup is not complete (no table or no users), allow access to setup-related routes
        if (!$tableExists || !$hasUsers) {
            // Allow setup page and all API routes
            if ($request->routeIs('artisan-ui.setup') || $request->is('artisan-ui/api/*') || $request->expectsJson()) {
                return $next($request);
            }
            return redirect()->route('artisan-ui.setup');
        }

        // Setup is complete, allow access
        return $next($request);
    }

    /**
     * Ensure migrations have been run.
     *
     * @return void
     */
    protected function ensureMigrationsRun()
    {
        try {
            if (!Schema::hasTable('artisan_ui_users')) {
                Artisan::call('migrate', [
                    '--path' => 'vendor/blessedjasonmwanza/artisan-ui/database/migrations',
                    '--force' => true,
                ]);
                
                Log::info('Artisan UI migrations executed automatically');
            }
        } catch (Throwable $e) {
            Log::warning('Artisan UI migrations failed', [
                'error' => $e->getMessage()
            ]);
        }
    }
}
