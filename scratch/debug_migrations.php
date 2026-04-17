<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking artisan_ui_users table...\n";
if (Schema::hasTable('artisan_ui_users')) {
    echo "Table exists!\n";
    echo "Count: " . DB::table('artisan_ui_users')->count() . "\n";
} else {
    echo "Table does NOT exist.\n";
    
    echo "Attempting to run migrations...\n";
    $migrationPath = realpath(__DIR__ . '/database/migrations');
    echo "Path: $migrationPath\n";
    
    $exitCode = Artisan::call('migrate', [
        '--path' => $migrationPath,
        '--realpath' => true,
        '--force' => true,
    ]);
    
    echo "Migration Exit Code: $exitCode\n";
    echo "Artisan Output: " . Artisan::output() . "\n";
    
    if (Schema::hasTable('artisan_ui_users')) {
        echo "Table now exists!\n";
    } else {
        echo "Table STILL does not exist.\n";
    }
}
