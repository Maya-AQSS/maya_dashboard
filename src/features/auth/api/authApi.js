import { USER } from '../data/userData'
import { mapUserFromApi } from './userMapper'

async function loginApi({ email, password }) {
  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios')
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  return { user: mapUserFromApi(USER) }
}

async function registerApi({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Nombre, email y contraseña son obligatorios')
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  return { user: mapUserFromApi(USER) }
}

export { loginApi, registerApi }
