/**
 * Fachada local sobre el peerService canónico de `@ceedcv-maya/shared-auth-react`
 * (0.16.0). La implementación se extrajo de este archivo al paquete compartido
 * sin cambios de comportamiento; se mantiene el path local porque App.tsx y
 * otros consumidores lo importan desde aquí.
 *
 * Convención Maya: cada servicio se sirve en
 *   `<slot-prefix>-<service-name>.<domain-suffix>`
 */
export { peerOrigin, resolveServiceUrl } from '@ceedcv-maya/shared-auth-react';
