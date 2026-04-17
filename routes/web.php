<?php

use Illuminate\Support\Facades\Route;
use Blessedjasonmwanza\ArtisanUi\Http\Controllers\AuthController;
use Blessedjasonmwanza\ArtisanUi\Http\Middleware\EnsureSetupComplete;

Route::prefix(config('artisan-ui.path'))
    ->middleware(array_merge([EnsureSetupComplete::class], config('artisan-ui.middleware')))
    ->group(function () {
        Route::get('/setup', [AuthController::class, 'setup'])->name('artisan-ui.setup');
        Route::post('/setup', [AuthController::class, 'setup']);
        
        Route::get('/login', [AuthController::class, 'login'])->name('artisan-ui.login');
        Route::post('/login', [AuthController::class, 'login']);
        
        Route::post('/logout', [AuthController::class, 'logout'])->name('artisan-ui.logout');

        // SPA Entry
        Route::get('/{view?}', function () {
            return view('artisan-ui::app');
        })->where('view', '.*')->name('artisan-ui.index');
    });
