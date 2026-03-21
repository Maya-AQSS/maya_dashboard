import { useState } from 'react'
import { AuthContext } from './authContext.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const value = { user, setUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
