import { useState } from 'react'
import DashboardPage from '../features/dashboard/pages/DashboardPage'

import '../shared/styles/App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <DashboardPage />
  )
}

export default App
