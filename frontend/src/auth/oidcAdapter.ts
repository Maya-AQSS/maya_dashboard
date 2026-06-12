/**
 * Inicialización del cliente OIDC (Keycloak vía @ceedcv-maya/shared-auth-react).
 * Solo este archivo lee `import.meta.env.VITE_KEYCLOAK_*`; el resto de la app
 * consume el servicio resultante o los hooks (`useOidcSession`, `useAuth`) del paquete.
 *
 * 0.16.0: el boilerplate (AuthService + helpers) vive en `createOidcAdapter`
 * del paquete compartido; aquí solo queda la config propia de dashboard.
 */
import { createOidcAdapter } from '@ceedcv-maya/shared-auth-react';

export const { oidcAuthService, appendBearerAuthorization, triggerSignIn } =
  createOidcAdapter({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  });
