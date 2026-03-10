function AuthLayout({ children }) {
    return (
        <>
            <header>
                <h1>Autenticación</h1>
            </header>

            <main>
                {children}
            </main>
            
        </>
    )
}

export default AuthLayout