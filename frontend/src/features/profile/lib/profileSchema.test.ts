import { describe, it, expect } from 'vitest'
import { createProfileFormSchema, emptyProfileForm } from './profileSchema'

/** Mock de t: devuelve la clave (y serializa vars si hay interpolación). */
function mockT(key: string, vars?: Record<string, unknown>): string {
  if (vars && Object.keys(vars).length) return `${key}|${JSON.stringify(vars)}`
  return key
}

const schema = createProfileFormSchema(mockT)

const validBase = {
  name: 'Ana',
  surname: 'López',
  username: 'ana',
  email: 'ana@example.com',
  phone: '600 123 456',
  role: 'developer',
  dni: '12345678Z',
  street: 'Calle Mayor',
  addressNumber: '12',
  addressFloor: '',
  addressDoor: '',
  postalCode: '46001',
  city: 'València',
  bio: 'Texto de biografía suficiente.',
}

function errorsFor(input: unknown): Record<string, string> {
  const result = schema.safeParse(input)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !errors[key]) errors[key] = issue.message
  }
  return errors
}

describe('profile form schema', () => {
  it('con datos vacíos falla y reporta errores en los campos obligatorios', () => {
    const result = schema.safeParse(emptyProfileForm)
    expect(result.success).toBe(false)
    const errors = errorsFor(emptyProfileForm)
    expect(errors.name).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(Object.keys(errors).length).toBeGreaterThan(5)
  })

  it('rechaza email con formato inválido', () => {
    const errors = errorsFor({ ...validBase, email: 'no-es-email' })
    expect(errors.email).toBe('profile.validation.emailInvalid')
  })

  it('rechaza DNI con formato incorrecto', () => {
    const errors = errorsFor({ ...validBase, dni: '123' })
    expect(errors.dni).toBe('profile.validation.dniFormat')
  })

  it('rechaza teléfono con pocos dígitos', () => {
    const errors = errorsFor({ ...validBase, phone: '123' })
    expect(errors.phone).toContain('profile.validation.phoneMinDigits')
  })

  it('acepta un perfil coherente con todas las reglas', () => {
    const result = schema.safeParse(validBase)
    expect(result.success).toBe(true)
  })
})
