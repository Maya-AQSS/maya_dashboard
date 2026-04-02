import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/useAuth.js'
import { useLocale } from '../i18n'

function Navbar() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const { t, locale, setLocale, localeOptions } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const previousMenuOpen = useRef(false)

  const logout = () => {
    setMenuOpen(false)
    setUser(null)
    navigate('/login')
  }

  const linkClass =
    'text-xs sm:text-sm py-1.5 px-3 rounded-full sm:px-3.5 text-gray-50 transition bg-transparent hover:bg-white/20 hover:-translate-y-0.5'
  const profileLabel = [user.name, user.surname].filter(Boolean).join(' ') || user.name

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown)
      const firstFocusable = mobileMenuRef.current?.querySelector('select, a, button')
      firstFocusable?.focus()
    }

    if (!menuOpen && previousMenuOpen.current) {
      menuButtonRef.current?.focus()
    }

    previousMenuOpen.current = menuOpen
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto relative w-full">
      <nav className="py-3 px-4 sm:py-3.5 sm:px-6 flex flex-row items-center justify-between gap-2">
        <div className="flex-shrink-0 min-w-0">
          <Link
            to="/tools"
            className="font-semibold tracking-[0.08em] uppercase text-xs sm:text-sm text-gray-50 truncate block hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
          >
            {t('nav.brand')}
          </Link>
        </div>

        {/* Escritorio: enlaces visibles */}
        <div className="hidden sm:flex flex-wrap gap-2 sm:gap-3 justify-end items-center flex-shrink-0">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="text-xs py-1.5 pl-2 pr-7 rounded-lg border border-white/30 bg-white/10 text-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none bg-no-repeat bg-[length:0.6rem] bg-[right_0.35rem_center]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f8fafc'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
            }}
            aria-label={t('nav.language')}
          >
            {localeOptions.map(({ code, label }) => (
              <option key={code} value={code} className="bg-gray-800 text-gray-100">
                {label}
              </option>
            ))}
          </select>
          <Link to="/tools" className={linkClass}>
            {t('nav.tools')}
          </Link>
          <Link
            to="/profile"
            className={`${linkClass} truncate max-w-[160px] sm:max-w-none`}
            title={t('nav.profileOf', { name: profileLabel })}
            aria-label={t('nav.profileOf', { name: profileLabel })}
          >
            {profileLabel || t('nav.profile')}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-xs sm:text-sm py-1.5 px-3 rounded-full sm:px-3.5 bg-amber-500/95 text-zinc-800 font-semibold shadow-sm border border-amber-500/90 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/90 transition dark:bg-amber-500/90 dark:text-zinc-900 dark:hover:bg-amber-200 dark:border-amber-600/80"
          >
            {t('nav.logout')}
          </button>
        </div>

        {/* Móvil: botón hamburguesa */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg text-gray-50 hover:bg-white/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Móvil: menú desplegable */}
      {menuOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/30"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={mobileMenuRef}
            id="mobile-nav-menu"
            className="sm:hidden absolute top-full left-0 right-0 z-50 mt-0 py-3 px-4 bg-odoo-primary border-b border-white/10 dark:border-odoo-dark-border shadow-lg rounded-b-lg"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.mobileNavigation')}
          >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <label htmlFor="locale-select-mobile" className="text-gray-50 text-xs shrink-0">
                {t('nav.language')}:
              </label>
              <select
                id="locale-select-mobile"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="text-sm py-2 pl-2 pr-8 rounded-lg border border-white/30 bg-white/10 text-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 flex-1 max-w-[140px]"
                aria-label={t('nav.language')}
              >
                {localeOptions.map(({ code, label }) => (
                  <option key={code} value={code} className="bg-gray-800 text-gray-100">
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Link
                to="/tools"
                className="py-3 px-4 rounded-lg text-gray-50 hover:bg-white/20 transition"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.tools')}
              </Link>
              <Link
                to="/profile"
                className="py-3 px-4 rounded-lg text-gray-50 hover:bg-white/20 transition"
                onClick={() => setMenuOpen(false)}
                title={t('nav.profileOf', { name: profileLabel })}
                aria-label={t('nav.profileOf', { name: profileLabel })}
              >
                {profileLabel || t('nav.profile')}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-auto self-start py-2.5 px-4 rounded-full text-left bg-amber-500 text-zinc-900 font-semibold border border-amber-400/90 hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/90 transition dark:bg-amber-500 dark:text-zinc-900 dark:hover:bg-amber-400 dark:border-amber-300/80"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Navbar
