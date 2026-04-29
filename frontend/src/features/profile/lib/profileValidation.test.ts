import { describe, it, expect } from'vitest'
import { validateProfileForm } from'./profileValidation'

/** Mock de t: devuelve la clave (y serializa vars si hay interpolación). */
function mockT(key, vars) {
 if (vars && Object.keys(vars).length) return`${key}|${JSON.stringify(vars)}`
 return key
}

const validBase = {
 name:'Ana',
 surname:'López',
 username:'ana',
 email:'ana@example.com',
 phone:'600 123 456',
 role:'developer',
 dni:'12345678Z',
 street:'Calle Mayor',
 addressNumber:'12',
 addressFloor:'',
 addressDoor:'',
 postalCode:'46001',
 city:'València',
 bio:'Texto de biografía suficiente.',
}

describe('validateProfileForm', () => {
 it('con datos vacíos devuelve valid false y errores en campos obligatorios', () => {
 const { valid, errors } = validateProfileForm({}, mockT)
 expect(valid).toBe(false)
 expect(errors.name).toBeDefined()
 expect(errors.email).toBeDefined()
 expect(Object.keys(errors).length).toBeGreaterThan(5)
 })

 it('rechaza email con formato inválido', () => {
 const { valid, errors } = validateProfileForm({ ...validBase, email:'no-es-email' }, mockT)
 expect(valid).toBe(false)
 expect(errors.email).toBe('profile.validation.emailInvalid')
 })

 it('rechaza DNI con formato incorrecto', () => {
 const { valid, errors } = validateProfileForm({ ...validBase, dni:'123' }, mockT)
 expect(valid).toBe(false)
 expect(errors.dni).toBe('profile.validation.dniFormat')
 })

 it('rechaza teléfono con pocos dígitos', () => {
 const { valid, errors } = validateProfileForm({ ...validBase, phone:'123' }, mockT)
 expect(valid).toBe(false)
 expect(errors.phone).toContain('profile.validation.phoneMinDigits')
 })

 it('acepta un perfil coherente con todas las reglas', () => {
 const { valid, errors } = validateProfileForm(validBase, mockT)
 expect(valid).toBe(true)
 expect(Object.keys(errors)).toHaveLength(0)
 })
})
