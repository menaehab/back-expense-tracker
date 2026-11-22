<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register
     *
     * Register a new user and start an authenticated session.
     *
     * @unauthenticated
     * @group Authentication
     *
     * @bodyParam name string required The user's name. Minimum 2 characters. Example: Ahmed Mohamed
     * @bodyParam email string required The user's unique email address. Example: ahmed@example.com
     * @bodyParam password string required The user's password. Minimum 8 characters. Example: secret123
     * @bodyParam password_confirmation string required Must match password. Example: secret123
     *
     * @response 201 scenario="success" {
     *   "message": "User registered successfully",
     *   "data": {
     *     "user": {
     *       "id": 1,
     *       "name": "Ahmed Mohamed",
     *       "email": "ahmed@example.com",
     *       "created_at": "2026-06-02T10:53:32.000000Z",
     *       "updated_at": "2026-06-02T10:53:32.000000Z"
     *     }
     *   }
     * }
     * @response 422 scenario="validation error" {
     *   "message": "The email has already been taken.",
     *   "errors": {
     *     "email": ["The email has already been taken."]
     *   }
     * }
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create($validated);

        Auth::login($user);

        return response()->json(['message' => 'User registered successfully', 'data' => ['user' => $user]], 201);
    }

    /**
     * Login
     *
     * Authenticate a user and start a session.
     *
     * @unauthenticated
     * @group Authentication
     *
     * @bodyParam email string required The user's email address. Example: ahmed@example.com
     * @bodyParam password string required The user's password. Example: secret123
     *
     * @response 200 scenario="success" {
     *   "message": "Login successful",
     *   "data": {
     *     "user": {
     *       "id": 1,
     *       "name": "Ahmed Mohamed",
     *       "email": "ahmed@example.com"
     *     }
     *   }
     * }
     * @response 401 scenario="invalid credentials" {
     *   "message": "Invalid credentials"
     * }
     * @response 422 scenario="validation error" {
     *   "message": "The email field is required.",
     *   "errors": {
     *     "email": ["The email field is required."]
     *   }
     * }
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        Auth::login($user);

        $request->session()->regenerate();

        return response()->json(['message' => 'Login successful', 'data' => ['user' => $user]], 200);
    }

    /**
     * Logout
     *
     * Invalidate the authenticated user's current session.
     *
     * @authenticated
     * @group Authentication
     *
     * @response 200 scenario="success" {
     *   "message": "Logged out successfully"
     * }
     * @response 401 scenario="unauthenticated" {
     *   "message": "Unauthenticated."
     * }
     */
    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }
}
