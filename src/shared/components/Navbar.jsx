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
        <nav className="navbar">
            <div className="navbar-left">
                <span className="navbar-logo">Dashboard React</span>
            </div>

            <div className="navbar-right">

                <Link to="/technologies" className="navbar-link">
                    Tecnologías
                </Link>

                <Link to="/profile" className="navbar-link">
                    Perfil de {user.name}
                </Link>

                <button
                    type="button"
                    onClick={logout}
                    className="navbar-link navbar-link-primary"
                >
                    Cerrar sesión
                </button>

            </div>
        </nav>
    )
}

export default Navbar