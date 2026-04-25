import { Outlet } from 'react-router-dom'
import { useLocale } from '../i18n'

function AuthLayout() {
  const { t, locale, setLocale, localeOptions } = useLocale()
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,#9c6b98_0,#714b67_40%,#2c2c38_100%)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:rounded-lg focus:bg-ui-card focus:text-text-primary focus:px-4 focus:py-2 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        {t('layout.skipToContent')}
      </a>
      <header className="pt-6 sm:pt-10 px-4 sm:px-6 pb-4 text-center text-text-inverse relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="text-xs sm:text-sm py-1.5 pl-2 pr-7 rounded-lg border border-white/30 bg-white/10 text-text-inverse cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label={t('nav.language')}
          >
            {localeOptions.map(({ code, label }) => (
              <option key={code} value={code} className="bg-gray-800 text-gray-100">
                {label}
              </option>
            ))}
          </select>
        </div>
        <h1 className="m-0 text-2xl sm:text-3xl tracking-[0.06em] uppercase">{t('nav.brand')}</h1>
        <p className="mt-3 max-w-[420px] mx-auto text-text-inverse/75 text-sm sm:text-[0.95rem]">
          {t('layout.authSubtitle')}
        </p>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex items-center justify-center p-4 sm:p-6 outline-none"
      >
        <div className="w-full max-w-[420px] bg-ui-card dark:bg-ui-dark-card dark:border dark:border-ui-dark-border rounded-2xl p-5 sm:p-9 shadow-[0_18px_25px_-10px_rgba(17,24,39,0.35),0_4px_8px_-2px_rgba(17,24,39,0.15)] dark:shadow-none">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AuthLayout