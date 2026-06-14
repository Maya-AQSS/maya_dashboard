import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
// Inicializa i18next con los recursos reales de la app para los tests que NO
// mockean react-i18next/useLocale (p.ej. UserAlertsWidget asume traducciones
// resueltas). Los tests que mockean i18n localmente no se ven afectados: su
// vi.mock sobrescribe el módulo. Es un side-effect import (init en createAppI18n).
// Forzamos locale 'es': en jsdom el LanguageDetector resolvería 'en' por
// navigator.language y 'en' no contiene todas las claves de dominio del
// dashboard (las traducciones canónicas viven en es/common.json).
import i18n from './../i18n'
void i18n.changeLanguage('es')

const localStorageMock = {
  _store: {} as Record<string, string>,
  getItem(key: string) { return this._store[key] ?? null },
  setItem(key: string, value: string) { this._store[key] = value },
  removeItem(key: string) { delete this._store[key] },
  clear() { this._store = {} },
  get length() { return Object.keys(this._store).length },
  key(index: number) { return Object.keys(this._store)[index] ?? null },
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(() => {
  cleanup()
})
