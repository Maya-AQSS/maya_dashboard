FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev \
    linux-headers

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    sockets

# Redis + pcov via PECL. pcov se usa para coverage en `php artisan test --coverage`.
# Es mucho más rápido que xdebug en modo coverage y no afecta a runs normales.
# Redis + pcov: descargados desde GitHub directamente.
# pecl.php.net tiene caídas frecuentes (HTTP 504 con redirect roto en 2026-05).
# Las versiones se fijan aquí para builds reproducibles.
ENV PHPREDIS_VERSION=6.2.0
ENV PCOV_VERSION=1.0.12
RUN apk add --no-cache $PHPIZE_DEPS \
    && curl -fsSL "https://github.com/phpredis/phpredis/archive/refs/tags/${PHPREDIS_VERSION}.tar.gz" | tar -xz -C /tmp \
    && cd /tmp/phpredis-${PHPREDIS_VERSION} \
    && phpize && ./configure --enable-redis && make -j$(nproc) && make install \
    && curl -fsSL "https://github.com/krakjoe/pcov/archive/refs/tags/v${PCOV_VERSION}.tar.gz" | tar -xz -C /tmp \
    && cd /tmp/pcov-${PCOV_VERSION} \
    && phpize && ./configure --enable-pcov && make -j$(nproc) && make install \
    && docker-php-ext-enable redis pcov \
    && rm -rf /tmp/phpredis-${PHPREDIS_VERSION} /tmp/pcov-${PCOV_VERSION} \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2.9 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
