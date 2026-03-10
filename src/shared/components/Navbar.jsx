import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="navbar">

            <div className="navbar-left">
                <span className="navbar-logo">Dashboard React</span>
            </div>
            
            <div className="navbar-right">
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                <Link to="/profile" className="navbar-link">Perfil</Link>
                <Link to="/login" className="navbar-link">Login</Link>
                <Link to="/register" className="navbar-link navbar-link-primary">
                    Registro
                </Link>
            </div>
        
        </nav>
    )
}

export default Navbar