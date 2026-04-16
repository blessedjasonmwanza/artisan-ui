<?php

namespace Blessedjasonmwanza\ArtisanUi\Http\Controllers;

use Blessedjasonmwanza\ArtisanUi\Models\ArtisanUiLog;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LogController extends Controller
{
    public function index()
    {
        try {
            $logs = ArtisanUiLog::orderBy('created_at', 'desc')->paginate(20);
            
            // Ensure response format is always consistent
            return response()->json($logs);
        } catch (\Throwable $e) {
            \Log::error('LogController::index error', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json(['data' => []], 200);
        }
    }

    public function show(int $id)
    {
        try {
            $log = ArtisanUiLog::find($id);

            if (!$log || !(is_object($log) || is_array($log))) {
                return response()->json(['message' => 'Log not found'], 404);
            }

            return response()->json($log);
        } catch (\Throwable $e) {
            \Log::error('LogController::show error', [
                'message' => $e->getMessage(),
                'id' => $id
            ]);
            
            return response()->json(['message' => 'Error retrieving log'], 500);
        }
    }
}
