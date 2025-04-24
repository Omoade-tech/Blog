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

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www

# Copy the deployment entrypoint script
COPY deploy-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create .env file if it doesn't exist
RUN if [ ! -f .env ]; then \
    cp .env.example .env || echo "No .env.example file found"; \
    fi

# Expose port (will be overridden by PORT env var)
EXPOSE 10000

# Use the entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]