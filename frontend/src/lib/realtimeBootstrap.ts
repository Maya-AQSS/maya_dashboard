/**
 * Bootstrap del cliente Echo/Reverb — delegado a `bootstrapRealtime` de
 * @ceedcv-maya/shared-realtime-react (0.16.0). Se mantiene el wrapper local
 * (main.tsx lo importa desde aquí) fijando el slug `dashboard` y el resolver
 * de token del cliente HTTP de la app.
 */
import { bootstrapRealtime as bootstrapSharedRealtime } from '@ceedcv-maya/shared-realtime-react'
import { getBearerToken } from '../api/http'

export function bootstrapRealtime(): void {
  bootstrapSharedRealtime('dashboard', getBearerToken)
}
