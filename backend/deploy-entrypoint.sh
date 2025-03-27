#!/bin/bash
set -e

# Print environment info (excluding sensitive data)
echo "Starting deployment with:"
echo "APP_ENV: $APP_ENV"
echo "APP_DEBUG: $APP_DEBUG"
echo "APP_URL: $APP_URL"
echo "DB_CONNECTION: $DB_CONNECTION"
echo "DB_HOST: $DB_HOST"
echo "DB_DATABASE: $DB_DATABASE"

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Wait a bit to ensure database is ready
echo "Waiting for database connection..."
sleep 5

# Try to run migrations (but continue on error)
echo "Running migrations..."
php artisan migrate --force || echo "Migration failed but continuing..."

# Ensure personal_access_tokens table exists
echo "Ensuring Sanctum tables exist..."
php artisan sanctum:create-table || echo "Sanctum table setup failed but continuing..."

# Create storage link if it doesn't exist
echo "Setting up storage links..."
php artisan storage:link || echo "Storage link setup failed but continuing..."

# Start the server
echo "Starting web server..."
php -S 0.0.0.0:$PORT -t public 