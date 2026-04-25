import { useState } from 'react'

// TODO: replace mock with GET /api/v1/fichaje/status?userId=... when API is available
function useFichajeStatus(_userId) {
  const [status, setStatus] = useState('not-clocked-in')
  const [lastClockIn, setLastClockIn] = useState(undefined)

  const clockIn = async () => {
    await new Promise((r) => setTimeout(r, 500))
    const now = new Date()
    setLastClockIn(now)
    setStatus('clocked-in')
  }

  return { status, lastClockIn, error: undefined, clockIn }
}

export default useFichajeStatus
