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

# Set Supabase environment variables
ENV DB_CONNECTION=pgsql
ENV DB_HOST=aws-0-us-west-1.pooler.supabase.com
ENV DB_PORT=5432
ENV DB_DATABASE=postgres
ENV DB_USERNAME=postgres.
ENV DB_PASSWORD=

# Install PHP dependencies, cache config, and run migrations with debug
ENV APP_URL=
RUN composer install --no-scripts --no-interaction \
    && php artisan config:cache \
    && echo "Connecting to $DB_HOST:$DB_PORT, DB: $DB_DATABASE" \
    && php artisan migrate:fresh --force --verbose \
    && php artisan storage:link

# Permissions
RUN chown -R www-data:www-data /var/www \
    && chmod 755 /var/www

# Expose port
EXPOSE 10000

CMD ["php", "artisan", "serve", "--host", "0.0.0.0", "--port", "10000"]