<?php

use Illuminate\Support\Facades\Route;

// Add a route to serve CSRF token for SPA
Route::get('/csrf', function () {
    return response()->json(['token' => csrf_token()]);
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
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
                'GET /api/blogs/search'
            ],
            'profile' => [
                'GET /api/profile',
                'POST /api/profile/update'
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
