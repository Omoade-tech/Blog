#!/bin/bash
set -e

echo "Current ENV:"
env

echo "Database configuration:"
echo "DB_CONNECTION: $DB_CONNECTION"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_DATABASE: $DB_DATABASE"
echo "DB_USERNAME: $DB_USERNAME"
echo "DB_SSLMODE: $DB_SSLMODE"

echo "Waiting for database connection..."
until php artisan db:show > /dev/null 2>&1; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "Database connection successful!"

echo "Running migrations..."
php artisan migrate --force --verbose

echo "Migration status:"
php artisan migrate:status

echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Use the PORT environment variable from Render
PORT=${PORT:-8000}
echo "Starting server on port $PORT"
php artisan serve --host 0.0.0.0 --port $PORT 