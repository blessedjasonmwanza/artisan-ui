<?php

namespace Blessedjasonmwanza\ArtisanUi\Services;

use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class CommandRegistry
{
    /**
     * Get all registered and filtered artisan commands with metadata.
     *
     * @return array
     */
    public function getCommands(): array
    {
        $allCommands = Artisan::all();
        $filtered = [];

        $only = config('artisan-ui.commands.only', []);
        $exclude = config('artisan-ui.commands.exclude', []);

        foreach ($allCommands as $name => $command) {
            if (!empty($only) && !in_array($name, $only)) {
                continue;
            }

            if (in_array($name, $exclude)) {
                continue;
            }

            $filtered[] = $this->formatCommand($name, $command);
        }

        return $filtered;
    }

    /**
     * Get metadata for a specific command.
     *
     * @param string $name
     * @return array|null
     */
    public function getCommand(string $name): ?array
    {
        $allCommands = Artisan::all();

        if (!isset($allCommands[$name])) {
            return null;
        }

        return $this->formatCommand($name, $allCommands[$name]);
    }

    /**
     * Format command metadata.
     *
     * @param string $name
     * @param Command $command
     * @return array
     */
    protected function formatCommand(string $name, Command $command): array
    {
        $definition = $command->getDefinition();
        
        $arguments = [];
        foreach ($definition->getArguments() as $arg) {
            $arguments[] = [
                'name' => $arg->getName(),
                'description' => $arg->getDescription(),
                'required' => $arg->isRequired(),
                'default' => $arg->getDefault(),
            ];
        }

        $options = [];
        foreach ($definition->getOptions() as $opt) {
            $options[] = [
                'name' => $opt->getName(),
                'shortcut' => $opt->getShortcut(),
                'description' => $opt->getDescription(),
                'accept_value' => $opt->acceptValue(),
                'required' => $opt->isValueRequired(),
                'default' => $opt->getDefault(),
                'is_flag' => !$opt->acceptValue(),
            ];
        }

        return [
            'name' => $name,
            'description' => $command->getDescription(),
            'arguments' => $arguments,
            'options' => $options,
        ];
    }
}
