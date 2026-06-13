/**
 * Formatea un `Date` como `YYYY-MM-DD` en hora LOCAL (sin conversión a UTC),
 * usando `getFullYear` / `getMonth` / `getDate`. Centraliza el helper que estaba
 * duplicado como `toDateString` / `toYmd` en varios features de fichaje, bookings
 * y alertas.
 */
export function formatYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
