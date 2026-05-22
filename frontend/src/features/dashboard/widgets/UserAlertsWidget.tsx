import { Button } from '@maya/shared-ui-react'
import { useTranslation } from 'react-i18next'
import { useUserAlerts } from '../../alerts/hooks/useUserAlerts'
import type { AlertItem } from '../../alerts/hooks/useActiveSystemAlerts'

const COLOR_CLASSES = {
  amber: 'bg-warning-light dark:bg-warning-dark/20 border-warning/20 dark:border-warning/50 text-warning-dark dark:text-warning',
  blue: 'bg-info-light dark:bg-info-dark/20 border-info/20 dark:border-info/50 text-info-dark dark:text-info',
  red: 'bg-danger-light dark:bg-danger-dark/20 border-danger/20 dark:border-danger/50 text-danger-dark dark:text-danger',
  green: 'bg-success-light dark:bg-success-dark/20 border-success/20 dark:border-success/50 text-success-dark dark:text-success',
}

const BUTTON_CLASSES = {
  amber: 'bg-warning-light hover:bg-warning/20 dark:bg-warning-dark/40 dark:hover:bg-warning-dark/60 text-warning-dark dark:text-warning',
  blue: 'bg-info-light hover:bg-info/20 dark:bg-info-dark/40 dark:hover:bg-info-dark/60 text-info-dark dark:text-info',
  red: 'bg-danger-light hover:bg-danger/20 dark:bg-danger-dark/40 dark:hover:bg-danger-dark/60 text-danger-dark dark:text-danger',
  green: 'bg-success-light hover:bg-success/20 dark:bg-success-dark/40 dark:hover:bg-success-dark/60 text-success-dark dark:text-success',
}

/**
 * Megáfono en estilo "claro": cono blanco crema con boca de oro suave y
 * ondas sonoras blancas. Más etéreo y limpio que el rojo cartoon original
 * o el PA oscuro; resalta contra el card purple→teal sin competir.
 */
function MegaphoneIllustration({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      className="maya-megaphone-shadow"
    >
      <defs>
        <linearGradient id="megaConeLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#FEF3C7" />
          <stop offset="1" stopColor="#FDE68A" />
        </linearGradient>
        <linearGradient id="megaRimLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id="megaBellInner" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FEF3C7" />
          <stop offset="0.55" stopColor="#FBBF24" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="megaHandleLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#78716C" />
          <stop offset="1" stopColor="#44403C" />
        </linearGradient>
      </defs>

      {/* Ondas sonoras (capa trasera, blanco translúcido) */}
      <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M58 22 Q 64 28 64 36 Q 64 44 58 50" opacity="0.95" />
        <path d="M62 16 Q 70 24 70 36 Q 70 48 62 56" opacity="0.6" />
        <path d="M66 10 Q 76 22 76 36 Q 76 50 66 62" opacity="0.32" />
      </g>

      {/* Cuerpo del cono */}
      <path
        d="M10 24 L48 10 L48 62 L10 48 Z"
        fill="url(#megaConeLight)"
        stroke="#D97706"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Boca con halo dorado interior */}
      <ellipse cx="48" cy="36" rx="4" ry="26" fill="url(#megaBellInner)" />
      <ellipse cx="48" cy="36" rx="4" ry="26" fill="none" stroke="url(#megaRimLight)" strokeWidth="2" />
      <ellipse cx="48" cy="36" rx="3" ry="24" fill="none" stroke="#FEF3C7" strokeWidth="0.6" opacity="0.85" />

      {/* Cuerpo trasero */}
      <rect x="2" y="28" width="10" height="16" rx="2" fill="url(#megaConeLight)" stroke="#D97706" strokeWidth="1.2" />

      {/* Mango + gatillo */}
      <rect x="20" y="44" width="6" height="14" rx="1.5" fill="url(#megaHandleLight)" />
      <path d="M20 46 L15 52 L18 53 L22 48 Z" fill="#292524" />

      {/* Brillo lateral cremoso */}
      <path d="M14 27 L14 45" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

/**
 * Widget de avisos con look "AVISO": el card al completo es de color de marca
 * (gradiente purple→teal con formas orgánicas decorativas), cabecera con
 * título e icono, megáfono sobresaliendo arriba a la derecha, y un bloque
 * blanco central con la lista de alertas.
 *
 * Requiere en el registry: `hideTitle: true`, `allowOverflow: true`,
 * `bleed: true` — el card del WidgetFrame queda sin padding ni overflow
 * recortado, y el widget controla todo el lienzo.
 */
function UserAlertsWidget() {
  const { t } = useTranslation('common')
  const { alerts, loading, dismiss, clockIn } = useUserAlerts()

  const handleAction = (alert: AlertItem) => {
    if (alert.actionKind === 'clockIn') {
      clockIn()
      return
    }
    if (alert.actionUrl) {
      window.location.assign(alert.actionUrl)
    }
  }

  return (
    <div className="relative h-full rounded-2xl">
      {/* ── Capa de marca: gradiente purple→teal con formas ─────────────── */}
      <div
        className="maya-alerts-canvas absolute inset-0 rounded-2xl overflow-hidden"
        aria-hidden="true"
      >
        {/* Blob superior derecho */}
        <span className="maya-alerts-blob-tr absolute -top-12 -right-10 w-40 h-40 rounded-full opacity-40" />
        {/* Blob inferior izquierdo */}
        <span className="maya-alerts-blob-bl absolute -bottom-16 -left-12 w-48 h-48 rounded-full opacity-35" />
        {/* Trazo curvo decorativo */}
        <svg
          className="absolute inset-0 w-full h-full mix-blend-overlay opacity-30"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 60 Q 100 10, 200 70 T 400 50 L400 0 L0 0 Z" fill="rgba(255,255,255,0.5)" />
          <path d="M0 160 Q 120 200, 240 150 T 400 170 L400 200 L0 200 Z" fill="rgba(0,0,0,0.18)" />
        </svg>
      </div>

      {/* ── Megáfono que sobresale por encima del card ──────────────────── */}
      <div className="absolute -top-5 right-3 z-30 -rotate-12 pointer-events-none">
        <MegaphoneIllustration size={64} />
      </div>

      {/* ── Cabecera con título de marca ─────────────────────────────────── */}
      <div className="relative z-10 flex items-center gap-2 px-5 pt-4 pb-2 text-text-inverse">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 11l18-7v16L3 13z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
        <span className="text-xs uppercase tracking-[0.18em] font-display font-bold">
          {t('dashboard.widgets.userAlerts', { defaultValue: 'Avisos' })}
        </span>
      </div>

      {/* ── Bloque blanco interior con las alertas ──────────────────────── */}
      <div className="relative z-10 mx-5 mb-5 bg-ui-card dark:bg-ui-dark-card rounded-xl shadow-card-md border border-white/40 dark:border-ui-dark-border/40 p-3 overflow-auto max-h-[calc(100%-3.5rem)]">
        {loading && (
          <div className="flex flex-col gap-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-10 bg-ui-border-l dark:bg-ui-dark-border rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-5 gap-1">
            <p className="text-xs uppercase tracking-[0.18em] font-display font-bold text-odoo-purple dark:text-odoo-dark-purple">
              {t('dashboard.userAlerts.emptyTitle', { defaultValue: 'Sin avisos' })}
            </p>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary text-center">
              {t('dashboard.userAlerts.empty')}
            </p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => {
              const colorCls = COLOR_CLASSES[alert.color] ?? COLOR_CLASSES.blue
              const btnCls = BUTTON_CLASSES[alert.color] ?? BUTTON_CLASSES.blue
              return (
                <div
                  key={alert.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${colorCls}`}
                >
                  <span className="flex-1">{alert.text}</span>
                  {alert.actionLabel && (
                    <Button
                      variant="unstyled"
                      size="xs"
                      onClick={() => handleAction(alert)}
                      className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium transition ${btnCls}`}
                    >
                      {alert.actionLabel}
                    </Button>
                  )}
                  {alert.canDismiss !== false && (
                    <Button
                      variant="unstyled"
                      size="xs"
                      onClick={() => dismiss(alert.id)}
                      aria-label={t('dashboard.userAlerts.dismissAria')}
                      title={t('dashboard.userAlerts.dismissTitle')}
                      className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm transition ${btnCls}`}
                    >
                      ×
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserAlertsWidget
