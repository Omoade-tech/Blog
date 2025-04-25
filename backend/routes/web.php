<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

// Add a route to serve CSRF token for SPA
Route::get('/csrf', function () {
    return response()->json(['token' => csrf_token()]);
});

// Health check endpoint
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'ok',
            'database' => 'connected',
            'message' => 'Database connection successful'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'database' => 'disconnected',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Default route to return API info
Route::get('/', function () {
    return response()->json([
        'name' => 'Blog API',
        'version' => '1.0',
        'status' => 'running',
        'documentation' => 'https://blog-46qn.onrender.com/api/documentation',
        'endpoints' => [
            'auth' => [
                'POST /api/login',
                'POST /api/register',
                'POST /api/logout'
            ],
            'blogs' => [
                'GET /api/blogs',
                'GET /api/blogs/{id}',
                'GET /api/blogs/search',
                'POST /api/blogs', // Protected route
                'PUT /api/blogs/{id}', // Protected route
                'DELETE /api/blogs/{id}' // Protected route
            ],
            'profile' => [
                'GET /api/profile', // Protected route
                'POST /api/profile/update' // Protected route
            ],
            'user' => [
                'GET /api/user', // Protected route
                
            ]
        ]
    ]);
});



// Fallback route for API
Route::fallback(function () {
    return response()->json([
        'error' => 'Not Found',
        'message' => 'The requested API endpoint does not exist.'
    ], 404);
});
