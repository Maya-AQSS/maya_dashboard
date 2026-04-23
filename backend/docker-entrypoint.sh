#!/bin/bash
set -e

echo "[entrypoint] Clearing bootstrap cache..."
rm -f /var/www/html/bootstrap/cache/packages.php
rm -f /var/www/html/bootstrap/cache/services.php

echo "[entrypoint] Running composer install..."
composer install --optimize-autoloader --no-interaction --ignore-platform-reqs

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs
chmod -R 775 storage
chown -R www-data:www-data storage 2>/dev/null || true

echo "[entrypoint] Running migrations..."
php artisan migrate --force --no-interaction 2>/dev/null || true

echo "[entrypoint] Seeding database..."
php artisan db:seed --force --no-interaction 2>/dev/null || true

echo "[entrypoint] Running package:discover..."
php artisan package:discover --ansi 2>/dev/null || true

exec "$@"
