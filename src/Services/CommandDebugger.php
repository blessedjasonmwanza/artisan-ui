<?php

namespace Blessedjasonmwanza\ArtisanUi\Services;

use Illuminate\Support\Facades\Artisan;

/**
 * Debug utility for troubleshooting command discovery
 */
class CommandDebugger
{
    /**
     * Get debug information about command discovery
     *
     * @return array
     */
    public static function getDebugInfo(): array
    {
        $allCommands = Artisan::all();
        $registry = new CommandRegistry();
        $filtered = $registry->getCommands();

        return [
            'total_commands_discovered' => count($allCommands),
            'commands_after_filtering' => count($filtered),
            'config' => [
                'only' => config('artisan-ui.commands.only', []),
                'exclude' => config('artisan-ui.commands.exclude', []),
            ],
            'all_command_names' => array_keys($allCommands),
            'filtered_command_names' => array_map(fn($cmd) => $cmd['name'], $filtered),
            'excluded_commands' => array_diff(array_keys($allCommands), array_map(fn($cmd) => $cmd['name'], $filtered)),
        ];
    }

    /**
     * Log debug information
     *
     * @return void
     */
    public static function logDebugInfo(): void
    {
        $info = self::getDebugInfo();
        \Log::info('Artisan UI Command Debug', $info);
    }
}
