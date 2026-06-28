import { vi } from 'vitest'

vi.mock('@ceedcv-maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

export const defaultMockUser = { sub: 'u-123', token: 'tok-abc' }

export function createMockAuthContext(overrides: Partial<typeof defaultMockUser> = {}) {
  return { user: { ...defaultMockUser, ...overrides } }
}

export function createMockLocale(translator: (key: string) => string = (k) => k) {
  return { t: translator }
}
