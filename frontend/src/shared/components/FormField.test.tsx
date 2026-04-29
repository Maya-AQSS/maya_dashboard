import { describe, it, expect, vi } from'vitest'
import { render, screen } from'@testing-library/react'
import userEvent from'@testing-library/user-event'
import FormField from'./FormField'

describe('FormField', () => {
 it('renderiza etiqueta y campo asociado', () => {
 render(<FormField name="email" label="Correo" value="" onChange={() => {}} />)
 expect(screen.getByLabelText('Correo')).toBeInTheDocument()
 expect(screen.getByRole('textbox')).toHaveAttribute('name','email')
 })

 it('muestra mensaje de error con role alert', () => {
 render(<FormField name="email" label="Correo" value="" onChange={() => {}} error="Requerido" />,
 )
 const alert = screen.getByRole('alert')
 expect(alert).toHaveTextContent('Requerido')
 // El span de error está dentro del <label>: el nombre accesible del input incluye"Requerido".
 expect(screen.getByRole('textbox', { name: /Correo/ })).toHaveAttribute('aria-invalid','true')
 })

 it('llama onChange al escribir', async () => {
 const user = userEvent.setup()
 const onChange = vi.fn()
 render(<FormField name="user" label="Usuario" value="" onChange={onChange} />)
 await user.type(screen.getByRole('textbox', { name:'Usuario' }),'a')
 expect(onChange).toHaveBeenCalled()
 })

 it('renderiza textarea cuando type es textarea', () => {
 render(<FormField name="bio" label="Bio" type="textarea" value="x" onChange={() => {}} />,
 )
 const field = screen.getByRole('textbox', { name:'Bio' })
 expect(field).toBeInTheDocument()
 expect(field.tagName).toBe('TEXTAREA')
 })
})
