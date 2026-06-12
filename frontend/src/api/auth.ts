import { createStandardProfileApi } from '@ceedcv-maya/shared-profile-react'
import { apiFetchJson, apiGetJson } from './http'

export type { MeProfile } from '../types/users'

const profileApi = createStandardProfileApi({ apiFetchJson, apiGetJson })

export const { fetchMe, updateMyLocale, StandardUserProfileProvider } = profileApi
