/**
 * Cliente HTTP autenticado — delegado al factory de @maya/shared-auth-react.
 * El Bearer lo añade la instancia Keycloak de {@link ../auth/oidcAdapter}.
 */
import { createApiClient, ApiHttpError, type ApiFetchOptions } from '@maya/shared-auth-react';
import { oidcAuthService } from '../auth/oidcAdapter';
import { peerOrigin } from '../lib/peerService';

const baseUrl = ((import.meta.env.VITE_API_URL as string | undefined)?.trim())
  || `${peerOrigin('dashboard-api')}/api/v1`;

const client = createApiClient(oidcAuthService.keycloak, baseUrl);

export { ApiHttpError, type ApiFetchOptions };
export const { apiFetchJson, apiGetJson, buildApiUrl, getBearerToken } = client;

/**
 * Translates an error thrown by `apiFetchJson` / `apiGetJson` into a
 * domain-prefixed `Error` whose `.message` is an i18n key. Mirrors the
 * contract of the previous local `fetchClient.mapApiError` so consumers
 * keep their existing i18n lookups (`favorites.errorUnauthorized`,
 * `dashboardLayout.errorServer`, …).
 *
 * Network failures (`fetch()` rejecting with `TypeError`) map to
 * `${prefix}.errorNetwork`.
 */
export function mapApiError(err: unknown, prefix: string, fallbackSuffix = 'errorLoad'): Error {
  if (err instanceof ApiHttpError) {
    if (err.status === 401) return new Error(`${prefix}.errorUnauthorized`);
    if (err.status === 403) return new Error(`${prefix}.errorForbidden`);
    if (err.status === 404) return new Error(`${prefix}.errorNotFound`);
    if (err.status === 422) return new Error(`${prefix}.errorValidation`);
    if (err.status >= 500) return new Error(`${prefix}.errorServer`);
  }
  if (err instanceof TypeError) return new Error(`${prefix}.errorNetwork`);
  return new Error(`${prefix}.${fallbackSuffix}`);
}
