<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

   'paths' => ['api/*', 'sanctum/csrf-cookie'], 
    'allowed_methods' => ['*'], 
<<<<<<< HEAD
    'allowed_origins' => [
        'https://blog-post-aorf.onrender.com',
        'https://blogpost-db.onrender.com',
        'http://localhost:3000',
        'http://localhost:5173'
    ], 
=======
    'allowed_origins' => ['https://blog-post-aorf.onrender.com', 'https://blogpost-db.onrender.com', 'http://localhost:3000', 'http://localhost:5173'], 
>>>>>>> 78c483fac8c5b6e598ce66f350192814a6fff915
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], 
    'exposed_headers' => ['*'],
    'max_age' => 0,
    'supports_credentials' => true, 

];
