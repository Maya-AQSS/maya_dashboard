import { describe, expect, it } from 'vitest'
import { isAllowedReturnUrl } from './returnUrl'

describe('isAllowedReturnUrl', () => {
  describe('producción (dashboard.ceedcv)', () => {
    const host = 'dashboard.ceedcv'

    it.each([
      'https://dms.ceedcv/documents/42',
      'https://authorization.ceedcv/',
      'https://logs.ceedcv',
      'https://audit.ceedcv/?x=1',
      'https://dashboard.ceedcv/profile',
    ])('acepta el frontend Maya %s', (url) => {
      expect(isAllowedReturnUrl(url, host)).toBe(true)
    })

    it.each([
      ['http://dms.ceedcv/', 'sin https'],
      ['https://odoo.ceedcv/', 'otro servicio del dominio'],
      ['https://n8n.ceedcv/webhook', 'otro servicio del dominio'],
      ['https://api.dms.ceedcv/', 'la API, no el frontend'],
      ['https://dms.ceedcv.evil.example/', 'sufijo engañoso'],
      ['https://evil.example/?dms.ceedcv', 'otro dominio'],
      ['https://dev-dms.ceedcv/', 'prefijo de otro entorno'],
      ['javascript:alert(1)', 'esquema peligroso'],
      ['no es una url', 'URL inválida'],
    ])('rechaza %s (%s)', (url) => {
      expect(isAllowedReturnUrl(url, host)).toBe(false)
    })
  })

  describe('desarrollo (dev-dashboard.<ip>.nip.io)', () => {
    const host = 'dev-dashboard.10.224.237.230.nip.io'

    it('acepta los frontends con el mismo prefijo y dominio', () => {
      expect(isAllowedReturnUrl('https://dev-dms.10.224.237.230.nip.io/', host)).toBe(true)
      expect(isAllowedReturnUrl('https://dev-logs.10.224.237.230.nip.io/x', host)).toBe(true)
    })

    it('rechaza el host sin el prefijo del entorno', () => {
      expect(isAllowedReturnUrl('https://dms.10.224.237.230.nip.io/', host)).toBe(false)
    })
  })

  describe('desarrollo local', () => {
    it('sigue aceptando localhost y *.localhost, con http', () => {
      expect(isAllowedReturnUrl('http://localhost:5174/', 'localhost')).toBe(true)
      expect(isAllowedReturnUrl('http://maya_dms.localhost:5173/', 'dashboard.ceedcv')).toBe(true)
    })
  })

  it('sin la convención de nombres en el propio host, solo localhost', () => {
    expect(isAllowedReturnUrl('https://dms.ceedcv/', 'portal.ceedcv')).toBe(false)
    expect(isAllowedReturnUrl('https://dms.ceedcv/', '10.224.237.251')).toBe(false)
  })
})
