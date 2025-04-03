<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Get allowed origins from config
        $allowedOrigins = Config::get('cors.allowed_origins', ['*']);
        $origin = $request->header('Origin');
        
        // Check if the request origin is in the allowed list
        if ($origin && (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins))) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            // Check against patterns if direct match not found
            $allowedPatterns = Config::get('cors.allowed_origins_patterns', []);
            foreach ($allowedPatterns as $pattern) {
                if ($origin && preg_match($pattern, $origin)) {
                    $response->headers->set('Access-Control-Allow-Origin', $origin);
                    break;
                }
            }
        }
        
        $response->headers->set('Access-Control-Allow-Methods', implode(',', Config::get('cors.allowed_methods', ['*'])));
        $response->headers->set('Access-Control-Allow-Headers', implode(',', Config::get('cors.allowed_headers', ['*'])));
        $response->headers->set('Access-Control-Allow-Credentials', Config::get('cors.supports_credentials', true) ? 'true' : 'false');
        $response->headers->set('Access-Control-Max-Age', Config::get('cors.max_age', 0));

        return $response;
    }
} 