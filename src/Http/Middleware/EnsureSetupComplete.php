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

        $tableExists = Schema::hasTable('artisan_ui_users');
        $hasUsers = $tableExists && DB::table('artisan_ui_users')->count() > 0;

        // If setup is complete (users exist), prevent access to setup pages
        if ($hasUsers) {
            if ($request->routeIs('artisan-ui.setup') || $request->is('artisan-ui/api/setup')) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Setup already completed.'], 400);
                }
                return redirect()->route('artisan-ui.login');
            }
            return $next($request);
        }

        // If setup is not complete (no table or no users), allow access to setup-related routes
        if (!$tableExists || !$hasUsers) {
            $path = trim(config('artisan-ui.path', 'artisan-ui'), '/');
            
            // Allow setup, login, and SPA entry routes
            if ($request->routeIs('artisan-ui.setup') || 
                $request->routeIs('artisan-ui.login') ||
                $request->routeIs('artisan-ui.index') ||
                $request->routeIs('artisan-ui.api.setup') || 
                $request->routeIs('artisan-ui.api.setup-status') ||
                $request->routeIs('artisan-ui.api.login') ||
                $request->is($path . '/setup*') || 
                $request->is($path . '/login*') || 
                $request->is($path . '/api/setup*') || 
                $request->is($path . '/api/setup-status*') ||
                $request->is($path . '/api/login*')) {
                return $next($request);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Setup not complete. Please visit the setup page.',
                    'setup_required' => true
                ], 403);
            }

            return redirect()->route('artisan-ui.setup');
        }
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
                $migrationPath = realpath(__DIR__ . '/../../../database/migrations');
                
                Artisan::call('migrate', [
                    '--path' => $migrationPath,
                    '--realpath' => true,
                    '--force' => true,
                ]);
                
                Log::info('Artisan UI migrations executed automatically', ['path' => $migrationPath]);
            }
        } catch (Throwable $e) {
            Log::warning('Artisan UI migrations failed', [
                'error' => $e->getMessage()
            ]);
        }
    }
}
