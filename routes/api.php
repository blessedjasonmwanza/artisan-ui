<?php

use Illuminate\Support\Facades\Route;
use Blessedjasonmwanza\ArtisanUi\Http\Controllers\CommandController;
use Blessedjasonmwanza\ArtisanUi\Http\Controllers\LogController;
use Blessedjasonmwanza\ArtisanUi\Http\Controllers\AuthController;
use Blessedjasonmwanza\ArtisanUi\Http\Middleware\AuthenticateArtisanUi;
use Blessedjasonmwanza\ArtisanUi\Http\Middleware\EnsureSetupComplete;

Route::prefix(config('artisan-ui.path') . '/api')
    ->middleware(array_merge(config('artisan-ui.middleware'), [EnsureSetupComplete::class]))
    ->group(function () {

        Route::get('/setup-status', [AuthController::class, 'setupStatus']);
        Route::post('/setup', [AuthController::class, 'setup']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);

        Route::middleware([AuthenticateArtisanUi::class])->group(function () {
            Route::get('/commands', [CommandController::class, 'index']);
            Route::get('/commands/{name}', [CommandController::class, 'show']);
            Route::get('/debug/commands', [CommandController::class, 'debug']);
            Route::post('/run', [CommandController::class, 'run']);

            Route::get('/logs', [LogController::class, 'index']);
            Route::get('/logs/{id}', [LogController::class, 'show']);
        });
    });
