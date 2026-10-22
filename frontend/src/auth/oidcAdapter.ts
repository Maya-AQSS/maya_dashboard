/**
 * Inicialización del cliente OIDC (Keycloak vía @ceedcv-maya/shared-auth-react).
 * Solo este archivo lee la configuración de Keycloak (`KEYCLOAK_*`); el resto de la app
 * consume el servicio resultante o los hooks (`useOidcSession`, `useAuth`) del paquete.
 *
 * La configuración se lee al arrancar, no al construir (D26 R6): `publicKeycloakConfig`
 * toma `/config.js` (`MAYA_PUBLIC_KEYCLOAK_*` del chart) y, en Vite, `VITE_KEYCLOAK_*`,
 * y falla si falta alguna.
 *
 * 0.16.0: el boilerplate (AuthService + helpers) vive en `createOidcAdapter`
 * del paquete compartido; aquí solo queda la config propia de dashboard.
 */
import { createOidcAdapter, publicKeycloakConfig } from '@ceedcv-maya/shared-auth-react';

export const { oidcAuthService, appendBearerAuthorization, triggerSignIn } =
  createOidcAdapter(publicKeycloakConfig());
