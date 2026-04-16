<?php

namespace Blessedjasonmwanza\ArtisanUi\Http\Controllers;

use Blessedjasonmwanza\ArtisanUi\Services\CommandRegistry;
use Blessedjasonmwanza\ArtisanUi\Services\CommandRunner;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CommandController extends Controller
{
    protected $registry;
    protected $runner;

    public function __construct(CommandRegistry $registry, CommandRunner $runner)
    {
        $this->registry = $registry;
        $this->runner = $runner;
    }

    public function index()
    {
        try {
            $commands = $this->registry->getCommands();
            
            // Ensure it's always an array
            if (!is_array($commands)) {
                $commands = [];
            }
            
            return response()->json($commands);
        } catch (\Throwable $e) {
            \Log::error('CommandController::index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([], 500);
        }
    }

    public function show(string $name)
    {
        try {
            $command = $this->registry->getCommand($name);

            if (!$command || !is_array($command)) {
                return response()->json(['message' => 'Command not found'], 404);
            }

            return response()->json($command);
        } catch (\Throwable $e) {
            \Log::error('CommandController::show error', [
                'message' => $e->getMessage(),
                'command' => $name
            ]);
            
            return response()->json(['message' => 'Error retrieving command'], 500);
        }
    }

    public function run(Request $request)
    {
        try {
            $request->validate([
                'command' => 'required|string',
                'parameters' => 'array',
            ]);

            $commandName = $request->command;
            $parameters = $request->parameters ?? [];

            // Verify command is allowed
            $command = $this->registry->getCommand($commandName);
            if (!$command) {
                return response()->json(['message' => 'Command not allowed or not found'], 403);
            }

            // Run the command
            $log = $this->runner->run($commandName, $parameters);
            
            if (!$log || !$log->id) {
                return response()->json(['message' => 'Failed to create log record'], 500);
            }

            return response()->json([
                'message' => 'Command executed',
                'log_id' => $log->id,
            ]);
        } catch (\Throwable $e) {
            \Log::error('CommandController::run error', [
                'message' => $e->getMessage(),
                'command' => $request->command ?? 'unknown'
            ]);
            
            return response()->json(['message' => 'Command execution failed'], 500);
        }
    }
}
