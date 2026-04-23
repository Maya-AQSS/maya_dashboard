import { createContext, useCallback, useContext, useState } from 'react'

const TopbarActionsContext = createContext(null)

export function TopbarActionsProvider({ children }) {
  const [actions, setActionsState] = useState(null)
  const setActions = useCallback((content) => setActionsState(content), [])
  return (
    <TopbarActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </TopbarActionsContext.Provider>
  )
}

export function useTopbarActions() {
  const ctx = useContext(TopbarActionsContext)
  if (!ctx) throw new Error('useTopbarActions must be inside TopbarActionsProvider')
  return ctx
}
