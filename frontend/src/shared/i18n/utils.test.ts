import { describe, it, expect } from'vitest'
import { getNested, interpolate } from'./utils'

describe('getNested', () => {
 it('resuelve claves anidadas', () => {
 const obj = { a: { b: { c: 42 } } }
 expect(getNested(obj,'a.b.c')).toBe(42)
 })

 it('devuelve undefined si falta el camino', () => {
 expect(getNested({ a: 1 },'a.b')).toBeUndefined()
 expect(getNested(null,'a')).toBeUndefined()
 })

 it('devuelve undefined si un nivel no es objeto', () => {
 expect(getNested({ a:'x' },'a.b')).toBeUndefined()
 })
})

describe('interpolate', () => {
 it('sustituye placeholders {clave}', () => {
 expect(interpolate('Hola {name}', { name:'Maya' })).toBe('Hola Maya')
 })

 it('deja el placeholder si no hay variable', () => {
 expect(interpolate('Hola {name}', {})).toBe('Hola {name}')
 })

 it('no altera valores no string', () => {
 expect(interpolate(123)).toBe(123)
 })
})
