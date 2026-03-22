import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from './authContext.js'
import RequireAuth from './RequireAuth.jsx'

function renderProtectedRoute({ user }) {
  const setUser = () => {}
  return render(
    <AuthContext.Provider value={{ user, setUser }}>
      <MemoryRouter initialEntries={['/tools']}>
        <Routes>
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/tools" element={<div>ToolsPage</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('RequireAuth', () => {
  it('sin usuario redirige a /login y no muestra la ruta protegida', () => {
    renderProtectedRoute({ user: null })
    expect(screen.getByText('LoginPage')).toBeInTheDocument()
    expect(screen.queryByText('ToolsPage')).not.toBeInTheDocument()
  })

  it('con usuario muestra el contenido de la ruta protegida', () => {
    renderProtectedRoute({ user: { id: 1, email: 'a@b.co' } })
    expect(screen.getByText('ToolsPage')).toBeInTheDocument()
    expect(screen.queryByText('LoginPage')).not.toBeInTheDocument()
  })
})
