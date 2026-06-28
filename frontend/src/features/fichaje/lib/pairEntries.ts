import { formatYmd } from '../../../lib/dateUtils'

export interface FichajeEntry {
  type: 'in' | 'out'
  timestamp: Date | string
}

export interface FichajePair {
  entrada: FichajeEntry
  salida: FichajeEntry | null
  autoClose: boolean
}

function isToday(date: Date): boolean {
  return formatYmd(date) === formatYmd(new Date())
}

/**
 * Empareja entradas / salidas de un mismo día. Si la última entrada queda sin
 * salida y el día seleccionado no es hoy, se sintetiza un cierre automático a
 * las 20:00 (auto-close), marcado en el par. Si es hoy, se devuelve un par
 * abierto (`salida: null`).
 */
export function pairEntries(entries: FichajeEntry[], selectedDate: Date): FichajePair[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )
  const pairs: FichajePair[] = []
  let currentIn: FichajeEntry | null = null

  for (const entry of sorted) {
    if (entry.type === 'in') {
      currentIn = entry
    } else if (entry.type === 'out' && currentIn) {
      pairs.push({ entrada: currentIn, salida: entry, autoClose: false })
      currentIn = null
    }
  }

  if (currentIn) {
    if (!isToday(selectedDate)) {
      // Use the entrada's own date so the 20:00 cutoff lands on the correct day
      const autoCloseTime = new Date(currentIn.timestamp)
      autoCloseTime.setHours(20, 0, 0, 0)
      pairs.push({
        entrada: currentIn,
        salida: { ...currentIn, type: 'out', timestamp: autoCloseTime },
        autoClose: true,
      })
    } else {
      pairs.push({ entrada: currentIn, salida: null, autoClose: false })
    }
  }

  return pairs
}
