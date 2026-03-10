import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Perfil</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
        </nav>
    )
}

export default Navbar