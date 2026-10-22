/**
 * Cliente HTTP autenticado — delegado a `createServiceApiClient` de
 * @ceedcv-maya/shared-auth-react (0.16.0): resuelve la baseUrl vía
 * `peerOrigin('dashboard-api')/api/v1` con override `API_URL` de la configuración en
 * ejecución (`/config.js`, `MAYA_PUBLIC_API_URL`; en Vite, `VITE_API_URL`; D26 R6).
 * El Bearer lo añade la instancia Keycloak de {@link ../auth/oidcAdapter}.
 *
 * `mapApiError` se re-exporta del paquete: la implementación canónica se
 * extrajo de este archivo (dashboard es su origen) con comportamiento idéntico.
 */
import {
  createServiceApiClient,
  publicConfig,
  ApiHttpError,
  type ApiFetchOptions,
} from '@ceedcv-maya/shared-auth-react';
import { oidcAuthService } from '../auth/oidcAdapter';

const client = createServiceApiClient(
  'dashboard-api',
  oidcAuthService.keycloak,
  publicConfig('API_URL'),
);

export { ApiHttpError, type ApiFetchOptions };
export { mapApiError, mapApiErrorToI18nKey } from '@ceedcv-maya/shared-auth-react';
export const { apiFetchJson, apiGetJson, buildApiUrl, getBearerToken } = client;
