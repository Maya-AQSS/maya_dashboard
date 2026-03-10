import Navbar from './Navbar'

function MainLayout({ children }) {
    return (
        <div className="main-layout">

            <header className="main-header">
                <Navbar />
                <div className="main-header-text">
                    <h1>Dashboard</h1>
                    <p>Bienvenido a tu panel de control</p>
                </div>
            </header>

            <main className="main-content">
                {children}
            </main>

            <footer className="main-footer">
                <p>Dashboard React</p>
            </footer>
            
        </div>
    )
}

export default MainLayout