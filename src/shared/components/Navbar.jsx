import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/AuthContext'

function Navbar() {
    const navigate = useNavigate()
    const { user, setUser } = useAuth()

    const logout = () => {
        setUser(null)
        navigate('/login')
    }

    return (
        <nav className="max-w-[1200px] mx-auto py-3 px-6 flex items-center justify-between">
            <div>
                <span className="font-semibold tracking-[0.08em] uppercase text-sm text-gray-50">
                    Dashboard React
                </span>
            </div>

            <div className="flex gap-3">
                <Link
                    to="/tools"
                    className="text-sm py-1.5 px-3.5 rounded-full text-gray-50 transition bg-transparent hover:bg-white/20 hover:-translate-y-0.5"
                >
                    Herramientas
                </Link>

                <Link
                    to="/profile"
                    className="text-sm py-1.5 px-3.5 rounded-full text-gray-50 transition bg-transparent hover:bg-white/20 hover:-translate-y-0.5"
                >
                    Perfil de {[user.name, user.surname].filter(Boolean).join(' ') || user.name}
                </Link>

                <button
                    type="button"
                    onClick={logout}
                    className="text-sm py-1.5 px-3.5 rounded-full bg-amber-300 dark:bg-amber-400 text-zinc-700 dark:text-odoo-dark-bg font-medium hover:bg-amber-200 dark:hover:bg-amber-300 transition"
                >
                    Cerrar sesión
                </button>
            </div>
        </nav>
    )
}

export default Navbar