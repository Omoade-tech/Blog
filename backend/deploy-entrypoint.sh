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

# Test database connection with retries
echo "Testing database connection..."
MAX_RETRIES=5
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  php -r "
  try {
      \$pdo = new PDO('$DB_CONNECTION:host=$DB_HOST;port=$DB_PORT;dbname=$DB_DATABASE', '$DB_USERNAME', '$DB_PASSWORD');
      echo \"✅ Database connection successful\\n\";
      exit(0);
  } catch (PDOException \$e) {
      echo \"❌ Database connection attempt $RETRY_COUNT failed: \" . \$e->getMessage() . \"\\n\";
      exit(1);
  }
  "
  if [ $? -eq 0 ]; then
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Retrying database connection in 5 seconds... (Attempt $RETRY_COUNT of $MAX_RETRIES)"
  sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Failed to connect to database after $MAX_RETRIES attempts"
  exit 1
fi

# Run migrations with proper error handling
echo "Running migrations..."
php artisan migrate --force --verbose
if [ $? -ne 0 ]; then
  echo "❌ Migrations failed"
  exit 1
fi

# Ensure Sanctum tables exist
echo "Ensuring Sanctum tables exist..."
php artisan sanctum:create-table --verbose
if [ $? -ne 0 ]; then
  echo "❌ Sanctum table setup failed"
  exit 1
fi

# Create storage link
echo "Setting up storage links..."
php artisan storage:link
if [ $? -ne 0 ]; then
  echo "❌ Storage link setup failed"
  exit 1
fi

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
    exit(1);
}
"

# Start the server
echo "Starting web server..."
php -S 0.0.0.0:$PORT -t public 