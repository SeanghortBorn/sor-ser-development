#!/bin/bash
# deploy.sh - Run this after each deployment

echo "🚀 Starting post-deployment tasks..."

# Install/Update Composer dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Set proper permissions
echo "🔐 Setting file permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 777 storage/logs storage/framework

# Clear and optimize caches
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimize for production (only for production, not staging)
if [ "$1" == "production" ]; then
    echo "⚡ Optimizing for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

echo "✅ Post-deployment tasks completed!"