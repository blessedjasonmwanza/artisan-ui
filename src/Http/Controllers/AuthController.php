<?php

namespace Blessedjasonmwanza\ArtisanUi\Http\Controllers;

use Blessedjasonmwanza\ArtisanUi\Models\ArtisanUiUser;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function setup(Request $request)
    {
        if ($request->isMethod('get')) {
            return view('artisan-ui::app'); // React will handle the setup view
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = ArtisanUiUser::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        Session::put('artisan_ui_user_id', $user->id);

        return response()->json(['message' => 'Setup successful', 'user' => $user]);
    }

    public function login(Request $request)
    {
        if ($request->isMethod('get')) {
            return view('artisan-ui::app');
        }

        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = ArtisanUiUser::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        Session::put('artisan_ui_user_id', $user->id);

        return response()->json(['message' => 'Login successful', 'user' => $user]);
    }

    public function logout()
    {
        Session::forget('artisan_ui_user_id');
        return response()->json(['message' => 'Logout successful']);
    }

    public function user()
    {
        $userId = Session::get('artisan_ui_user_id');
        if (!$userId) {
            return response()->json(null, 401);
        }

        return response()->json(ArtisanUiUser::find($userId));
    }

    public function setupStatus()
    {
        if (!config('artisan-ui.auth.enabled')) {
            return response()->json([
                'setup_required' => false, 
                'user_exists' => true,
                'auth_disabled' => true
            ]);
        }

        $userExists = $this->artisanUiUserCount() > 0;

        return response()->json([
            'setup_required' => !$userExists, 
            'user_exists' => $userExists,
            'auth_disabled' => false
        ]);
    }

    protected function artisanUiUserCount(): int
    {
        if (!Schema::hasTable('artisan_ui_users')) {
            return 0;
        }

        return DB::table('artisan_ui_users')->count();
    }
}

