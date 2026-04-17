<?php

use Illuminate\Support\Facades\Route;
use Blessedjasonmwanza\ArtisanUi\Http\Controllers\CommandController;
use Blessedjasonmwanza\ArtisanUi\Http\Controllers\LogController;
use Blessedjasonmwanza\ArtisanUi\Http\Controllers\AuthController;
use Blessedjasonmwanza\ArtisanUi\Http\Middleware\AuthenticateArtisanUi;
use Blessedjasonmwanza\ArtisanUi\Http\Middleware\EnsureSetupComplete;

Route::prefix(config('artisan-ui.path') . '/api')
    ->middleware(array_merge([EnsureSetupComplete::class], config('artisan-ui.middleware')))
    ->group(function () {

        Route::get('/setup-status', [AuthController::class, 'setupStatus'])->name('artisan-ui.api.setup-status');
        Route::post('/setup', [AuthController::class, 'setup'])->name('artisan-ui.api.setup');
        Route::post('/login', [AuthController::class, 'login'])->name('artisan-ui.api.login');
        Route::post('/logout', [AuthController::class, 'logout'])->name('artisan-ui.api.logout');
        Route::get('/user', [AuthController::class, 'user'])->name('artisan-ui.api.user');

        Route::middleware([AuthenticateArtisanUi::class])->group(function () {
            Route::get('/commands', [CommandController::class, 'index']);
            Route::get('/commands/{name}', [CommandController::class, 'show']);
            Route::get('/debug/commands', [CommandController::class, 'debug']);
            Route::post('/run', [CommandController::class, 'run']);

            Route::get('/logs', [LogController::class, 'index']);
            Route::get('/logs/{id}', [LogController::class, 'show']);
        });
    });
