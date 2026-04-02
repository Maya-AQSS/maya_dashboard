import { USER } from '../../auth/data/userData'
import { mapUserFromApi, mapUserToApi } from '../../auth/api/userMapper'

async function updateProfile(updates) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const apiUpdates = mapUserToApi(updates)
  if (apiUpdates) {
    Object.assign(USER, apiUpdates)
  }

  const mapped = mapUserFromApi(USER)
  if (!mapped) {
    throw new Error('profile.errorUpdate')
  }
  return mapped
}

export { updateProfile }
