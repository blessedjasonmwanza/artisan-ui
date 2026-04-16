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
        return response()->json($this->registry->getCommands());
    }

    public function show(string $name)
    {
        $command = $this->registry->getCommand($name);

        if (!$command) {
            return response()->json(['message' => 'Command not found'], 404);
        }

        return response()->json($command);
    }

    public function run(Request $request)
    {
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

        return response()->json([
            'message' => 'Command executed',
            'log_id' => $log->id,
        ]);
    }
}
