FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    git \
    unzip \
    libicu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo pdo_pgsql intl

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www
COPY . /var/www

# Set environment variables
ENV APP_URL=https://blogpost-db.onrender.com
ENV APP_DEBUG=false
ENV APP_ENV=production
ENV DB_CONNECTION=pgsql
ENV DB_HOST=aws-0-us-west-1.pooler.supabase.com
ENV DB_PORT=5432
ENV DB_DATABASE=postgres
ENV DB_USERNAME=postgres.oawesktltrtfudeipgrs
ENV DB_PASSWORD=Adelani8991#

# Install PHP dependencies but skip scripts that might need DB connection
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy env file - will be overridden by render.yaml's buildCommand
COPY .env.render .env

# Clear configuration - avoid caching configuration as it will be set at runtime
RUN php artisan config:clear || true
RUN php artisan cache:clear || true

# Don't run migrations here - they will be run at startup
# RUN php artisan migrate --force

# Permissions
RUN chown -R www-data:www-data /var/www \
    && chmod 755 /var/www

# Expose port 
EXPOSE 8000

# Define entrypoint script to be run at startup
COPY deploy-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/deploy-entrypoint.sh

# Use our entrypoint script
CMD ["/usr/local/bin/deploy-entrypoint.sh"]