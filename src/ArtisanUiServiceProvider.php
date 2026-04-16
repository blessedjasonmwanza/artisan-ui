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
        $this->handleAutoInstall();

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
     * Handle automatic installation if enabled.
     *
     * @return void
     */
    protected function handleAutoInstall()
    {
        if (!config('artisan-ui.auto_install', true) || $this->app->runningInConsole()) {
            return;
        }

        // Only run when accessing Artisan UI routes to avoid overhead
        if (!request()->is(config('artisan-ui.path') . '*')) {
            return;
        }

        try {
            // Check for assets
            if (!file_exists(public_path('vendor/artisan-ui/index.js'))) {
                Artisan::call('vendor:publish', [
                    '--tag' => 'artisan-ui-assets',
                    '--force' => true,
                ]);
            }

            // Check for migrations
            if (!Schema::hasTable('artisan_ui_users')) {
                Artisan::call('migrate');
            }
        } catch (Throwable $e) {
            Log::warning('Artisan UI Auto-installation failed: ' . $e->getMessage(), [
                'exception' => $e
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
            $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
            $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
        });
    }
}
