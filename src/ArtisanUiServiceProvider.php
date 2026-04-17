<?php

namespace Blessedjasonmwanza\ArtisanUi;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Throwable;

class ArtisanUiServiceProvider extends ServiceProvider
{
    const VERSION = '1.0.23';

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/artisan-ui.php', 'artisan-ui');

        $this->app->singleton(Services\CommandRegistry::class);
        $this->app->singleton(Services\CommandRunner::class);

        $this->commands([
            Console\InstallCommand::class,
        ]);
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'artisan-ui');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');

        $this->registerRoutes();
        
        // Auto-publish assets and run migrations
        $this->ensureAssetsPublished();
        // $this->ensureMigrationsRun(); // Moved to middleware

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/artisan-ui.php' => config_path('artisan-ui.php'),
            ], 'artisan-ui-config');

            $this->publishes([
                __DIR__ . '/../resources/dist' => public_path('vendor/artisan-ui'),
            ], 'artisan-ui-assets');
        }
    }

    /**
     * Ensure assets are published (on install, update, or first access).
     *
     * @return void
     */
    protected function ensureAssetsPublished()
    {
        try {
            $sourcePath = __DIR__ . '/../resources/dist/index.js';
            $publicPath = public_path('vendor/artisan-ui/index.js');
            $versionFile = public_path('vendor/artisan-ui/.version');

            // Key conditions to publish:
            // 1. Assets don't exist yet (fresh install)
            // 2. Version has changed (package updated)
            $currentVersion = file_exists($versionFile) ? trim(file_get_contents($versionFile)) : '';
            $versionChanged = $currentVersion !== self::VERSION;
            $assetsExists = file_exists($publicPath);
            
            if (!$assetsExists || $versionChanged) {
                // Ensure directory exists
                $assetDir = public_path('vendor/artisan-ui');
                if (!is_dir($assetDir)) {
                    mkdir($assetDir, 0755, true);
                }

                // Run the publish command
                Artisan::call('vendor:publish', [
                    '--tag' => 'artisan-ui-assets',
                    '--force' => true,
                ]);

                // Also publish config if not exists
                if (!file_exists(config_path('artisan-ui.php'))) {
                    Artisan::call('vendor:publish', [
                        '--tag' => 'artisan-ui-config',
                        '--force' => true,
                    ]);
                }

                // Update version file
                file_put_contents($versionFile, self::VERSION);
                
                Log::info('Artisan UI assets published', [
                    'version' => self::VERSION,
                    'reason' => $versionChanged ? 'version-change' : 'fresh-install'
                ]);
            }
        } catch (Throwable $e) {
            Log::warning('Artisan UI asset publishing failed', [
                'error' => $e->getMessage(),
                'version' => self::VERSION
            ]);
        }
    }

    /**
     * Register the package routes.
     *
     * @return void
     */
    protected function registerRoutes()
    {
        Route::group([], function () {
            // Load API routes FIRST (before web routes) so specific routes match before catch-all
            $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
            $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
        });
    }
}
