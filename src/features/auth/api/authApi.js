async function login({ email, password }) {

    if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios')
    }

    return {
        id: 1,
        name: 'Usuario de prueba',
        email,
    }
}


export {
    login,
}
