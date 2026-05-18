import { describe, expect, it } from 'vitest'
import { defaultLocale, supportedLocaleCodes, dateLocaleMap, getDateLocale, messages } from './config'

describe('config i18n', () => {
  describe('defaultLocale', () => {
    it('es "es"', () => {
      expect(defaultLocale).toBe('es')
    })
  })

  describe('supportedLocaleCodes', () => {
    it('contiene los tres idiomas registrados', () => {
      expect(supportedLocaleCodes).toContain('es')
      expect(supportedLocaleCodes).toContain('en')
      expect(supportedLocaleCodes).toContain('va')
    })

    it('coincide con las claves de messages', () => {
      expect(supportedLocaleCodes).toEqual(Object.keys(messages))
    })
  })

  describe('dateLocaleMap', () => {
    it('mapea va → ca-ES', () => {
      expect(dateLocaleMap['va']).toBe('ca-ES')
    })

    it('mapea es → es-ES', () => {
      expect(dateLocaleMap['es']).toBe('es-ES')
    })

    it('mapea en → en-GB', () => {
      expect(dateLocaleMap['en']).toBe('en-GB')
    })
  })

  describe('getDateLocale', () => {
    it('retorna ca-ES para va', () => {
      expect(getDateLocale('va')).toBe('ca-ES')
    })

    it('retorna es-ES para es', () => {
      expect(getDateLocale('es')).toBe('es-ES')
    })

    it('retorna en-GB para en', () => {
      expect(getDateLocale('en')).toBe('en-GB')
    })

    it('retorna en-GB como fallback para código desconocido', () => {
      expect(getDateLocale('fr')).toBe('en-GB')
    })

    it('retorna en-GB como fallback para string vacío', () => {
      expect(getDateLocale('')).toBe('en-GB')
    })
  })
})
