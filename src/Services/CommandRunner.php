<?php

namespace Blessedjasonmwanza\ArtisanUi\Services;

use Blessedjasonmwanza\ArtisanUi\Models\ArtisanUiLog;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\DB;

class CommandRunner
{
    /**
     * Run an artisan command and log the output.
     *
     * @param string $command
     * @param array $parameters
     * @return ArtisanUiLog
     */
    public function run(string $command, array $parameters = []): ArtisanUiLog
    {
        $log = ArtisanUiLog::create([
            'command' => $command,
            'parameters' => $parameters,
            'status' => 'running',
            'output' => '',
            'started_at' => now(),
        ]);

        // Build the command string for Symfony Process
        // We use 'php artisan' prefix.
        $artisanPath = base_path('artisan');
        $commandArr = ['php', $artisanPath, $command];

        // Add arguments and options
        foreach ($parameters as $key => $value) {
            if (str_starts_with($key, '--')) {
                if ($value === true) {
                    $commandArr[] = $key;
                } elseif ($value !== false && $value !== null) {
                    $commandArr[] = $key . '=' . $value;
                }
            } else {
                $commandArr[] = $value;
            }
        }

        $process = new Process($commandArr);
        $process->setTimeout(3600); // 1 hour timeout for long running tasks

        // Execute and update log in real-time (as much as possible)
        $process->run(function ($type, $buffer) use ($log) {
            $log->refresh();
            $log->output .= $buffer;
            $log->save();
        });

        if ($process->isSuccessful()) {
            $log->status = 'success';
        } else {
            $log->status = 'failed';
            $log->output .= "\n\nError: " . $process->getErrorOutput();
        }

        $log->finished_at = now();
        $log->save();

        return $log;
    }
}
