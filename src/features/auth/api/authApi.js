import { USER } from '../data/userData'

async function loginApi({ email, password }) {

    if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios')
    }

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return { user: USER }
}

async function registerApi({ name, email, password }) {

    if (!name || !email || !password) {
        throw new Error('Nombre, email y contraseña son obligatorios')
    }

    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular una llamada a la API

    return { user: USER }
}

export { loginApi, registerApi }
