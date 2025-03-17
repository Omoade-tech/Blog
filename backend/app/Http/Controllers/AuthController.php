<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request) {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email'=> 'required|email|unique:users',
                'password'=> 'required|min:8',
                'role'=> 'required|in:blogUser,admin',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email, 
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);
            
        

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request) {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            $credentials = $request->only('email', 'password');

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $user = User::where('email', $request->email)->first();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    public function logout(Request $request)
    {
        try {
            // Revoke all tokens...
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}