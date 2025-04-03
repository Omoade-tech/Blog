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

// Default route to serve the welcome view
Route::get('/', function () {
    return view('welcome');
});

// Fallback route for SPA
Route::fallback(function () {
    return view('welcome');
});
