/**
 * Utilidades internas del módulo i18n (resolución de claves anidadas e interpolación).
 * No exportar fuera del módulo.
 */

function getNested(obj, path) {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[key]
  }
  return current
}

function interpolate(str, vars = {}) {
  if (typeof str !== 'string') return str
  return str.replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : `{${key}}`))
}

export { getNested, interpolate }