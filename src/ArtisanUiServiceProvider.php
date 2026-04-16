<?php

namespace Blessedjasonmwanza\ArtisanUi;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

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
