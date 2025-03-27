<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Schema;

class AuthController extends Controller
{
    public function register(Request $request) {
        try {
            // Log the request data for debugging
            Log::info('Registration attempt with data:', $request->except(['password']));
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email'=> 'required|email|unique:users',
                'password'=> 'required|min:8',
                'role'=> 'required|in:blogUser,admin',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'], 
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);
            
            // Log success
            Log::info('User registered successfully:', ['id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'user' => $user,
                ], 201);
        } catch (ValidationException $e) {
            // Log validation errors
            Log::error('Registration validation failed:', [
                'errors' => $e->errors(),
                'client_data' => $request->except(['password'])
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Log general errors
            Log::error('Registration failed with exception:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request) {
        try {
            // Log login attempt
            Log::info('Login attempt for email:', ['email' => $request->email]);
            
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            $credentials = $request->only('email', 'password');

            // Check if user exists first
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                Log::warning('Login failed: User not found', ['email' => $request->email]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if (!Auth::attempt($credentials)) {
                Log::warning('Login failed: Invalid credentials', ['email' => $request->email]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            try {
                // Log before token creation
                Log::info('Creating token for user', ['id' => $user->id, 'email' => $user->email]);
                
                // Check if the personal_access_tokens table exists
                if (!Schema::hasTable('personal_access_tokens')) {
                    Log::error('personal_access_tokens table does not exist');
                    throw new \Exception('The authentication system is not properly set up. Please contact support.');
                }
                
                $token = $user->createToken('auth_token')->plainTextToken;
                
                // Log successful token creation
                Log::info('Token created successfully', ['user_id' => $user->id]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $user,
                    'token' => $token
                ]);
            } catch (\Exception $tokenError) {
                Log::error('Token creation failed', [
                    'error' => $tokenError->getMessage(),
                    'trace' => $tokenError->getTraceAsString()
                ]);
                
                // Return a simple token without using Sanctum as fallback
                $simpleToken = bin2hex(random_bytes(32));
                $user->remember_token = $simpleToken;
                $user->save();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful (fallback mode)',
                    'user' => $user,
                    'token' => $simpleToken,
                    'note' => 'Using fallback authentication'
                ]);
            }
        } catch (ValidationException $e) {
            Log::error('Login validation failed:', [
                'errors' => $e->errors(),
                'email' => $request->email
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Login failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login failed with exception:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $request->email
            ]);
            
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