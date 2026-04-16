<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Route Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the route prefix and middleware that will be
    | applied to the Artisan UI routes.
    |
    */
    'path' => env('ARTISAN_UI_PATH', 'artisan-ui'),

    'middleware' => [
        'web',
        // \Blessedjasonmwanza\ArtisanUi\Http\Middleware\AuthenticateArtisanUi::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Command Filtering
    |--------------------------------------------------------------------------
    |
    | Only commands in the 'only' list will be shown. If 'only' is empty,
    | all commands except those in the 'exclude' list will be shown.
    |
    */
    'commands' => [
        'only' => [],
        'exclude' => [
            'tinker',
            'down',
            'up',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    |
    | If enabled, the package will use its own internal authentication system
    | with a dedicated users table.
    |
    */
    /*
    |--------------------------------------------------------------------------
    | Auto-Installation
    |--------------------------------------------------------------------------
    |
    | If enabled, the package will attempt to automatically run migrations
    | and publish assets if they are missing when the UI is first accessed.
    |
    */
    'auto_install' => env('ARTISAN_UI_AUTO_INSTALL', true),
];
