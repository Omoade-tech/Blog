<?php

use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Cookie\Middleware\EncryptCookies;

// Helper function to safely access environment variables
if (!function_exists('safe_env')) {
    function safe_env($key, $default = null) {
        if (function_exists('env')) {
            return env($key, $default);
        }
        return $_ENV[$key] ?? $default;
    }
}

return [
    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Domains from which your SPA will be making requests.
    |
    */

    'stateful' => array_filter(array_unique(array_merge(
        explode(',', safe_env('SANCTUM_STATEFUL_DOMAINS', '')),
        [
            'localhost',
            'localhost:3000',
            '127.0.0.1',
            '127.0.0.1:8000',
            'blog-post-aorf.onrender.com',
            'blog-46qn.onrender.com'
        ],
        safe_env('APP_URL') ? [parse_url(safe_env('APP_URL'), PHP_URL_HOST)] : []
    ))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | This array contains the authentication guards that will be checked when
    | Sanctum is trying to authenticate a request. If none of these guards
    | are able to authenticate the request, Sanctum will use the bearer
    | token that's present on an incoming request's "Authorization" header.
    |
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes until an issued token will be
    | considered expired. If this value is null, personal access tokens do
    | not expire. This won't tweak the lifetime of first-party sessions.
    |
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    |
    | Sanctum can prefix new tokens in order to take advantage of numerous
    | security scanning initiatives maintained by open source platforms
    | that notify developers if they commit tokens into repositories.
    |
    */

    'token_prefix' => safe_env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    */

    'middleware' => [
        'verify_csrf_token' => VerifyCsrfToken::class,
        'encrypt_cookies' => EncryptCookies::class,
    ],
];