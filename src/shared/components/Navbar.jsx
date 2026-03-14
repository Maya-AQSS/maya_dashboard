import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/AuthContext'

function Navbar() {
    const navigate = useNavigate()
    const { user, setUser } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    const logout = () => {
        setMenuOpen(false)
        setUser(null)
        navigate('/login')
    }

    const linkClass = "text-xs sm:text-sm py-1.5 px-3 rounded-full sm:px-3.5 text-gray-50 transition bg-transparent hover:bg-white/20 hover:-translate-y-0.5"
    const profileLabel = [user.name, user.surname].filter(Boolean).join(' ') || user.name

    return (
        <div className="max-w-[1200px] mx-auto relative w-full">
            <nav className="py-2 px-4 sm:py-3 sm:px-6 flex flex-row items-center justify-between gap-2">
                <div className="flex-shrink-0 min-w-0">
                    <span className="font-semibold tracking-[0.08em] uppercase text-xs sm:text-sm text-gray-50 truncate block">
                        Dashboard React
                    </span>
                </div>

                {/* Escritorio: enlaces visibles */}
                <div className="hidden sm:flex flex-wrap gap-2 sm:gap-3 justify-end flex-shrink-0">
                    <Link to="/tools" className={linkClass}>
                        Herramientas
                    </Link>
                    <Link to="/profile" className={`${linkClass} truncate max-w-[140px] sm:max-w-none`} title={profileLabel}>
                        <span className="sm:hidden">Perfil</span>
                        <span className="hidden sm:inline">Perfil de {profileLabel}</span>
                    </Link>
                    <button
                        type="button"
                        onClick={logout}
                        className="text-xs sm:text-sm py-1.5 px-3 rounded-full sm:px-3.5 bg-amber-300 dark:bg-amber-900/70 dark:text-amber-200 text-zinc-700 font-medium hover:bg-amber-200 dark:hover:bg-amber-800/80 transition"
                    >
                        Cerrar sesión
                    </button>
                </div>

                {/* Móvil: botón hamburguesa */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg text-gray-50 hover:bg-white/20 transition aria-expanded={menuOpen}"
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    {menuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
                        aria-hidden
                    />
                    <div className="sm:hidden absolute top-full left-0 right-0 z-50 mt-0 py-3 px-4 bg-odoo-primary dark:bg-odoo-dark-surface border-b border-white/10 dark:border-odoo-dark-border shadow-lg rounded-b-lg">
                        <div className="flex flex-col gap-1">
                            <Link
                                to="/tools"
                                className="py-3 px-4 rounded-lg text-gray-50 hover:bg-white/20 transition"
                                onClick={() => setMenuOpen(false)}
                            >
                                Herramientas
                            </Link>
                            <Link
                                to="/profile"
                                className="py-3 px-4 rounded-lg text-gray-50 hover:bg-white/20 transition"
                                onClick={() => setMenuOpen(false)}
                                title={profileLabel}
                            >
                                Perfil de {profileLabel}
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                                className="w-auto self-start py-2.5 px-4 rounded-lg text-left bg-amber-300 dark:bg-amber-900/70 dark:text-amber-200 text-zinc-700 font-medium hover:bg-amber-200 dark:hover:bg-amber-800/80 transition"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Navbar