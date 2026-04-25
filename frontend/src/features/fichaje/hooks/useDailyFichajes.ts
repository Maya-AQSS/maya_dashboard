// TODO: replace mock with GET /api/v1/fichaje/daily?userId=...&date=YYYY-MM-DD when API is available

function makeEntries(date, pairs) {
  return pairs.map(([hours, minutes, type], i) => ({
    id: i + 1,
    type,
    timestamp: new Date(new Date(date).setHours(hours, minutes, 0, 0)),
  }))
}

function toDateString(date) {
  if (!(date instanceof Date)) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildMockHistory() {
  const history = {}
  const today = new Date()

  const templates = [
    [[8, 30, 'in'], [14, 0, 'out'], [15, 0, 'in']],
    [[9, 0, 'in'], [13, 30, 'out'], [14, 30, 'in']],
    [[8, 45, 'in'], [14, 15, 'out'], [15, 15, 'in']],
    [[8, 0, 'in'], [13, 0, 'out'], [14, 0, 'in']],
    [[9, 15, 'in'], [14, 0, 'out'], [15, 0, 'in']],
    [[8, 30, 'in'], [13, 45, 'out'], [14, 45, 'in']],
    [[8, 0, 'in'], [14, 30, 'out']],
  ]

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = toDateString(d)
    history[key] = makeEntries(d, templates[i % templates.length])
  }

  return history
}

const MOCK_HISTORY = buildMockHistory()

function useDailyFichajes(_userId, date) {
  const key = toDateString(date)
  const entries = MOCK_HISTORY[key] ?? []

  return { entries, loading: false, error: undefined }
}

export default useDailyFichajes
