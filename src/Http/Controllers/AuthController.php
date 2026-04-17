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

    /**
     * Get the current authentication state
     * Backend tells frontend which page to render, preventing race conditions
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function authState()
    {
        if (!config('artisan-ui.auth.enabled')) {
            return response()->json([
                'state' => 'dashboard',
                'user' => (object) ['id' => 1, 'name' => 'Admin', 'email' => 'admin@example.com'],
                'auth_disabled' => true
            ]);
        }

        $userCount = $this->artisanUiUserCount();

        // If no users exist, setup is required
        if ($userCount === 0) {
            \Log::debug('[AuthController] authState: No users found, returning setup state');
            return response()->json([
                'state' => 'setup',
                'user' => null,
                'auth_disabled' => false,
                'debug' => ['user_count' => 0]
            ]);
        }

        // Users exist, check if current session is authenticated
        $userId = Session::get('artisan_ui_user_id');
        
        if (!$userId) {
            // No authenticated session
            \Log::debug('[AuthController] authState: Users exist but no session, returning login state');
            return response()->json([
                'state' => 'login',
                'user' => null,
                'auth_disabled' => false,
                'debug' => ['user_count' => $userCount, 'has_session' => false]
            ]);
        }

        // Try to get authenticated user
        $user = ArtisanUiUser::find($userId);

        if (!$user) {
            // User session is stale, clear it
            \Log::debug('[AuthController] authState: Session user not found, clearing session');
            Session::forget('artisan_ui_user_id');
            return response()->json([
                'state' => 'login',
                'user' => null,
                'auth_disabled' => false,
                'debug' => ['user_count' => $userCount, 'session_user_not_found' => true]
            ]);
        }

        // User is fully authenticated
        \Log::debug('[AuthController] authState: User authenticated, returning dashboard state', ['user_id' => $user->id]);
        return response()->json([
            'state' => 'dashboard',
            'user' => $user,
            'auth_disabled' => false
        ]);
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

