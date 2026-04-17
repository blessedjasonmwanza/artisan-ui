<?php

namespace Blessedjasonmwanza\ArtisanUi\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class InstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'artisan-ui:install {--uninstall : Uninstall the package}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install the Artisan UI package';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        if ($this->option('uninstall')) {
            return $this->handleUninstall();
        }

        $this->info('Installing Artisan UI...');

        $this->info('Publishing configuration...');
        $this->call('vendor:publish', [
            '--tag' => 'artisan-ui-config',
            '--force' => true,
        ]);

        $this->info('Publishing assets...');
        $this->call('vendor:publish', [
            '--tag' => 'artisan-ui-assets',
            '--force' => true,
        ]);

        if ($this->confirm('Would you like to run the database migrations now?', true)) {
            $this->info('Running Artisan UI migrations...');

            $migrationPath = realpath(__DIR__ . '/../../database/migrations');
            $this->call('migrate', [
                '--path' => $migrationPath,
                '--realpath' => true,
                '--force' => true,
            ]);

            $output = \Illuminate\Support\Facades\Artisan::output();

            if (!Schema::hasTable('artisan_ui_users') && str_contains($output, 'Nothing to migrate')) {
                $this->warn('Artisan UI migrations out of sync. Cleaning up stale migration records and retrying...');
                
                \Illuminate\Support\Facades\DB::table('migrations')
                    ->where('migration', 'like', '%create_artisan_ui_users_table%')
                    ->orWhere('migration', 'like', '%create_artisan_ui_logs_table%')
                    ->delete();
                    
                $this->call('migrate', [
                    '--path' => $migrationPath,
                    '--realpath' => true,
                    '--force' => true,
                ]);
            }

            if (Schema::hasTable('artisan_ui_users')) {
                $this->info('Artisan UI database migrations completed successfully.');
            } else {
                $this->error('Artisan UI database table "artisan_ui_users" is still missing after migration.');
            }
        }

        $this->info('Artisan UI installed successfully!');

        return 0;
    }

    /**
     * Handle the uninstall process.
     *
     * @return int
     */
    protected function handleUninstall()
    {
        $this->info('Uninstalling Artisan UI...');

        // Remove published assets
        $assetDir = public_path('vendor/artisan-ui');
        if (is_dir($assetDir)) {
            $this->info('Removing published assets...');
            File::deleteDirectory($assetDir);
            $this->info('Assets removed successfully.');
        } else {
            $this->info('No published assets found.');
        }

        // Remove config file
        $configFile = config_path('artisan-ui.php');
        if (file_exists($configFile)) {
            $this->info('Removing configuration file...');
            unlink($configFile);
            $this->info('Configuration file removed successfully.');
        } else {
            $this->info('No configuration file found.');
        }

        // Ask about removing database table
        if ($this->confirm('Would you like to drop the Artisan UI database table?', false)) {
            $this->info('Dropping Artisan UI database table...');
            Schema::dropIfExists('artisan_ui_users');
            Schema::dropIfExists('artisan_ui_logs');
            
            // Also clean up migration records
            \Illuminate\Support\Facades\DB::table('migrations')
                ->where('migration', 'like', '%create_artisan_ui_users_table%')
                ->orWhere('migration', 'like', '%create_artisan_ui_logs_table%')
                ->delete();

            $this->info('Database tables and migration records dropped successfully.');
        }

        $this->info('Artisan UI uninstalled successfully!');

        return 0;
    }
}
