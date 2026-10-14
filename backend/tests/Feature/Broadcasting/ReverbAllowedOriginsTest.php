<?php

declare(strict_types=1);

use Illuminate\Support\Str;

/*
 * D37: el Reverb del dashboard admite las SPAs de las 5 apps (las mismas que CORS) y no
 * cualquier origen. Reverb compara el host de la cabecera Origin con Str::is
 * (Laravel\Reverb\Protocols\Pusher\Server::verifyOrigin).
 */

/** @param  list<string>  $allowed */
function reverbAcceptsOrigin(array $allowed, string $origin): bool
{
    if (in_array('*', $allowed, true)) {
        return true;
    }
    $host = (string) parse_url($origin, PHP_URL_HOST);

    return collect($allowed)->contains(fn (string $pattern): bool => Str::is($pattern, $host));
}

it('admits the SPAs of the CORS domain in production', function () {
    $allowed = $this->configWithEnv('reverb', [
        'REVERB_ALLOWED_ORIGINS' => '',
        'CORS_REGEX_DOMAIN' => 'ceedcv',
        'CORS_ADDITIONAL_ORIGINS' => '',
    ])['apps']['apps'][0]['allowed_origins'];

    expect($allowed)->toBe(['*.ceedcv', 'localhost', '*.localhost']);
    foreach (['https://dms.ceedcv', 'https://dashboard.ceedcv', 'https://authorization.ceedcv', 'https://audit.ceedcv', 'https://logs.ceedcv'] as $spa) {
        expect(reverbAcceptsOrigin($allowed, $spa))->toBeTrue();
    }
    expect(reverbAcceptsOrigin($allowed, 'https://evil.example'))->toBeFalse();
    expect(reverbAcceptsOrigin($allowed, 'https://ceedcv.evil.example'))->toBeFalse();
    expect(reverbAcceptsOrigin($allowed, 'https://evilceedcv'))->toBeFalse();
});

it('follows CORS_REGEX_DOMAIN and CORS_ADDITIONAL_ORIGINS in development', function () {
    $allowed = $this->configWithEnv('reverb', [
        'REVERB_ALLOWED_ORIGINS' => '',
        'CORS_REGEX_DOMAIN' => 'maya.lan',
        'CORS_ADDITIONAL_ORIGINS' => 'http://localhost:5173, https://pruebas.example:8443',
    ])['apps']['apps'][0]['allowed_origins'];

    expect($allowed)->toBe(['*.maya.lan', 'localhost', '*.localhost', 'pruebas.example']);
    expect(reverbAcceptsOrigin($allowed, 'https://dev-dms.maya.lan'))->toBeTrue();
    expect(reverbAcceptsOrigin($allowed, 'http://localhost:5174'))->toBeTrue();
    expect(reverbAcceptsOrigin($allowed, 'https://dms.ceedcv'))->toBeFalse();
});

it('uses REVERB_ALLOWED_ORIGINS when set', function () {
    $allowed = $this->configWithEnv('reverb', [
        'REVERB_ALLOWED_ORIGINS' => '*.ceedcv, *.ceedcv.es',
        'CORS_REGEX_DOMAIN' => 'ceedcv',
        'CORS_ADDITIONAL_ORIGINS' => '',
    ])['apps']['apps'][0]['allowed_origins'];

    expect($allowed)->toBe(['*.ceedcv', '*.ceedcv.es']);
    expect(reverbAcceptsOrigin($allowed, 'https://dms.ceedcv.es'))->toBeTrue();
});
