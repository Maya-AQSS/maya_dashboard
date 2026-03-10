import Navbar from './Navbar'

function MainLayout({ children }) {
    return (
        <>
            <header>
                <Navbar />
                <h1>Layout principal</h1>
            </header>

            <main>
                {children}
            </main>
            
            <footer>
                <p>Dashboard React</p>
            </footer>
        </>
    )
}

export default MainLayout