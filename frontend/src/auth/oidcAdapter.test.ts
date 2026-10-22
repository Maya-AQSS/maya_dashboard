import { afterEach, describe, expect, it, vi } from 'vitest'

// createOidcAdapter espiado; publicKeycloakConfig, el real del paquete (D26 R6).
const { createOidcAdapter } = vi.hoisted(() => ({
  createOidcAdapter: vi.fn(() => ({
    oidcAuthService: { keycloak: {} },
    appendBearerAuthorization: vi.fn(),
    triggerSignIn: vi.fn(),
  })),
}))

vi.mock('@ceedcv-maya/shared-auth-react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@ceedcv-maya/shared-auth-react')>()),
  createOidcAdapter,
}))

describe('oidcAdapter', () => {
  afterEach(() => {
    delete window.__MAYA_CONFIG__
    vi.unstubAllEnvs()
    createOidcAdapter.mockClear()
    vi.resetModules()
  })

  it('lee Keycloak de /config.js (window.__MAYA_CONFIG__) al arrancar', async () => {
    window.__MAYA_CONFIG__ = {
      KEYCLOAK_URL: 'https://keycloak.ceedcv',
      KEYCLOAK_REALM: 'CEED',
      KEYCLOAK_CLIENT_ID: 'maya-dashboard',
    }

    await import('./oidcAdapter')

    expect(createOidcAdapter).toHaveBeenCalledWith({
      url: 'https://keycloak.ceedcv',
      realm: 'CEED',
      clientId: 'maya-dashboard',
    })
  })

  it('falla al arrancar si falta la URL de Keycloak', async () => {
    vi.stubEnv('VITE_KEYCLOAK_URL', '')

    await expect(import('./oidcAdapter')).rejects.toThrow(/KEYCLOAK_URL/)
    expect(createOidcAdapter).not.toHaveBeenCalled()
  })
})
