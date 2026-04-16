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

        Route::get('/user', [AuthController::class, 'user']);

        Route::middleware([AuthenticateArtisanUi::class])->group(function () {
            Route::get('/commands', [CommandController::class, 'index']);
            Route::get('/commands/{name}', [CommandController::class, 'show']);
            Route::post('/run', [CommandController::class, 'run']);

            Route::get('/logs', [LogController::class, 'index']);
            Route::get('/logs/{id}', [LogController::class, 'show']);
        });
    });
