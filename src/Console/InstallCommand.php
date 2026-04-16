<?php

namespace Blessedjasonmwanza\ArtisanUi\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class InstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'artisan-ui:install';

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
            $this->info('Running migrations...');
            $this->call('migrate');
        }

        $this->info('Artisan UI installed successfully!');

        return 0;
    }
}
