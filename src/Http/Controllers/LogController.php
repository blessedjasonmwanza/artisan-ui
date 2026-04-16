<?php

namespace Blessedjasonmwanza\ArtisanUi\Http\Controllers;

use Blessedjasonmwanza\ArtisanUi\Models\ArtisanUiLog;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LogController extends Controller
{
    public function index()
    {
        return response()->json(
            ArtisanUiLog::orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function show(int $id)
    {
        $log = ArtisanUiLog::find($id);

        if (!$log) {
            return response()->json(['message' => 'Log not found'], 404);
        }

        return response()->json($log);
    }
}
