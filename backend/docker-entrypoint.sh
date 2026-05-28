#!/bin/bash
set -e

echo "[entrypoint] Clearing bootstrap cache..."
rm -f /var/www/html/bootstrap/cache/packages.php
rm -f /var/www/html/bootstrap/cache/services.php
# config.php cacheado congela env() — eliminarlo permite que tests/bootstrap.php
# imponga sqlite ANTES de Laravel cargar config. Sin esto, pest --coverage ejecuta
# contra la BD pgsql cacheada.
rm -f /var/www/html/bootstrap/cache/config.php

# Sync only maya/* path packages in lock (handles stale lock when new shared package is added)
composer update "maya/*" --no-install --no-interaction --ignore-platform-reqs --no-scripts 2>/dev/null || true
echo "[entrypoint] Running composer install..." --no-scripts
composer install --optimize-autoloader --no-interaction --ignore-platform-reqs --no-scripts

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs
chmod -R 775 storage
chown -R www-data:www-data storage 2>/dev/null || true



echo "[entrypoint] Running package:discover..."

# Fix laravel-queue-rabbitmq Consumer::$currentJob visibility (Laravel 13 compat)
sed -i 's/protected \$currentJob;/public \$currentJob;/' \
  /var/www/html/vendor/vladimir-yuldashev/laravel-queue-rabbitmq/src/Consumer.php 2>/dev/null || true

php artisan package:discover --ansi 2>/dev/null || true

exec "$@"
