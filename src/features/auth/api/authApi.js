async function loginApi({ email, password }) {

    if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios')
    }

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return {
        id: 1,
        name: 'Usuario de prueba',
        email,
    }
}


export {
    loginApi,
}
