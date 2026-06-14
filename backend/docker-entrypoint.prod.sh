#!/bin/bash
# maya_dashboard backend — entrypoint de PRODUCCIÓN.
#
# Distinto al entrypoint dev (no hace `composer install` ni `migrate`).
# El rol se determina por:
#   1) la variable de entorno CONTAINER_ROLE si está definida
#   2) el primer argumento posicional (CMD del Dockerfile)
#
# Roles soportados: api | worker | scheduler | reverb
#
# Reglas:
# - NO ejecutar composer en runtime (vendor viene de la imagen).
# - NO ejecutar migrate aquí (Job helm hook pre-upgrade).
# - Recachear config/route por si las env cambian entre releases.
# - Logs a stdout/stderr.
set -euo pipefail

ROLE="${CONTAINER_ROLE:-${1:-api}}"

cd /var/www/html

# Asegurar que los dirs writable existan (en K3s vienen de emptyDir).
mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# Limpiar y regenerar caches por release. Si Laravel falla aquí, queremos
# saberlo en el arranque del pod (probes en Failed → reinicio controlado).
php artisan config:clear  >/dev/null 2>&1 || true
php artisan route:clear   >/dev/null 2>&1 || true
php artisan view:clear    >/dev/null 2>&1 || true
php artisan event:clear   >/dev/null 2>&1 || true

php artisan config:cache
php artisan route:cache  >/dev/null 2>&1 || true  # routes con closures lo aborta; no es bloqueante
php artisan event:cache  >/dev/null 2>&1 || true

# Fix laravel-queue-rabbitmq Consumer::$currentJob visibility (Laravel 13 compat)
# Mismo patch que en docker-entrypoint.sh (dev). Idempotente.
sed -i 's/protected \$currentJob;/public \$currentJob;/' \
    /var/www/html/vendor/vladimir-yuldashev/laravel-queue-rabbitmq/src/Consumer.php 2>/dev/null || true

case "${ROLE}" in
    api)
        echo "[entrypoint] role=api → supervisord (nginx + php-fpm)"
        exec /usr/bin/supervisord -c /etc/supervisor/conf.d/api.conf
        ;;
    worker)
        echo "[entrypoint] role=worker → notifications:consume"
        exec php artisan notifications:consume --no-interaction
        ;;
    scheduler)
        echo "[entrypoint] role=scheduler → schedule:work"
        exec php artisan schedule:work --no-interaction
        ;;
    reverb)
        echo "[entrypoint] role=reverb → reverb:start :8080"
        exec php artisan reverb:start --host=0.0.0.0 --port=8080
        ;;
    sh|bash)
        exec "$@"
        ;;
    *)
        # Cualquier otro CMD se ejecuta tal cual (debug ad-hoc).
        exec "$@"
        ;;
esac
