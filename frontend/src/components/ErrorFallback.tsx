import { useTranslation } from 'react-i18next'
import { Button } from '@ceedcv-maya/shared-ui-react'

/**
 * Fallback del error boundary raíz (extraído de App.tsx en la migración a
 * MayaAppShell). Se conserva el componente propio en lugar del
 * `AppErrorFallback` de shared-ui-react porque:
 * - los textos son reactivos al idioma (useTranslation) en vez de strings
 *   estáticos via `errorFallbackProps`;
 * - el botón de recarga elimina el query param `?crash` antes de recargar
 *   (evita re-crashear si la URL fuerza el error);
 * - mantiene el diseño de tarjeta propio del portal.
 */
export function ErrorFallback() {
  const { t } = useTranslation('common')
  const handleReload = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('crash')
    window.location.assign(url.toString())
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-ui-body dark:bg-ui-dark-bg px-6">
      <div className="w-full max-w-[560px] rounded-2xl border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card px-8 py-10 text-center shadow-[0_18px_25px_-10px_rgba(17,24,39,0.2),0_4px_8px_-2px_rgba(17,24,39,0.08)] dark:shadow-none">
        <p className="text-4xl font-semibold text-odoo-purple m-0">Error</p>
        <h1 className="mt-4 mb-2 text-2xl font-semibold text-text-primary dark:text-text-dark-primary">
          {t('layout.errorBoundaryTitle')}
        </h1>
        <p className="m-0 text-sm sm:text-base text-text-secondary dark:text-text-dark-secondary">
          {t('layout.errorBoundaryDescription')}
        </p>
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={handleReload}>
            {t('layout.errorBoundaryReload')}
          </Button>
        </div>
      </div>
    </div>
  )
}
