import { USER } from '../data/userData'
import { mapUserFromApi } from './userMapper'

async function loginApi({ email, password }) {
  if (!email || !password) {
    throw new Error('auth.error.loginRequired')
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  return { user: mapUserFromApi(USER) }
}

async function registerApi({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('auth.error.registerRequired')
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  return { user: mapUserFromApi(USER) }
}

export { loginApi, registerApi }
