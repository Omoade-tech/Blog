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

# Verify existence of critical files
echo "Checking for critical Laravel files..."
for file in "app/Http/Kernel.php" "app/Console/Kernel.php"; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Missing required file: $file"
    exit 1
  else
    echo "✅ Found $file"
  fi
done

# Clear caches
echo "Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Test database connection
echo "Testing database connection..."
# Verify database connection by running a simple query
php -r "
try {
    \$pdo = new PDO('$DB_CONNECTION:host=$DB_HOST;port=$DB_PORT;dbname=$DB_DATABASE', '$DB_USERNAME', '$DB_PASSWORD');
    echo \"✅ Database connection successful\\n\";
} catch (PDOException \$e) {
    echo \"❌ Database connection failed: \" . \$e->getMessage() . \"\\n\";
    // Don't exit, just continue with deployment
}
"

# Wait a bit to ensure database is ready
echo "Waiting for database connection..."
sleep 10

# Try running SQL file directly first to ensure tables exist
echo "Creating tables directly with SQL if needed..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -f create_sanctum_tables.sql || echo "Direct SQL failed, will try migrations next"

# Try to run migrations with verbose output for debugging
echo "Running migrations..."
php artisan migrate --force --verbose || echo "Migration failed but continuing..."

# Ensure personal_access_tokens table exists with error output
echo "Ensuring Sanctum tables exist..."
php artisan sanctum:create-table --verbose || echo "Sanctum table setup failed but continuing..."

# Create storage link if it doesn't exist
echo "Setting up storage links..."
php artisan storage:link || echo "Storage link setup failed but continuing..."

# List database tables for debugging
echo "Checking database tables..."
php -r "
try {
    \$pdo = new PDO('$DB_CONNECTION:host=$DB_HOST;port=$DB_PORT;dbname=$DB_DATABASE', '$DB_USERNAME', '$DB_PASSWORD');
    \$stmt = \$pdo->query('SELECT table_name FROM information_schema.tables WHERE table_schema = \\'public\\' ORDER BY table_name');
    echo \"Available tables:\\n\";
    while (\$row = \$stmt->fetch()) {
        echo \"- \" . \$row['table_name'] . \"\\n\";
    }
} catch (PDOException \$e) {
    echo \"Could not list tables: \" . \$e->getMessage() . \"\\n\";
}
"

# Start the server
echo "Starting web server..."
php -S 0.0.0.0:$PORT -t public 