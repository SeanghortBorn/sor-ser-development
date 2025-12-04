#!/bin/bash
echo "🚀 Running complete reset..."
php artisan optimize:clear
rm -rf bootstrap/cache/*.php
rm -rf public/build
composer dump-autoload
npm run build
php artisan config:cache
php artisan route:cache
echo "✅ Reset complete! Restart server."
